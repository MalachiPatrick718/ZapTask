import { useState, type CSSProperties } from 'react';
import { differenceInCalendarDays, format, parseISO } from 'date-fns';
import { StatusBadge } from './StatusBadge';
import { SchedulePickerModal } from './SchedulePickerModal';
import type { Task } from '../../../shared/types';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  onStatusChange?: (taskId: string, status: Task['status']) => void;
  onAddToDay?: () => void;
  onStartPomodoro?: () => void;
}

const priorityColors: Record<string, string> = {
  urgent: 'var(--red)',
  high: 'var(--yellow)',
  medium: 'var(--teal)',
  low: 'var(--text3)',
};

const energyIcons: Record<string, { icon: string; color: string }> = {
  high: { icon: '\u26A1', color: 'var(--energy-high)' },
  medium: { icon: '\uD83D\uDD0B', color: 'var(--energy-med)' },
  low: { icon: '\uD83C\uDF19', color: 'var(--energy-low)' },
};

const sourceLabels: Record<string, { label: string; color: string }> = {
  jira: { label: 'Jira', color: '#2684FF' },
  notion: { label: 'Notion', color: '#999' },
  gcal: { label: 'Calendar', color: '#4285F4' },
  local: { label: 'Local', color: 'var(--text3)' },
};

const priorityEmojis: Record<string, string> = {
  urgent: '🔥',
  high: '⬆️',
  medium: '⏱️',
  low: '💤',
};

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

export function TaskCard({ task, onClick, onStatusChange, onAddToDay, onStartPomodoro }: TaskCardProps) {
  const [hovered, setHovered] = useState(false);
  const [showSchedulePicker, setShowSchedulePicker] = useState(false);
  const overdue = isOverdue(task.dueDate);
  const accentColor = task.category === 'work' ? 'var(--accent)' : 'var(--red)';
  const energy = task.energyRequired ? energyIcons[task.energyRequired] : null;
  const source = sourceLabels[task.source] || sourceLabels.local;

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
        {/* Row 1: Status + Priority + Source */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <StatusBadge
            status={task.status}
            onClick={onStatusChange ? (next) => onStatusChange(task.id, next) : undefined}
          />
          {task.priority && (
            <span style={{
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              fontSize: 11,
              color: priorityColors[task.priority] || 'var(--text3)',
            }}>
              <span>{priorityEmojis[task.priority] || '⭐'}</span>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: priorityColors[task.priority] || 'var(--text3)',
              }}
              />
            </span>
          )}
          <span style={{
            display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 11, fontFamily: 'var(--font-mono)',
            color: source.color, marginLeft: 'auto',
          }}>
            {source.label}
            {task.sourceUrl && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.zaptask.openUrl(task.sourceUrl!);
                }}
                title={`Open in ${source.label}`}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: source.color, fontSize: 12, padding: 0,
                  display: 'inline-flex', alignItems: 'center',
                }}
              >
                {'\u2197'}
              </button>
            )}
          </span>
        </div>

        {/* Row 2: Title */}
        <div style={{
          fontSize: 13, fontWeight: 500, color: 'var(--text1)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          marginBottom: 4,
        }}>
          {task.title}
        </div>

        {/* Row 3: Energy + Time + Due date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text3)' }}>
          {energy ? (
            <span style={{ color: energy.color }}>{energy.icon}</span>
          ) : (
            <span style={{
              color: 'var(--yellow)', fontSize: 12, fontFamily: 'var(--font-mono)',
            }}>
              {'\u26A1'} Set energy
            </span>
          )}
          {task.estimatedMinutes && (
            <span style={{ fontFamily: 'var(--font-mono)' }}>
              {task.estimatedMinutes >= 60
                ? `${Math.floor(task.estimatedMinutes / 60)}h ${task.estimatedMinutes % 60}m`
                : `${task.estimatedMinutes}m`}
            </span>
          )}
          {task.dueDate && (
            <span style={{
              marginLeft: 'auto',
              color: overdue ? 'var(--red)' : 'var(--text3)',
              fontFamily: 'var(--font-mono)',
              fontWeight: overdue ? 600 : 400,
            }}>
              {formatDueDate(task.dueDate)}
            </span>
          )}
        </div>

        {/* Actions row */}
        {task.status !== 'done' && (onAddToDay || onStartPomodoro) && (
          <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
            {onAddToDay && (
              <button
                onClick={(e) => { e.stopPropagation(); setShowSchedulePicker(true); }}
                style={{
                  padding: '4px 0',
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent)',
                  fontSize: 12,
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                + Add to Today's Work
              </button>
            )}
            {onStartPomodoro && (
              <button
                onClick={(e) => { e.stopPropagation(); onStartPomodoro(); }}
                style={{
                  padding: '4px 0',
                  background: 'none',
                  border: 'none',
                  color: 'var(--red)',
                  fontSize: 12,
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                }}
              >
                {'\uD83C\uDF45'} Pomodoro
              </button>
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
    </div>
  );
}
