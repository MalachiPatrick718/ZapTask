import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Btn } from './Btn';
import type { Task } from '../../../shared/types';

interface PomodoroModalProps {
  task: Task;
  onClose: () => void;
  onStart: () => void;
}

type Phase = 'idle' | 'work' | 'break' | 'longBreak';

const PRESETS = [
  { label: 'Classic', work: 25, break: 5, longBreak: 15, rounds: 4 },
  { label: 'Short', work: 15, break: 3, longBreak: 10, rounds: 4 },
  { label: 'Deep Focus', work: 50, break: 10, longBreak: 20, rounds: 3 },
];

const phaseColors: Record<Phase, string> = {
  idle: 'var(--text2)',
  work: 'var(--red)',
  break: 'var(--green)',
  longBreak: 'var(--teal)',
};

const phaseLabels: Record<Phase, string> = {
  idle: 'Ready',
  work: 'Focus',
  break: 'Break',
  longBreak: 'Long Break',
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function PomodoroModal({ task, onClose, onStart }: PomodoroModalProps) {
  const [workMin, setWorkMin] = useState(25);
  const [breakMin, setBreakMin] = useState(5);
  const [longBreakMin, setLongBreakMin] = useState(15);
  const [totalRounds, setTotalRounds] = useState(4);

  const [phase, setPhase] = useState<Phase>('idle');
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [completedRounds, setCompletedRounds] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  // Timer tick
  useEffect(() => {
    if (!running) {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      return;
    }

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          // Phase complete
          handlePhaseComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, phase, currentRound, totalRounds, workMin, breakMin, longBreakMin]);

  const handlePhaseComplete = () => {
    setRunning(false);

    if (phase === 'work') {
      const newCompleted = completedRounds + 1;
      setCompletedRounds(newCompleted);

      if (newCompleted >= totalRounds) {
        // All rounds done
        setPhase('idle');
        setSecondsLeft(workMin * 60);
        try {
          window.zaptask.notifications.show(
            'Pomodoro Complete!',
            `Finished ${totalRounds} rounds on "${task.title}"`,
            task.id,
          );
        } catch {}
        return;
      }

      // Switch to break
      const isLongBreak = newCompleted % totalRounds === 0;
      if (isLongBreak) {
        setPhase('longBreak');
        setSecondsLeft(longBreakMin * 60);
      } else {
        setPhase('break');
        setSecondsLeft(breakMin * 60);
      }
      setCurrentRound(newCompleted + 1);
    } else {
      // Break ended → start next work phase
      setPhase('work');
      setSecondsLeft(workMin * 60);
    }
  };

  const handleStartWork = () => {
    setPhase('work');
    setSecondsLeft(workMin * 60);
    setCurrentRound(1);
    setCompletedRounds(0);
    setRunning(true);
    onStart();
  };

  const handlePause = () => setRunning(false);
  const handleResume = () => setRunning(true);

  const handleReset = () => {
    setRunning(false);
    setPhase('idle');
    setSecondsLeft(workMin * 60);
    setCurrentRound(1);
    setCompletedRounds(0);
  };

  const applyPreset = (preset: typeof PRESETS[number]) => {
    setWorkMin(preset.work);
    setBreakMin(preset.break);
    setLongBreakMin(preset.longBreak);
    setTotalRounds(preset.rounds);
    if (phase === 'idle') {
      setSecondsLeft(preset.work * 60);
    }
  };

  const progress = phase === 'idle' ? 0 : (() => {
    const total = phase === 'work' ? workMin * 60
      : phase === 'break' ? breakMin * 60
        : longBreakMin * 60;
    return 1 - (secondsLeft / total);
  })();

  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference * (1 - progress);
  const activeColor = phaseColors[phase];

  const inputStyle = {
    width: 52,
    padding: '4px 6px',
    background: 'var(--surface-high)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text1)',
    fontSize: 13,
    fontFamily: 'var(--font-mono)',
    textAlign: 'center' as const,
  };

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 360,
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
        }}
      >
        {/* Task name */}
        <div style={{
          fontSize: 11, fontFamily: 'var(--font-mono)',
          color: 'var(--text3)', marginBottom: 4,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {task.title}
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', marginBottom: 16,
        }}>
          <span style={{
            fontSize: 18, fontFamily: 'var(--font-display)', fontWeight: 700,
            color: 'var(--text1)',
          }}>
            {'\uD83C\uDF45'} Pomodoro Timer
          </span>
          <button
            onClick={onClose}
            style={{
              position: 'absolute', right: 0, top: -2,
              background: 'none', border: 'none',
              color: 'var(--text3)', fontSize: 16,
              cursor: 'pointer', padding: '2px 4px',
              borderRadius: 'var(--radius-sm)',
            }}
            title="Close"
          >
            {'\u2715'}
          </button>
        </div>

        {/* Timer ring */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <div style={{ position: 'relative', width: 128, height: 128 }}>
            <svg width="128" height="128" style={{ transform: 'rotate(-90deg)' }}>
              {/* Background ring */}
              <circle
                cx="64" cy="64" r="54"
                fill="none" stroke="var(--border)" strokeWidth="6"
              />
              {/* Progress ring */}
              <circle
                cx="64" cy="64" r="54"
                fill="none" stroke={activeColor} strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{
                fontSize: 28, fontFamily: 'var(--font-mono)', fontWeight: 700,
                color: 'var(--text1)',
              }}>
                {formatTime(secondsLeft)}
              </span>
              <span style={{
                fontSize: 11, fontFamily: 'var(--font-mono)',
                color: activeColor, fontWeight: 500,
              }}>
                {phaseLabels[phase]}
              </span>
            </div>
          </div>
        </div>

        {/* Rounds indicator */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 16,
        }}>
          {Array.from({ length: totalRounds }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 10, height: 10, borderRadius: '50%',
                background: i < completedRounds ? 'var(--red)' : 'var(--border)',
                border: i === completedRounds && phase === 'work'
                  ? '2px solid var(--red)' : '2px solid transparent',
              }}
            />
          ))}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {phase === 'idle' ? (
            <Btn onClick={handleStartWork} style={{ flex: 1 }}>
              Start Focus
            </Btn>
          ) : (
            <>
              <Btn
                variant="secondary"
                onClick={running ? handlePause : handleResume}
                style={{ flex: 1 }}
              >
                {running ? 'Pause' : 'Resume'}
              </Btn>
              <Btn variant="ghost" onClick={handleReset} style={{ flex: 1 }}>
                Reset
              </Btn>
            </>
          )}
        </div>

        {/* Settings (only when idle) */}
        {phase === 'idle' && (
          <div style={{
            borderTop: '1px solid var(--border)',
            paddingTop: 12,
          }}>
            {/* Presets */}
            <div style={{
              display: 'flex', gap: 6, marginBottom: 12,
            }}>
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => applyPreset(p)}
                  style={{
                    flex: 1,
                    padding: '5px 8px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    background: workMin === p.work ? 'var(--accent-dim)' : 'var(--surface)',
                    color: workMin === p.work ? 'var(--accent)' : 'var(--text2)',
                    fontSize: 11, fontWeight: 500, cursor: 'pointer',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Custom values */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              gap: '8px 12px',
            }}>
              <label style={{ fontSize: 11, color: 'var(--text3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                Focus
                <input type="number" min={1} max={120} value={workMin}
                  onChange={(e) => { setWorkMin(+e.target.value); setSecondsLeft(+e.target.value * 60); }}
                  style={inputStyle}
                />
              </label>
              <label style={{ fontSize: 11, color: 'var(--text3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                Break
                <input type="number" min={1} max={30} value={breakMin}
                  onChange={(e) => setBreakMin(+e.target.value)}
                  style={inputStyle}
                />
              </label>
              <label style={{ fontSize: 11, color: 'var(--text3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                Long Break
                <input type="number" min={1} max={60} value={longBreakMin}
                  onChange={(e) => setLongBreakMin(+e.target.value)}
                  style={inputStyle}
                />
              </label>
              <label style={{ fontSize: 11, color: 'var(--text3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                Rounds
                <input type="number" min={1} max={10} value={totalRounds}
                  onChange={(e) => setTotalRounds(+e.target.value)}
                  style={inputStyle}
                />
              </label>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
