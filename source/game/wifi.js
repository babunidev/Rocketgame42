/* Hosting is controlled only by the trusted Electron preload. */
(() => {
  'use strict';
  const api=window.rocketLan;
  if(!api)return;
  const button=document.getElementById('serve-wifi');
  const panel=document.getElementById('wifi-panel');
  const toggle=document.getElementById('wifi-toggle');
  const close=document.getElementById('wifi-close');
  const addresses=document.getElementById('wifi-addresses');
  const status=document.getElementById('wifi-status');
  button.hidden=false;
  let busy=false;
  function render(s) {
    button.textContent=s.running?'WI-FI SHARING ON':'SERVE ON WI-FI';
    button.classList.toggle('active',!!s.running);
    toggle.textContent=s.running?'STOP SHARING':'START SHARING';
    addresses.replaceChildren();
    for(const url of s.urls||[]) {
      const a=document.createElement('a');a.textContent=url;a.href=url;a.target='_blank';a.rel='noopener noreferrer';addresses.append(a);
    }
    status.textContent=s.error|| (s.running ? (s.urls.length?'Sharing while this application remains open.':'Sharing started, but no network IPv4 address was detected.') : 'Sharing is off.');
  }
  async function action(fn) {
    if(busy)return;
    busy=true;toggle.disabled=true;status.textContent='Working…';
    try {render(await fn());} catch(e) {status.textContent='Could not change sharing: '+String(e.message||e);}
    finally {busy=false;toggle.disabled=false;}
  }
  button.addEventListener('click',async () => {panel.hidden=false;await action(()=>api.status());toggle.focus();});
  toggle.addEventListener('click',()=>action(async () => {
    const state=await api.status();
    return state.running?api.stop():api.start();
  }));
  close.addEventListener('click',()=>{panel.hidden=true;button.focus();});
  panel.addEventListener('keydown',e=>{if(e.key==='Escape'){panel.hidden=true;button.focus();}});
  action(()=>api.status());
})();
