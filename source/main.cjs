const { app, BrowserWindow, Menu, session, protocol, net, ipcMain } = require('electron');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const fs = require('node:fs');
const { pathToFileURL } = require('node:url');

app.setName('Raketenspiel 42 by Babuni.dev');
protocol.registerSchemesAsPrivileged([{scheme:'raketenspiel',privileges:{standard:true,secure:true,supportFetchAPI:true}}]);
// A fixed origin keeps localStorage independent of the portable launcher's
// temporary extraction path and of where the EXE is copied.
const gameURL = 'raketenspiel://game/index.html';
const portableDirectory = process.env.PORTABLE_EXECUTABLE_DIR || path.dirname(process.execPath);
const dataPath = path.join(portableDirectory, 'Raketenspiel 42 Data');
try {
  fs.mkdirSync(dataPath, { recursive: true });
  const probe = path.join(dataPath, '.write-check-' + process.pid);
  fs.writeFileSync(probe, '');fs.unlinkSync(probe);
  app.setPath('userData', dataPath);
} catch { /* A read-only location uses the normal Windows user-data folder. */ }
let window;
let lanServer = null;
const lanPort = 4173;
const gameDir = path.join(__dirname, 'game');
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.ogg':'audio/ogg'};
const publicFiles = new Set(['index.html','assets.js','gameplay.js','runtime.js','missiles.js','sfx.js','highscores.js','highscores.css','wifi.js','sounds/roket-explosion.ogg','sounds/seeker-explosion.ogg']);
function localUrls() {
  return Object.values(os.networkInterfaces()).flat().filter(i => i && i.family === 'IPv4' && !i.internal)
    .map(i => 'http://' + i.address + ':' + lanPort + '/').filter((s,i,a) => a.indexOf(s) === i);
}
function lanStatus() { return { running: !!lanServer, urls: lanServer ? localUrls() : [] }; }
function stopLan() {
  const server = lanServer; lanServer = null;
  if (server) server.close();
  return lanStatus();
}
async function startLan() {
  if (lanServer) return lanStatus();
  const server = http.createServer((req,res) => {
    const raw = (req.url || '/').split('?')[0];
    let relative;
    try { relative = decodeURIComponent(raw).replace(/^[/]+/, '') || 'index.html'; }
    catch { res.writeHead(400).end(); return; }
    if (!['GET','HEAD'].includes(req.method)) { res.writeHead(405).end(); return; }
    if (!publicFiles.has(relative)) { res.writeHead(404).end(); return; }
    const full = path.join(gameDir, relative);
    const stream = fs.createReadStream(full);
    stream.on('error', () => { if (!res.headersSent) res.writeHead(404); res.end(); });
    res.setHeader('Content-Type', mime[path.extname(full)] || 'application/octet-stream');
    res.setHeader('Cache-Control','no-store');
    if (req.method === 'HEAD') { stream.destroy(); res.end(); return; }
    stream.pipe(res);
  });
  try {
    await new Promise((resolve,reject) => {
      server.once('error',reject);
      server.listen(lanPort,'0.0.0.0',() => { server.off('error',reject); resolve(); });
    });
    lanServer = server;
    return lanStatus();
  } catch (error) {
    server.close();
    return { running:false, urls:[], error: error.code === 'EADDRINUSE' ? 'Port ' + lanPort + ' is already in use.' : String(error.message || error) };
  }
}
function trustedIpc(event) { return event.sender === window?.webContents && event.senderFrame === window?.webContents.mainFrame && event.senderFrame.url === gameURL; }
ipcMain.handle('lan:status', event => trustedIpc(event) ? lanStatus() : {running:false,urls:[],error:'Denied'});
ipcMain.handle('lan:start', event => trustedIpc(event) ? startLan() : {running:false,urls:[],error:'Denied'});
ipcMain.handle('lan:stop', event => trustedIpc(event) ? stopLan() : {running:false,urls:[],error:'Denied'});

if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on('second-instance', () => { if(window){ if(window.isMinimized())window.restore(); window.show();window.focus();} });
  app.whenReady().then(() => {
    Menu.setApplicationMenu(null);
    const allowed = publicFiles;
    protocol.handle('raketenspiel', request => {
      const url = new URL(request.url), name = url.pathname.slice(1) || 'index.html';
      if(url.host !== 'game' || !allowed.has(name)) return new Response('Not found', {status:404});
      return net.fetch(pathToFileURL(path.join(__dirname,'game',name)).href);
    });
    session.defaultSession.setPermissionRequestHandler((_wc, _permission, done) => done(false));
    session.defaultSession.webRequest.onBeforeRequest({urls:['http://*/*','https://*/*']}, (_details, done) => done({cancel:true}));
    window = new BrowserWindow({
      title:'Raketenspiel 42 by Babuni.dev',
      width:566, height:416, useContentSize:true,
      resizable:false, maximizable:false, backgroundColor:'#000000',
      icon:path.join(__dirname,'build','icon.png'),show:false,
      webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true,preload:path.join(__dirname,'preload.cjs')}
    });
    window.webContents.setWindowOpenHandler(() => ({action:'deny'}));
    window.webContents.on('will-navigate', event => event.preventDefault());
    window.on('page-title-updated', event => event.preventDefault());
    window.once('ready-to-show', () => window.show());
    window.loadURL(gameURL);
  });
}
app.on('window-all-closed', () => { stopLan(); app.quit(); });
app.on('before-quit', () => { stopLan(); session.defaultSession?.flushStorageData(); });
