/* Local arcade high scores. This browser shell does not change gameplay rules. */
(() => {
  'use strict';
  const g=window.Raketenspiel, byId=id=>document.getElementById(id);
  const stage=byId('game'),screen=byId('score-screen'),shell=byId('game-shell');
  const key='raketenspiel.highscores.v1';
  // The original-SWF regression harness deliberately exercises the core alone.
  if(new URLSearchParams(location.search).has('test')){screen.hidden=true;return;}
  let records=[],lastName='',storageAvailable=true,run=null,playing=false;
  const cleanName=value=>String(value).replace(/[\u0000-\u001f\u007f]/g,'').trim().replace(/\s+/g,' ').slice(0,16);
  const order=(a,b)=>b.points-a.points||b.level-a.level||a.time-b.time||a.id.localeCompare(b.id);
  function readScores(){
    try{
      const saved=JSON.parse(localStorage.getItem(key)||'null');
      if(saved===null){records=[];lastName='';return;}
      if(saved.version!==1||!Array.isArray(saved.scores))throw new Error('Unknown high-score format');
      const valid=saved.scores.filter(s=>s&&typeof s.id==='string'&&typeof s.name==='string'&&cleanName(s.name)&&Number.isSafeInteger(s.points)&&Number.isSafeInteger(s.level)&&Number.isFinite(s.time));
      records=valid.map(s=>({...s,name:cleanName(s.name)})).sort(order);
      lastName=typeof saved.lastName==='string'?cleanName(saved.lastName):'';
    }catch{storageAvailable=false;}
  }
  function renderBoard(){
    const body=byId('score-rows');body.replaceChildren();
    records.slice(0,10).forEach((entry,i)=>{
      const row=document.createElement('tr');
      if(run?.id===entry.id){row.className='current-run';row.setAttribute('aria-current','true');}
      for(const value of [String(i+1).padStart(2,'0'),entry.name,String(entry.points),String(entry.level)]){
        const cell=document.createElement('td');cell.textContent=value;cell.title=value;row.append(cell);
      }
      body.append(row);
    });
    byId('empty-scores').hidden=records.length>0;
    const standing=byId('standing');standing.textContent='';
    if(run?.saved){
      const rank=records.findIndex(s=>s.id===run.id)+1;
      standing.textContent=rank===1?'#1 — You hold the high score!':`Your place: #${rank} of ${records.length} runs${rank>10?' · Outside the top 10.':'.'}`;
    }
    byId('storage-note').textContent=storageAvailable?'Saved locally in this browser.':'Browser storage unavailable. Scores stay for this session only.';
  }
  function showScreen(){
    shell.classList.add('showing-scores');
    playing=false;g.pause();g.release();stage.inert=true;stage.setAttribute('aria-hidden','true');stage.style.cursor='default';
    screen.hidden=false;renderBoard();
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
    if(storageAvailable)readScores();showScreen();
    input.focus({preventScroll:true});input.select();
  }
  byId('score-form').addEventListener('submit',event=>{
    event.preventDefault();if(!run||run.saved)return;
    const input=byId('player-name'),name=cleanName(input.value);
    if(!name){input.setCustomValidity('Please enter your name.');input.reportValidity();return;}
    input.setCustomValidity('');
    if(storageAvailable)readScores();
    const entry={id:globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random()}`,name,points:run.points,level:run.level,time:Date.now()};
    records.push(entry);records.sort(order);lastName=name;
    if(storageAvailable){
      try{localStorage.setItem(key,JSON.stringify({version:1,lastName,scores:records}));}
      catch{storageAvailable=false;}
    }
    run.id=entry.id;run.saved=true;input.value=name;input.readOnly=true;
    byId('save-score').disabled=true;byId('save-score').textContent=storageAvailable?'SCORE SAVED ✓':'ADDED THIS SESSION';
    const inTopTen=records.findIndex(s=>s.id===entry.id)<10;
    byId('save-message').textContent=storageAvailable?(inTopTen?'Your place is marked on the board.':'Your standing is below the table.'):'Could not save to this browser.';
    renderBoard();
  });
  byId('player-name').addEventListener('input',()=>byId('player-name').setCustomValidity(''));
  byId('start-game').addEventListener('click',start);
  stage.addEventListener('raketenspiel:gameover',gameOver);
  window.addEventListener('storage',event=>{if(event.key===key&&storageAvailable){readScores();if(!playing)renderBoard();}});
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
  readScores();
  screen.classList.add('welcome-mode');
  showScreen();
})();
