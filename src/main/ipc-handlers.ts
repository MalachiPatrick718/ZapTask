import { ipcMain, shell, app, BrowserWindow, Notification, clipboard, nativeImage } from 'electron';
import * as path from 'node:path';
import * as fs from 'node:fs';
import * as os from 'node:os';
import { IPC } from '../shared/types/ipc-channels';
import { syncEngine } from './services/sync-engine';
import { getTaskRepository } from './database';
import { expandToSettings, collapseToWidget } from './window-manager';
import { getCredentials, setCredentials, clearCredentials } from './credential-store';
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

  ipcMain.handle(IPC.WINDOW_EXPAND_SETTINGS, async () => {
    expandToSettings();
    return { success: true };
  });

  ipcMain.handle(IPC.WINDOW_COLLAPSE_WIDGET, async () => {
    collapseToWidget();
    return { success: true };
  });

  // Shell
  ipcMain.on(IPC.SHELL_OPEN_URL, (_event, url: string) => {
    if (typeof url === 'string' && (url.startsWith('https://') || url.startsWith('http://'))) {
      shell.openExternal(url);
    }
  });

  // OAuth — direct OAuth 2.0 with PKCE
  ipcMain.handle(IPC.OAUTH_START, async (_event, params: { toolId: string }) => {
    try {
      const { startOAuthFlow } = await import('./auth/oauth-manager');
      const { state } = startOAuthFlow(params.toolId);
      return { success: true, state };
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

  // Paddle config
  ipcMain.handle(IPC.PADDLE_GET_CONFIG, async () => {
    return {
      clientToken: process.env.PADDLE_CLIENT_TOKEN || '',
      priceIdMonthly: process.env.PADDLE_PRICE_ID_MONTHLY || '',
      priceIdYearly: process.env.PADDLE_PRICE_ID_YEARLY || '',
    };
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

}
