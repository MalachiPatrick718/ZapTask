import { useState } from 'react';
import { useStore } from '../../store';
import { Btn } from '../shared/Btn';
import { CalendarModal } from '../shared/CalendarModal';
import type { EnergyLevel, Task } from '../../../shared/types';
import { format } from 'date-fns';

export function AddTaskPanel() {
  const addTask = useStore((s) => s.addTask);
  const setActivePanel = useStore((s) => s.setActivePanel);
  const addToast = useStore((s) => s.addToast);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'work' | 'personal'>('work');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [energyRequired, setEnergyRequired] = useState<EnergyLevel | null>(null);
  const [estHours, setEstHours] = useState('');
  const [estMinutes, setEstMinutes] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [tags, setTags] = useState('');
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);

  const canSave = title.trim().length > 0 && energyRequired !== null;

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);

    const now = new Date().toISOString();
    const task: Task = {
      id: crypto.randomUUID(),
      title: title.trim(),
      description: description.trim() || null,
      source: 'local',
      sourceId: null,
      sourceUrl: null,
      category,
      status: 'todo',
      priority,
      energyRequired,
      estimatedMinutes: (estHours || estMinutes)
        ? (parseInt(estHours || '0', 10) * 60) + parseInt(estMinutes || '0', 10)
        : null,
      dueDate: dueDate || null,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      notes: [],
      createdAt: now,
      updatedAt: now,
      syncedAt: null,
    };

    try {
      const result = await window.zaptask.tasks.create(task);
      if (result.success) {
        addTask(task);
        addToast('Task created', 'success');
        setActivePanel(null);
      } else {
        addToast('Failed to save task', 'error');
      }
    } catch (err) {
      console.error('[AddTask] Error:', err);
      addToast('Failed to save task', 'error');
    } finally {
      setSaving(false);
    }
  };

  const energyOptions: { value: EnergyLevel; icon: string; label: string; color: string }[] = [
    { value: 'high', icon: '\u26A1', label: 'High', color: 'var(--energy-high)' },
    { value: 'medium', icon: '\uD83D\uDD0B', label: 'Med', color: 'var(--energy-med)' },
    { value: 'low', icon: '\uD83C\uDF19', label: 'Low', color: 'var(--energy-low)' },
  ];

  const priorityOptions: { value: Task['priority']; label: string; icon: string }[] = [
    { value: 'urgent', label: 'Urgent', icon: '🔥' },
    { value: 'high', label: 'High', icon: '⬆️' },
    { value: 'medium', label: 'Medium', icon: '⏱️' },
    { value: 'low', label: 'Low', icon: '💤' },
  ];

  const inputStyle = {
    width: '100%' as const,
    padding: '8px 12px',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text1)',
    fontSize: 13,
  };

  const labelStyle = {
    display: 'block' as const,
    marginBottom: 6,
    fontSize: 12,
    fontFamily: 'var(--font-mono)',
    color: 'var(--text2)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', borderBottom: '1px solid var(--border)',
      }}>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700,
          color: 'var(--text1)',
        }}>
          New Task
        </h2>
        <button
          onClick={() => setActivePanel(null)}
          style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: 18, cursor: 'pointer' }}
        >
          {'\u2715'}
        </button>
      </div>

      {/* Form */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Title */}
        <div>
          <label style={labelStyle}>Title *</label>
          <input
            type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?" autoFocus style={inputStyle}
          />
        </div>

        {/* Description */}
        <div>
          <label style={labelStyle}>Description</label>
          <textarea
            value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="Add details..." rows={3}
            style={{ ...inputStyle, resize: 'vertical' as const }}
          />
        </div>

        {/* Category toggle */}
        <div>
          <label style={labelStyle}>Category</label>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['work', 'personal'] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                style={{
                  flex: 1, padding: '6px 0',
                  background: category === c ? 'var(--accent-dim)' : 'var(--surface)',
                  color: category === c ? 'var(--accent)' : 'var(--text3)',
                  border: `1px solid ${category === c ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 12, fontWeight: 500, cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {c === 'work' ? '💼 Work' : '🏡 Personal'}
              </button>
            ))}
          </div>
        </div>

        {/* Priority */}
        <div>
            <label style={labelStyle}>Priority</label>
          <div style={{ display: 'flex', gap: 6 }}>
            {priorityOptions.map((p) => (
              <button
                key={p.value}
                onClick={() => setPriority(p.value)}
                style={{
                  flex: 1, padding: '6px 0',
                  background: priority === p.value ? 'var(--surface-high)' : 'var(--surface)',
                  color: priority === p.value ? 'var(--text1)' : 'var(--text3)',
                  border: `1px solid ${priority === p.value ? 'var(--border-glow)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 11, cursor: 'pointer',
                }}
              >
                <span style={{ marginRight: 4 }}>{p.icon}</span>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Energy Required */}
        <div>
          <label style={{ ...labelStyle, color: energyRequired === null ? 'var(--yellow)' : 'var(--text2)' }}>
            Energy Required * {energyRequired === null && '(required)'}
          </label>
          <div style={{ display: 'flex', gap: 6 }}>
            {energyOptions.map((e) => (
              <button
                key={e.value}
                onClick={() => setEnergyRequired(e.value)}
                style={{
                  flex: 1, padding: '8px 0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                  background: energyRequired === e.value ? `color-mix(in srgb, ${e.color} 15%, transparent)` : 'var(--surface)',
                  color: energyRequired === e.value ? e.color : 'var(--text3)',
                  border: `1px solid ${energyRequired === e.value ? e.color : 'var(--border)'}`,
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 12, cursor: 'pointer',
                }}
              >
                {e.icon} {e.label}
              </button>
            ))}
          </div>
        </div>

        {/* Est. Duration + Due Date row */}
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Est. Duration</label>
            <div style={{ display: 'flex', gap: 6 }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  type="number" min="0" value={estHours}
                  onChange={(e) => setEstHours(e.target.value)}
                  placeholder="0" style={{ ...inputStyle, paddingRight: 28 }}
                />
                <span style={{
                  position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                  fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)', pointerEvents: 'none',
                }}>hr</span>
              </div>
              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  type="number" min="0" max="59" value={estMinutes}
                  onChange={(e) => setEstMinutes(e.target.value)}
                  placeholder="30" style={{ ...inputStyle, paddingRight: 32 }}
                />
                <span style={{
                  position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                  fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)', pointerEvents: 'none',
                }}>min</span>
              </div>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Due Date 📅</label>
            <button
              type="button"
              onClick={() => setShowDueDatePicker(true)}
              style={{
                ...inputStyle,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--surface)',
              }}
            >
              <span style={{ color: dueDate ? 'var(--text1)' : 'var(--text3)' }}>
                {dueDate ? format(new Date(dueDate + 'T00:00:00'), 'MM/dd/yyyy') : 'Pick a date'}
              </span>
              <span>{'\uD83D\uDCC5'}</span>
            </button>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label style={labelStyle}>Tags (comma-separated)</label>
          <input
            type="text" value={tags} onChange={(e) => setTags(e.target.value)}
            placeholder="frontend, bug, p1" style={inputStyle}
          />
        </div>

        {/* Destination note */}
        <div style={{
          padding: '8px 10px',
          background: 'var(--surface)',
          borderRadius: 'var(--radius-sm)',
          fontSize: 12,
          color: 'var(--text3)',
          border: '1px solid var(--border)',
        }}>
          Saving to: Local only
          <br />
          <span style={{ opacity: 0.6 }}>Creating tasks in Jira/Notion/Calendar coming soon</span>
        </div>
      </div>

      {/* Footer buttons */}
      <div style={{
        display: 'flex', gap: 8, padding: '12px 16px',
        borderTop: '1px solid var(--border)',
      }}>
        <Btn variant="secondary" onClick={() => setActivePanel(null)} style={{ flex: 1 }}>
          Cancel
        </Btn>
        <Btn disabled={!canSave} onClick={handleSave} style={{ flex: 1 }}>
          Add Task
        </Btn>
      </div>

      <CalendarModal
        isOpen={showDueDatePicker}
        selectedDate={dueDate || null}
        onSelect={(value) => setDueDate(value)}
        onClose={() => setShowDueDatePicker(false)}
        title="Choose due date"
      />
    </div>
  );
}
