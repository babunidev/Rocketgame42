/* On-screen controls for phones and tablets. Mouse play is unchanged.
 *  - Steering pad (left): drag left/right; the ship follows the finger's movement.
 *    Touching the playfield itself also steers the ship to that x position.
 *  - LASER (right): hold to fire, like holding the left mouse button.
 *  - ROCKETS (right): tap to launch the stocked seeker missiles, like a right click.
 */
(() => {
  'use strict';
  const g=window.Raketenspiel, byId=id=>document.getElementById(id);
  const root=document.documentElement, shell=byId('game-shell');
  const pad=byId('steer-pad'), laser=byId('btn-laser'), rockets=byId('btn-rockets');
  if(!g||!pad||new URLSearchParams(location.search).has('test'))return;

  const enable=()=>{if(!root.classList.contains('touch'))root.classList.add('touch');};
  // index.html already sets the class for touch-first devices; this also catches
  // touch laptops/tablets that report a mouse first.
  window.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')enable();},{capture:true,passive:true});

  // Steering pad: relative drag. One screen pixel of finger movement moves the
  // ship a bit more than one screen pixel, so small thumb moves cover the field.
  const GAIN=1.6;
  let steerId=null,startX=0,startShip=0;
  pad.addEventListener('pointerdown',e=>{
    if(steerId!==null)return;
    steerId=e.pointerId;startX=e.clientX;startShip=g.root._xmouse;
    pad.setPointerCapture(e.pointerId);pad.classList.add('active');e.preventDefault();
  });
  pad.addEventListener('pointermove',e=>{
    if(e.pointerId!==steerId)return;
    const unitsPerPx=550/shell.getBoundingClientRect().width;
    g.steer(startShip+(e.clientX-startX)*unitsPerPx*GAIN);
  });
  const endSteer=e=>{if(e.pointerId!==steerId)return;steerId=null;pad.classList.remove('active');};
  pad.addEventListener('pointerup',endSteer);
  pad.addEventListener('pointercancel',endSteer);
  pad.addEventListener('lostpointercapture',endSteer);

  // LASER: held while any finger stays on the button.
  const held=new Set();
  const laserDown=e=>{
    e.preventDefault();laser.setPointerCapture(e.pointerId);
    if(!held.size){g.press();laser.classList.add('active');}
    held.add(e.pointerId);
  };
  const laserUp=e=>{
    if(!held.delete(e.pointerId)||held.size)return;
    g.release();laser.classList.remove('active');
  };
  laser.addEventListener('pointerdown',laserDown);
  laser.addEventListener('pointerup',laserUp);
  laser.addEventListener('pointercancel',laserUp);
  laser.addEventListener('lostpointercapture',laserUp);

  // ROCKETS: one launch per tap (runtime.js debounces repeats within 200 ms).
  rockets.addEventListener('pointerdown',e=>{
    e.preventDefault();g.fireMissiles();
    rockets.classList.add('active');setTimeout(()=>rockets.classList.remove('active'),160);
  });

  // No long-press menus, text selection or double-tap zoom on the controls.
  for(const el of [pad,laser,rockets])el.addEventListener('contextmenu',e=>e.preventDefault());

  // When the high-score screen opens, highscores.js releases the laser; forget held fingers too.
  new MutationObserver(()=>{
    if(shell.classList.contains('showing-scores')){held.clear();laser.classList.remove('active');steerId=null;pad.classList.remove('active');}
  }).observe(shell,{attributes:true,attributeFilter:['class']});
})();
