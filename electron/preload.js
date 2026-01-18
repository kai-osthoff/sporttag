"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
// Context bridge for Electron detection and IPC communication
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    isElectron: true,
    getVersion: function () { return electron_1.ipcRenderer.invoke('app:get-version'); },
    openExternal: function (url) { return electron_1.ipcRenderer.invoke('shell:open-external', url); },
});
