"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
// Minimal context bridge for Electron detection
// No IPC needed since Server Actions handle all data operations
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    isElectron: true,
});
