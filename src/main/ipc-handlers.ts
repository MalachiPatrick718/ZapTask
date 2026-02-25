import { ipcMain, shell, app, BrowserWindow, Notification } from 'electron';
import { IPC } from '../shared/types/ipc-channels';
import { syncEngine } from './services/sync-engine';
import { getTaskRepository } from './database';
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

  // Shell
  ipcMain.on(IPC.SHELL_OPEN_URL, (_event, url: string) => {
    if (typeof url === 'string' && (url.startsWith('https://') || url.startsWith('http://'))) {
      shell.openExternal(url);
    }
  });

  // OAuth — stub
  ipcMain.handle(IPC.OAUTH_START, async (_event, params: { toolId: string }) => {
    console.log(`[OAuth] Start flow for: ${params.toolId}`);
    // TODO: Open OAuth URL in system browser for real OAuth flow
  });

  // Sync
  ipcMain.handle(IPC.SYNC_NOW, async (_event, toolId?: string) => {
    if (toolId) {
      return syncEngine.syncSource(toolId as TaskSource);
    }
    return syncEngine.syncAll();
  });

  // Store — stubs (credential storage)
  // TODO: Implement with electron-store when real OAuth credentials are available
  ipcMain.handle(IPC.STORE_GET_CREDENTIALS, async (_event, _toolId: string) => {
    return null;
  });

  ipcMain.handle(IPC.STORE_SET_CREDENTIALS, async (_event, _toolId: string, _creds: any) => {
    // stub
  });

  ipcMain.handle(IPC.STORE_CLEAR_CREDENTIALS, async (_event, _toolId: string) => {
    // stub
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
}
