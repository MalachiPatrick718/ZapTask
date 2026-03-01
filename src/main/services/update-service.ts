import { app, net } from 'electron';
import { autoUpdater, UpdateInfo } from 'electron-updater';
import { getMainWindow } from '../window-manager';

const GITHUB_REPO = 'MalachiPatrick718/ZapTask';
const CHECK_INTERVAL_MS = 4 * 60 * 60 * 1000; // 4 hours

export type UpdateStatus = 'idle' | 'checking' | 'available' | 'downloading' | 'ready' | 'error';

interface ReleaseInfo {
  version: string;
  releaseNotes?: string;
  downloadUrl: string;
}

let autoUpdaterAvailable = true;
let checkTimer: ReturnType<typeof setInterval> | null = null;

/** Send update status to the renderer */
function sendStatus(status: UpdateStatus, data?: Partial<{ version: string; releaseNotes: string; downloadUrl: string; progress: number; error: string }>) {
  const win = getMainWindow();
  if (win && !win.isDestroyed()) {
    win.webContents.send('app:updateStatus', { status, ...data });
  }
}

/** Compare two semver strings. Returns 1 if b > a, -1 if a > b, 0 if equal */
function compareVersions(a: string, b: string): number {
  const pa = a.replace(/^v/, '').split('.').map(Number);
  const pb = b.replace(/^v/, '').split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    const na = pa[i] || 0;
    const nb = pb[i] || 0;
    if (nb > na) return 1;
    if (na > nb) return -1;
  }
  return 0;
}

/** Fetch latest release from GitHub API (Tier 1 — always works) */
async function fetchLatestRelease(): Promise<ReleaseInfo | null> {
  return new Promise((resolve) => {
    const request = net.request(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`);
    request.setHeader('User-Agent', `ZapTask/${app.getVersion()}`);
    request.setHeader('Accept', 'application/vnd.github.v3+json');

    let body = '';
    request.on('response', (response) => {
      if (response.statusCode !== 200) {
        resolve(null);
        return;
      }
      response.on('data', (chunk) => { body += chunk.toString(); });
      response.on('end', () => {
        try {
          const release = JSON.parse(body);
          const version = (release.tag_name || '').replace(/^v/, '');
          const releaseNotes = release.body || '';
          const downloadUrl = release.html_url || `https://github.com/${GITHUB_REPO}/releases/latest`;
          resolve({ version, releaseNotes, downloadUrl });
        } catch {
          resolve(null);
        }
      });
    });
    request.on('error', () => resolve(null));
    request.end();
  });
}

/** Check for updates using GitHub API (manual/fallback) */
export async function checkForUpdateManual(): Promise<{ available: boolean; info?: ReleaseInfo }> {
  const release = await fetchLatestRelease();
  if (!release) return { available: false };

  const current = app.getVersion();
  if (compareVersions(current, release.version) > 0) {
    return { available: true, info: release };
  }
  return { available: false };
}

/** Main check function — tries auto-updater first, falls back to GitHub API */
export async function checkForUpdates(): Promise<void> {
  sendStatus('checking');

  if (autoUpdaterAvailable) {
    try {
      await autoUpdater.checkForUpdates();
      return; // autoUpdater events will handle the rest
    } catch {
      // Auto-updater failed (unsigned build, no yml, etc.) — fall back
      autoUpdaterAvailable = false;
    }
  }

  // Tier 1 fallback: GitHub API check
  try {
    const result = await checkForUpdateManual();
    if (result.available && result.info) {
      sendStatus('available', {
        version: result.info.version,
        releaseNotes: result.info.releaseNotes,
        downloadUrl: result.info.downloadUrl,
      });
    } else {
      sendStatus('idle');
    }
  } catch {
    sendStatus('error', { error: 'Failed to check for updates' });
  }
}

/** Download update (only works with auto-updater) */
export function downloadUpdate(): void {
  if (autoUpdaterAvailable) {
    autoUpdater.downloadUpdate();
  }
}

/** Install update and restart (only works with auto-updater) */
export function installUpdate(): void {
  if (autoUpdaterAvailable) {
    autoUpdater.quitAndInstall(false, true);
  }
}

/** Initialize auto-updater and schedule periodic checks */
export function initAutoUpdater(): void {
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('checking-for-update', () => {
    sendStatus('checking');
  });

  autoUpdater.on('update-available', (info: UpdateInfo) => {
    sendStatus('available', {
      version: info.version,
      releaseNotes: typeof info.releaseNotes === 'string' ? info.releaseNotes : undefined,
      downloadUrl: `https://github.com/${GITHUB_REPO}/releases/latest`,
    });
  });

  autoUpdater.on('update-not-available', () => {
    sendStatus('idle');
  });

  autoUpdater.on('download-progress', (progress) => {
    sendStatus('downloading', { progress: Math.round(progress.percent) });
  });

  autoUpdater.on('update-downloaded', () => {
    sendStatus('ready');
  });

  autoUpdater.on('error', () => {
    // Auto-updater isn't working — fall through to manual check
    autoUpdaterAvailable = false;
  });

  // Initial check after 5 seconds (don't block startup)
  setTimeout(() => checkForUpdates(), 5000);

  // Periodic check
  checkTimer = setInterval(() => checkForUpdates(), CHECK_INTERVAL_MS);
}

/** Cleanup on app quit */
export function stopUpdateChecks(): void {
  if (checkTimer) {
    clearInterval(checkTimer);
    checkTimer = null;
  }
}
