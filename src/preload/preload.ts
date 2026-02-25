import { contextBridge, ipcRenderer } from 'electron';
import { IPC } from '../shared/types/ipc-channels';

const api = {
  // Window
  minimize: () => ipcRenderer.send(IPC.WINDOW_MINIMIZE),
  hide: () => ipcRenderer.send(IPC.WINDOW_HIDE),
  setAlwaysOnTop: (v: boolean) => ipcRenderer.send(IPC.WINDOW_ALWAYS_ON_TOP, v),

  // Shell
  openUrl: (url: string) => ipcRenderer.send(IPC.SHELL_OPEN_URL, url),

  // OAuth
  startOAuth: (params: { toolId: string }) => ipcRenderer.invoke(IPC.OAUTH_START, params),
  onOAuthCallback: (cb: (data: { toolId: string; code: string }) => void) => {
    const handler = (_e: Electron.IpcRendererEvent, data: { toolId: string; code: string }) => cb(data);
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
  },

  // Notifications
  notifications: {
    show: (title: string, body: string, taskId?: string) =>
      ipcRenderer.invoke(IPC.NOTIFICATION_SHOW, title, body, taskId),
  },

  // App settings
  app: {
    getAutoLaunch: () => ipcRenderer.invoke(IPC.APP_GET_AUTO_LAUNCH),
    setAutoLaunch: (v: boolean) => ipcRenderer.invoke(IPC.APP_SET_AUTO_LAUNCH, v),
  },

  // Navigation (main -> renderer)
  onNavigateToTask: (cb: (taskId: string) => void) => {
    const handler = (_e: Electron.IpcRendererEvent, taskId: string) => cb(taskId);
    ipcRenderer.on(IPC.NAVIGATE_TO_TASK, handler);
    return () => { ipcRenderer.removeListener(IPC.NAVIGATE_TO_TASK, handler); };
  },
};

export type ZaptaskAPI = typeof api;

contextBridge.exposeInMainWorld('zaptask', api);
