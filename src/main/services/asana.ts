import type { Task } from '../../shared/types';
import type { IntegrationService } from './types';

const STATUS_MAP: Record<string, Task['status']> = {
  upcoming: 'todo',
  inbox: 'todo',
  'in progress': 'in_progress',
  completed: 'done',
};

export class AsanaService implements IntegrationService {
  source = 'asana' as const;

  mapStatusFromSource(sourceStatus: string): Task['status'] {
    return STATUS_MAP[sourceStatus.toLowerCase()] || 'todo';
  }

  async fetchTasks(accessToken: string): Promise<Task[]> {
    if (!accessToken) return [];

    try {
      const res = await fetch(
        'https://app.asana.com/api/1.0/tasks?assignee=me&workspace&opt_fields=name,notes,completed,due_on,tags.name,memberships.section.name,permalink_url&completed_since=now&limit=50',
        { headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' } },
      );
      if (!res.ok) throw new Error(`Asana API ${res.status}: ${await res.text()}`);
      const data = await res.json();
      const now = new Date().toISOString();

      return (data.data || []).map((task: any) => ({
        id: `asana-${task.gid}`,
        title: task.name,
        description: task.notes || null,
        source: 'asana',
        sourceId: task.gid,
        sourceUrl: task.permalink_url || `https://app.asana.com/0/0/${task.gid}`,
        category: 'work',
        status: task.completed ? 'done' : 'todo',
        priority: 'medium',
        energyRequired: null,
        estimatedMinutes: null,
        dueDate: task.due_on || null,
        tags: (task.tags || []).map((t: any) => t.name),
        notes: [],
        createdAt: now,
        updatedAt: now,
        syncedAt: now,
        startTime: null, endTime: null, location: null, conferenceUrl: null, recurrenceRule: null, recurrenceParentId: null,
      } satisfies Task));
    } catch (err) {
      console.error('[Asana] API error:', err);
      return [];
    }
  }
}
