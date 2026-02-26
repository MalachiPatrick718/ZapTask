import { useState, useMemo, useRef, useEffect } from 'react';
import { useStore } from '../../store';
import { Btn } from '../shared/Btn';
import { StatusBadge } from '../shared/StatusBadge';
import { CalendarModal } from '../shared/CalendarModal';
import { ProBadge } from '../shared/UpgradePrompt';
import { useSubscription } from '../../hooks/useSubscription';
import type { EnergyLevel, Task, TaskNote } from '../../../shared/types';
import { format } from 'date-fns';
import { scheduleTaskIntoDay } from '../../services/scheduler';

function to12h(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'pm' : 'am';
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour12}:${String(m).padStart(2, '0')}${period}`;
}

const energyOptions: { value: EnergyLevel; icon: string; label: string; color: string }[] = [
  { value: 'high', icon: '\u26A1', label: 'High', color: 'var(--energy-high)' },
  { value: 'medium', icon: '\uD83D\uDD0B', label: 'Med', color: 'var(--energy-med)' },
  { value: 'low', icon: '\uD83C\uDF19', label: 'Low', color: 'var(--energy-low)' },
];

const priorityOptions: { value: Task['priority']; label: string; icon: string }[] = [
  { value: 'urgent', label: 'Urgent', icon: '\uD83D\uDD25' },
  { value: 'high', label: 'High', icon: '\u2B06\uFE0F' },
  { value: 'medium', label: 'Medium', icon: '\u23F1\uFE0F' },
  { value: 'low', label: 'Low', icon: '\uD83D\uDCA4' },
];

const sourceLabels: Record<string, string> = {
  jira: 'Jira',
  asana: 'Asana',
  notion: 'Notion',
  gcal: 'Google Calendar',
  outlook: 'Outlook Calendar',
  apple_cal: 'Apple Calendar',
  local: 'Local',
};

// Inline editable field wrapper — click the value to open an editor
function InlineField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '10px 0', borderBottom: '1px solid var(--border)',
      minHeight: 40,
    }}>
      <span style={{
        fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text3)',
        flexShrink: 0, marginRight: 12,
      }}>
        {label}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4, justifyContent: 'flex-end' }}>
        {children}
      </div>
    </div>
  );
}

export function TaskDetailPanel() {
  const selectedTaskId = useStore((s) => s.selectedTaskId);
  const tasks = useStore((s) => s.tasks);
  const updateTask = useStore((s) => s.updateTask);
  const deleteTask = useStore((s) => s.deleteTask);
  const setActivePanel = useStore((s) => s.setActivePanel);
  const addToast = useStore((s) => s.addToast);
  const energyProfile = useStore((s) => s.energyProfile);
  const override = useStore((s) => s.currentEnergyOverride);
  const schedule = useStore((s) => s.schedule);
  const addTimeBlock = useStore((s) => s.addTimeBlock);
  const pomodoroSession = useStore((s) => s.pomodoroSession);
  const startPomodoro = useStore((s) => s.startPomodoro);
  const stopPomodoro = useStore((s) => s.stopPomodoro);
  const { canUsePomodoro } = useSubscription();

  const task = useMemo(() => tasks.find((t) => t.id === selectedTaskId), [tasks, selectedTaskId]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [editingDuration, setEditingDuration] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  const [descDraft, setDescDraft] = useState('');
  const [durationHours, setDurationHours] = useState('');
  const [durationMins, setDurationMins] = useState('');
  const [noteDraft, setNoteDraft] = useState('');
  const titleRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const noteInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingTitle && titleRef.current) titleRef.current.focus();
  }, [editingTitle]);

  useEffect(() => {
    if (editingDesc && descRef.current) descRef.current.focus();
  }, [editingDesc]);

  if (!task) {
    return (
      <div style={{ padding: 24, color: 'var(--text3)' }}>
        Task not found.
        <br />
        <Btn variant="ghost" onClick={() => setActivePanel(null)} style={{ marginTop: 12 }}>
          Close
        </Btn>
      </div>
    );
  }

  // Persist a single field change
  const saveField = async (changes: Partial<Task>) => {
    try {
      const result = await window.zaptask.tasks.update(task.id, changes);
      if (result.success) {
        updateTask(task.id, changes);
      } else {
        addToast('Failed to update', 'error');
      }
    } catch {
      addToast('Failed to update', 'error');
    }
  };

  const handleAddNote = async () => {
    const text = noteDraft.trim();
    if (!text) return;
    const newNote: TaskNote = {
      id: crypto.randomUUID(),
      text,
      createdAt: new Date().toISOString(),
    };
    await saveField({ notes: [...task.notes, newNote] });
    setNoteDraft('');
    noteInputRef.current?.focus();
  };

  const handleDeleteNote = async (noteId: string) => {
    await saveField({ notes: task.notes.filter((n) => n.id !== noteId) });
  };

  const handleSchedule = (date: Date) => {
    const block = scheduleTaskIntoDay(task, date, energyProfile, schedule, override);
    if (!block) {
      addToast('No available slot that day', 'error');
      return;
    }
    addTimeBlock(block);
    addToast(`Scheduled ${to12h(block.start)} \u2013 ${to12h(block.end)}`, 'success');
  };

  const handleDelete = async () => {
    try {
      const result = await window.zaptask.tasks.delete(task.id);
      if (result.success) {
        deleteTask(task.id);
        setActivePanel(null);
        addToast('Task deleted', 'info');
      } else {
        addToast('Failed to delete task', 'error');
      }
    } catch {
      addToast('Failed to delete task', 'error');
    }
  };

  // Chip button style for inline selectors
  const chipStyle = (active: boolean, color?: string) => ({
    padding: '4px 10px',
    fontSize: 12,
    fontFamily: 'var(--font-mono)',
    fontWeight: active ? 600 : 400,
    borderRadius: 'var(--radius-sm)',
    border: `1px solid ${active ? (color || 'var(--accent)') : 'var(--border)'}`,
    background: active
      ? color ? `color-mix(in srgb, ${color} 15%, transparent)` : 'var(--accent-dim)'
      : 'var(--surface)',
    color: active ? (color || 'var(--accent)') : 'var(--text3)',
    cursor: 'pointer',
  } as const);

  const clickableValueStyle = {
    fontSize: 13,
    color: 'var(--text1)',
    cursor: 'pointer',
    padding: '3px 8px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid transparent',
    background: 'transparent',
    transition: 'border-color 150ms ease, background 150ms ease',
  } as const;

  const currentEnergy = task.energyRequired ? energyOptions.find((e) => e.value === task.energyRequired) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', borderBottom: '1px solid var(--border)',
      }}>
        <span style={{
          fontSize: 11, fontFamily: 'var(--font-mono)',
          padding: '2px 6px', borderRadius: 'var(--radius-sm)',
          background: 'var(--surface)', color: 'var(--text3)',
        }}>
          {sourceLabels[task.source]}
          {task.sourceId && ` \u00B7 ${task.sourceId}`}
        </span>
        <button
          onClick={() => setActivePanel(null)}
          style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: 18, cursor: 'pointer' }}
        >
          {'\u2715'}
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
        {/* Title — click to edit */}
        {editingTitle ? (
          <input
            ref={titleRef}
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={() => {
              const trimmed = titleDraft.trim();
              if (trimmed && trimmed !== task.title) {
                saveField({ title: trimmed });
              }
              setEditingTitle(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
              if (e.key === 'Escape') { setEditingTitle(false); }
            }}
            style={{
              width: '100%', fontSize: 20, fontWeight: 700,
              fontFamily: 'var(--font-display)',
              color: 'var(--text1)', background: 'var(--surface)',
              border: '1px solid var(--accent)', borderRadius: 'var(--radius-sm)',
              padding: '6px 10px', outline: 'none', marginBottom: 12,
            }}
          />
        ) : (
          <h2
            onClick={() => { setTitleDraft(task.title); setEditingTitle(true); }}
            style={{
              fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700,
              color: 'var(--text1)', marginBottom: 12,
              cursor: 'pointer', borderRadius: 'var(--radius-sm)',
              padding: '2px 0',
            }}
            title="Click to edit"
          >
            {task.title}
          </h2>
        )}

        {/* Description — click to edit */}
        {editingDesc ? (
          <textarea
            ref={descRef}
            value={descDraft}
            onChange={(e) => setDescDraft(e.target.value)}
            onBlur={() => {
              const trimmed = descDraft.trim();
              if (trimmed !== (task.description || '')) {
                saveField({ description: trimmed || null });
              }
              setEditingDesc(false);
            }}
            rows={3}
            style={{
              width: '100%', fontSize: 13, color: 'var(--text1)',
              background: 'var(--surface)', border: '1px solid var(--accent)',
              borderRadius: 'var(--radius-sm)', padding: '8px 10px',
              outline: 'none', marginBottom: 16, resize: 'vertical',
              lineHeight: 1.6,
            }}
          />
        ) : (
          <p
            onClick={() => { setDescDraft(task.description || ''); setEditingDesc(true); }}
            style={{
              color: task.description ? 'var(--text2)' : 'var(--text3)',
              fontSize: 13, marginBottom: 16, lineHeight: 1.6,
              cursor: 'pointer', borderRadius: 'var(--radius-sm)',
              minHeight: 20,
            }}
            title="Click to edit"
          >
            {task.description || 'Add a description...'}
          </p>
        )}

        {/* Calendar event details */}
        {task.startTime && (
          <div style={{
            padding: '10px 12px',
            background: 'color-mix(in srgb, #4285F4 6%, var(--surface))',
            border: '1px solid color-mix(in srgb, #4285F4 20%, var(--border))',
            borderRadius: 'var(--radius-md)',
            marginBottom: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}>
            {/* Event time */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14 }}>{'\uD83D\uDD52'}</span>
              <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--text1)' }}>
                {(() => {
                  const s = new Date(task.startTime!);
                  const fmtTime = (d: Date) => {
                    const h = d.getHours(), m = d.getMinutes();
                    const period = h >= 12 ? 'pm' : 'am';
                    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
                    return `${h12}:${String(m).padStart(2, '0')}${period}`;
                  };
                  const timeStr = fmtTime(s);
                  if (task.endTime) {
                    const e = new Date(task.endTime);
                    return `${timeStr} \u2013 ${fmtTime(e)}`;
                  }
                  return timeStr;
                })()}
              </span>
            </div>

            {/* Location */}
            {task.location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14 }}>{'\uD83D\uDCCD'}</span>
                <span style={{ fontSize: 13, color: 'var(--text2)' }}>
                  {task.location}
                </span>
              </div>
            )}

            {/* Conference link */}
            {task.conferenceUrl && (
              <button
                onClick={() => window.zaptask.openUrl(task.conferenceUrl!)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 14px',
                  background: 'var(--teal)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  width: '100%',
                  justifyContent: 'center',
                }}
              >
                {'\uD83C\uDFA5'} Join Meeting
              </button>
            )}
          </div>
        )}

        {/* Fields */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Status */}
          <InlineField label="Status">
            <StatusBadge
              status={task.status}
              onClick={async (s) => {
                const result = await window.zaptask.tasks.update(task.id, { status: s });
                if (result.success) updateTask(task.id, { status: s });
              }}
            />
          </InlineField>

          {/* Priority — inline chips */}
          <InlineField label="Priority">
            {priorityOptions.map((p) => (
              <button
                key={p.value}
                onClick={() => saveField({ priority: p.value })}
                style={chipStyle(task.priority === p.value)}
              >
                {p.icon} {p.label}
              </button>
            ))}
          </InlineField>

          {/* Energy — inline chips */}
          <InlineField label="Energy">
            {energyOptions.map((e) => (
              <button
                key={e.value}
                onClick={() => saveField({ energyRequired: e.value })}
                style={chipStyle(task.energyRequired === e.value, e.color)}
              >
                {e.icon} {e.label}
              </button>
            ))}
          </InlineField>

          {/* Duration — click to edit inline */}
          <InlineField label="Duration">
            {editingDuration ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <input
                  type="number"
                  min="0"
                  value={durationHours}
                  onChange={(e) => setDurationHours(e.target.value)}
                  placeholder="0"
                  autoFocus
                  style={{
                    width: 44, padding: '4px 6px', fontSize: 13,
                    background: 'var(--surface)', border: '1px solid var(--accent)',
                    borderRadius: 'var(--radius-sm)', color: 'var(--text1)',
                    textAlign: 'center', outline: 'none',
                  }}
                />
                <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>hr</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={durationMins}
                  onChange={(e) => setDurationMins(e.target.value)}
                  placeholder="0"
                  style={{
                    width: 44, padding: '4px 6px', fontSize: 13,
                    background: 'var(--surface)', border: '1px solid var(--accent)',
                    borderRadius: 'var(--radius-sm)', color: 'var(--text1)',
                    textAlign: 'center', outline: 'none',
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const total = (parseInt(durationHours || '0', 10) * 60) + parseInt(durationMins || '0', 10);
                      saveField({ estimatedMinutes: total > 0 ? total : null });
                      setEditingDuration(false);
                    }
                  }}
                />
                <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>min</span>
                <button
                  onClick={() => {
                    const total = (parseInt(durationHours || '0', 10) * 60) + parseInt(durationMins || '0', 10);
                    saveField({ estimatedMinutes: total > 0 ? total : null });
                    setEditingDuration(false);
                  }}
                  style={{
                    background: 'var(--accent)', border: 'none', color: '#fff',
                    fontSize: 11, padding: '4px 8px', borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer', fontFamily: 'var(--font-mono)',
                  }}
                >
                  {'\u2713'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  const totalMin = task.estimatedMinutes ?? 0;
                  setDurationHours(totalMin >= 60 ? Math.floor(totalMin / 60).toString() : '');
                  setDurationMins(totalMin % 60 > 0 ? (totalMin % 60).toString() : totalMin < 60 && totalMin > 0 ? totalMin.toString() : '');
                  setEditingDuration(true);
                }}
                style={clickableValueStyle}
                title="Click to edit"
              >
                {task.estimatedMinutes
                  ? task.estimatedMinutes >= 60
                    ? `${Math.floor(task.estimatedMinutes / 60)}h ${task.estimatedMinutes % 60}m`
                    : `${task.estimatedMinutes}m`
                  : '\u2014 Set duration'}
              </button>
            )}
          </InlineField>

          {/* Due Date — click to open picker */}
          <InlineField label="Due Date">
            <button
              onClick={() => setShowDueDatePicker(true)}
              style={clickableValueStyle}
              title="Click to change"
            >
              {task.dueDate
                ? format(new Date(task.dueDate + 'T00:00:00'), 'MMM d, yyyy')
                : '\uD83D\uDCC5 Set due date'}
            </button>
          </InlineField>

          {/* Repeat — recurrence rule chips */}
          <InlineField label="Repeat">
            {([
              { value: null, label: 'None' },
              { value: 'daily', label: 'Daily' },
              { value: 'weekdays', label: 'Wkdays' },
              { value: 'weekly', label: 'Weekly' },
              { value: 'biweekly', label: '2-Wk' },
              { value: 'monthly', label: 'Monthly' },
            ] as { value: Task['recurrenceRule']; label: string }[]).map((opt) => (
              <button
                key={opt.label}
                onClick={() => saveField({ recurrenceRule: opt.value })}
                style={chipStyle(task.recurrenceRule === opt.value, opt.value ? '#8B5CF6' : undefined)}
              >
                {opt.value ? '\uD83D\uDD01 ' : ''}{opt.label}
              </button>
            ))}
          </InlineField>

          {task.recurrenceRule && task.status !== 'done' && (
            <div style={{
              padding: '6px 10px',
              background: 'color-mix(in srgb, #8B5CF6 6%, var(--surface))',
              border: '1px solid color-mix(in srgb, #8B5CF6 15%, var(--border))',
              borderRadius: 'var(--radius-sm)',
              fontSize: 11,
              color: '#8B5CF6',
              fontFamily: 'var(--font-mono)',
            }}>
              {'\uD83D\uDD01'} Next task will be created when this one is completed
            </div>
          )}

          {/* Category — toggle */}
          <InlineField label="Category">
            {(['work', 'personal'] as const).map((c) => (
              <button
                key={c}
                onClick={() => saveField({ category: c })}
                style={{
                  ...chipStyle(task.category === c),
                  textTransform: 'capitalize',
                }}
              >
                {c}
              </button>
            ))}
          </InlineField>

          {/* Tags */}
          {task.tags.length > 0 && (
            <InlineField label="Tags">
              {task.tags.map((tag) => (
                <span key={tag} style={{
                  fontSize: 11, padding: '2px 6px', borderRadius: 'var(--radius-sm)',
                  background: 'var(--surface-high)', color: 'var(--text2)',
                }}>
                  {tag}
                </span>
              ))}
            </InlineField>
          )}
        </div>

        {/* Notes */}
        <div style={{ marginTop: 16 }}>
          <div style={{
            fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 600,
            color: 'var(--text2)', marginBottom: 8,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            Notes
            {task.notes.length > 0 && (
              <span style={{
                fontSize: 11, padding: '1px 6px',
                background: 'var(--accent-dim)', borderRadius: 'var(--radius-sm)',
                color: 'var(--accent)',
              }}>
                {task.notes.length}
              </span>
            )}
          </div>

          {/* Quick-add input */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
            <input
              ref={noteInputRef}
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && noteDraft.trim()) handleAddNote();
              }}
              placeholder="Quick note..."
              style={{
                flex: 1, padding: '6px 10px', fontSize: 13,
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)', color: 'var(--text1)', outline: 'none',
              }}
            />
            <Btn variant="primary" size="sm" disabled={!noteDraft.trim()} onClick={handleAddNote}>
              Add
            </Btn>
          </div>

          {/* Note list (newest first) */}
          {task.notes.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[...task.notes].reverse().map((note) => (
                <div key={note.id} style={{
                  padding: '8px 10px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                }}>
                  <div style={{ fontSize: 13, color: 'var(--text1)', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                    {note.text}
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginTop: 4,
                  }}>
                    <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
                      {new Date(note.createdAt).toLocaleString(undefined, {
                        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                      })}
                    </span>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      style={{
                        background: 'none', border: 'none', color: 'var(--text3)',
                        fontSize: 11, cursor: 'pointer', padding: '2px 4px',
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Source info */}
        {task.source !== 'local' && task.syncedAt && (
          <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 16 }}>
            {'\u21BB'} From {sourceLabels[task.source]} {'\u00B7'} synced {new Date(task.syncedAt).toLocaleTimeString()}
          </p>
        )}

        {task.source !== 'local' && task.sourceUrl && (
          <button
            onClick={() => window.zaptask.openUrl(task.sourceUrl!)}
            style={{
              marginTop: 8, padding: '6px 10px',
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)', color: 'var(--accent)',
              fontSize: 12, cursor: 'pointer',
            }}
          >
            {'\u2197'} Open in {sourceLabels[task.source]}
          </button>
        )}
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex', gap: 8, padding: '12px 16px',
        borderTop: '1px solid var(--border)', alignItems: 'center',
      }}>
        {confirmDelete ? (
          <>
            <Btn variant="secondary" onClick={() => setConfirmDelete(false)} style={{ flex: 1 }}>Cancel</Btn>
            <Btn variant="danger" onClick={handleDelete} style={{ flex: 1 }}>Confirm Delete</Btn>
          </>
        ) : (
          <>
            <Btn variant="ghost" onClick={() => setConfirmDelete(true)} size="sm" style={{ color: 'var(--red)' }}>Delete</Btn>
            <div style={{ flex: 1 }} />
            {task.status !== 'done' && (
              !canUsePomodoro() ? (
                <span style={{ fontSize: 12, color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  {'\uD83C\uDF45'} <ProBadge />
                </span>
              ) : pomodoroSession?.taskId === task.id ? (
                <Btn variant="secondary" size="sm" onClick={stopPomodoro}>
                  {'\u23F9'} Stop Pomodoro
                </Btn>
              ) : (
                <Btn variant="secondary" size="sm" onClick={() => startPomodoro(task.id)}>
                  {'\uD83C\uDF45'} Start Pomodoro
                </Btn>
              )
            )}
          </>
        )}
      </div>

      <CalendarModal
        isOpen={showDueDatePicker}
        selectedDate={task.dueDate || null}
        onSelect={(value) => {
          saveField({ dueDate: value || null });
          setShowDueDatePicker(false);
          if (value) {
            handleSchedule(new Date(value));
          }
        }}
        onClose={() => setShowDueDatePicker(false)}
        title="Choose due date"
      />
    </div>
  );
}
