import type { Task } from '../../shared/types';
import type { IntegrationService } from './types';

const STATUS_MAP: Record<string, Task['status']> = {
  '': 'todo',
  'Working on it': 'in_progress',
  'Stuck': 'todo',
  'Done': 'done',
};

const PRIORITY_MAP: Record<string, Task['priority']> = {
  'Critical': 'urgent',
  'High': 'high',
  'Medium': 'medium',
  'Low': 'low',
};

export class MondayService implements IntegrationService {
  source = 'monday' as const;

  mapStatusFromSource(sourceStatus: string): Task['status'] {
    return STATUS_MAP[sourceStatus] || 'todo';
  }

  async fetchTasks(accessToken: string): Promise<Task[]> {
    if (!accessToken) return this.stubTasks();

    try {
      // Monday.com uses GraphQL
      const query = `{
        me {
          id
        }
        boards(limit: 5, state: active) {
          id
          name
          items_page(limit: 50) {
            items {
              id
              name
              state
              column_values {
                id
                title
                text
              }
              board {
                id
                name
              }
              updated_at
            }
          }
        }
      }`;

      const res = await fetch('https://api.monday.com/v2', {
        method: 'POST',
        headers: {
          Authorization: accessToken,
          'Content-Type': 'application/json',
          'API-Version': '2024-01',
        },
        body: JSON.stringify({ query }),
      });

      if (!res.ok) throw new Error(`Monday API ${res.status}: ${await res.text()}`);
      const data = await res.json();
      const now = new Date().toISOString();
      const tasks: Task[] = [];

      for (const board of (data.data?.boards || [])) {
        for (const item of (board.items_page?.items || [])) {
          if (item.state === 'deleted') continue;

          const columns = item.column_values || [];
          const statusCol = columns.find((c: any) => c.title === 'Status');
          const priorityCol = columns.find((c: any) => c.title === 'Priority');
          const dateCol = columns.find((c: any) => c.title === 'Date' || c.title === 'Due Date' || c.title === 'Timeline');

          tasks.push({
            id: `monday-${item.id}`,
            title: item.name,
            description: null,
            source: 'monday',
            sourceId: item.id,
            sourceUrl: `https://monday.com/boards/${board.id}/pulses/${item.id}`,
            category: 'work',
            status: this.mapStatusFromSource(statusCol?.text || ''),
            priority: PRIORITY_MAP[priorityCol?.text || ''] || 'medium',
            energyRequired: null,
            estimatedMinutes: null,
            dueDate: dateCol?.text?.split(' - ')?.[0] || null,
            tags: [board.name],
            notes: [],
            createdAt: now,
            updatedAt: item.updated_at || now,
            syncedAt: now,
          });
        }
      }

      return tasks;
    } catch (err) {
      console.error('[Monday] API error:', err);
      return this.stubTasks();
    }
  }

  private stubTasks(): Task[] {
    const now = new Date().toISOString();
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    return [
      {
        id: 'monday-001', title: 'Sprint planning prep',
        description: 'Prepare agenda and backlog items for sprint planning',
        source: 'monday', sourceId: '1234', sourceUrl: 'https://monday.com',
        category: 'work', status: 'todo', priority: 'high', energyRequired: null,
        estimatedMinutes: 30, dueDate: tomorrow, tags: ['Sprint Board'],
        notes: [], createdAt: now, updatedAt: now, syncedAt: now,
      },
    ];
  }
}
