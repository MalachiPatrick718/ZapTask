import { contextBridge, ipcRenderer } from 'electron';
import { IPC } from '../shared/types/ipc-channels';

const api = {
  // Window
  minimize: () => ipcRenderer.send(IPC.WINDOW_MINIMIZE),
  hide: () => ipcRenderer.send(IPC.WINDOW_HIDE),
  setAlwaysOnTop: (v: boolean) => ipcRenderer.send(IPC.WINDOW_ALWAYS_ON_TOP, v),
  expand: () => ipcRenderer.invoke(IPC.WINDOW_EXPAND),
  collapse: () => ipcRenderer.invoke(IPC.WINDOW_COLLAPSE),
  toggleExpand: () => ipcRenderer.invoke(IPC.WINDOW_TOGGLE_EXPAND),
  onExpandChanged: (cb: (expanded: boolean) => void) => {
    const handler = (_e: Electron.IpcRendererEvent, expanded: boolean) => cb(expanded);
    ipcRenderer.on('window:expandChanged', handler);
    return () => { ipcRenderer.removeListener('window:expandChanged', handler); };
  },

  // Shell
  openUrl: (url: string) => ipcRenderer.send(IPC.SHELL_OPEN_URL, url),

  // OAuth
  startOAuth: (params: { toolId: string }) => ipcRenderer.invoke(IPC.OAUTH_START, params),
  onOAuthCallback: (cb: (data: { success: boolean; toolId: string; error?: string }) => void) => {
    const handler = (_e: Electron.IpcRendererEvent, data: { success: boolean; toolId: string; error?: string }) => cb(data);
    ipcRenderer.on(IPC.OAUTH_CALLBACK, handler);
    return () => { ipcRenderer.removeListener(IPC.OAUTH_CALLBACK, handler); };
  },

  // Sync
  syncNow: (toolId?: string) => ipcRenderer.invoke(IPC.SYNC_NOW, toolId),
  onSyncStatus: (cb: (data: { toolId: string; status: string; lastSyncAt?: string; error?: string }) => void) => {
    const handler = (_e: Electron.IpcRendererEvent, data: any) => cb(data);
    ipcRenderer.on(IPC.SYNC_STATUS, handler);
    return () => { ipcRenderer.removeListener(IPC.SYNC_STATUS, handler); };
  },

  // Sync tasks (main -> renderer)
  onSyncTasks: (cb: (data: { source: string; tasks: any[] }) => void) => {
    const handler = (_e: Electron.IpcRendererEvent, data: any) => cb(data);
    ipcRenderer.on('sync:tasks', handler);
    return () => { ipcRenderer.removeListener('sync:tasks', handler); };
  },

  // Store (credentials only — app state lives in Zustand/localStorage)
  getCredentials: (toolId: string) => ipcRenderer.invoke(IPC.STORE_GET_CREDENTIALS, toolId),
  setCredentials: (toolId: string, creds: any) => ipcRenderer.invoke(IPC.STORE_SET_CREDENTIALS, toolId, creds),
  clearCredentials: (toolId: string) => ipcRenderer.invoke(IPC.STORE_CLEAR_CREDENTIALS, toolId),

  // Tasks — SQLite persistence via IPC
  tasks: {
    getAll: () => ipcRenderer.invoke(IPC.TASKS_GET_ALL),
    create: (task: any) => ipcRenderer.invoke(IPC.TASKS_CREATE, task),
    update: (id: string, changes: any) => ipcRenderer.invoke(IPC.TASKS_UPDATE, id, changes),
    delete: (id: string) => ipcRenderer.invoke(IPC.TASKS_DELETE, id),
    deleteBySource: (source: string) => ipcRenderer.invoke(IPC.TASKS_DELETE_BY_SOURCE, source),
  },

  // Notifications
  notifications: {
    show: (title: string, body: string, taskId?: string) =>
      ipcRenderer.invoke(IPC.NOTIFICATION_SHOW, title, body, taskId),
  },

  // App settings & updates
  app: {
    getAutoLaunch: () => ipcRenderer.invoke(IPC.APP_GET_AUTO_LAUNCH),
    setAutoLaunch: (v: boolean) => ipcRenderer.invoke(IPC.APP_SET_AUTO_LAUNCH, v),
    checkForUpdate: () => ipcRenderer.invoke(IPC.APP_CHECK_UPDATE),
    downloadUpdate: () => ipcRenderer.invoke(IPC.APP_DOWNLOAD_UPDATE),
    installUpdate: () => ipcRenderer.invoke(IPC.APP_INSTALL_UPDATE),
    openExternal: (url: string) => ipcRenderer.invoke(IPC.APP_OPEN_EXTERNAL, url),
  },

  // Update status (main -> renderer)
  onUpdateStatus: (cb: (data: { status: string; version?: string; releaseNotes?: string; downloadUrl?: string; progress?: number; error?: string }) => void) => {
    const handler = (_e: Electron.IpcRendererEvent, data: any) => cb(data);
    ipcRenderer.on(IPC.APP_UPDATE_STATUS, handler);
    return () => { ipcRenderer.removeListener(IPC.APP_UPDATE_STATUS, handler); };
  },

  // Navigation (main -> renderer)
  onNavigateToTask: (cb: (taskId: string) => void) => {
    const handler = (_e: Electron.IpcRendererEvent, taskId: string) => cb(taskId);
    ipcRenderer.on(IPC.NAVIGATE_TO_TASK, handler);
    return () => { ipcRenderer.removeListener(IPC.NAVIGATE_TO_TASK, handler); };
  },

  // License / Billing
  license: {
    getConfig: () => ipcRenderer.invoke(IPC.LICENSE_GET_CONFIG) as Promise<{
      checkoutBaseUrl: string;
    }>,
    validate: (key: string) => ipcRenderer.invoke(IPC.LICENSE_VALIDATE, key) as Promise<{
      valid: boolean;
      tier?: string;
      expiresAt?: string | null;
      email?: string | null;
      error?: string;
    }>,
  },

  // Feedback
  feedback: {
    captureScreenshot: () => ipcRenderer.invoke(IPC.FEEDBACK_CAPTURE_SCREENSHOT) as Promise<{
      success: boolean;
      data?: string;
      error?: string;
    }>,
    send: (data: {
      category: string;
      subject: string;
      message: string;
      screenshotDataUrl?: string;
    }) => ipcRenderer.invoke(IPC.FEEDBACK_SEND, data) as Promise<{
      success: boolean;
      error?: string;
    }>,
  },

};

export type ZaptaskAPI = typeof api;

contextBridge.exposeInMainWorld('zaptask', api);
