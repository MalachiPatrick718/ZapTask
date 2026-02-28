import { app, safeStorage } from 'electron';
import path from 'node:path';
import fs from 'node:fs';

/**
 * Encrypted credential store using Electron's safeStorage.
 * Stores OAuth tokens per integration tool.
 */

const STORE_FILE = path.join(app.getPath('userData'), 'credentials.enc');

export interface CredentialEntry {
  accessToken?: string;
  refreshToken?: string | null;
  expiresAt?: string | null;
  tokenType?: string;
  [key: string]: any;
}

let cache: Record<string, CredentialEntry> | null = null;

function load(): Record<string, CredentialEntry> {
  if (cache) return cache;
  try {
    if (!fs.existsSync(STORE_FILE)) {
      cache = {};
      return cache;
    }
    const encrypted = fs.readFileSync(STORE_FILE);
    const decrypted = safeStorage.decryptString(encrypted);
    cache = JSON.parse(decrypted);
    return cache!;
  } catch (err) {
    console.error('[CredentialStore] Failed to load:', err);
    cache = {};
    return cache;
  }
}

function save(data: Record<string, CredentialEntry>): void {
  cache = data;
  try {
    const encrypted = safeStorage.encryptString(JSON.stringify(data));
    fs.writeFileSync(STORE_FILE, encrypted);
  } catch (err) {
    console.error('[CredentialStore] Failed to save:', err);
  }
}

export function getCredentials(toolId: string): CredentialEntry | null {
  const data = load();
  return data[toolId] || null;
}

export function setCredentials(toolId: string, creds: CredentialEntry): void {
  const data = load();
  data[toolId] = creds;
  save(data);
}

export function clearCredentials(toolId: string): void {
  const data = load();
  delete data[toolId];
  save(data);
}

/** Return tool IDs that have a stored access token. */
export function getConnectedToolIds(): string[] {
  const data = load();
  return Object.keys(data).filter((k) => data[k]?.accessToken);
}
