import type { Task, TaskSource } from '../../shared/types';

export interface IntegrationService {
  source: TaskSource;
  fetchTasks(accessToken: string): Promise<Task[]>;
  mapStatusFromSource(sourceStatus: string): Task['status'];
}

export interface SyncResult {
  source: TaskSource;
  added: number;
  updated: number;
  removed: number;
  errors: string[];
}
