"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var child_process_1 = require("child_process");
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var electron_window_state_1 = __importDefault(require("electron-window-state"));
// IPC handlers for update notification
electron_1.ipcMain.handle('app:get-version', function () { return electron_1.app.getVersion(); });
electron_1.ipcMain.handle('shell:open-external', function (_event, url) {
    // Security: Only allow GitHub URLs for this app
    if (url.startsWith('https://github.com/kai-osthoff/sporttag')) {
        return electron_1.shell.openExternal(url);
    }
    throw new Error('Invalid URL - only GitHub sporttag URLs allowed');
});
// Fixed port for production (non-standard to avoid conflicts)
var PORT = 3456;
// Track processes
var nextServer = null;
var mainWindow = null;
// Track quit intent for macOS close-to-hide behavior
var isQuitting = false;
/**
 * Wait for the Next.js server to be ready
 */
function waitForServer(url_1) {
    return __awaiter(this, arguments, void 0, function (url, maxAttempts) {
        var i, response, _a;
        if (maxAttempts === void 0) { maxAttempts = 30; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    i = 0;
                    _b.label = 1;
                case 1:
                    if (!(i < maxAttempts)) return [3 /*break*/, 8];
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, fetch(url)];
                case 3:
                    response = _b.sent();
                    if (response.ok) {
                        console.log("Server ready at ".concat(url));
                        return [2 /*return*/];
                    }
                    return [3 /*break*/, 5];
                case 4:
                    _a = _b.sent();
                    return [3 /*break*/, 5];
                case 5: return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 500); })];
                case 6:
                    _b.sent();
                    _b.label = 7;
                case 7:
                    i++;
                    return [3 /*break*/, 1];
                case 8: throw new Error("Server failed to start at ".concat(url, " after ").concat(maxAttempts, " attempts"));
            }
        });
    });
}
/**
 * Start the Next.js standalone server
 */
function startNextServer() {
    return __awaiter(this, void 0, void 0, function () {
        var serverPath, dbPath, migrationsPath, userData;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    serverPath = electron_1.app.isPackaged
                        ? path_1.default.join(process.resourcesPath, 'standalone', 'githubrepos', 'sporttag', 'server.js')
                        : path_1.default.join(__dirname, '..', '.next', 'standalone', 'githubrepos', 'sporttag', 'server.js');
                    if (electron_1.app.isPackaged) {
                        userData = electron_1.app.getPath('userData');
                        fs_1.default.mkdirSync(userData, { recursive: true });
                        console.log("Created/verified userData directory: ".concat(userData));
                        dbPath = path_1.default.join(userData, 'sporttag.db');
                        migrationsPath = path_1.default.join(process.resourcesPath, 'standalone', 'githubrepos', 'sporttag', 'src', 'db', 'migrations');
                    }
                    else {
                        // Development: use project root
                        dbPath = path_1.default.join(__dirname, '..', 'sporttag.db');
                        migrationsPath = path_1.default.join(__dirname, '..', 'src', 'db', 'migrations');
                    }
                    console.log("Starting Next.js server at ".concat(serverPath));
                    console.log("Database path: ".concat(dbPath));
                    console.log("Migrations path: ".concat(migrationsPath));
                    nextServer = (0, child_process_1.spawn)('node', [serverPath], {
                        env: __assign(__assign({}, process.env), { PORT: String(PORT), HOSTNAME: 'localhost', DB_PATH: dbPath, MIGRATIONS_PATH: migrationsPath }),
                        cwd: path_1.default.dirname(serverPath),
                        stdio: ['ignore', 'pipe', 'pipe'],
                    });
                    // Pipe output for debugging
                    (_a = nextServer.stdout) === null || _a === void 0 ? void 0 : _a.on('data', function (data) {
                        console.log("[Next.js] ".concat(data.toString().trim()));
                    });
                    (_b = nextServer.stderr) === null || _b === void 0 ? void 0 : _b.on('data', function (data) {
                        console.error("[Next.js] ".concat(data.toString().trim()));
                    });
                    nextServer.on('error', function (err) {
                        console.error('Failed to start Next.js server:', err);
                    });
                    nextServer.on('exit', function (code, signal) {
                        console.log("Next.js server exited with code ".concat(code, ", signal ").concat(signal));
                        nextServer = null;
                    });
                    // Wait for server to be ready
                    return [4 /*yield*/, waitForServer("http://localhost:".concat(PORT))];
                case 1:
                    // Wait for server to be ready
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Create the main application window with state persistence
 */
function createWindow() {
    // Restore window position and size from previous session
    var windowState = (0, electron_window_state_1.default)({
        defaultWidth: 1200,
        defaultHeight: 800,
    });
    mainWindow = new electron_1.BrowserWindow({
        x: windowState.x,
        y: windowState.y,
        width: windowState.width,
        height: windowState.height,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            preload: path_1.default.join(__dirname, 'preload.js'),
        },
    });
    // Let windowStateKeeper track position and size changes
    windowState.manage(mainWindow);
    // Use PORT 3456 for both dev and production (consistent, avoids conflicts)
    var url = "http://localhost:".concat(PORT);
    mainWindow.loadURL(url);
    // macOS: Hide instead of close on X button (unless actually quitting)
    mainWindow.on('close', function (event) {
        if (process.platform === 'darwin' && !isQuitting) {
            event.preventDefault();
            mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.hide();
        }
    });
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}
// App lifecycle
electron_1.app.whenReady().then(function () { return __awaiter(void 0, void 0, void 0, function () {
    var isDev, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                isDev = !electron_1.app.isPackaged;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                if (!!isDev) return [3 /*break*/, 3];
                // Production: spawn standalone server
                return [4 /*yield*/, startNextServer()];
            case 2:
                // Production: spawn standalone server
                _a.sent();
                _a.label = 3;
            case 3:
                // Dev mode: Next.js dev server already running via concurrently
                createWindow();
                return [3 /*break*/, 5];
            case 4:
                err_1 = _a.sent();
                console.error('Failed to initialize app:', err_1);
                electron_1.app.quit();
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
// Track when user triggers quit (Cmd+Q or menu)
electron_1.app.on('before-quit', function () {
    isQuitting = true;
});
electron_1.app.on('quit', function () {
    if (nextServer) {
        console.log('Killing Next.js server...');
        nextServer.kill();
        nextServer = null;
    }
});
electron_1.app.on('window-all-closed', function () {
    // On macOS, keep app running (will be enhanced in Plan 02)
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', function () {
    // On macOS, re-show window when dock icon clicked (or create if somehow null)
    if (mainWindow) {
        mainWindow.show();
    }
    else {
        createWindow();
    }
});
