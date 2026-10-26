/* Native browser scene graph for the recovered Raketenspiel.
 * No Flash player, SWF interpreter, dependencies, network requests or build step.
 * All gameplay rules live in gameplay.js; original vector data in assets.js.
 */
(() => {
  'use strict';
  const NS='http://www.w3.org/2000/svg', data=window.RAKETENSPIEL_ASSETS;
  const stage=document.getElementById('game');
  const make=(tag,attrs={})=>{const el=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs))el.setAttribute(k,v);return el;};
  const defs=make('defs');stage.append(defs);
  const objects=[];let serial=0,frames=0,paused=false,lastTime=null,accumulator=0,visualAccum=0;
  // 48 Hz logic (3× original Flash 16 Hz); rates in gameplay/missiles scale by TICK=16/48.
  const LOGIC_MS=1000/48, VISUAL_MS=1000/48;
  const isTest=new URLSearchParams(location.search).has('test');
  let random=Math.random;
  const math=Object.create(Math); math.random=()=>random();
  // AVM1 silently ignores writes through an undefined movie-clip reference.
  // The original script contains two such references; retain that behavior.
  const missing=new Proxy(Object.create(null),{
    get:(_,key)=>key===Symbol.toPrimitive?()=>undefined:key==='then'?undefined:missing,
    set:()=>true
  });
  const quantizePosition=v=>Math.trunc(Number(v)*20)/20;
  function filterFor(p) {
    const fs=p.filters||[],ct=p.color;
    if(!fs.length&&!ct)return null;
    const id='fx'+serial++,f=make('filter',{id,x:'-250%',y:'-50%',width:'600%',height:'200%','color-interpolation-filters':'sRGB'});
    let input='SourceGraphic';
    if(ct){
      const vals=['red','green','blue','alpha'].flatMap((c,i)=>{
        const row=[0,0,0,0,0];row[i]=c==='alpha'?1:(ct[c+'MultTerm']??256)/256;row[4]=c==='alpha'?0:(ct[c+'AddTerm']??0)/255;return row;
      });
      f.append(make('feColorMatrix',{in:input,type:'matrix',values:vals.join(' '),result:'tint'}));input='tint';
    }
    fs.forEach((effect,i)=>{
      const bx=Number(effect.blurX||0),by=Number(effect.blurY||0),blur='blur'+i;
      if(effect.type==='BLURFILTER'){
        f.append(make('feGaussianBlur',{in:input,stdDeviation:`${bx/2} ${by/2}`,result:blur}));input=blur;
      }else if(effect.type==='GLOWFILTER'||effect.type==='DROPSHADOWFILTER'){
        const col=effect.glowColor||effect.dropShadowColor,strength=Number(effect.strength||1);
        f.append(make('feGaussianBlur',{in:input,stdDeviation:`${bx/2} ${by/2}`,result:blur}));
        let effectInput=blur;
        if(effect.type==='DROPSHADOWFILTER'){
          const angle=Number(effect.angle),distance=Number(effect.distance);
          f.append(make('feOffset',{in:blur,dx:Math.cos(angle)*distance,dy:Math.sin(angle)*distance,result:'offset'+i}));effectInput='offset'+i;
        }
        f.append(make('feColorMatrix',{in:effectInput,type:'matrix',values:`0 0 0 0 ${col[0]/255} 0 0 0 0 ${col[1]/255} 0 0 0 0 ${col[2]/255} 0 0 0 ${strength*col[3]/255} 0`,result:'glow'+i}));
        const merge=make('feMerge',{result:'merged'+i});merge.append(make('feMergeNode',{in:'glow'+i}),make('feMergeNode',{in:input}));f.append(merge);input='merged'+i;
      }
    });
    defs.append(f);return `url(#${id})`;
  }
  for(const [id,d] of Object.entries(data.definitions))if(d.type==='art'){
    const g=make('g',{id:'art'+id});g.innerHTML=d.svg;defs.append(g);
  }
  class Clip {
    constructor(p,parent) {
      this.definition=data.definitions[p.id];this.name=p.name||'';this.parent=parent;this.depth=p.depth;
      this.children=[];this.matrix=p.matrix.slice();this.visible=true;
      this.alpha=(p.color?.alphaMultTerm??256)/256*100;
      this.rotation=Math.atan2(this.matrix[1],this.matrix[0])*180/Math.PI;
      this.initialRotation=this.rotation;
      this.element=make('g');this.element.dataset.instance=this.name;
      this.content=make('g');this.element.append(this.content);
      const filter=filterFor(p);if(filter)this.content.setAttribute('filter',filter);
      this.dirty=true;this.textValue=this.definition.text||'';
      const proxy=new Proxy(this,{get:(target,key,receiver)=>Reflect.has(target,key)?Reflect.get(target,key,receiver):missing});
      objects.push(proxy);
      if(parent){parent.children.push(proxy);parent.content.append(this.element);if(this.name)parent[this.name]=proxy;}
      const d=this.definition;
      if(d.type==='sprite')for(const child of d.children)new Clip(child,proxy);
      else if(d.type==='art')this.content.append(make('use',{href:'#art'+p.id}));
      else if(d.type==='text'){
        const [x,y,x2,y2]=d.bounds;
        const viewport=make('svg',{x,y,width:x2-x,height:y2-y,viewBox:`${x} ${y} ${x2-x} ${y2-y}`,overflow:'hidden'});
        const [r,g,b,a]=d.color;
        // Preserve the SWF's Arial Bold device-font declaration. Its embedded
        // subset lacks digits, so editable fields require a local device font.
        this.textElement=make('text',{fill:`rgb(${r},${g},${b})`,'fill-opacity':a/255,'font-family':'Arial, sans-serif','font-size':d.size,'font-weight':d.bold?'bold':'normal'});
        viewport.append(this.textElement);this.content.append(viewport);
      }
      return proxy;
    }
    get _x(){return this.matrix[4];}set _x(v){this.matrix[4]=quantizePosition(v);this.dirty=true;}
    get _y(){return this.matrix[5];}set _y(v){this.matrix[5]=quantizePosition(v);this.dirty=true;}
    get _alpha(){return this.alpha;}set _alpha(v){this.alpha=Math.trunc(Number(v)*256/100)*100/256;this.dirty=true;}
    get _visible(){return this.visible;}set _visible(v){this.visible=Boolean(v);this.dirty=true;}
    get _rotation(){return this.rotation;}set _rotation(v){let angle=Number(v)%360;if(angle>180)angle-=360;if(angle< -180)angle+=360;this.rotation=angle;this.dirty=true;}
    get text(){return this.textValue;}set text(v){this.textValue=String(v);this.dirty=true;}
    render() {
      if(!this.dirty)return;
      this.dirty=false;
      const [a,b,c,d,x,y]=this.matrix;
      const theta=(this.rotation-this.initialRotation)*Math.PI/180,co=Math.cos(theta),si=Math.sin(theta);
      this.element.setAttribute('transform',`matrix(${a*co-b*si} ${a*si+b*co} ${c*co-d*si} ${c*si+d*co} ${x} ${y})`);
      this.element.setAttribute('visibility',this.visible?'visible':'hidden');
      // display:none prevents descendants explicitly marked visible from leaking out.
      this.element.style.display=this.visible?'':'none';
      this.element.setAttribute('opacity',Math.max(0,Math.min(1,this.alpha/100)));
      if(this.definition.type==='text'){
        const d=this.definition,[x,y,x2]=d.bounds;
        const tx=d.align===2?(x+x2)/2:d.align===1?x2-2:x+2;
        this.textElement.setAttribute('x',tx);this.textElement.setAttribute('y',y+2+d.size*.92);
        this.textElement.setAttribute('text-anchor',d.align===2?'middle':d.align===1?'end':'start');
        this.textElement.textContent=this.textValue;
      }
    }
  }
  const root={children:[],content:make('g'),_xmouse:0,_ymouse:0};stage.append(root.content);
  for(const p of data.children)new Clip(p,root);
  const initialState=objects.map(obj=>({obj,matrix:obj.matrix.slice(),alpha:obj.alpha,visible:obj.visible,rotation:obj.rotation,textValue:obj.textValue}));
  const Mouse={hide:()=>stage.style.cursor='none',show:()=>stage.style.cursor='default'};
  installGameplay(root,Mouse,math);
  installMissiles?.(root,stage);
  // Flash's enter-frame broadcast visits movie clips in reverse placement order,
  // followed by the root. Invisible clips continue to receive frame events.
  const eventOrder=objects.slice().reverse();
  function capturePrev(){
    for(const obj of objects){
      obj._prevX=obj.matrix[4];obj._prevY=obj.matrix[5];
      obj._prevRot=obj.rotation;obj._prevAlpha=obj.alpha;
    }
  }
  function present(alpha){
    alpha=Math.max(0,Math.min(1,alpha));
    for(const obj of objects){
      const [a,b,c,d]=obj.matrix;
      const px=obj._prevX??obj.matrix[4], py=obj._prevY??obj.matrix[5];
      const pr=obj._prevRot??obj.rotation, pa=obj._prevAlpha??obj.alpha;
      // Respawn teleports (rocket/asteroids/enemy) jump far in one logic tick.
      // Lerping those flashes a half-faded clone sliding up the screen for a frame.
      const teleport=Math.abs(obj.matrix[4]-px)>60||Math.abs(obj.matrix[5]-py)>60;
      const x=teleport?obj.matrix[4]:px+(obj.matrix[4]-px)*alpha;
      const y=teleport?obj.matrix[5]:py+(obj.matrix[5]-py)*alpha;
      const rot=teleport?obj.rotation:pr+(obj.rotation-pr)*alpha;
      const al=teleport&&pa<5?obj.alpha:pa+(obj.alpha-pa)*alpha;
      const theta=(rot-obj.initialRotation)*Math.PI/180,co=Math.cos(theta),si=Math.sin(theta);
      obj.element.setAttribute('transform',`matrix(${a*co-b*si} ${a*si+b*co} ${c*co-d*si} ${c*si+d*co} ${x} ${y})`);
      obj.element.setAttribute('visibility',obj.visible?'visible':'hidden');
      obj.element.style.display=obj.visible?'':'none';
      obj.element.setAttribute('opacity',Math.max(0,Math.min(1,al/100)));
      if(obj.definition.type==='text'){
        const def=obj.definition,[tx0,ty0,tx2]=def.bounds;
        const tx=def.align===2?(tx0+tx2)/2:def.align===1?tx2-2:tx0+2;
        obj.textElement.setAttribute('x',tx);obj.textElement.setAttribute('y',ty0+2+def.size*.92);
        obj.textElement.setAttribute('text-anchor',def.align===2?'middle':def.align===1?'end':'start');
        obj.textElement.textContent=obj.textValue;
      }
      obj.dirty=false;
    }
  }
  function render(){present(1);}
  function stepLogic(){
    // at16: true once per original Flash frame (every 3rd 48 Hz tick).
    root._phase=(root._phase|0)+1;
    root.at16=(root._phase%3)===0;
    const wasOver=root.gameover_mc._visible;
    for(const obj of eventOrder)if(typeof obj.onEnterFrame==='function')obj.onEnterFrame.call(obj);
    root.onEnterFrame?.call(root);frames++;
    if(!wasOver&&root.gameover_mc._visible){
      present(1);
      stage.dispatchEvent(new CustomEvent('raketenspiel:gameover',{detail:{
        points:Number(root.gameover_mc.punkteEnd_txt.text),level:Number(root.gameover_mc.levelEnd_txt.text)
      }}));
      return true;
    }
    return false;
  }
  function step(count=1){
    for(let i=0;i<count;i++){
      capturePrev();
      if(stepLogic()&&paused&&!isTest)break;
    }
    present(1);
  }
  function reset(){
    for(const saved of initialState){
      const obj=saved.obj;
      obj.matrix=saved.matrix.slice();obj.alpha=saved.alpha;obj.visible=saved.visible;
      obj.rotation=saved.rotation;obj.textValue=saved.textValue;obj.dirty=true;
      obj._prevX=obj.matrix[4];obj._prevY=obj.matrix[5];obj._prevRot=obj.rotation;obj._prevAlpha=obj.alpha;
      for(const event of ['onEnterFrame','onMouseDown','onMouseUp','onRelease'])obj[event]=undefined;
    }
    root.onEnterFrame=undefined;root._xmouse=root.schiff_mc._x;root._ymouse=0;
    frames=0;restartPressed=false;lastTime=null;accumulator=0;visualAccum=0;
    stage.querySelector('g[data-missiles]')?.remove();
    installGameplay(root,Mouse,math);
    installMissiles?.(root,stage);
    present(1);
  }
  function broadcast(name){for(const obj of eventOrder)if(typeof obj[name]==='function')obj[name].call(obj);}
  function pointer(e){
    const r=stage.getBoundingClientRect();
    // Full playfield range — do not clamp ship steering (seeker pods clamp separately).
    root._xmouse=quantizePosition((e.clientX-r.left)*550/r.width);
    root._ymouse=quantizePosition((e.clientY-r.top)*400/r.height);
  }
  let restartPressed=false;
  stage.addEventListener('pointermove',pointer);
  // Right-click seekers whenever a run is active (not only when cursor is over the SVG).
  // HUD text / letterboxing / left-laser capture used to block target-based checks.
  let lastMissileFire=0, rightHeld=false;
  const fireMissilesNow=()=>{
    const now=performance.now();
    if(now-lastMissileFire<200)return;
    lastMissileFire=now;
    if(!paused)root.fireMissiles?.();
  };
  document.addEventListener('mousedown',e=>{
    if(e.button!==2)return;
    if(paused)return;
    e.preventDefault();
    fireMissilesNow();
  },true);
  document.addEventListener('contextmenu',e=>{
    if(!paused)e.preventDefault();
  },true);
  document.addEventListener('pointermove',e=>{
    const down=(e.buttons&2)!==0;
    if(down&&!rightHeld&&!paused)fireMissilesNow();
    rightHeld=down;
  },true);
  document.addEventListener('pointerup',e=>{if(e.button===2)rightHeld=false;},true);
  stage.addEventListener('pointerdown',e=>{
    pointer(e);stage.focus();
    if(e.button===2){e.preventDefault();fireMissilesNow();return;}
    if(e.button!==0)return;
    stage.setPointerCapture(e.pointerId);
    restartPressed=root.neu_mc._visible&&root.neu_mc.element.contains(e.target);
    broadcast('onMouseDown');e.preventDefault();
  });
  stage.addEventListener('pointerup',e=>{
    pointer(e);
    if(e.button===0)broadcast('onMouseUp');
    if(restartPressed&&root.neu_mc._visible){const r=root.neu_mc.element.getBoundingClientRect();if(e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom)root.neu_mc.onRelease?.call(root.neu_mc);}
    restartPressed=false;render();
  });
  stage.addEventListener('pointercancel',()=>{broadcast('onMouseUp');restartPressed=false;});
  window.addEventListener('blur',()=>{broadcast('onMouseUp');lastTime=null;accumulator=0;});
  document.addEventListener('visibilitychange',()=>{lastTime=null;accumulator=0;if(document.hidden)broadcast('onMouseUp');});
  function loop(now){
    const dt=lastTime===null?0:Math.min(now-lastTime,250);
    lastTime=now;
    if(!paused&&!document.hidden){
      accumulator+=dt;
      while(!paused&&accumulator>=LOGIC_MS){
        capturePrev();
        const ended=stepLogic();
        accumulator-=LOGIC_MS;
        if(ended&&paused&&!isTest)break;
      }
      visualAccum+=dt;
      if(visualAccum>=VISUAL_MS){
        present(accumulator/LOGIC_MS);
        visualAccum%=VISUAL_MS;
      }
    }
    requestAnimationFrame(loop);
  }
  capturePrev();
  present(1);
  paused=isTest;requestAnimationFrame(loop);
  window.Raketenspiel={root,step,render,reset,get frames(){return frames;},pause(){paused=true;},play(){paused=false;lastTime=null;accumulator=0;visualAccum=0;},setRandom(fn){random=fn;},press(){broadcast('onMouseDown');},release(){broadcast('onMouseUp');},get objects(){return objects;}};
})();
