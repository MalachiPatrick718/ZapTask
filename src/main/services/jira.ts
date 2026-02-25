import type { Task } from '../../shared/types';
import type { IntegrationService } from './types';

/**
 * Jira integration service.
 *
 * Auth: OAuth 2.0 via https://auth.atlassian.com/authorize
 * Scopes: read:jira-work offline_access
 * JQL: assignee = currentUser() AND statusCategory != Done ORDER BY updated DESC
 *
 * TODO: Replace stub with real Jira REST API calls
 * Client ID: PLACEHOLDER — register at https://developer.atlassian.com/console/myapps/
 */

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

  async fetchTasks(_accessToken: string): Promise<Task[]> {
    // TODO: Real Jira API call
    // GET https://{domain}.atlassian.net/rest/api/3/search
    // JQL: assignee = currentUser() AND statusCategory != Done
    const now = new Date().toISOString();
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

    return [
      {
        id: 'jira-001',
        title: '[PROJ-142] Fix login page validation',
        description: 'Email validation regex is too strict, rejecting valid addresses with + characters',
        source: 'jira',
        sourceId: 'PROJ-142',
        sourceUrl: 'https://team.atlassian.net/browse/PROJ-142',
        category: 'work',
        status: 'todo',
        priority: 'high',
        energyRequired: null,
        estimatedMinutes: 45,
        dueDate: tomorrow,
        tags: ['frontend', 'bug'],
        notes: [],
        createdAt: now,
        updatedAt: now,
        syncedAt: now,
      },
      {
        id: 'jira-002',
        title: '[PROJ-138] Add dark mode support',
        description: 'Implement dark mode theme tokens and toggle in settings',
        source: 'jira',
        sourceId: 'PROJ-138',
        sourceUrl: 'https://team.atlassian.net/browse/PROJ-138',
        category: 'work',
        status: 'in_progress',
        priority: 'medium',
        energyRequired: null,
        estimatedMinutes: 120,
        dueDate: nextWeek,
        tags: ['frontend', 'feature'],
        notes: [],
        createdAt: now,
        updatedAt: now,
        syncedAt: now,
      },
      {
        id: 'jira-003',
        title: '[PROJ-155] Update API documentation',
        description: 'Document the new /v2/users endpoints',
        source: 'jira',
        sourceId: 'PROJ-155',
        sourceUrl: 'https://team.atlassian.net/browse/PROJ-155',
        category: 'work',
        status: 'todo',
        priority: 'low',
        energyRequired: null,
        estimatedMinutes: 30,
        dueDate: null,
        tags: ['docs'],
        notes: [],
        createdAt: now,
        updatedAt: now,
        syncedAt: now,
      },
    ];
  }
}
