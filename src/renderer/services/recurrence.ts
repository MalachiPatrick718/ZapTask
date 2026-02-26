import { addDays, addMonths, format, isWeekend } from 'date-fns';
import type { Task } from '../../shared/types';

export type RecurrenceRule = 'daily' | 'weekdays' | 'weekly' | 'biweekly' | 'monthly';

/**
 * Calculate the next due date based on recurrence rule.
 * If currentDueDate is null, uses today as base.
 */
export function getNextDueDate(currentDueDate: string | null, rule: RecurrenceRule): string {
  const base = currentDueDate ? new Date(currentDueDate + 'T00:00:00') : new Date();
  base.setHours(0, 0, 0, 0);

  let next: Date;

  switch (rule) {
    case 'daily':
      next = addDays(base, 1);
      break;
    case 'weekdays': {
      next = addDays(base, 1);
      // Skip weekends
      while (isWeekend(next)) {
        next = addDays(next, 1);
      }
      break;
    }
    case 'weekly':
      next = addDays(base, 7);
      break;
    case 'biweekly':
      next = addDays(base, 14);
      break;
    case 'monthly':
      next = addMonths(base, 1);
      break;
    default:
      next = addDays(base, 1);
  }

  return format(next, 'yyyy-MM-dd');
}

/**
 * Create the next recurring task instance from a completed task.
 * Copies core properties, resets status and timestamps.
 */
export function createNextRecurringTask(completedTask: Task): Task {
  const now = new Date().toISOString();
  const nextDue = getNextDueDate(completedTask.dueDate, completedTask.recurrenceRule!);

  return {
    id: crypto.randomUUID(),
    title: completedTask.title,
    description: completedTask.description,
    source: completedTask.source,
    sourceId: null,
    sourceUrl: null,
    category: completedTask.category,
    status: 'todo',
    priority: completedTask.priority,
    energyRequired: completedTask.energyRequired,
    estimatedMinutes: completedTask.estimatedMinutes,
    dueDate: nextDue,
    tags: [...completedTask.tags],
    notes: [],
    startTime: null,
    endTime: null,
    location: null,
    conferenceUrl: null,
    recurrenceRule: completedTask.recurrenceRule,
    recurrenceParentId: completedTask.recurrenceParentId || completedTask.id,
    createdAt: now,
    updatedAt: now,
    syncedAt: null,
  };
}
