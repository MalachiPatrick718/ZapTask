import type { Task } from '../../shared/types';
import type { IntegrationService } from './types';

/**
 * Notion integration service.
 *
 * Auth: OAuth 2.0 via https://api.notion.com/v1/oauth/authorize
 * Scopes: read_content
 *
 * TODO: Replace stub with real Notion API calls
 * Client ID: PLACEHOLDER — register at https://www.notion.so/my-integrations
 */

const STATUS_MAP: Record<string, Task['status']> = {
  'Not started': 'todo',
  'In progress': 'in_progress',
  'Done': 'done',
};

export class NotionService implements IntegrationService {
  source = 'notion' as const;

  mapStatusFromSource(sourceStatus: string): Task['status'] {
    return STATUS_MAP[sourceStatus] || 'todo';
  }

  async fetchTasks(_accessToken: string): Promise<Task[]> {
    // TODO: Real Notion API call
    // POST https://api.notion.com/v1/search with filter
    const now = new Date().toISOString();
    const inTwoDays = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0];

    return [
      {
        id: 'notion-001',
        title: 'Q1 OKR review prep',
        description: 'Prepare slides and talking points for the quarterly OKR review meeting',
        source: 'notion',
        sourceId: 'abc123',
        sourceUrl: 'https://notion.so/abc123',
        category: 'work',
        status: 'todo',
        priority: 'medium',
        energyRequired: null,
        estimatedMinutes: 60,
        dueDate: inTwoDays,
        tags: ['planning'],
        notes: [],
        createdAt: now,
        updatedAt: now,
        syncedAt: now,
      },
      {
        id: 'notion-002',
        title: 'Research competitor pricing',
        description: null,
        source: 'notion',
        sourceId: 'def456',
        sourceUrl: 'https://notion.so/def456',
        category: 'work',
        status: 'todo',
        priority: 'low',
        energyRequired: null,
        estimatedMinutes: 90,
        dueDate: null,
        tags: ['research'],
        notes: [],
        createdAt: now,
        updatedAt: now,
        syncedAt: now,
      },
    ];
  }
}
