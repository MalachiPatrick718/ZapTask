export const TOOL_META: Record<string, { name: string; color: string; description: string }> = {
  jira: { name: 'Jira', color: '#2684FF', description: 'Import issues and epics from Jira projects' },
  asana: { name: 'Asana', color: '#F06A6A', description: 'Sync tasks and projects from Asana' },
  notion: { name: 'Notion', color: '#999', description: 'Pull tasks from Notion databases' },
  monday: { name: 'Monday.com', color: '#FF3D57', description: 'Sync items and boards from Monday.com' },
  gcal: { name: 'Google Calendar', color: '#4285F4', description: 'Import events from Google Calendar' },
  outlook: { name: 'Outlook', color: '#0078D4', description: 'Sync tasks and events from Outlook' },
  apple_cal: { name: 'Apple Calendar', color: '#FF3B30', description: 'Import events from Apple Calendar' },
  todoist: { name: 'Todoist', color: '#E44332', description: 'Sync tasks from your Todoist projects' },
};

export const TOOL_ORDER = ['jira', 'asana', 'notion', 'monday', 'todoist', 'gcal', 'outlook', 'apple_cal'] as const;
