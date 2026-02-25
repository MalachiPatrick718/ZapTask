import type { Task } from '../../shared/types';
import type { IntegrationService } from './types';

/**
 * Google Calendar integration service.
 *
 * Auth: OAuth 2.0 via Google Identity
 * Scopes: https://www.googleapis.com/auth/calendar.readonly
 * Fetches events from today through 14 days forward
 *
 * TODO: Replace stub with real Google Calendar API calls
 * Client ID: PLACEHOLDER — register at https://console.cloud.google.com
 */

export class GCalService implements IntegrationService {
  source = 'gcal' as const;

  mapStatusFromSource(_sourceStatus: string): Task['status'] {
    // Calendar events: past = done, future = todo
    return 'todo';
  }

  async fetchTasks(_accessToken: string): Promise<Task[]> {
    // TODO: Real Google Calendar API call
    // GET https://www.googleapis.com/calendar/v3/calendars/primary/events
    const now = new Date().toISOString();
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    return [
      {
        id: 'gcal-001',
        title: 'Team standup',
        description: 'Daily sync with the engineering team',
        source: 'gcal',
        sourceId: 'evt-standup-001',
        sourceUrl: 'https://calendar.google.com/event?eid=standup001',
        category: 'work',
        status: 'todo',
        priority: 'medium',
        energyRequired: null,
        estimatedMinutes: 15,
        dueDate: today,
        tags: ['meeting'],
        notes: [],
        createdAt: now,
        updatedAt: now,
        syncedAt: now,
      },
      {
        id: 'gcal-002',
        title: 'Dentist appointment',
        description: null,
        source: 'gcal',
        sourceId: 'evt-dentist-001',
        sourceUrl: 'https://calendar.google.com/event?eid=dentist001',
        category: 'personal',
        status: 'todo',
        priority: null,
        energyRequired: null,
        estimatedMinutes: 60,
        dueDate: tomorrow,
        tags: [],
        notes: [],
        createdAt: now,
        updatedAt: now,
        syncedAt: now,
      },
    ];
  }
}
