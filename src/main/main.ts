import 'dotenv/config';
import { app, BrowserWindow, nativeImage, globalShortcut } from 'electron';

// Crash handlers — log but don't crash the app
process.on('unhandledRejection', (reason) => {
  console.error('[Main] Unhandled rejection:', reason);
});
process.on('uncaughtException', (error) => {
  console.error('[Main] Uncaught exception:', error);
});
import path from 'node:path';
import started from 'electron-squirrel-startup';
import { createWindow, getMainWindow, toggleVisibility, toggleExpand } from './window-manager';
import { setupTray, destroyTray } from './tray';
import { registerIpcHandlers } from './ipc-handlers';
import { IPC } from '../shared/types/ipc-channels';
import { syncEngine } from './services/sync-engine';
import { notificationScheduler } from './services/notification-scheduler';
import { getDb, closeDb } from './database';
import { getConnectedToolIds } from './credential-store';

// Handle Squirrel events on Windows
if (started) app.quit();

// Ensure single instance
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (_event, argv) => {
    const win = getMainWindow();
    if (win) {
      if (win.isMinimized()) win.restore();
      win.show();
      win.focus();
    }
    // On Windows, deep-link URL comes as a command-line argument
    const url = argv.find(arg => arg.startsWith('zaptask://'));
    if (url) handleDeepLink(url);
  });
}

// Register deep-link protocol
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('zaptask', process.execPath, [process.argv[1]]);
  }
} else {
  app.setAsDefaultProtocolClient('zaptask');
}

app.whenReady().then(() => {
  // Set dock icon (macOS) — in dev, process.cwd() is project root
  if (process.platform === 'darwin') {
    const iconPath = app.isPackaged
      ? path.join(process.resourcesPath, 'icons', 'icon.png')
      : path.join(process.cwd(), 'assets/icons/icon.png');
    const dockIcon = nativeImage.createFromPath(iconPath);
    if (!dockIcon.isEmpty()) {
      app.dock?.setIcon(dockIcon);
    }
  }

  // Initialize SQLite database (creates file, runs migrations)
  getDb();

  registerIpcHandlers();
  createWindow();
  setupTray();
  notificationScheduler.start();

  // Global keyboard shortcuts
  globalShortcut.register('CommandOrControl+H', () => {
    toggleVisibility();
  });

  globalShortcut.register('CommandOrControl+E', () => {
    const win = getMainWindow();
    if (!win || !win.isVisible()) return;
    const expanded = toggleExpand();
    win.webContents.send('window:expandChanged', expanded);
  });

  // Start sync engine with tools that have stored credentials
  const connectedTools = getConnectedToolIds();
  if (connectedTools.length > 0) {
    syncEngine.setConnectedTools(connectedTools);
    syncEngine.start();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else {
      const win = getMainWindow();
      if (win) win.show();
    }
  });
});

app.on('before-quit', () => {
  globalShortcut.unregisterAll();
  notificationScheduler.stop();
  closeDb();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    destroyTray();
    app.quit();
  }
});

// Handle deep-link on macOS
app.on('open-url', (_event, url) => {
  handleDeepLink(url);
});

async function handleDeepLink(url: string) {
  try {
    const parsed = new URL(url);

    // OAuth callbacks are now handled by the loopback HTTP server
    // (see src/main/auth/loopback-server.ts)

    // Task deep link: zaptask://task/{taskId}
    const taskMatch = parsed.pathname.match(/^\/?\/task\/(.+)$/);
    if (taskMatch) {
      const taskId = taskMatch[1];
      const win = getMainWindow();
      if (win) {
        win.show();
        win.focus();
        win.webContents.send(IPC.NAVIGATE_TO_TASK, taskId);
      }
    }
  } catch (err) {
    console.error('[DeepLink] Error handling URL:', err);
  }
}
