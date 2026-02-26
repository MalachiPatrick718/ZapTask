import type { Task } from '../../shared/types';
import type { IntegrationService } from './types';

export class GCalService implements IntegrationService {
  source = 'gcal' as const;

  mapStatusFromSource(_sourceStatus: string): Task['status'] {
    return 'todo';
  }

  async fetchTasks(accessToken: string): Promise<Task[]> {
    if (!accessToken) return this.stubTasks();

    try {
      const now = new Date();
      const timeMin = now.toISOString();
      const timeMax = new Date(now.getTime() + 14 * 86400000).toISOString();

      const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime&maxResults=50`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
      });
      if (!res.ok) throw new Error(`GCal API ${res.status}: ${await res.text()}`);
      const data = await res.json();
      const nowIso = now.toISOString();

      return (data.items || []).map((event: any) => {
        const start = event.start?.dateTime || event.start?.date || '';
        const end = event.end?.dateTime || event.end?.date || '';
        const dueDate = start ? start.split('T')[0] : null;
        const durationMs = start && end
          ? new Date(end).getTime() - new Date(start).getTime()
          : 0;
        const estimatedMinutes = durationMs > 0 ? Math.round(durationMs / 60000) : null;

        // Extract conference/meeting link
        const conferenceUrl = event.hangoutLink
          || event.conferenceData?.entryPoints?.find((e: any) => e.entryPointType === 'video')?.uri
          || null;

        return {
          id: `gcal-${event.id}`,
          title: event.summary || 'Untitled event',
          description: event.description || null,
          source: 'gcal',
          sourceId: event.id,
          sourceUrl: event.htmlLink || null,
          category: 'work',
          status: 'todo',
          priority: 'medium',
          energyRequired: null,
          estimatedMinutes,
          dueDate,
          tags: ['meeting'],
          notes: [],
          createdAt: nowIso,
          updatedAt: event.updated || nowIso,
          syncedAt: nowIso,
          startTime: event.start?.dateTime || null,
          endTime: event.end?.dateTime || null,
          location: event.location || null,
          conferenceUrl,
          recurrenceRule: null,
          recurrenceParentId: null,
        } satisfies Task;
      });
    } catch (err) {
      console.error('[GCal] API error:', err);
      return this.stubTasks();
    }
  }

  private stubTasks(): Task[] {
    const now = new Date().toISOString();
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    return [
      {
        id: 'gcal-001', title: 'Team standup',
        description: 'Daily sync with the engineering team', source: 'gcal',
        sourceId: 'evt-standup-001', sourceUrl: 'https://calendar.google.com/event?eid=standup001',
        category: 'work', status: 'todo', priority: 'medium', energyRequired: null,
        estimatedMinutes: 15, dueDate: today, tags: ['meeting'],
        notes: [], createdAt: now, updatedAt: now, syncedAt: now,
        startTime: `${today}T09:00:00`, endTime: `${today}T09:15:00`,
        location: null, conferenceUrl: 'https://meet.google.com/abc-defg-hij',
        recurrenceRule: null, recurrenceParentId: null,
      },
      {
        id: 'gcal-002', title: 'Dentist appointment',
        description: null, source: 'gcal',
        sourceId: 'evt-dentist-001', sourceUrl: 'https://calendar.google.com/event?eid=dentist001',
        category: 'personal', status: 'todo', priority: null, energyRequired: null,
        estimatedMinutes: 60, dueDate: tomorrow, tags: [],
        notes: [], createdAt: now, updatedAt: now, syncedAt: now,
        startTime: `${tomorrow}T14:00:00`, endTime: `${tomorrow}T15:00:00`,
        location: '123 Main St, Suite 200', conferenceUrl: null,
        recurrenceRule: null, recurrenceParentId: null,
      },
    ];
  }
}
