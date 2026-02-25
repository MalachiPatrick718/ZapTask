import { BrowserWindow } from 'electron';
import type { Task, TaskSource } from '../../shared/types';
import type { IntegrationService, SyncResult } from './types';
import { JiraService } from './jira';
import { NotionService } from './notion';
import { GCalService } from './gcal';
import { IPC } from '../../shared/types/ipc-channels';

const services: Record<string, IntegrationService> = {
  jira: new JiraService(),
  notion: new NotionService(),
  gcal: new GCalService(),
};

export class SyncEngine {
  private interval: NodeJS.Timeout | null = null;
  private connectedTools: Set<string> = new Set();

  start(intervalMs = 5 * 60 * 1000) {
    // Immediate sync on launch
    this.syncAll();
    this.interval = setInterval(() => this.syncAll(), intervalMs);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  setConnectedTools(tools: string[]) {
    this.connectedTools = new Set(tools);
  }

  async syncAll(): Promise<SyncResult[]> {
    const results: SyncResult[] = [];
    for (const toolId of this.connectedTools) {
      try {
        const result = await this.syncSource(toolId as TaskSource);
        results.push(result);
      } catch (err) {
        console.error(`[Sync] Error syncing ${toolId}:`, err);
        this.broadcastStatus(toolId, 'error', undefined, String(err));
      }
    }
    return results;
  }

  async syncSource(source: TaskSource): Promise<SyncResult> {
    const service = services[source];
    if (!service) {
      return { source, added: 0, updated: 0, removed: 0, errors: ['Unknown source'] };
    }

    this.broadcastStatus(source, 'syncing');

    try {
      // Fetch tasks (using empty token for stubs)
      const remoteTasks = await service.fetchTasks('');
      const now = new Date().toISOString();

      // Send fetched tasks to renderer for merge
      this.broadcastTasks(source, remoteTasks);
      this.broadcastStatus(source, 'idle', now);

      return {
        source,
        added: remoteTasks.length,
        updated: 0,
        removed: 0,
        errors: [],
      };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.broadcastStatus(source, 'error', undefined, errorMsg);
      return { source, added: 0, updated: 0, removed: 0, errors: [errorMsg] };
    }
  }

  private broadcastStatus(toolId: string, status: string, lastSyncAt?: string, error?: string) {
    const wins = BrowserWindow.getAllWindows();
    for (const win of wins) {
      win.webContents.send(IPC.SYNC_STATUS, { toolId, status, lastSyncAt, error });
    }
  }

  private broadcastTasks(source: TaskSource, tasks: Task[]) {
    const wins = BrowserWindow.getAllWindows();
    for (const win of wins) {
      win.webContents.send('sync:tasks', { source, tasks });
    }
  }
}

// Singleton
export const syncEngine = new SyncEngine();
