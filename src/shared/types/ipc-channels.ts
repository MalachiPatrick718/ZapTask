export const IPC = {
  // Window
  WINDOW_MINIMIZE: 'window:minimize',
  WINDOW_HIDE: 'window:hide',
  WINDOW_ALWAYS_ON_TOP: 'window:alwaysOnTop',

  // Shell
  SHELL_OPEN_URL: 'shell:openUrl',

  // OAuth
  OAUTH_START: 'oauth:start',
  OAUTH_CALLBACK: 'oauth:callback',

  // Sync
  SYNC_NOW: 'sync:now',
  SYNC_STATUS: 'sync:status',

  // Store (credentials)
  STORE_GET_CREDENTIALS: 'store:getCredentials',
  STORE_SET_CREDENTIALS: 'store:setCredentials',
  STORE_CLEAR_CREDENTIALS: 'store:clearCredentials',

  // Tasks
  TASKS_GET_ALL: 'tasks:getAll',
  TASKS_CREATE: 'tasks:create',
  TASKS_UPDATE: 'tasks:update',
  TASKS_DELETE: 'tasks:delete',

  // Notifications
  NOTIFICATION_SHOW: 'notification:show',

  // App
  APP_GET_AUTO_LAUNCH: 'app:getAutoLaunch',
  APP_SET_AUTO_LAUNCH: 'app:setAutoLaunch',

  // Navigation
  NAVIGATE_TO_TASK: 'navigate:toTask',
} as const;
