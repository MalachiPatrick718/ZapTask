import type { Task } from '../../shared/types';
import type { IntegrationService } from './types';

const STATUS_MAP: Record<string, Task['status']> = {
  'Not started': 'todo',
  'In progress': 'in_progress',
  'Done': 'done',
  'Completed': 'done',
};

export class NotionService implements IntegrationService {
  source = 'notion' as const;

  mapStatusFromSource(sourceStatus: string): Task['status'] {
    return STATUS_MAP[sourceStatus] || 'todo';
  }

  async fetchTasks(accessToken: string): Promise<Task[]> {
    if (!accessToken) return this.stubTasks();

    try {
      // Search for databases that look like task boards
      const searchRes = await fetch('https://api.notion.com/v1/search', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify({
          filter: { value: 'database', property: 'object' },
          page_size: 10,
        }),
      });
      if (!searchRes.ok) throw new Error(`Notion search ${searchRes.status}`);
      const searchData = await searchRes.json();

      const tasks: Task[] = [];
      const now = new Date().toISOString();

      for (const db of (searchData.results || []).slice(0, 3)) {
        const queryRes = await fetch(`https://api.notion.com/v1/databases/${db.id}/query`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Notion-Version': '2022-06-28',
          },
          body: JSON.stringify({ page_size: 20 }),
        });
        if (!queryRes.ok) continue;
        const queryData = await queryRes.json();

        for (const page of (queryData.results || [])) {
          const props = page.properties || {};
          // Try to extract title from common property names
          const titleProp = props['Name'] || props['Title'] || props['Task'] ||
            Object.values(props).find((p: any) => p.type === 'title');
          const titleText = (titleProp as any)?.title?.[0]?.plain_text || 'Untitled';

          const statusProp = props['Status'] || props['State'];
          const statusName = (statusProp as any)?.status?.name || (statusProp as any)?.select?.name || '';

          const dueProp = props['Due'] || props['Due Date'] || props['Deadline'];
          const dueDate = (dueProp as any)?.date?.start || null;

          tasks.push({
            id: `notion-${page.id}`,
            title: titleText,
            description: null,
            source: 'notion',
            sourceId: page.id,
            sourceUrl: page.url || `https://notion.so/${page.id.replace(/-/g, '')}`,
            category: 'work',
            status: this.mapStatusFromSource(statusName),
            priority: 'medium',
            energyRequired: null,
            estimatedMinutes: null,
            dueDate,
            tags: [],
            notes: [],
            createdAt: now,
            updatedAt: page.last_edited_time || now,
            syncedAt: now,
          });
        }
      }

      return tasks;
    } catch (err) {
      console.error('[Notion] API error:', err);
      return this.stubTasks();
    }
  }

  private stubTasks(): Task[] {
    const now = new Date().toISOString();
    const inTwoDays = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0];
    return [
      {
        id: 'notion-001', title: 'Q1 OKR review prep',
        description: 'Prepare slides for quarterly OKR review', source: 'notion',
        sourceId: 'abc123', sourceUrl: 'https://notion.so/abc123',
        category: 'work', status: 'todo', priority: 'medium', energyRequired: null,
        estimatedMinutes: 60, dueDate: inTwoDays, tags: ['planning'],
        notes: [], createdAt: now, updatedAt: now, syncedAt: now,
      },
      {
        id: 'notion-002', title: 'Research competitor pricing',
        description: null, source: 'notion',
        sourceId: 'def456', sourceUrl: 'https://notion.so/def456',
        category: 'work', status: 'todo', priority: 'low', energyRequired: null,
        estimatedMinutes: 90, dueDate: null, tags: ['research'],
        notes: [], createdAt: now, updatedAt: now, syncedAt: now,
      },
    ];
  }
}
