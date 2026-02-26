import { useState, type CSSProperties } from 'react';
import { differenceInCalendarDays, format, parseISO } from 'date-fns';
import { StatusBadge } from './StatusBadge';
import { SchedulePickerModal } from './SchedulePickerModal';
import { PomodoroModal } from './PomodoroModal';
import { ProBadge } from './UpgradePrompt';
import { useSubscription } from '../../hooks/useSubscription';
import type { Task } from '../../../shared/types';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  onStatusChange?: (taskId: string, status: Task['status']) => void;
  onAddToDay?: () => void;
  onStartPomodoro?: () => void;
}

const priorityConfig: Record<string, { label: string; color: string; bg: string }> = {
  urgent: { label: 'Urgent', color: 'var(--red)', bg: 'rgba(255, 69, 58, 0.12)' },
  high: { label: 'High', color: 'var(--yellow)', bg: 'rgba(255, 214, 10, 0.12)' },
  medium: { label: 'Medium', color: 'var(--teal)', bg: 'rgba(78, 205, 196, 0.12)' },
  low: { label: 'Low', color: 'var(--text3)', bg: 'rgba(150, 150, 150, 0.1)' },
};

const energyConfig: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  high: { label: 'High Energy', icon: '\u26A1', color: 'var(--energy-high)', bg: 'rgba(255, 149, 0, 0.12)' },
  medium: { label: 'Med Energy', icon: '\uD83D\uDD0B', color: 'var(--energy-med)', bg: 'rgba(78, 205, 196, 0.12)' },
  low: { label: 'Low Energy', icon: '\uD83C\uDF19', color: 'var(--energy-low)', bg: 'rgba(120, 120, 255, 0.12)' },
};

const sourceLabels: Record<string, { label: string; color: string }> = {
  jira: { label: 'Jira', color: '#2684FF' },
  asana: { label: 'Asana', color: '#F06A6A' },
  notion: { label: 'Notion', color: '#999' },
  gcal: { label: 'Calendar', color: '#4285F4' },
  outlook: { label: 'Outlook', color: '#0078D4' },
  apple_cal: { label: 'Apple Cal', color: '#FF3B30' },
  local: { label: 'Local', color: 'var(--text3)' },
};

const calendarSources = new Set(['gcal', 'outlook', 'apple_cal']);

function formatEventTime(iso: string): string {
  try {
    const d = new Date(iso);
    const h = d.getHours();
    const m = d.getMinutes();
    const period = h >= 12 ? 'pm' : 'am';
    const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${hour12}:${String(m).padStart(2, '0')}${period}`;
  } catch {
    return '';
  }
}

function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dueDate + 'T00:00:00') < today;
}

function formatDueDate(dueDate: string): string {
  try {
    const date = parseISO(dueDate);
    const diff = differenceInCalendarDays(date, new Date());
    if (diff < 0) return `${Math.abs(diff)}d overdue`;
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    return format(date, 'MMM d');
  } catch {
    return dueDate;
  }
}

function formatDuration(minutes: number): string {
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  return `${minutes}m`;
}

const pillStyle = (color: string, bg: string): CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  padding: '2px 8px',
  borderRadius: 10,
  fontSize: 11,
  fontWeight: 500,
  fontFamily: 'var(--font-mono)',
  color,
  background: bg,
  whiteSpace: 'nowrap',
});

export function TaskCard({ task, onClick, onStatusChange, onAddToDay, onStartPomodoro }: TaskCardProps) {
  const { canUsePomodoro } = useSubscription();
  const [hovered, setHovered] = useState(false);
  const [showSchedulePicker, setShowSchedulePicker] = useState(false);
  const [showPomodoro, setShowPomodoro] = useState(false);
  const overdue = isOverdue(task.dueDate);
  const isCalendarEvent = calendarSources.has(task.source);
  const accentColor = task.category === 'work' ? 'var(--accent)' : 'var(--red)';
  const source = sourceLabels[task.source] || sourceLabels.local;
  const energy = task.energyRequired ? energyConfig[task.energyRequired] : null;
  const priority = task.priority ? priorityConfig[task.priority] : null;

  const cardStyle: CSSProperties = {
    display: 'flex',
    background: 'var(--surface)',
    borderRadius: 'var(--radius-md)',
    border: `1px solid ${hovered ? 'var(--border-glow)' : 'var(--border)'}`,
    cursor: 'pointer',
    transition: 'all 150ms ease',
    transform: hovered ? 'translateY(-1px)' : 'none',
    overflow: 'hidden',
  };

  return (
    <div
      style={cardStyle}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Left accent bar */}
      <div style={{ width: 3, background: accentColor, flexShrink: 0 }} />

      <div style={{ flex: 1, padding: '10px 12px', minWidth: 0 }}>
        {/* Row 1: Title + Source + Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <div style={{
            flex: 1, minWidth: 0,
            fontSize: 13, fontWeight: 600, color: 'var(--text1)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {task.title}
          </div>

          {/* Source */}
          <span
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 3,
              fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 500,
              color: source.color, flexShrink: 0,
            }}
          >
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: source.color,
            }} />
            {source.label}
            {task.sourceUrl && (
              <button
                onClick={(e) => { e.stopPropagation(); window.zaptask.openUrl(task.sourceUrl!); }}
                title={`Open in ${source.label}`}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: source.color, fontSize: 11, padding: 0,
                  display: 'inline-flex', alignItems: 'center',
                }}
              >
                {'\u2197'}
              </button>
            )}
          </span>

          {/* Status */}
          <StatusBadge
            status={task.status}
            onClick={onStatusChange ? (next) => onStatusChange(task.id, next) : undefined}
          />
        </div>

        {/* Row 2: Pills + Due Date */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          flexWrap: 'wrap', marginBottom: (task.status !== 'done' && (onAddToDay || onStartPomodoro)) ? 6 : 0,
        }}>
          {/* Calendar event time */}
          {isCalendarEvent && task.startTime && (
            <span style={pillStyle('#4285F4', 'rgba(66, 133, 244, 0.1)')}>
              {'\uD83D\uDD52'} {formatEventTime(task.startTime)}
              {task.endTime && ` \u2013 ${formatEventTime(task.endTime)}`}
            </span>
          )}

          {/* Conference link indicator */}
          {task.conferenceUrl && (
            <button
              onClick={(e) => { e.stopPropagation(); window.zaptask.openUrl(task.conferenceUrl!); }}
              title="Join meeting"
              style={{
                ...pillStyle('var(--teal)', 'rgba(78, 205, 196, 0.12)'),
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {'\uD83C\uDFA5'} Join
            </button>
          )}

          {energy && (
            <span style={pillStyle(energy.color, energy.bg)}>
              {energy.icon} {energy.label}
            </span>
          )}

          {task.estimatedMinutes && (
            <span style={pillStyle('var(--text2)', 'rgba(150, 150, 150, 0.1)')}>
              {'\u23F1'} {formatDuration(task.estimatedMinutes)}
            </span>
          )}

          {priority && (
            <span style={pillStyle(priority.color, priority.bg)}>
              {priority.label}
            </span>
          )}

          {task.recurrenceRule && (
            <span style={pillStyle('#8B5CF6', 'rgba(139, 92, 246, 0.12)')}>
              {'\uD83D\uDD01'} {task.recurrenceRule === 'weekdays' ? 'Weekdays'
                : task.recurrenceRule.charAt(0).toUpperCase() + task.recurrenceRule.slice(1)}
            </span>
          )}

          {task.dueDate && (
            <span style={{
              marginLeft: 'auto',
              fontSize: 11,
              fontFamily: 'var(--font-mono)',
              fontWeight: overdue ? 600 : 400,
              color: overdue ? 'var(--red)' : 'var(--text3)',
              flexShrink: 0,
            }}>
              {overdue ? '\u26A0 ' : ''}{formatDueDate(task.dueDate)}
            </span>
          )}
        </div>

        {/* Row 3: Actions — Pin to Today + Pomodoro */}
        {task.status !== 'done' && (onAddToDay || onStartPomodoro) && (
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 4,
            borderTop: '1px solid var(--border)',
          }}>
            {onAddToDay ? (
              <button
                onClick={(e) => { e.stopPropagation(); setShowSchedulePicker(true); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '3px 0',
                  background: 'none', border: 'none',
                  color: 'var(--accent)', fontSize: 11,
                  fontFamily: 'var(--font-mono)', fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                {'\uD83D\uDCCC'} Add to Today
              </button>
            ) : <span />}

            {onStartPomodoro && (
              canUsePomodoro() ? (
                <button
                  onClick={(e) => { e.stopPropagation(); setShowPomodoro(true); }}
                  title="Start Pomodoro"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 3,
                    padding: '3px 6px',
                    background: 'none', border: 'none',
                    color: 'var(--red)', fontSize: 13,
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-sm)',
                    transition: 'background 100ms ease',
                  }}
                  onMouseEnter={(e) => { (e.target as HTMLElement).style.background = 'rgba(255,69,58,0.1)'; }}
                  onMouseLeave={(e) => { (e.target as HTMLElement).style.background = 'none'; }}
                >
                  {'\uD83C\uDF45'}
                </button>
              ) : (
                <span style={{
                  fontSize: 11, fontFamily: 'var(--font-mono)',
                  color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  {'\uD83C\uDF45'} <ProBadge />
                </span>
              )
            )}
          </div>
        )}
      </div>

      {showSchedulePicker && (
        <SchedulePickerModal
          task={task}
          onClose={() => setShowSchedulePicker(false)}
        />
      )}

      {showPomodoro && (
        <PomodoroModal
          task={task}
          onClose={() => setShowPomodoro(false)}
          onStart={() => {
            setShowPomodoro(false);
            onStartPomodoro?.();
          }}
        />
      )}
    </div>
  );
}
