import { useState, useMemo, useCallback } from 'react';
import { useStore } from '../store';
import { TaskCard } from './shared/TaskCard';
import { scheduleTaskIntoDay } from '../services/scheduler';
import type { Task } from '../../shared/types';

function to12h(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'pm' : 'am';
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour12}:${String(m).padStart(2, '0')}${period}`;
}

type CategoryFilter = 'all' | 'work' | 'personal';
type StatusFilter = 'all' | 'todo' | 'in_progress' | 'done';

export function TasksView() {
  const tasks = useStore((s) => s.tasks);
  const updateTask = useStore((s) => s.updateTask);
  const setActivePanel = useStore((s) => s.setActivePanel);
  const selectTask = useStore((s) => s.selectTask);
  const energyProfile = useStore((s) => s.energyProfile);
  const override = useStore((s) => s.currentEnergyOverride);
  const schedule = useStore((s) => s.schedule);
  const addTimeBlock = useStore((s) => s.addTimeBlock);
  const addToast = useStore((s) => s.addToast);
  const setActiveView = useStore((s) => s.setActiveView);
  const startPomodoro = useStore((s) => s.startPomodoro);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [status, setStatus] = useState<StatusFilter>('all');

  const uncategorizedCount = tasks.filter((t) => t.energyRequired === null && t.status !== 'done').length;

  const filtered = useMemo(() => {
    let result = tasks;
    if (category !== 'all') result = result.filter((t) => t.category === category);
    if (status !== 'all') result = result.filter((t) => t.status === status);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((t) =>
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q))
      );
    }
    return result;
  }, [tasks, category, status, search]);

  const workCount = tasks.filter((t) => t.category === 'work').length;
  const personalCount = tasks.filter((t) => t.category === 'personal').length;

  const handleAddToDay = useCallback((task: Task) => {
    const block = scheduleTaskIntoDay(task, new Date(), energyProfile, schedule, override);
    if (!block) {
      addToast('No available slot today. Try adjusting your schedule.', 'error');
      return;
    }
    addTimeBlock(block);
    addToast(`Scheduled ${to12h(block.start)} \u2013 ${to12h(block.end)}`, 'success');
    setActiveView('day');
  }, [energyProfile, schedule, override, addTimeBlock, addToast, setActiveView]);

  const handleTaskClick = (task: Task) => {
    selectTask(task.id);
    setActivePanel('taskDetail');
  };

  const categories: { id: CategoryFilter; label: string; icon?: string; count?: number }[] = [
    { id: 'all', label: 'All', icon: '📋', count: tasks.length },
    { id: 'work', label: 'Work', icon: '💼', count: workCount },
    { id: 'personal', label: 'Personal', icon: '🏡', count: personalCount },
  ];

  const statuses: { id: StatusFilter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'todo', label: 'To Do' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'done', label: 'Done' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Search + Add */}
      <div style={{ display: 'flex', gap: 8, padding: '12px 14px 8px' }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tasks..."
          style={{
            flex: 1,
            padding: '8px 12px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text1)',
            fontSize: 13,
          }}
        />
        <button
          onClick={() => setActivePanel('addTask')}
          style={{
            width: 36, height: 36,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--accent)',
            color: '#fff',
            borderRadius: 'var(--radius-sm)',
            fontSize: 20,
            fontWeight: 300,
            border: 'none',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          +
        </button>
      </div>

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: 4, padding: '4px 14px' }}>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            style={{
              padding: '4px 10px',
              borderRadius: 'var(--radius-sm)',
              background: category === c.id ? 'var(--accent-dim)' : 'transparent',
              color: category === c.id ? 'var(--accent)' : 'var(--text3)',
              fontSize: 13,
              fontFamily: 'var(--font-mono)',
              fontWeight: 500,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {c.icon && <span style={{ marginRight: 4 }}>{c.icon}</span>}
            {c.label} {c.count !== undefined && <span style={{ opacity: 0.7 }}>{c.count}</span>}
          </button>
        ))}
      </div>

      {/* Status filter chips */}
      <div style={{ display: 'flex', gap: 4, padding: '4px 14px 8px' }}>
        {statuses.map((s) => (
          <button
            key={s.id}
            onClick={() => setStatus(s.id)}
            style={{
              padding: '3px 8px',
              borderRadius: 'var(--radius-sm)',
              background: status === s.id ? 'var(--surface-high)' : 'transparent',
              color: status === s.id ? 'var(--text1)' : 'var(--text3)',
              fontSize: 12,
              fontFamily: 'var(--font-mono)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Uncategorized energy banner */}
      {uncategorizedCount > 0 && (
        <div style={{
          margin: '0 14px 8px',
          padding: '8px 12px',
          background: 'rgba(255, 209, 102, 0.08)',
          border: '1px solid rgba(255, 209, 102, 0.2)',
          borderRadius: 'var(--radius-sm)',
          fontSize: 13,
          color: 'var(--yellow)',
          cursor: 'pointer',
        }}
          onClick={() => { setStatus('all'); setCategory('all'); }}
        >
          {'\u26A1'} {uncategorizedCount} task{uncategorizedCount > 1 ? 's' : ''} need an energy level — they won't appear in Suggested until set
        </div>
      )}

      {/* Task list */}
      <div style={{ flex: 1, overflow: 'auto', padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {filtered.length === 0 ? (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <span style={{ fontSize: 32, opacity: 0.3 }}>{'\u2611'}</span>
            <span style={{ color: 'var(--text3)', fontSize: 13 }}>
              {tasks.length === 0 ? 'No tasks yet. Tap + to add one.' : 'No tasks match your filters.'}
            </span>
          </div>
        ) : (
          filtered.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => handleTaskClick(task)}
              onStatusChange={async (id, status) => {
                const result = await window.zaptask.tasks.update(id, { status });
                if (result.success) updateTask(id, { status });
              }}
              onAddToDay={() => handleAddToDay(task)}
              onStartPomodoro={() => startPomodoro(task.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
