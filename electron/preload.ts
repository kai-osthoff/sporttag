import { contextBridge, ipcRenderer } from 'electron';

// Context bridge for Electron detection and IPC communication
contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  getVersion: () => ipcRenderer.invoke('app:get-version'),
  openExternal: (url: string) => ipcRenderer.invoke('shell:open-external', url),
});
