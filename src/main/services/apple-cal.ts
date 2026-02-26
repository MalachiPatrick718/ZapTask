import type { Task } from '../../shared/types';
import type { IntegrationService } from './types';

export class AppleCalService implements IntegrationService {
  source = 'apple_cal' as const;

  mapStatusFromSource(_sourceStatus: string): Task['status'] {
    return 'todo';
  }

  async fetchTasks(_accessToken: string): Promise<Task[]> {
    // TODO: Real CalDAV call to iCloud calendar
    const now = new Date().toISOString();
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    return [
      {
        id: 'apple-cal-001',
        title: 'Gym session',
        description: null,
        source: 'apple_cal',
        sourceId: 'cal-evt-gym-001',
        sourceUrl: null,
        category: 'personal',
        status: 'todo',
        priority: null,
        energyRequired: null,
        estimatedMinutes: 60,
        dueDate: tomorrow,
        tags: ['fitness'],
        notes: [],
        createdAt: now,
        updatedAt: now,
        syncedAt: now,
        startTime: `${tomorrow}T07:00:00`,
        endTime: `${tomorrow}T08:00:00`,
        location: 'Downtown Gym',
        conferenceUrl: null,
        recurrenceRule: null,
        recurrenceParentId: null,
      },
    ];
  }
}
