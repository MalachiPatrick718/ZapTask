import { useEffect, useRef } from 'react';
import { useStore } from '../store';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function PomodoroBar() {
  const session = useStore((s) => s.pomodoroSession);
  const tasks = useStore((s) => s.tasks);
  const tickPomodoro = useStore((s) => s.tickPomodoro);
  const completePomodoroPhase = useStore((s) => s.completePomodoroPhase);
  const pausePomodoro = useStore((s) => s.pausePomodoro);
  const resumePomodoro = useStore((s) => s.resumePomodoro);
  const stopPomodoro = useStore((s) => s.stopPomodoro);
  const addToast = useStore((s) => s.addToast);
  const selectTask = useStore((s) => s.selectTask);
  const setActivePanel = useStore((s) => s.setActivePanel);

  const prevRemaining = useRef<number | null>(null);

  // Tick every second
  useEffect(() => {
    if (!session || !session.isRunning) return;
    const interval = setInterval(() => {
      tickPomodoro();
    }, 1000);
    return () => clearInterval(interval);
  }, [session?.isRunning, tickPomodoro]);

  // Detect when remaining hits 0 → complete phase + notify
  useEffect(() => {
    if (!session) {
      prevRemaining.current = null;
      return;
    }
    if (prevRemaining.current !== null && prevRemaining.current > 0 && session.remainingSeconds <= 0) {
      const wasFocus = session.phase === 'focus';
      completePomodoroPhase();
      if (wasFocus) {
        addToast('Focus session complete! Time for a break.', 'success');
        try {
          window.zaptask.notifications.show(
            'Pomodoro Complete',
            'Focus session done! Take a break.',
          );
        } catch { /* notifications may not be available */ }
      } else {
        addToast('Break over! Ready for another focus session?', 'info');
        try {
          window.zaptask.notifications.show(
            'Break Over',
            'Ready to focus again?',
          );
        } catch { /* notifications may not be available */ }
      }
    }
    prevRemaining.current = session.remainingSeconds;
  }, [session?.remainingSeconds, session?.phase, completePomodoroPhase, addToast]);

  if (!session) return null;

  const task = tasks.find((t) => t.id === session.taskId);
  const taskTitle = task?.title || 'Unknown Task';
  const isFocus = session.phase === 'focus';

  const barBg = isFocus
    ? 'color-mix(in srgb, var(--accent) 15%, var(--surface-high))'
    : 'color-mix(in srgb, var(--green) 15%, var(--surface-high))';
  const phaseColor = isFocus ? 'var(--accent)' : 'var(--green)';

  const handleTaskClick = () => {
    selectTask(session.taskId);
    setActivePanel('taskDetail');
  };

  const btnStyle = {
    background: 'none',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text1)',
    fontSize: 14,
    cursor: 'pointer',
    padding: '4px 8px',
    lineHeight: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as const;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '8px 14px',
      background: barBg,
      borderTop: `1px solid ${phaseColor}`,
      flexShrink: 0,
    }}>
      {/* Task title (clickable) */}
      <button
        onClick={handleTaskClick}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text1)',
          fontSize: 13,
          fontWeight: 500,
          cursor: 'pointer',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          flex: 1,
          textAlign: 'left',
          padding: 0,
        }}
        title={taskTitle}
      >
        {'\uD83C\uDF45'} {taskTitle}
      </button>

      {/* Phase badge */}
      <span style={{
        fontSize: 10,
        fontFamily: 'var(--font-mono)',
        fontWeight: 700,
        padding: '2px 6px',
        borderRadius: 'var(--radius-sm)',
        background: `color-mix(in srgb, ${phaseColor} 20%, transparent)`,
        color: phaseColor,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        flexShrink: 0,
      }}>
        {isFocus ? 'Focus' : 'Break'}
      </span>

      {/* Countdown */}
      <span style={{
        fontSize: 18,
        fontFamily: 'var(--font-mono)',
        fontWeight: 700,
        color: 'var(--text1)',
        minWidth: 56,
        textAlign: 'center',
        flexShrink: 0,
      }}>
        {formatTime(session.remainingSeconds)}
      </span>

      {/* Pause / Resume */}
      <button
        onClick={session.isRunning ? pausePomodoro : resumePomodoro}
        style={btnStyle}
        title={session.isRunning ? 'Pause' : 'Resume'}
      >
        {session.isRunning ? '\u23F8' : '\u25B6'}
      </button>

      {/* Stop */}
      <button
        onClick={stopPomodoro}
        style={{ ...btnStyle, color: 'var(--red)' }}
        title="Stop"
      >
        {'\u23F9'}
      </button>

      {/* Completed count */}
      {session.completedCount > 0 && (
        <span style={{
          fontSize: 11,
          fontFamily: 'var(--font-mono)',
          color: 'var(--text3)',
          flexShrink: 0,
        }}>
          {'\uD83C\uDF45'}{session.completedCount}
        </span>
      )}
    </div>
  );
}
