import { format } from 'date-fns';
import type { EnergyLevel, EnergyProfile, Task, TimeBlock } from '../../shared/types';

const DAY_START_HOUR = 7;
const DAY_END_HOUR = 22;

/**
 * Find the next available time slot for a task on the given date.
 *
 * Strategy:
 * 1. If today, start scanning from the current time (rounded up to next 15-min).
 *    If a future date, start from DAY_START_HOUR.
 * 2. Walk through 15-min slots, skipping any that collide with existing blocks.
 * 3. Prefers energy-matched slots, but falls back to any available slot so
 *    users can always add tasks to their day.
 */
export function scheduleTaskIntoDay(
  task: Task,
  date: Date,
  energyProfile: EnergyProfile,
  existingBlocks: TimeBlock[],
  energyOverride?: EnergyLevel | null,
): TimeBlock | null {
  const targetDate = format(date, 'yyyy-MM-dd');
  const duration = task.estimatedMinutes || 30;
  const isToday = format(new Date(), 'yyyy-MM-dd') === targetDate;

  // Earliest start: now rounded up to next 15-min slot, or day start
  let earliestMin: number;
  if (isToday) {
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    earliestMin = Math.ceil(nowMin / 15) * 15;
  } else {
    earliestMin = DAY_START_HOUR * 60;
  }

  const dayBlocks = existingBlocks.filter((b) => b.date === targetDate);
  const dayStartMin = DAY_START_HOUR * 60;
  const dayEndMin = DAY_END_HOUR * 60;

  // Helper: find first available slot in a given time range
  const findSlot = (startMin: number, endMin: number): TimeBlock | null => {
    for (let slotStart = startMin; slotStart + duration <= endMin; slotStart += 15) {
      const slotEnd = slotStart + duration;
      const startStr = `${String(Math.floor(slotStart / 60)).padStart(2, '0')}:${String(slotStart % 60).padStart(2, '0')}`;
      const endStr = `${String(Math.floor(slotEnd / 60)).padStart(2, '0')}:${String(slotEnd % 60).padStart(2, '0')}`;

      const hasCollision = dayBlocks.some((tb) => tb.start < endStr && tb.end > startStr);
      if (!hasCollision) {
        return {
          id: crypto.randomUUID(),
          taskId: task.id,
          date: targetDate,
          start: startStr,
          end: endStr,
          createdAt: new Date().toISOString(),
        };
      }
    }
    return null;
  };

  // First pass: try energy-matched blocks (preferred scheduling)
  if (task.energyRequired && !energyOverride) {
    const levels: EnergyLevel[] = ['low', 'medium', 'high'];
    const matchingBlocks = energyProfile.blocks
      .filter((b) => levels.indexOf(b.level) >= levels.indexOf(task.energyRequired!))
      .sort((a, b) => a.start - b.start);

    for (const eBlock of matchingBlocks) {
      const blockStart = Math.max(eBlock.start * 60, dayStartMin, earliestMin);
      const blockEnd = Math.min(eBlock.end * 60, dayEndMin);
      const result = findSlot(blockStart, blockEnd);
      if (result) return result;
    }
  }

  // Fallback: scan the entire day for any available slot
  return findSlot(Math.max(earliestMin, dayStartMin), dayEndMin);
}

// === Schedule Suggestions ===

export interface ScheduleSuggestion {
  id: string;
  start: string;       // HH:MM
  end: string;         // HH:MM
  date: string;        // YYYY-MM-DD
  energyMatch: 'perfect' | 'good' | 'any';
  energyLevel: EnergyLevel | null;
  isBest: boolean;
}

function minToStr(min: number): string {
  return `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
}

/**
 * Return up to `max` schedule suggestions for a task on a given date.
 * Slots are scored by energy match quality and deduplicated (30-min spacing).
 */
export function getScheduleSuggestions(
  task: Task,
  date: Date,
  energyProfile: EnergyProfile,
  existingBlocks: TimeBlock[],
  energyOverride?: EnergyLevel | null,
  max = 4,
): ScheduleSuggestion[] {
  const targetDate = format(date, 'yyyy-MM-dd');
  const duration = task.estimatedMinutes || 30;
  const isToday = format(new Date(), 'yyyy-MM-dd') === targetDate;

  let earliestMin: number;
  if (isToday) {
    const now = new Date();
    earliestMin = Math.ceil((now.getHours() * 60 + now.getMinutes()) / 15) * 15;
  } else {
    earliestMin = DAY_START_HOUR * 60;
  }

  const dayBlocks = existingBlocks.filter((b) => b.date === targetDate);
  const scanStart = Math.max(earliestMin, DAY_START_HOUR * 60);
  const scanEnd = DAY_END_HOUR * 60;
  const levels: EnergyLevel[] = ['low', 'medium', 'high'];

  const allSlots: Array<{
    startMin: number;
    start: string;
    end: string;
    energyLevel: EnergyLevel | null;
    matchQuality: 'perfect' | 'good' | 'any';
  }> = [];

  for (let slotStart = scanStart; slotStart + duration <= scanEnd; slotStart += 15) {
    const slotEnd = slotStart + duration;
    const startStr = minToStr(slotStart);
    const endStr = minToStr(slotEnd);

    if (dayBlocks.some((tb) => tb.start < endStr && tb.end > startStr)) continue;

    // Energy level at midpoint of the slot
    const midHour = (slotStart + duration / 2) / 60;
    const eBlock = energyProfile.blocks.find((b) => midHour >= b.start && midHour < b.end);
    const slotEnergy = eBlock?.level ?? null;

    let matchQuality: 'perfect' | 'good' | 'any' = 'any';
    if (task.energyRequired && slotEnergy && !energyOverride) {
      const reqIdx = levels.indexOf(task.energyRequired);
      const slotIdx = levels.indexOf(slotEnergy);
      if (slotIdx === reqIdx) matchQuality = 'perfect';
      else if (slotIdx > reqIdx) matchQuality = 'good';
    }

    allSlots.push({ startMin: slotStart, start: startStr, end: endStr, energyLevel: slotEnergy, matchQuality });
  }

  // Sort: perfect → good → any, then earlier first
  const tierOrder = { perfect: 0, good: 1, any: 2 };
  allSlots.sort((a, b) => tierOrder[a.matchQuality] - tierOrder[b.matchQuality] || a.startMin - b.startMin);

  // Deduplicate: skip slots within 30 minutes of already-selected
  const selected: typeof allSlots = [];
  for (const slot of allSlots) {
    if (selected.length >= max) break;
    if (selected.some((s) => Math.abs(s.startMin - slot.startMin) < 30)) continue;
    selected.push(slot);
  }

  return selected.map((slot, i) => ({
    id: crypto.randomUUID(),
    start: slot.start,
    end: slot.end,
    date: targetDate,
    energyMatch: slot.matchQuality,
    energyLevel: slot.energyLevel,
    isBest: i === 0,
  }));
}
