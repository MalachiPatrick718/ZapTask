import { shell } from 'electron';
import { OAUTH_PROVIDERS, getRedirectUri, type OAuthProviderConfig } from './oauth-config';
import { generatePKCE, generateState } from './pkce';
import { getCredentials, setCredentials } from '../credential-store';
import { startLoopbackServer } from './loopback-server';

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
}

const CLIENT_CREDENTIALS: Record<string, { clientId: string; clientSecret: string }> = {
  jira: { clientId: process.env.JIRA_CLIENT_ID || '', clientSecret: process.env.JIRA_CLIENT_SECRET || '' },
  asana: { clientId: process.env.ASANA_CLIENT_ID || '', clientSecret: process.env.ASANA_CLIENT_SECRET || '' },
  notion: { clientId: process.env.NOTION_CLIENT_ID || '', clientSecret: process.env.NOTION_CLIENT_SECRET || '' },
  monday: { clientId: process.env.MONDAY_CLIENT_ID || '', clientSecret: process.env.MONDAY_CLIENT_SECRET || '' },
  gcal: { clientId: process.env.GCAL_CLIENT_ID || '', clientSecret: process.env.GCAL_CLIENT_SECRET || '' },
  outlook: { clientId: process.env.OUTLOOK_CLIENT_ID || '', clientSecret: process.env.OUTLOOK_CLIENT_SECRET || '' },
  todoist: { clientId: process.env.TODOIST_CLIENT_ID || '', clientSecret: process.env.TODOIST_CLIENT_SECRET || '' },
};

function getClientCredentials(toolId: string): { clientId: string; clientSecret: string } {
  return CLIENT_CREDENTIALS[toolId] || { clientId: '', clientSecret: '' };
}

/**
 * Start an OAuth flow:
 * 1. Spin up a temp loopback HTTP server
 * 2. Open system browser to auth URL with loopback redirect
 * 3. Wait for provider to redirect back with code
 * 4. Exchange code for tokens
 * 5. Store credentials and return result
 */
export async function startOAuthFlow(
  toolId: string,
): Promise<{ success: boolean; toolId: string; error?: string }> {
  const config = OAUTH_PROVIDERS[toolId];
  if (!config) {
    return { success: false, toolId, error: `Unknown OAuth provider: ${toolId}` };
  }

  const { clientId, clientSecret } = getClientCredentials(toolId);
  if (!clientId) {
    return {
      success: false,
      toolId,
      error: `${toolId.charAt(0).toUpperCase() + toolId.slice(1)} integration is not configured yet`,
    };
  }

  // Start loopback server to catch the callback
  const server = startLoopbackServer();
  const redirectUri = getRedirectUri(server.port);

  const state = generateState();
  let codeVerifier: string | null = null;

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
  });

  if (config.scopes.length > 0) {
    params.set('scope', config.scopes.join(' '));
  }

  if (config.usePKCE) {
    const pkce = generatePKCE();
    codeVerifier = pkce.codeVerifier;
    params.set('code_challenge', pkce.codeChallenge);
    params.set('code_challenge_method', 'S256');
  }

  if (config.extraAuthParams) {
    for (const [key, value] of Object.entries(config.extraAuthParams)) {
      params.set(key, value);
    }
  }

  const authUrl = `${config.authUrl}?${params.toString()}`;
  shell.openExternal(authUrl);

  try {
    // Wait for the loopback server to receive the callback
    const { code, state: returnedState } = await server.result;

    if (returnedState !== state) {
      return { success: false, toolId, error: 'OAuth state mismatch' };
    }

    // Exchange authorization code for tokens
    const tokens = await exchangeCode(config, clientId, clientSecret, code, codeVerifier, redirectUri);

    setCredentials(toolId, {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || null,
      expiresAt: tokens.expires_in
        ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
        : null,
      tokenType: tokens.token_type || 'Bearer',
    });

    return { success: true, toolId };
  } catch (err) {
    server.close();
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[OAuth] Flow failed for ${toolId}:`, msg);
    return { success: false, toolId, error: msg };
  }
}

async function exchangeCode(
  config: OAuthProviderConfig,
  clientId: string,
  clientSecret: string,
  code: string,
  codeVerifier: string | null,
  redirectUri: string,
): Promise<TokenResponse> {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
  });

  const headers: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded',
    Accept: 'application/json',
  };

  if (config.tokenAuthMethod === 'basic') {
    headers['Authorization'] = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`;
  } else {
    body.set('client_id', clientId);
    if (clientSecret) body.set('client_secret', clientSecret);
  }

  if (codeVerifier) {
    body.set('code_verifier', codeVerifier);
  }

  const res = await fetch(config.tokenUrl, {
    method: 'POST',
    headers,
    body: body.toString(),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Token exchange failed (${res.status}): ${errorBody}`);
  }

  return res.json();
}

/**
 * Refresh an access token. Returns new token or null if refresh failed.
 */
export async function refreshAccessToken(toolId: string): Promise<string | null> {
  const creds = getCredentials(toolId);
  if (!creds?.refreshToken) return null;

  const config = OAUTH_PROVIDERS[toolId];
  if (!config) return null;

  const { clientId, clientSecret } = getClientCredentials(toolId);

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: creds.refreshToken,
  });

  const headers: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded',
    Accept: 'application/json',
  };

  if (config.tokenAuthMethod === 'basic') {
    headers['Authorization'] = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`;
  } else {
    body.set('client_id', clientId);
    if (clientSecret) body.set('client_secret', clientSecret);
  }

  try {
    const res = await fetch(config.tokenUrl, { method: 'POST', headers, body: body.toString() });
    if (!res.ok) {
      console.error(`[OAuth] Refresh failed for ${toolId}: ${res.status}`);
      return null;
    }

    const tokens: TokenResponse = await res.json();

    setCredentials(toolId, {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || creds.refreshToken,
      expiresAt: tokens.expires_in
        ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
        : null,
      tokenType: tokens.token_type || 'Bearer',
    });

    return tokens.access_token;
  } catch (err) {
    console.error(`[OAuth] Refresh error for ${toolId}:`, err);
    return null;
  }
}

/**
 * Get a valid access token for a provider. Auto-refreshes if expired.
 */
export async function getValidAccessToken(toolId: string): Promise<string> {
  const creds = getCredentials(toolId);
  if (!creds?.accessToken) return '';

  if (creds.expiresAt) {
    const bufferMs = 5 * 60 * 1000;
    if (Date.now() >= new Date(creds.expiresAt).getTime() - bufferMs) {
      console.log(`[OAuth] Token expired for ${toolId}, refreshing...`);
      const newToken = await refreshAccessToken(toolId);
      return newToken || '';
    }
  }

  return creds.accessToken;
}
