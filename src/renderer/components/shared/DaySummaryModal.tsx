import { useMemo } from 'react';
import { format } from 'date-fns';
import { useStore } from '../../store';
import { StatusBadge } from './StatusBadge';
import { Btn } from './Btn';
import type { Task } from '../../../shared/types';

interface DaySummaryModalProps {
  isOpen: boolean;
  date: string; // YYYY-MM-DD
  onClose: () => void;
}

const sourceLabels: Record<string, string> = {
  jira: 'Jira',
  notion: 'Notion',
  gcal: 'Calendar',
  local: 'Local',
};

const statusOrder: Task['status'][] = ['done', 'in_progress', 'todo'];
const statusLabels: Record<string, string> = {
  done: 'DONE',
  in_progress: 'IN PROGRESS',
  todo: 'TO DO',
};
const statusPrefixes: Record<string, string> = {
  done: '[x]',
  in_progress: '[~]',
  todo: '[ ]',
};

function formatSummaryText(date: string, grouped: Record<string, Task[]>): string {
  const dateLabel = format(new Date(date + 'T00:00:00'), 'EEEE, MMMM d');
  let text = `Day Summary - ${dateLabel}\n`;

  for (const status of statusOrder) {
    const tasks = grouped[status];
    if (!tasks || tasks.length === 0) continue;
    text += `\n${statusLabels[status]} (${tasks.length})\n`;
    for (const t of tasks) {
      const prefix = statusPrefixes[status];
      const source = t.source !== 'local' ? ` (${sourceLabels[t.source]})` : '';
      const noteCount = t.notes.length > 0 ? ` - ${t.notes.length} note${t.notes.length !== 1 ? 's' : ''}` : '';
      text += `${prefix} ${t.title}${source}${noteCount}\n`;
      // Include note text in the copy
      for (const note of t.notes) {
        text += `    > ${note.text}\n`;
      }
    }
  }

  return text.trim();
}

export function DaySummaryModal({ isOpen, date, onClose }: DaySummaryModalProps) {
  const tasks = useStore((s) => s.tasks);
  const schedule = useStore((s) => s.schedule);
  const addToast = useStore((s) => s.addToast);

  const { grouped, stats } = useMemo(() => {
    const dayTaskIds = new Set<string>();
    tasks.forEach((t) => { if (t.dueDate === date) dayTaskIds.add(t.id); });
    schedule.forEach((b) => { if (b.date === date) dayTaskIds.add(b.taskId); });

    const dayTasks = tasks.filter((t) => dayTaskIds.has(t.id));
    const grouped: Record<string, Task[]> = {
      done: dayTasks.filter((t) => t.status === 'done'),
      in_progress: dayTasks.filter((t) => t.status === 'in_progress'),
      todo: dayTasks.filter((t) => t.status === 'todo'),
    };
    const stats = {
      total: dayTasks.length,
      done: grouped.done.length,
      inProgress: grouped.in_progress.length,
      todo: grouped.todo.length,
    };
    return { grouped, stats };
  }, [tasks, schedule, date]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatSummaryText(date, grouped));
      addToast('Summary copied to clipboard', 'success');
    } catch {
      addToast('Failed to copy', 'error');
    }
  };

  const dateLabel = format(new Date(date + 'T00:00:00'), 'EEEE, MMMM d');

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0, 0, 0, 0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 340, maxHeight: '80vh',
          background: 'var(--surface-high)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-glow)',
          boxShadow: '0 18px 45px rgba(0, 0, 0, 0.55)',
          display: 'flex', flexDirection: 'column',
          color: 'var(--text1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '14px 16px 10px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-display)' }}>
              Day Summary
            </div>
            <div style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
              {dateLabel}
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: 'var(--text3)',
            fontSize: 16, cursor: 'pointer',
          }}>
            {'\u2715'}
          </button>
        </div>

        {/* Stats bar */}
        <div style={{
          display: 'flex', gap: 12, padding: '10px 16px',
          fontSize: 12, fontFamily: 'var(--font-mono)',
          borderBottom: '1px solid var(--border)',
        }}>
          <span style={{ color: 'var(--green)' }}>{stats.done} done</span>
          <span style={{ color: 'var(--teal)' }}>{stats.inProgress} active</span>
          <span style={{ color: 'var(--text3)' }}>{stats.todo} to do</span>
        </div>

        {/* Task groups */}
        <div style={{ flex: 1, overflow: 'auto', padding: '8px 16px 16px' }}>
          {stats.total === 0 && (
            <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>
              No tasks for this day.
            </div>
          )}
          {statusOrder.map((status) => {
            const group = grouped[status];
            if (!group || group.length === 0) return null;
            return (
              <div key={status} style={{ marginTop: 10 }}>
                <div style={{
                  fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 600,
                  color: 'var(--text3)', marginBottom: 6, textTransform: 'uppercase',
                }}>
                  {statusLabels[status]} ({group.length})
                </div>
                {group.map((task) => (
                  <div key={task.id} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '6px 0', borderBottom: '1px solid var(--border)',
                    fontSize: 13,
                  }}>
                    <StatusBadge status={task.status} style={{ fontSize: 10, padding: '1px 6px' }} />
                    <span style={{
                      flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {task.title}
                    </span>
                    {task.source !== 'local' && (
                      <span style={{
                        fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--font-mono)',
                        flexShrink: 0,
                      }}>
                        {sourceLabels[task.source]}
                      </span>
                    )}
                    {task.notes.length > 0 && (
                      <span style={{
                        fontSize: 10, color: 'var(--accent)', fontFamily: 'var(--font-mono)',
                        flexShrink: 0,
                      }}>
                        {task.notes.length} note{task.notes.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* Footer with Copy button */}
        <div style={{
          padding: '10px 16px', borderTop: '1px solid var(--border)',
          display: 'flex', justifyContent: 'flex-end',
        }}>
          <Btn variant="secondary" size="sm" onClick={handleCopy}>
            Copy Summary
          </Btn>
        </div>
      </div>
    </div>
  );
}
