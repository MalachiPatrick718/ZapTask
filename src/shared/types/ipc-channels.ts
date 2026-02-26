export const IPC = {
  // Window
  WINDOW_MINIMIZE: 'window:minimize',
  WINDOW_HIDE: 'window:hide',
  WINDOW_ALWAYS_ON_TOP: 'window:alwaysOnTop',
  WINDOW_EXPAND_SETTINGS: 'window:expandSettings',
  WINDOW_COLLAPSE_WIDGET: 'window:collapseWidget',

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

  // Paddle / Billing
  PADDLE_GET_CONFIG: 'paddle:getConfig',

  // Feedback
  FEEDBACK_CAPTURE_SCREENSHOT: 'feedback:captureScreenshot',
  FEEDBACK_SEND: 'feedback:send',

} as const;
