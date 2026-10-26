const { app, BrowserWindow, Menu, session, protocol, net } = require('electron');
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
if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on('second-instance', () => { if(window){ if(window.isMinimized())window.restore(); window.show();window.focus();} });
  app.whenReady().then(() => {
    Menu.setApplicationMenu(null);
    const allowed = new Set(['index.html','assets.js','gameplay.js','runtime.js','highscores.js','highscores.css']);
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
      webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true}
    });
    window.webContents.setWindowOpenHandler(() => ({action:'deny'}));
    window.webContents.on('will-navigate', event => event.preventDefault());
    window.on('page-title-updated', event => event.preventDefault());
    window.once('ready-to-show', () => window.show());
    window.loadURL(gameURL);
  });
}
app.on('window-all-closed', () => app.quit());
app.on('before-quit', () => session.defaultSession?.flushStorageData());
