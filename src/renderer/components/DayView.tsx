import { useState, useEffect, useMemo, useCallback } from 'react';
import { addDays, format, startOfWeek } from 'date-fns';
import { useStore } from '../store';
import { TaskCard } from './shared/TaskCard';
import { scheduleTaskIntoDay } from '../services/scheduler';
import { DaySummaryModal } from './shared/DaySummaryModal';
import { ProBadge } from './shared/UpgradePrompt';
import { useSubscription } from '../hooks/useSubscription';
import type { EnergyLevel, Task } from '../../shared/types';

/** Convert "HH:MM" (24h) to "h:mmam/pm" */
function to12h(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'pm' : 'am';
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour12}:${String(m).padStart(2, '0')}${period}`;
}

const HOUR_HEIGHT = 64;
const DEFAULT_startHour = 7;
const DEFAULT_endHour = 22;

const energyColors: Record<EnergyLevel, string> = {
  high: 'var(--energy-high)',
  medium: 'var(--energy-med)',
  low: 'var(--energy-low)',
};

export function DayView() {
  const energyProfile = useStore((s) => s.energyProfile);

  // Derive timeline range from energy blocks so custom blocks always appear
  const startHour = useMemo(() => {
    const earliest = energyProfile.blocks.reduce((min, b) => Math.min(min, b.start), DEFAULT_startHour);
    return Math.min(earliest, DEFAULT_startHour);
  }, [energyProfile.blocks]);

  const endHour = useMemo(() => {
    const latest = energyProfile.blocks.reduce((max, b) => Math.max(max, b.end), DEFAULT_endHour);
    return Math.max(latest, DEFAULT_endHour);
  }, [energyProfile.blocks]);

  const totalHours = endHour - startHour;
  const { canUseDaySummary, canUsePomodoro } = useSubscription();
  const schedule = useStore((s) => s.schedule);
  const tasks = useStore((s) => s.tasks);
  const updateTask = useStore((s) => s.updateTask);
  const override = useStore((s) => s.currentEnergyOverride);
  const removeTimeBlock = useStore((s) => s.removeTimeBlock);
  const addTimeBlock = useStore((s) => s.addTimeBlock);
  const addToast = useStore((s) => s.addToast);
  const selectTask = useStore((s) => s.selectTask);
  const setActivePanel = useStore((s) => s.setActivePanel);
  const startPomodoro = useStore((s) => s.startPomodoro);
  const pomodoroSession = useStore((s) => s.pomodoroSession);

  const [now, setNow] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showSummary, setShowSummary] = useState(false);
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const selectedStr = format(selectedDate, 'yyyy-MM-dd');

  // Update "now" line every minute
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Scheduled time blocks for selected day (only those with valid tasks)
  const selectedBlocks = useMemo(
    () => schedule.filter((b) => b.date === selectedStr && tasks.some((t) => t.id === b.taskId)),
    [schedule, selectedStr, tasks],
  );

  // Tasks due on selected day (not yet done)
  const dueTasks = useMemo(
    () => tasks.filter((t) => t.dueDate === selectedStr && t.status !== 'done'),
    [tasks, selectedStr],
  );

  // Calendar events for selected day (gcal/outlook/apple_cal with startTime)
  const calendarSources = new Set(['gcal', 'outlook', 'apple_cal']);
  const calendarEvents = useMemo(
    () => tasks.filter((t) => {
      if (!calendarSources.has(t.source) || !t.startTime) return false;
      const eventDate = t.startTime.slice(0, 10);
      return eventDate === selectedStr;
    }),
    [tasks, selectedStr],
  );

  // IDs of tasks already scheduled as time blocks on this day
  const scheduledTaskIds = useMemo(
    () => new Set(selectedBlocks.map((b) => b.taskId)),
    [selectedBlocks],
  );

  // Calendar event IDs (so we don't double-show them)
  const calendarEventIds = useMemo(
    () => new Set(calendarEvents.map((t) => t.id)),
    [calendarEvents],
  );

  // Due tasks that aren't already on the timeline or calendar
  const unscheduledDueTasks = useMemo(
    () => dueTasks.filter((t) => !scheduledTaskIds.has(t.id) && !calendarEventIds.has(t.id)),
    [dueTasks, scheduledTaskIds, calendarEventIds],
  );

  const totalItems = selectedBlocks.length + unscheduledDueTasks.length + calendarEvents.length;

  // Now line position
  const nowHour = now.getHours() + now.getMinutes() / 60;
  const nowOffset = (nowHour - startHour) * HOUR_HEIGHT;
  const isTodaySelected = selectedStr === todayStr;
  const showNowLine = isTodaySelected && nowHour >= startHour && nowHour <= endHour;

  // Get energy level for a given hour
  const getEnergyForHour = (hour: number): EnergyLevel | null => {
    const block = energyProfile.blocks.find((b) => hour >= b.start && hour < b.end);
    return block?.level ?? null;
  };

  const handleAddToDay = useCallback((task: Task) => {
    const block = scheduleTaskIntoDay(task, new Date(), energyProfile, schedule, override);
    if (!block) {
      addToast('No available slot today. Try adjusting your schedule.', 'error');
      return;
    }
    addTimeBlock(block);
    addToast(`Scheduled ${to12h(block.start)} \u2013 ${to12h(block.end)}`, 'success');
  }, [energyProfile, schedule, override, addTimeBlock, addToast]);

  const handleTaskClick = (taskId: string) => {
    selectTask(taskId);
    setActivePanel('taskDetail');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header + week strip */}
      <div style={{ padding: '10px 10px 6px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 18,
              fontWeight: 700,
              color: 'var(--text1)',
            }}>
              {format(selectedDate, 'EEEE, MMMM d')}
            </h2>
            <div style={{
              fontSize: 12,
              fontFamily: 'var(--font-mono)',
              color: 'var(--text3)',
              marginTop: 2,
            }}>
              {totalItems === 0
                ? 'Nothing scheduled'
                : `${totalItems} task${totalItems !== 1 ? 's' : ''} for this day`}
            </div>
          </div>
          <button
            onClick={() => canUseDaySummary() ? setShowSummary(true) : window.dispatchEvent(new CustomEvent('zaptask:showPricing'))}
            style={{
              padding: '4px 10px', fontSize: 12,
              fontFamily: 'var(--font-mono)',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              color: canUseDaySummary() ? 'var(--accent)' : 'var(--text3)',
              cursor: 'pointer', flexShrink: 0,
              marginTop: 2,
              display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            Summary {!canUseDaySummary() && <ProBadge />}
          </button>
        </div>

        {/* Week strip */}
        <div style={{
          display: 'flex',
          gap: 6,
          marginTop: 10,
        }}>
          {Array.from({ length: 7 }).map((_, idx) => {
            const start = startOfWeek(now, { weekStartsOn: 0 });
            const day = addDays(start, idx);
            const dayStr = format(day, 'yyyy-MM-dd');
            const isToday = dayStr === todayStr;
            const isSelected = dayStr === selectedStr;
            // Count unique tasks for this day (due + scheduled, no double-counting)
            const dueIds = tasks.filter((t) => t.dueDate === dayStr && t.status !== 'done').map((t) => t.id);
            const scheduledIds = schedule.filter((b) => b.date === dayStr && tasks.some((t) => t.id === b.taskId)).map((b) => b.taskId);
            const dayItemCount = new Set([...dueIds, ...scheduledIds]).size;

            const bg = isSelected ? 'var(--accent)' : isToday ? 'var(--surface-high)' : 'var(--surface)';
            const fg = isSelected ? '#fff' : 'var(--text1)';

            return (
              <button
                key={dayStr}
                type="button"
                onClick={() => setSelectedDate(day)}
                style={{
                  flex: 1,
                  padding: '6px 4px',
                  borderRadius: 'var(--radius-sm)',
                  border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                  background: bg,
                  color: fg,
                  fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                <span style={{ opacity: 0.8 }}>{format(day, 'EEE')}</span>
                <span>{format(day, 'd')}</span>
                {dayItemCount > 0 && (
                  <span style={{
                    fontSize: 8,
                    color: isSelected ? 'rgba(255,255,255,0.8)' : 'var(--accent)',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                  }}>
                    {dayItemCount} task{dayItemCount !== 1 ? 's' : ''}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content area */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {/* Due tasks section */}
        {unscheduledDueTasks.length > 0 && (
          <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
            <div style={{
              fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 600,
              color: 'var(--text2)', marginBottom: 8,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              {'\uD83D\uDCC5'} Due this day
              <span style={{
                fontSize: 11, padding: '1px 6px',
                background: 'var(--accent-dim)', borderRadius: 'var(--radius-sm)',
                color: 'var(--accent)',
              }}>
                {unscheduledDueTasks.length}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {unscheduledDueTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={() => handleTaskClick(task.id)}
                  onStatusChange={async (id, s) => {
                    const r = await window.zaptask.tasks.update(id, { status: s });
                    if (r.success) updateTask(id, { status: s });
                  }}
                  onAddToDay={() => handleAddToDay(task)}
                  onStartPomodoro={() => startPomodoro(task.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Timeline */}
        <div style={{ position: 'relative' }}>
          <div style={{
            position: 'relative',
            height: totalHours * HOUR_HEIGHT,
            marginLeft: 44,
            marginRight: 14,
          }}>
            {/* Hour rows with energy backgrounds */}
            {Array.from({ length: totalHours }, (_, i) => {
              const hour = startHour + i;
              const energy = getEnergyForHour(hour);
              const bgColor = energy ? energyColors[energy] : 'transparent';

              return (
                <div
                  key={hour}
                  style={{
                    position: 'absolute',
                    top: i * HOUR_HEIGHT,
                    left: -44,
                    right: -14,
                    height: HOUR_HEIGHT,
                    display: 'flex',
                    borderBottom: '1px solid var(--border)',
                    background: energy ? `color-mix(in srgb, ${bgColor} 14%, var(--surface))` : 'transparent',
                  }}
                >
                  {/* Hour label */}
                  <div style={{
                    width: 44,
                    paddingRight: 8,
                    paddingTop: 2,
                    textAlign: 'right',
                    fontSize: 11,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text3)',
                    flexShrink: 0,
                  }}>
                    {hour === 0 ? '12am' : hour < 12 ? `${hour}am` : hour === 12 ? '12pm' : `${hour - 12}pm`}
                  </div>
                </div>
              );
            })}

            {/* Energy block labels */}
            {energyProfile.blocks
              .filter((eb) => eb.end > startHour && eb.start < endHour)
              .map((eb) => {
                const clampedStart = Math.max(eb.start, startHour);
                const clampedEnd = Math.min(eb.end, endHour);
                const top = (clampedStart - startHour) * HOUR_HEIGHT;
                const height = (clampedEnd - clampedStart) * HOUR_HEIGHT;
                const color = energyColors[eb.level];
                const energyIcons: Record<EnergyLevel, string> = {
                  high: '\u26A1', medium: '\uD83D\uDD0B', low: '\uD83C\uDF19',
                };
                return (
                  <div
                    key={eb.id}
                    style={{
                      position: 'absolute',
                      top,
                      left: 0,
                      right: 0,
                      height,
                      pointerEvents: 'none',
                      zIndex: 1,
                    }}
                  >
                    {/* Label pinned to top-right of energy block */}
                    <div style={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                      background: `color-mix(in srgb, ${color} 18%, var(--surface))`,
                      border: `1px solid color-mix(in srgb, ${color} 25%, var(--border))`,
                      fontSize: 10,
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 600,
                      color,
                    }}>
                      {energyIcons[eb.level]} {eb.label}
                    </div>
                  </div>
                );
              })}

            {/* Scheduled time blocks */}
            {selectedBlocks.map((block) => {
              const task = tasks.find((t) => t.id === block.taskId);
              if (!task) return null;

              const [startH, startM] = block.start.split(':').map(Number);
              const [endH, endM] = block.end.split(':').map(Number);
              const startOffset = (startH + startM / 60 - startHour) * HOUR_HEIGHT;
              const duration = (endH + endM / 60 - startH - startM / 60) * HOUR_HEIGHT;
              const minHeight = 56;

              const accentColor = task.category === 'work' ? 'var(--accent)' : 'var(--red)';
              const isCompact = Math.max(duration, minHeight) < 50;

              const priorityEmojis: Record<string, string> = {
                urgent: '\uD83D\uDD25', high: '\u2B06\uFE0F', medium: '\u23F1\uFE0F', low: '\uD83D\uDCA4',
              };
              const energyIcons: Record<string, string> = {
                high: '\u26A1', medium: '\uD83D\uDD0B', low: '\uD83C\uDF19',
              };

              return (
                <div
                  key={block.id}
                  style={{
                    position: 'absolute',
                    top: startOffset,
                    left: 0,
                    right: 0,
                    height: Math.max(duration, minHeight),
                    display: 'flex',
                    background: `color-mix(in srgb, ${accentColor} 8%, var(--surface))`,
                    border: `1px solid color-mix(in srgb, ${accentColor} 30%, var(--border))`,
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    zIndex: 2,
                    transition: 'box-shadow 150ms ease',
                  }}
                  onClick={() => {
                    selectTask(task.id);
                    setActivePanel('taskDetail');
                  }}
                >
                  {/* Left accent bar */}
                  <div style={{ width: 4, background: accentColor, flexShrink: 0 }} />

                  <div style={{
                    flex: 1,
                    padding: isCompact ? '6px 10px' : '8px 10px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    minWidth: 0,
                    gap: 2,
                  }}>
                    {/* Title row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                      <div style={{
                        fontSize: 13, fontWeight: 600, color: 'var(--text1)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        flex: 1,
                      }}>
                        {task.title}
                      </div>
                      {task.status !== 'done' && canUsePomodoro() && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startPomodoro(task.id);
                          }}
                          title="Start Pomodoro"
                          style={{
                            background: pomodoroSession?.taskId === task.id ? 'color-mix(in srgb, var(--red) 15%, transparent)' : 'none',
                            border: pomodoroSession?.taskId === task.id ? '1px solid var(--red)' : 'none',
                            color: 'var(--red)', fontSize: 13,
                            cursor: 'pointer', padding: '2px 4px',
                            borderRadius: 'var(--radius-sm)',
                            flexShrink: 0, lineHeight: 1,
                          }}
                        >
                          {'\uD83C\uDF45'}
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeTimeBlock(block.id);
                        }}
                        style={{
                          background: 'none', border: 'none',
                          color: 'var(--text3)', fontSize: 13,
                          cursor: 'pointer', padding: '2px 4px',
                          flexShrink: 0, lineHeight: 1,
                        }}
                      >
                        {'\u2715'}
                      </button>
                    </div>

                    {/* Meta row: time + badges */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text3)',
                    }}>
                      <span>{to12h(block.start)} {'\u2013'} {to12h(block.end)}</span>
                      {task.priority && (
                        <span>{priorityEmojis[task.priority] || ''}</span>
                      )}
                      {task.energyRequired && (
                        <span>{energyIcons[task.energyRequired]}</span>
                      )}
                      {task.estimatedMinutes && (
                        <span style={{ marginLeft: 'auto' }}>
                          {task.estimatedMinutes >= 60
                            ? `${Math.floor(task.estimatedMinutes / 60)}h${task.estimatedMinutes % 60 > 0 ? ` ${task.estimatedMinutes % 60}m` : ''}`
                            : `${task.estimatedMinutes}m`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Now line */}
            {showNowLine && (
              <div style={{
                position: 'absolute',
                top: nowOffset,
                left: -6,
                right: 0,
                height: 2,
                background: 'var(--red)',
                zIndex: 10,
                pointerEvents: 'none',
              }}>
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: -4,
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: 'var(--red)',
                }} />
              </div>
            )}
          </div>
        </div>
      </div>

      <DaySummaryModal
        isOpen={showSummary}
        date={selectedStr}
        onClose={() => setShowSummary(false)}
      />
    </div>
  );
}
