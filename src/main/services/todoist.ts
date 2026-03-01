import type { Task } from '../../shared/types';
import type { IntegrationService } from './types';

const PRIORITY_MAP: Record<number, Task['priority']> = {
  4: 'urgent',  // p1 in Todoist UI
  3: 'high',    // p2
  2: 'medium',  // p3
  1: 'low',     // p4 (default)
};

const STATUS_MAP: Record<string, Task['status']> = {
  active: 'todo',
  completed: 'done',
};

export class TodoistService implements IntegrationService {
  source = 'todoist' as const;

  mapStatusFromSource(sourceStatus: string): Task['status'] {
    return STATUS_MAP[sourceStatus.toLowerCase()] || 'todo';
  }

  async fetchTasks(accessToken: string): Promise<Task[]> {
    if (!accessToken) return [];

    try {
      const res = await fetch('https://api.todoist.com/rest/v2/tasks', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      });
      if (!res.ok) throw new Error(`Todoist API ${res.status}: ${await res.text()}`);
      const tasks: any[] = await res.json();
      const now = new Date().toISOString();

      return tasks.map((task) => ({
        id: `todoist-${task.id}`,
        title: task.content,
        description: task.description || null,
        source: 'todoist' as const,
        sourceId: task.id,
        sourceUrl: task.url || `https://todoist.com/showTask?id=${task.id}`,
        category: 'work' as const,
        status: 'todo' as const,
        priority: PRIORITY_MAP[task.priority] || 'medium',
        energyRequired: null,
        estimatedMinutes: task.duration?.amount ?? null,
        dueDate: task.due?.date || null,
        tags: task.labels || [],
        notes: [],
        createdAt: task.created_at || now,
        updatedAt: now,
        syncedAt: now,
        startTime: null,
        endTime: null,
        location: null,
        conferenceUrl: null,
        recurrenceRule: null,
        recurrenceParentId: null,
      } satisfies Task));
    } catch (err) {
      console.error('[Todoist] API error:', err);
      return [];
    }
  }
}
