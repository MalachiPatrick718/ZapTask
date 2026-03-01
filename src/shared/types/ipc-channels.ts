export const IPC = {
  // Window
  WINDOW_MINIMIZE: 'window:minimize',
  WINDOW_HIDE: 'window:hide',
  WINDOW_ALWAYS_ON_TOP: 'window:alwaysOnTop',
  WINDOW_EXPAND: 'window:expand',
  WINDOW_COLLAPSE: 'window:collapse',
  WINDOW_TOGGLE_EXPAND: 'window:toggleExpand',

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
  TASKS_DELETE_BY_SOURCE: 'tasks:deleteBySource',

  // Notifications
  NOTIFICATION_SHOW: 'notification:show',

  // App
  APP_GET_AUTO_LAUNCH: 'app:getAutoLaunch',
  APP_SET_AUTO_LAUNCH: 'app:setAutoLaunch',

  // Navigation
  NAVIGATE_TO_TASK: 'navigate:toTask',

  // License / Billing
  LICENSE_GET_CONFIG: 'license:getConfig',
  LICENSE_VALIDATE: 'license:validate',

  // Feedback
  FEEDBACK_CAPTURE_SCREENSHOT: 'feedback:captureScreenshot',
  FEEDBACK_SEND: 'feedback:send',

  // Updates
  APP_CHECK_UPDATE: 'app:checkUpdate',
  APP_UPDATE_STATUS: 'app:updateStatus',
  APP_DOWNLOAD_UPDATE: 'app:downloadUpdate',
  APP_INSTALL_UPDATE: 'app:installUpdate',
  APP_OPEN_EXTERNAL: 'app:openExternal',

} as const;
