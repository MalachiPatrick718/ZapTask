import type { Task } from '../../shared/types';
import type { IntegrationService } from './types';

const STATUS_MAP: Record<string, Task['status']> = {
  'To Do': 'todo',
  'In Progress': 'in_progress',
  'In Review': 'in_progress',
  'Done': 'done',
  'Closed': 'done',
  'Blocked': 'todo',
};

const PRIORITY_MAP: Record<string, Task['priority']> = {
  'Highest': 'urgent',
  'High': 'high',
  'Medium': 'medium',
  'Low': 'low',
  'Lowest': 'low',
};

export class JiraService implements IntegrationService {
  source = 'jira' as const;

  mapStatusFromSource(sourceStatus: string): Task['status'] {
    return STATUS_MAP[sourceStatus] || 'todo';
  }

  async fetchTasks(accessToken: string): Promise<Task[]> {
    if (!accessToken) return [];

    try {
      // First get accessible resources (cloud IDs)
      const resourcesRes = await fetch('https://api.atlassian.com/oauth/token/accessible-resources', {
        headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
      });
      if (!resourcesRes.ok) throw new Error(`Resources API ${resourcesRes.status}`);
      const resources = await resourcesRes.json();
      if (!resources.length) return [];

      const cloudId = resources[0].id;
      const jql = 'assignee = currentUser() AND statusCategory != Done ORDER BY updated DESC';
      const url = `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/search?jql=${encodeURIComponent(jql)}&maxResults=50&fields=summary,description,status,priority,duedate,labels,updated`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
      });
      if (!res.ok) throw new Error(`Jira API ${res.status}: ${await res.text()}`);
      const data = await res.json();
      const now = new Date().toISOString();

      return (data.issues || []).map((issue: any) => {
        const fields = issue.fields;
        return {
          id: `jira-${issue.id}`,
          title: `[${issue.key}] ${fields.summary}`,
          description: fields.description?.content?.[0]?.content?.[0]?.text || null,
          source: 'jira',
          sourceId: issue.key,
          sourceUrl: `https://${resources[0].name}.atlassian.net/browse/${issue.key}`,
          category: 'work',
          status: this.mapStatusFromSource(fields.status?.name || ''),
          priority: PRIORITY_MAP[fields.priority?.name || ''] || 'medium',
          energyRequired: null,
          estimatedMinutes: null,
          dueDate: fields.duedate || null,
          tags: fields.labels || [],
          notes: [],
          createdAt: now,
          updatedAt: fields.updated || now,
          syncedAt: now,
          startTime: null, endTime: null, location: null, conferenceUrl: null, recurrenceRule: null, recurrenceParentId: null,
        } satisfies Task;
      });
    } catch (err) {
      console.error('[Jira] API error:', err);
      return [];
    }
  }
}
