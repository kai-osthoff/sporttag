import { contextBridge } from 'electron';

// Minimal context bridge for Electron detection
// No IPC needed since Server Actions handle all data operations
contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
});
