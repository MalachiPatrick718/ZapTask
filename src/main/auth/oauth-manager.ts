import { shell } from 'electron';
import { OAUTH_PROVIDERS, REDIRECT_URI, type OAuthProviderConfig } from './oauth-config';
import { generatePKCE, generateState } from './pkce';
import { getCredentials, setCredentials } from '../credential-store';

interface PendingFlow {
  toolId: string;
  state: string;
  codeVerifier: string | null;
  createdAt: number;
}

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
}

const pendingFlows = new Map<string, PendingFlow>();
const FLOW_TTL_MS = 10 * 60 * 1000;

function cleanStaleFlows(): void {
  const now = Date.now();
  for (const [state, flow] of pendingFlows) {
    if (now - flow.createdAt > FLOW_TTL_MS) pendingFlows.delete(state);
  }
}

function getClientCredentials(toolId: string): { clientId: string; clientSecret: string } {
  const prefix = toolId.toUpperCase();
  return {
    clientId: process.env[`${prefix}_CLIENT_ID`] || '',
    clientSecret: process.env[`${prefix}_CLIENT_SECRET`] || '',
  };
}

/**
 * Start an OAuth flow: build auth URL and open in system browser.
 */
export function startOAuthFlow(toolId: string): { state: string } {
  cleanStaleFlows();

  const config = OAUTH_PROVIDERS[toolId];
  if (!config) throw new Error(`Unknown OAuth provider: ${toolId}`);

  const { clientId } = getClientCredentials(toolId);
  if (!clientId) throw new Error(`Missing ${toolId.toUpperCase()}_CLIENT_ID in environment`);

  const state = generateState();
  let codeVerifier: string | null = null;

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: REDIRECT_URI,
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

  pendingFlows.set(state, { toolId, state, codeVerifier, createdAt: Date.now() });

  const authUrl = `${config.authUrl}?${params.toString()}`;
  shell.openExternal(authUrl);

  return { state };
}

/**
 * Handle the OAuth callback: exchange authorization code for tokens.
 */
export async function handleOAuthCallback(
  code: string,
  state: string,
): Promise<{ success: boolean; toolId: string; error?: string }> {
  const flow = pendingFlows.get(state);
  if (!flow) {
    return { success: false, toolId: '', error: 'Invalid or expired OAuth state' };
  }

  pendingFlows.delete(state);
  const { toolId, codeVerifier } = flow;

  const config = OAUTH_PROVIDERS[toolId];
  if (!config) {
    return { success: false, toolId, error: `Unknown provider: ${toolId}` };
  }

  const { clientId, clientSecret } = getClientCredentials(toolId);

  try {
    const tokens = await exchangeCode(config, clientId, clientSecret, code, codeVerifier);

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
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[OAuth] Token exchange failed for ${toolId}:`, msg);
    return { success: false, toolId, error: msg };
  }
}

async function exchangeCode(
  config: OAuthProviderConfig,
  clientId: string,
  clientSecret: string,
  code: string,
  codeVerifier: string | null,
): Promise<TokenResponse> {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI,
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
