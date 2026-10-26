const {contextBridge,ipcRenderer} = require('electron');
contextBridge.exposeInMainWorld('rocketLan',Object.freeze({
  status: () => ipcRenderer.invoke('lan:status'),
  start: () => ipcRenderer.invoke('lan:start'),
  stop: () => ipcRenderer.invoke('lan:stop')
}));
