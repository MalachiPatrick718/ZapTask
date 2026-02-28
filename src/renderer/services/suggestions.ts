import { differenceInHours, differenceInDays, parseISO } from 'date-fns';
import type { Task, EnergyLevel, EnergyProfile, TimeBlock } from '../../shared/types';

export interface ScoredTask {
  task: Task;
  score: number;
  reason: string;
}

export interface SuggestedSections {
  needsAttention: ScoredTask[];
  rightForRightNow: ScoredTask[];
  comingUp: ScoredTask[];
}

/**
 * Energy matching: can a task with `taskEnergy` be done at `currentEnergy`?
 */
function energyMatches(currentEnergy: EnergyLevel, taskEnergy: EnergyLevel): boolean {
  if (currentEnergy === 'high') return true;
  if (currentEnergy === 'medium') return taskEnergy !== 'high';
  return taskEnergy === 'low';
}

/**
 * Score a task based on energy match, due urgency, priority, and in-progress status.
 */
function scoreTask(task: Task, currentEnergy: EnergyLevel): { score: number; reasons: string[] } {
  const now = new Date();
  let score = 0;
  const reasons: string[] = [];

  // Energy match (0-40 pts)
  if (task.energyRequired) {
    if (task.energyRequired === currentEnergy) {
      score += 40;
      reasons.push('Focus match');
    } else if (energyMatches(currentEnergy, task.energyRequired)) {
      score += 25;
      reasons.push('Focus compatible');
    }
    // mismatch = 0 pts
  } else {
    // No focus set — give a base score so it's not completely hidden
    score += 15;
  }

  // Due urgency (0-30 pts)
  if (task.dueDate) {
    const due = parseISO(task.dueDate);
    const hoursUntilDue = differenceInHours(due, now);
    const daysUntilDue = differenceInDays(due, now);

    if (hoursUntilDue < 0) {
      score += 30;
      reasons.push('Overdue');
    } else if (hoursUntilDue <= 4) {
      score += 25;
      reasons.push(`Due in ${hoursUntilDue}h`);
    } else if (hoursUntilDue <= 24) {
      score += 20;
      reasons.push('Due today');
    } else if (daysUntilDue <= 3) {
      score += 10;
      reasons.push(`Due in ${daysUntilDue}d`);
    }
  }

  // Priority (0-20 pts)
  if (task.priority) {
    const priorityPoints: Record<string, number> = {
      urgent: 20,
      high: 15,
      medium: 8,
      low: 3,
    };
    const pts = priorityPoints[task.priority] || 0;
    if (pts > 0) {
      score += pts;
      if (task.priority === 'urgent' || task.priority === 'high') {
        reasons.push(`${task.priority[0].toUpperCase()}${task.priority.slice(1)} priority`);
      }
    }
  }

  // In-progress boost (0-10 pts)
  if (task.status === 'in_progress') {
    score += 10;
    reasons.push('In progress');
  }

  return { score, reasons };
}

export function getSuggestions(
  tasks: Task[],
  currentEnergy: EnergyLevel,
  _energyProfile: EnergyProfile,
  _timeBlocks: TimeBlock[],
): SuggestedSections {
  const now = new Date();

  // Active tasks only
  const active = tasks.filter((t) => t.status !== 'done');

  // Score all active tasks
  const scored: ScoredTask[] = active.map((task) => {
    const { score, reasons } = scoreTask(task, currentEnergy);
    return {
      task,
      score,
      reason: reasons.length > 0 ? reasons.join(' \u00B7 ') : 'Available task',
    };
  });

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Section A: Needs Attention — score >= 50 AND (overdue or due within 24h)
  const needsAttention = scored
    .filter((s) => {
      if (s.score < 50) return false;
      if (!s.task.dueDate) return false;
      const hoursUntilDue = differenceInHours(parseISO(s.task.dueDate), now);
      return hoursUntilDue <= 24;
    })
    .slice(0, 5);

  const needsAttentionIds = new Set(needsAttention.map((s) => s.task.id));

  // Section B: Right for Right Now — score >= 25 AND energy-matched
  const rightForRightNow = scored
    .filter((s) => {
      if (needsAttentionIds.has(s.task.id)) return false;
      if (s.score < 25) return false;
      if (!s.task.energyRequired) return false;
      return energyMatches(currentEnergy, s.task.energyRequired);
    })
    .slice(0, 5);

  const rightNowIds = new Set(rightForRightNow.map((s) => s.task.id));

  // Section C: Coming Up — remaining with score > 0 AND due within 7 days
  const comingUp = scored
    .filter((s) => {
      if (needsAttentionIds.has(s.task.id)) return false;
      if (rightNowIds.has(s.task.id)) return false;
      if (s.score <= 0) return false;
      if (!s.task.dueDate) return false;
      const days = differenceInDays(parseISO(s.task.dueDate), now);
      return days >= 0 && days <= 7;
    })
    .slice(0, 3);

  return { needsAttention, rightForRightNow, comingUp };
}
