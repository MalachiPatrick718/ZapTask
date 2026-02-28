import { BrowserWindow, screen, app } from 'electron';
import path from 'node:path';

let mainWindow: BrowserWindow | null = null;
let isQuitting = false;
let widgetBounds: Electron.Rectangle | null = null;

export function getMainWindow(): BrowserWindow | null {
  return mainWindow;
}

export function createWindow(): BrowserWindow {
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: 360,
    height: 660,
    x: screenWidth - 360 - 20,
    y: 20,
    minWidth: 360,
    minHeight: 660,
    maxWidth: 360,
    maxHeight: 660,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: false,
    resizable: false,
    hasShadow: true,
    backgroundColor: '#0D0C10',
    roundedCorners: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  // Load the renderer
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  // Show window once content is ready
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Log renderer load errors
  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
    console.error('[Window] Failed to load:', errorCode, errorDescription);
  });
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('[Window] Renderer loaded successfully');
  });
  mainWindow.webContents.on('render-process-gone', (_event, details) => {
    console.error('[Window] Render process gone:', details.reason);
  });

  // Open devtools in development
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  // Hide on close instead of quitting (tray behavior)
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Allow actual quit when app is quitting
  app.on('before-quit', () => {
    isQuitting = true;
  });

  return mainWindow;
}

export function toggleVisibility(): void {
  if (!mainWindow) return;
  if (mainWindow.isVisible()) {
    mainWindow.hide();
  } else {
    mainWindow.show();
    mainWindow.focus();
  }
}

export function expandWindow(): void {
  if (!mainWindow) return;

  // Save current widget bounds for later restoration
  widgetBounds = mainWindow.getBounds();

  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
  const expandedWidth = 900;
  const expandedHeight = 700;

  // Remove size constraints first
  mainWindow.setMinimumSize(360, 400);
  mainWindow.setMaximumSize(1200, 900);
  mainWindow.setResizable(true);

  // Disable always-on-top for expanded mode
  mainWindow.setAlwaysOnTop(false);

  // Center on screen
  const x = Math.round((screenWidth - expandedWidth) / 2);
  const y = Math.round((screenHeight - expandedHeight) / 2);

  mainWindow.setBounds({ x, y, width: expandedWidth, height: expandedHeight }, true);
}

export function collapseWindow(): void {
  if (!mainWindow) return;

  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;

  // Restore widget constraints
  mainWindow.setResizable(false);
  mainWindow.setMinimumSize(360, 660);
  mainWindow.setMaximumSize(360, 660);

  // Re-enable always-on-top
  mainWindow.setAlwaysOnTop(true);

  // Restore to saved position or default bottom-right
  const bounds = widgetBounds || {
    x: screenWidth - 360 - 20,
    y: screenHeight - 660 - 20,
    width: 400,
    height: 660,
  };

  mainWindow.setBounds(bounds, true);
  widgetBounds = null;
}

export function isExpanded(): boolean {
  if (!mainWindow) return false;
  const bounds = mainWindow.getBounds();
  return bounds.width > 400;
}

export function toggleExpand(): boolean {
  if (isExpanded()) {
    collapseWindow();
    return false; // now widget mode
  } else {
    expandWindow();
    return true; // now expanded mode
  }
}
