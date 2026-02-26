import type { Task } from '../../shared/types';
import type { IntegrationService } from './types';

export class OutlookService implements IntegrationService {
  source = 'outlook' as const;

  mapStatusFromSource(_sourceStatus: string): Task['status'] {
    return 'todo';
  }

  async fetchTasks(accessToken: string): Promise<Task[]> {
    if (!accessToken) return this.stubTasks();

    try {
      const now = new Date();
      const startDateTime = now.toISOString();
      const endDateTime = new Date(now.getTime() + 14 * 86400000).toISOString();

      const url = `https://graph.microsoft.com/v1.0/me/calendarview?startDateTime=${encodeURIComponent(startDateTime)}&endDateTime=${encodeURIComponent(endDateTime)}&$top=50&$select=subject,bodyPreview,body,start,end,webLink,lastModifiedDateTime,location,onlineMeeting,isOnlineMeeting`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
      });
      if (!res.ok) throw new Error(`Outlook API ${res.status}: ${await res.text()}`);
      const data = await res.json();
      const nowIso = now.toISOString();

      return (data.value || []).map((event: any) => {
        const start = event.start?.dateTime || '';
        const end = event.end?.dateTime || '';
        const dueDate = start ? start.split('T')[0] : null;
        const durationMs = start && end
          ? new Date(end).getTime() - new Date(start).getTime()
          : 0;
        const estimatedMinutes = durationMs > 0 ? Math.round(durationMs / 60000) : null;

        return {
          id: `outlook-${event.id?.slice(0, 20) || crypto.randomUUID().slice(0, 8)}`,
          title: event.subject || 'Untitled event',
          description: event.bodyPreview || null,
          source: 'outlook',
          sourceId: event.id || '',
          sourceUrl: event.webLink || null,
          category: 'work',
          status: 'todo',
          priority: 'medium',
          energyRequired: null,
          estimatedMinutes,
          dueDate,
          tags: ['meeting'],
          notes: [],
          createdAt: nowIso,
          updatedAt: event.lastModifiedDateTime || nowIso,
          syncedAt: nowIso,
          startTime: event.start?.dateTime || null,
          endTime: event.end?.dateTime || null,
          location: event.location?.displayName || null,
          conferenceUrl: event.onlineMeeting?.joinUrl || null,
        } satisfies Task;
      });
    } catch (err) {
      console.error('[Outlook] API error:', err);
      return this.stubTasks();
    }
  }

  private stubTasks(): Task[] {
    const now = new Date().toISOString();
    const today = new Date().toISOString().split('T')[0];
    return [
      {
        id: 'outlook-001', title: 'Weekly team sync',
        description: 'Recurring weekly sync with the product team', source: 'outlook',
        sourceId: 'AAMkAG-001', sourceUrl: 'https://outlook.office365.com/calendar/item/AAMkAG-001',
        category: 'work', status: 'todo', priority: 'medium', energyRequired: null,
        estimatedMinutes: 30, dueDate: today, tags: ['meeting'],
        notes: [], createdAt: now, updatedAt: now, syncedAt: now,
        startTime: `${today}T10:00:00`, endTime: `${today}T10:30:00`,
        location: null, conferenceUrl: 'https://teams.microsoft.com/l/meetup-join/abc123',
      },
    ];
  }
}
