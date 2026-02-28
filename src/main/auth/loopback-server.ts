import * as http from 'http';

interface LoopbackResult {
  code: string;
  state: string;
}

interface LoopbackServer {
  port: number;
  result: Promise<LoopbackResult>;
  close: () => void;
}

const TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
const FIXED_PORT = 17548; // Fixed port so redirect URI is predictable for provider registration

const SUCCESS_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>ZapTask</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh; margin: 0;
      background: #0D0C10; color: #fff;
    }
    .card {
      text-align: center; padding: 48px;
      background: #1a1922; border-radius: 16px;
      border: 1px solid #2a2935;
    }
    h1 { font-size: 24px; margin: 0 0 8px; color: #F06D3D; }
    p { font-size: 14px; color: #9996a6; margin: 0; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Connected!</h1>
    <p>You can close this tab and return to ZapTask.</p>
  </div>
</body>
</html>`;

const ERROR_HTML = (msg: string) => `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>ZapTask</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh; margin: 0;
      background: #0D0C10; color: #fff;
    }
    .card {
      text-align: center; padding: 48px;
      background: #1a1922; border-radius: 16px;
      border: 1px solid #2a2935;
    }
    h1 { font-size: 24px; margin: 0 0 8px; color: #e05a2b; }
    p { font-size: 14px; color: #9996a6; margin: 0; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Connection Failed</h1>
    <p>${msg}</p>
  </div>
</body>
</html>`;

/**
 * Start a temporary loopback HTTP server to receive an OAuth callback.
 * Listens on 127.0.0.1 with a random port. Resolves when the
 * provider redirects back with ?code=...&state=...
 */
export function startLoopbackServer(): LoopbackServer {
  let resolveResult: (value: LoopbackResult) => void;
  let rejectResult: (reason: Error) => void;

  const result = new Promise<LoopbackResult>((resolve, reject) => {
    resolveResult = resolve;
    rejectResult = reject;
  });

  const server = http.createServer((req, res) => {
    const url = new URL(req.url || '/', `http://127.0.0.1`);

    // Only handle the /callback path
    if (url.pathname !== '/callback') {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    const code = url.searchParams.get('code') || '';
    const state = url.searchParams.get('state') || '';
    const error = url.searchParams.get('error') || '';
    const errorDesc = url.searchParams.get('error_description') || error;

    if (error) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(ERROR_HTML(errorDesc || 'Unknown error'));
      cleanup();
      rejectResult(new Error(errorDesc || 'OAuth error'));
      return;
    }

    if (!code || !state) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(ERROR_HTML('Missing authorization code'));
      cleanup();
      rejectResult(new Error('Missing code or state in OAuth callback'));
      return;
    }

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(SUCCESS_HTML);
    cleanup();
    resolveResult({ code, state });
  });

  const timeout = setTimeout(() => {
    cleanup();
    rejectResult(new Error('OAuth callback timed out'));
  }, TIMEOUT_MS);

  function cleanup() {
    clearTimeout(timeout);
    server.close();
  }

  // Listen on localhost with a fixed port so redirect URI is predictable
  server.listen(FIXED_PORT, '127.0.0.1');

  const port = FIXED_PORT;

  return { port, result, close: cleanup };
}
