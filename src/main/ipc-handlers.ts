import { ipcMain, shell, app, BrowserWindow, Notification, clipboard, nativeImage } from 'electron';
import * as path from 'node:path';
import * as fs from 'node:fs';
import * as os from 'node:os';
import { IPC } from '../shared/types/ipc-channels';
import { syncEngine } from './services/sync-engine';
import { getTaskRepository } from './database';
import { expandWindow, collapseWindow, toggleExpand, getMainWindow } from './window-manager';
import { getCredentials, setCredentials, clearCredentials } from './credential-store';
import { checkForUpdates, downloadUpdate, installUpdate } from './services/update-service';
import type { Task, TaskSource } from '../shared/types';

export function registerIpcHandlers(): void {
  // Window
  ipcMain.on(IPC.WINDOW_MINIMIZE, (event) => {
    BrowserWindow.fromWebContents(event.sender)?.minimize();
  });

  ipcMain.on(IPC.WINDOW_HIDE, (event) => {
    BrowserWindow.fromWebContents(event.sender)?.hide();
  });

  ipcMain.on(IPC.WINDOW_ALWAYS_ON_TOP, (event, flag: boolean) => {
    BrowserWindow.fromWebContents(event.sender)?.setAlwaysOnTop(flag);
  });

  ipcMain.handle(IPC.WINDOW_EXPAND, async () => {
    expandWindow();
    return { success: true };
  });

  ipcMain.handle(IPC.WINDOW_COLLAPSE, async () => {
    collapseWindow();
    return { success: true };
  });

  ipcMain.handle(IPC.WINDOW_TOGGLE_EXPAND, async () => {
    const expanded = toggleExpand();
    // Notify renderer of the new state
    const win = getMainWindow();
    if (win) {
      win.webContents.send('window:expandChanged', expanded);
    }
    return { success: true, expanded };
  });

  // Shell
  ipcMain.on(IPC.SHELL_OPEN_URL, (_event, url: string) => {
    if (typeof url === 'string' && (url.startsWith('https://') || url.startsWith('http://'))) {
      shell.openExternal(url);
    }
  });

  // OAuth — direct OAuth 2.0 with PKCE via loopback server
  ipcMain.handle(IPC.OAUTH_START, async (event, params: { toolId: string }) => {
    try {
      const { startOAuthFlow } = await import('./auth/oauth-manager');
      const result = await startOAuthFlow(params.toolId);

      // On success, add tool to sync engine so periodic sync picks it up
      if (result.success) {
        const { getConnectedToolIds } = await import('./credential-store');
        syncEngine.setConnectedTools(getConnectedToolIds());
        if (!syncEngine.isRunning) {
          syncEngine.start();
        }
      }

      // Send the result to the renderer via the callback channel
      const win = BrowserWindow.fromWebContents(event.sender);
      if (win) {
        win.show();
        win.focus();
        win.webContents.send(IPC.OAUTH_CALLBACK, result);
      }

      return { success: true };
    } catch (err) {
      console.error(`[OAuth] Failed to start flow for ${params.toolId}:`, err);
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  });

  // Sync
  ipcMain.handle(IPC.SYNC_NOW, async (_event, toolId?: string) => {
    if (toolId) {
      return syncEngine.syncSource(toolId as TaskSource);
    }
    return syncEngine.syncAll();
  });

  // Store — credential storage (Nango connectionIds)
  ipcMain.handle(IPC.STORE_GET_CREDENTIALS, async (_event, toolId: string) => {
    try {
      return { success: true, data: getCredentials(toolId) };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  });

  ipcMain.handle(IPC.STORE_SET_CREDENTIALS, async (_event, toolId: string, creds: any) => {
    try {
      setCredentials(toolId, creds);
      return { success: true };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  });

  ipcMain.handle(IPC.STORE_CLEAR_CREDENTIALS, async (_event, toolId: string) => {
    try {
      clearCredentials(toolId);
      return { success: true };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  });

  // Notifications
  ipcMain.handle(IPC.NOTIFICATION_SHOW, async (event, title: string, body: string, taskId?: string) => {
    try {
      const notification = new Notification({ title, body });
      if (taskId) {
        notification.on('click', () => {
          const win = BrowserWindow.fromWebContents(event.sender);
          if (win) {
            win.show();
            win.focus();
            win.webContents.send(IPC.NAVIGATE_TO_TASK, taskId);
          }
        });
      }
      notification.show();
      return { success: true };
    } catch (err) {
      console.error('[IPC] notification:show error:', err);
      return { success: false, error: String(err) };
    }
  });

  // App settings
  ipcMain.handle(IPC.APP_GET_AUTO_LAUNCH, async () => {
    try {
      return { success: true, data: app.getLoginItemSettings().openAtLogin };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  });

  ipcMain.handle(IPC.APP_SET_AUTO_LAUNCH, async (_event, enabled: boolean) => {
    try {
      app.setLoginItemSettings({ openAtLogin: enabled, openAsHidden: true });
      return { success: true };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  });

  // Tasks — SQLite CRUD
  ipcMain.handle(IPC.TASKS_GET_ALL, async () => {
    try {
      return { success: true, data: getTaskRepository().getAll() };
    } catch (err) {
      console.error('[IPC] tasks:getAll error:', err);
      return { success: false, error: String(err) };
    }
  });

  ipcMain.handle(IPC.TASKS_CREATE, async (_event, task: Task) => {
    try {
      const created = getTaskRepository().create(task);
      return { success: true, data: created };
    } catch (err) {
      console.error('[IPC] tasks:create error:', err);
      return { success: false, error: String(err) };
    }
  });

  ipcMain.handle(IPC.TASKS_UPDATE, async (_event, id: string, changes: Partial<Task>) => {
    try {
      const updated = getTaskRepository().update(id, changes);
      if (!updated) return { success: false, error: 'Task not found' };
      return { success: true, data: updated };
    } catch (err) {
      console.error('[IPC] tasks:update error:', err);
      return { success: false, error: String(err) };
    }
  });

  ipcMain.handle(IPC.TASKS_DELETE, async (_event, id: string) => {
    try {
      const deleted = getTaskRepository().delete(id);
      return { success: true, data: deleted };
    } catch (err) {
      console.error('[IPC] tasks:delete error:', err);
      return { success: false, error: String(err) };
    }
  });

  ipcMain.handle(IPC.TASKS_DELETE_BY_SOURCE, async (_event, source: string) => {
    try {
      const count = getTaskRepository().deleteBySource(source);
      return { success: true, data: count };
    } catch (err) {
      console.error('[IPC] tasks:deleteBySource error:', err);
      return { success: false, error: String(err) };
    }
  });

  // License config (Stripe Checkout base URL)
  ipcMain.handle(IPC.LICENSE_GET_CONFIG, async () => {
    return {
      checkoutBaseUrl: process.env.CHECKOUT_BASE_URL || 'https://zaptask.io/api/checkout',
    };
  });

  // License validation
  ipcMain.handle(IPC.LICENSE_VALIDATE, async (_event, licenseKey: string) => {
    try {
      const apiBase = process.env.LICENSE_API_URL || 'https://zaptask.io';
      const res = await fetch(`${apiBase}/api/license/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: licenseKey }),
      });
      if (!res.ok) {
        return { valid: false, error: `HTTP ${res.status}` };
      }
      return await res.json();
    } catch (err) {
      console.error('[License] Validation error:', err);
      return { valid: false, error: err instanceof Error ? err.message : String(err) };
    }
  });

  // Feedback — capture screenshot
  ipcMain.handle(IPC.FEEDBACK_CAPTURE_SCREENSHOT, async (event) => {
    try {
      const win = BrowserWindow.fromWebContents(event.sender);
      if (!win) return { success: false, error: 'No window found' };
      const image = await win.webContents.capturePage();
      return { success: true, data: image.toDataURL() };
    } catch (err) {
      console.error('[IPC] feedback:captureScreenshot error:', err);
      return { success: false, error: String(err) };
    }
  });

  // Feedback — send via mailto + clipboard screenshot
  ipcMain.handle(IPC.FEEDBACK_SEND, async (_event, data: {
    category: string;
    subject: string;
    message: string;
    screenshotDataUrl?: string;
  }) => {
    try {
      const feedbackEmail = process.env.FEEDBACK_EMAIL || 'support@zaptask.app';
      const subjectLine = `[${data.category}] ${data.subject}`;
      const body = data.message
        + (data.screenshotDataUrl
          ? '\n\n---\n[Screenshot copied to clipboard — please paste it here]'
          : '');

      const mailto = `mailto:${feedbackEmail}?subject=${encodeURIComponent(subjectLine)}&body=${encodeURIComponent(body)}`;
      await shell.openExternal(mailto);

      if (data.screenshotDataUrl) {
        const img = nativeImage.createFromDataURL(data.screenshotDataUrl);
        clipboard.writeImage(img);
        const tempPath = path.join(os.tmpdir(), `zaptask-screenshot-${Date.now()}.png`);
        fs.writeFileSync(tempPath, img.toPNG());
        console.log('[Feedback] Screenshot saved to', tempPath);
      }

      return { success: true };
    } catch (err) {
      console.error('[IPC] feedback:send error:', err);
      return { success: false, error: String(err) };
    }
  });

  // Updates
  ipcMain.handle(IPC.APP_CHECK_UPDATE, async () => {
    try {
      await checkForUpdates();
      return { success: true };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  });

  ipcMain.handle(IPC.APP_DOWNLOAD_UPDATE, async () => {
    try {
      downloadUpdate();
      return { success: true };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  });

  ipcMain.handle(IPC.APP_INSTALL_UPDATE, async () => {
    try {
      installUpdate();
      return { success: true };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  });

  // Open external URL (validated)
  ipcMain.handle(IPC.APP_OPEN_EXTERNAL, async (_event, url: string) => {
    if (typeof url === 'string' && (url.startsWith('https://') || url.startsWith('http://'))) {
      await shell.openExternal(url);
      return { success: true };
    }
    return { success: false, error: 'Invalid URL' };
  });

}
