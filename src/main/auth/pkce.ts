import crypto from 'node:crypto';

export interface PKCEPair {
  codeVerifier: string;
  codeChallenge: string;
}

export function generateCodeVerifier(length = 64): string {
  return crypto.randomBytes(length).toString('base64url').slice(0, length);
}

export function generateCodeChallenge(verifier: string): string {
  return crypto.createHash('sha256').update(verifier).digest('base64url');
}

export function generatePKCE(): PKCEPair {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  return { codeVerifier, codeChallenge };
}

export function generateState(): string {
  return crypto.randomBytes(32).toString('base64url');
}
