export interface OAuthProviderConfig {
  authUrl: string;
  tokenUrl: string;
  scopes: string[];
  usePKCE: boolean;
  /** 'body' = client_id/secret in POST body; 'basic' = HTTP Basic auth header */
  tokenAuthMethod: 'body' | 'basic';
  extraAuthParams?: Record<string, string>;
}

export const OAUTH_PROVIDERS: Record<string, OAuthProviderConfig> = {
  jira: {
    authUrl: 'https://auth.atlassian.com/authorize',
    tokenUrl: 'https://auth.atlassian.com/oauth/token',
    scopes: ['read:jira-work', 'offline_access'],
    usePKCE: true,
    tokenAuthMethod: 'body',
    extraAuthParams: {
      audience: 'api.atlassian.com',
      prompt: 'consent',
    },
  },
  asana: {
    authUrl: 'https://app.asana.com/-/oauth_authorize',
    tokenUrl: 'https://app.asana.com/-/oauth_token',
    scopes: ['default'],
    usePKCE: true,
    tokenAuthMethod: 'body',
  },
  monday: {
    authUrl: 'https://auth.monday.com/oauth2/authorize',
    tokenUrl: 'https://auth.monday.com/oauth2/token',
    scopes: ['boards:read', 'workspaces:read'],
    usePKCE: false,
    tokenAuthMethod: 'body',
  },
  notion: {
    authUrl: 'https://api.notion.com/v1/oauth/authorize',
    tokenUrl: 'https://api.notion.com/v1/oauth/token',
    scopes: [],
    usePKCE: false,
    tokenAuthMethod: 'basic',
    extraAuthParams: { owner: 'user' },
  },
  gcal: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    usePKCE: true,
    tokenAuthMethod: 'body',
    extraAuthParams: { access_type: 'offline', prompt: 'consent' },
  },
  outlook: {
    authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    scopes: ['Calendars.Read', 'offline_access'],
    usePKCE: true,
    tokenAuthMethod: 'body',
  },
  todoist: {
    authUrl: 'https://todoist.com/oauth/authorize',
    tokenUrl: 'https://todoist.com/oauth/access_token',
    scopes: ['data:read'],
    usePKCE: false,
    tokenAuthMethod: 'body',
  },
};

export function getRedirectUri(port: number): string {
  return `http://localhost:${port}/callback`;
}
