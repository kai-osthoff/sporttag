import { app, BrowserWindow } from 'electron';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import windowStateKeeper from 'electron-window-state';

// Fixed port for production (non-standard to avoid conflicts)
const PORT = 3456;

// Track processes
let nextServer: ChildProcess | null = null;
let mainWindow: BrowserWindow | null = null;

// Track quit intent for macOS close-to-hide behavior
let isQuitting = false;

/**
 * Wait for the Next.js server to be ready
 */
async function waitForServer(url: string, maxAttempts = 30): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        console.log(`Server ready at ${url}`);
        return;
      }
    } catch {
      // Server not ready yet
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  throw new Error(`Server failed to start at ${url} after ${maxAttempts} attempts`);
}

/**
 * Start the Next.js standalone server
 */
async function startNextServer(): Promise<void> {
  // Determine server.js path based on packaged vs development
  const serverPath = app.isPackaged
    ? path.join(process.resourcesPath, 'standalone', 'server.js')
    : path.join(__dirname, '..', '.next', 'standalone', 'server.js');

  // Database path: userData for production, project root for development
  const dbPath = app.isPackaged
    ? path.join(app.getPath('userData'), 'sporttag.db')
    : path.join(__dirname, '..', 'sporttag.db');

  console.log(`Starting Next.js server at ${serverPath}`);
  console.log(`Database path: ${dbPath}`);

  nextServer = spawn('node', [serverPath], {
    env: {
      ...process.env,
      PORT: String(PORT),
      HOSTNAME: 'localhost',
      DB_PATH: dbPath,
    },
    cwd: path.dirname(serverPath),
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  // Pipe output for debugging
  nextServer.stdout?.on('data', (data) => {
    console.log(`[Next.js] ${data.toString().trim()}`);
  });

  nextServer.stderr?.on('data', (data) => {
    console.error(`[Next.js] ${data.toString().trim()}`);
  });

  nextServer.on('error', (err) => {
    console.error('Failed to start Next.js server:', err);
  });

  nextServer.on('exit', (code, signal) => {
    console.log(`Next.js server exited with code ${code}, signal ${signal}`);
    nextServer = null;
  });

  // Wait for server to be ready
  await waitForServer(`http://localhost:${PORT}`);
}

/**
 * Create the main application window with state persistence
 */
function createWindow(): void {
  // Restore window position and size from previous session
  const windowState = windowStateKeeper({
    defaultWidth: 1200,
    defaultHeight: 800,
  });

  mainWindow = new BrowserWindow({
    x: windowState.x,
    y: windowState.y,
    width: windowState.width,
    height: windowState.height,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Let windowStateKeeper track position and size changes
  windowState.manage(mainWindow);

  // Use PORT 3456 for both dev and production (consistent, avoids conflicts)
  const url = `http://localhost:${PORT}`;
  mainWindow.loadURL(url);

  // macOS: Hide instead of close on X button (unless actually quitting)
  mainWindow.on('close', (event) => {
    if (process.platform === 'darwin' && !isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App lifecycle
app.whenReady().then(async () => {
  const isDev = !app.isPackaged;

  try {
    if (!isDev) {
      // Production: spawn standalone server
      await startNextServer();
    }
    // Dev mode: Next.js dev server already running via concurrently
    createWindow();
  } catch (err) {
    console.error('Failed to initialize app:', err);
    app.quit();
  }
});

// Track when user triggers quit (Cmd+Q or menu)
app.on('before-quit', () => {
  isQuitting = true;
});

app.on('quit', () => {
  if (nextServer) {
    console.log('Killing Next.js server...');
    nextServer.kill();
    nextServer = null;
  }
});

app.on('window-all-closed', () => {
  // On macOS, keep app running (will be enhanced in Plan 02)
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS, re-show window when dock icon clicked (or create if somehow null)
  if (mainWindow) {
    mainWindow.show();
  } else {
    createWindow();
  }
});
