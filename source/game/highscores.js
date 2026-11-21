/* Arcade high scores. This browser shell does not change gameplay rules.
 * Online (served by server/rocketgame_server.py, e.g. babuni.dev/Rocketgame42/):
 *   one global top-100 list from api/scores, shown on the welcome and game-over screens.
 * Offline (Electron app, Wi-Fi sharing, plain static server): the local list in
 *   this browser's localStorage, as before. */
(() => {
  'use strict';
  const g=window.Raketenspiel, byId=id=>document.getElementById(id);
  const stage=byId('game'),screen=byId('score-screen'),shell=byId('game-shell');
  const key='raketenspiel.highscores.v1', nameKey='raketenspiel.lastName';
  const API='api/scores';
  // The original-SWF regression harness deliberately exercises the core alone.
  if(new URLSearchParams(location.search).has('test')){screen.hidden=true;return;}
  let records=[],lastName='',storageAvailable=true,run=null,playing=false;
  // 'detecting' → 'online' (server list) or 'local' (browser list).
  let mode=/^https?:$/.test(location.protocol)?'detecting':'local',online={reachable:true,maxScores:100};
  const cleanName=value=>String(value).replace(/[\u0000-\u001f\u007f]/g,'').trim().replace(/\s+/g,' ').slice(0,16);
  const order=(a,b)=>b.points-a.points||b.level-a.level||a.time-b.time||a.id.localeCompare(b.id);

  function readLastName(){
    try{const n=localStorage.getItem(nameKey);if(n)lastName=cleanName(n);}catch{}
  }
  function saveLastName(name){
    lastName=name;try{localStorage.setItem(nameKey,name);}catch{}
  }
  function readScores(){
    try{
      const saved=JSON.parse(localStorage.getItem(key)||'null');
      if(saved===null){records=[];readLastName();return;}
      if(saved.version!==1||!Array.isArray(saved.scores))throw new Error('Unknown high-score format');
      const valid=saved.scores.filter(s=>s&&typeof s.id==='string'&&typeof s.name==='string'&&cleanName(s.name)&&Number.isSafeInteger(s.points)&&Number.isSafeInteger(s.level)&&Number.isFinite(s.time));
      records=valid.map(s=>({...s,name:cleanName(s.name)})).sort(order);
      lastName=typeof saved.lastName==='string'?cleanName(saved.lastName):'';
      readLastName();
    }catch{storageAvailable=false;}
  }

  async function request(method,body){
    const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),8000);
    try{
      const res=await fetch(API,{method,cache:'no-store',signal:ctrl.signal,
        headers:body?{'Content-Type':'application/json'}:undefined,body:body?JSON.stringify(body):undefined});
      const data=await res.json().catch(()=>null);
      if(!res.ok||!data||!Array.isArray(data.scores))throw Object.assign(new Error(data?.error||`HTTP ${res.status}`),{status:res.status});
      return data;
    }finally{clearTimeout(timer);}
  }
  const fromServer=data=>{
    online.maxScores=data.maxScores||100;
    records=data.scores.filter(s=>s&&typeof s.name==='string').map((s,i)=>({id:`#${i+1}`,name:cleanName(s.name),points:s.points|0,level:s.level|0}));
  };
  // Refresh the list when a screen opens. First call decides online vs local.
  async function refresh(){
    if(mode==='local'){if(storageAvailable)readScores();renderBoard();return;}
    try{fromServer(await request('GET'));mode='online';online.reachable=true;}
    catch{
      if(mode==='detecting'){mode='local';readScores();}
      else online.reachable=false; // keep the last list we had
    }
    if(!playing)renderBoard();
  }

  const currentIndex=()=>!run?.saved?-1:mode==='online'?(run.rank?run.rank-1:-1):records.findIndex(s=>s.id===run.id);
  function renderBoard(){
    const body=byId('score-rows');body.replaceChildren();
    const mine=currentIndex();
    records.slice(0,10).forEach((entry,i)=>{
      const row=document.createElement('tr');
      if(i===mine){row.className='current-run';row.setAttribute('aria-current','true');}
      for(const value of [String(i+1).padStart(2,'0'),entry.name,String(entry.points),String(entry.level)]){
        const cell=document.createElement('td');cell.textContent=value;cell.title=value;row.append(cell);
      }
      body.append(row);
    });
    const empty=byId('empty-scores');
    empty.hidden=records.length>0||mode==='detecting';
    const standing=byId('standing');standing.textContent='';
    if(run?.saved){
      if(mode==='online'){
        standing.textContent=!run.rank?`Not in the top ${online.maxScores} this time.`:
          run.rank===1?'#1 — You hold the high score!':`Your place: #${run.rank} of the top ${online.maxScores}${run.rank>10?' · Outside the top 10.':'.'}`;
      }else{
        const rank=mine+1;
        standing.textContent=rank===1?'#1 — You hold the high score!':`Your place: #${rank} of ${records.length} runs${rank>10?' · Outside the top 10.':'.'}`;
      }
    }
    byId('storage-note').textContent=
      mode==='detecting'?'Loading high scores…':
      mode==='online'?(online.reachable?'Global high scores — every pilot on babuni.dev.':'Score server unreachable — showing the last list loaded.'):
      storageAvailable?'Saved locally in this browser.':'Browser storage unavailable. Scores stay for this session only.';
  }
  function showScreen(){
    shell.classList.add('showing-scores');
    playing=false;g.pause();g.release();stage.inert=true;stage.setAttribute('aria-hidden','true');stage.style.cursor='default';
    screen.hidden=false;renderBoard();refresh();
  }
  function start(){
    shell.classList.remove('showing-scores');
    run=null;playing=true;screen.hidden=true;stage.inert=false;stage.removeAttribute('aria-hidden');
    g.reset();g.play();stage.focus({preventScroll:true});
  }
  function gameOver(event){
    if(!playing)return;
    const {points,level}=event.detail;
    run={points:Number.isFinite(points)?Math.trunc(points):0,level:Number.isFinite(level)?Math.trunc(level):1,saved:false};
    byId('screen-title').textContent='GAME OVER';
    byId('screen-subtitle').textContent='Every pilot leaves a mark. Add yours.';
    byId('welcome-panel').hidden=true;byId('result-panel').hidden=false;
    screen.classList.remove('welcome-mode');
    byId('run-points').textContent=String(run.points);byId('run-level').textContent=String(run.level);
    const input=byId('player-name');input.value=lastName;input.readOnly=false;input.setCustomValidity('');
    const button=byId('save-score');button.disabled=false;button.textContent='SAVE SCORE ↵';
    byId('save-message').textContent='Press Enter to claim your place.';
    byId('start-game').firstChild.textContent='PLAY AGAIN ';
    showScreen();
    // On phones, focusing would pop up the keyboard over the result; let the player tap the field.
    if(!document.documentElement.classList.contains('touch')){input.focus({preventScroll:true});input.select();}
  }

  function markSaved(text,message){
    const input=byId('player-name');input.value=lastName;input.readOnly=true;
    const button=byId('save-score');button.disabled=true;button.textContent=text;
    byId('save-message').textContent=message;
    run.saved=true;renderBoard();
  }
  function saveLocal(name){
    if(storageAvailable)readScores();
    const entry={id:globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random()}`,name,points:run.points,level:run.level,time:Date.now()};
    records.push(entry);records.sort(order);lastName=name;
    if(storageAvailable){
      try{localStorage.setItem(key,JSON.stringify({version:1,lastName,scores:records}));}
      catch{storageAvailable=false;}
    }
    run.id=entry.id;
    const inTopTen=records.findIndex(s=>s.id===entry.id)<10;
    markSaved(storageAvailable?'SCORE SAVED ✓':'ADDED THIS SESSION',
      storageAvailable?(inTopTen?'Your place is marked on the board.':'Your standing is below the table.'):'Could not save to this browser.');
  }
  async function saveOnline(name){
    const button=byId('save-score');
    button.disabled=true;button.textContent='SAVING…';byId('save-message').textContent='Sending your score…';
    try{
      const data=await request('POST',{name,points:run.points,level:run.level});
      fromServer(data);online.reachable=true;run.rank=data.rank||null;
      markSaved('SCORE SAVED ✓',!run.rank?`Saved, but not in the top ${online.maxScores}.`:run.rank<=10?'Your place is marked on the board.':'Your standing is below the table.');
    }catch(error){
      button.disabled=false;button.textContent='TRY AGAIN ↵';
      byId('save-message').textContent=error.status===429?'Too many scores at once — wait a minute and try again.':'Could not reach the score server — try again.';
    }
  }
  byId('score-form').addEventListener('submit',event=>{
    event.preventDefault();if(!run||run.saved||byId('save-score').disabled)return;
    const input=byId('player-name'),name=cleanName(input.value);
    if(!name){input.setCustomValidity('Please enter your name.');input.reportValidity();return;}
    input.setCustomValidity('');input.blur();
    saveLastName(name);
    if(mode==='online')saveOnline(name);else saveLocal(name);
  });
  byId('player-name').addEventListener('input',()=>byId('player-name').setCustomValidity(''));
  byId('start-game').addEventListener('click',start);
  stage.addEventListener('raketenspiel:gameover',gameOver);
  window.addEventListener('storage',event=>{if(mode==='local'&&event.key===key&&storageAvailable){readScores();if(!playing)renderBoard();}});
  const resize=()=>shell.style.setProperty('--ui-scale',shell.getBoundingClientRect().width/550);
  new ResizeObserver(resize).observe(shell);resize();
  const ship=g.root.schiff_mc.element.cloneNode(true);
  ship.removeAttribute('data-instance');ship.querySelectorAll('[data-instance]').forEach(e=>e.removeAttribute('data-instance'));
  byId('menu-ship').append(ship);
  const rockSrc=g.root.asteroid1_mc.good_mc.element;
  const rockBox=rockSrc.getBBox();
  [['legend-rock-blue','blue'],['legend-rock-green','green'],['legend-rock-red','red']].forEach(([id,tone])=>{
    const host=byId(id);
    host.setAttribute('viewBox',`${rockBox.x-4} ${rockBox.y-4} ${rockBox.width+8} ${rockBox.height+8}`);
    host.classList.add(tone);
    const clone=rockSrc.cloneNode(true);
    clone.removeAttribute('data-instance');
    clone.querySelectorAll('[data-instance]').forEach(e=>e.removeAttribute('data-instance'));
    clone.removeAttribute('transform');
    host.append(clone);
  });
  readLastName();
  if(mode==='local')readScores();
  screen.classList.add('welcome-mode');
  showScreen();
})();
