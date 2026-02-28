import { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { addDays, format } from 'date-fns';
import { Btn } from './Btn';
import { getScheduleSuggestions, type ScheduleSuggestion } from '../../services/scheduler';
import { useStore } from '../../store';
import type { Task } from '../../../shared/types';

function to12h(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'pm' : 'am';
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour12}:${String(m).padStart(2, '0')}${period}`;
}

interface SchedulePickerModalProps {
  task: Task;
  onClose: () => void;
}

const DAYS_BACK = 0;
const DAYS_FORWARD = 13;

const energyIcons: Record<string, string> = {
  high: '\u26A1',
  medium: '\uD83D\uDD0B',
  low: '\uD83C\uDF19',
};

export function SchedulePickerModal({ task, onClose }: SchedulePickerModalProps) {
  const energyProfile = useStore((s) => s.energyProfile);
  const override = useStore((s) => s.currentEnergyOverride);
  const schedule = useStore((s) => s.schedule);
  const addTimeBlock = useStore((s) => s.addTimeBlock);
  const addToast = useStore((s) => s.addToast);
  const setActiveView = useStore((s) => s.setActiveView);

  const duration = task.estimatedMinutes || 30;
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const [selectedDate, setSelectedDate] = useState(new Date());
  const selectedStr = format(selectedDate, 'yyyy-MM-dd');
  const scrollRef = useRef<HTMLDivElement>(null);
  const todayRef = useRef<HTMLButtonElement>(null);

  // Date strip
  const dateStrip = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Array.from({ length: DAYS_BACK + 1 + DAYS_FORWARD }, (_, i) => addDays(today, i - DAYS_BACK));
  }, [todayStr]);

  // Auto-scroll to today on mount
  useEffect(() => {
    if (todayRef.current) {
      todayRef.current.scrollIntoView({ inline: 'center', block: 'nearest' });
    }
  }, []);

  // Energy-based suggestions
  const suggestions = useMemo(
    () => getScheduleSuggestions(task, selectedDate, energyProfile, schedule, override, 4),
    [task, selectedDate, energyProfile, schedule, override],
  );

  // Manual time picker state
  const now = new Date();
  const currentMin = Math.ceil((now.getHours() * 60 + now.getMinutes()) / 15) * 15;
  const [startHour, setStartHour] = useState(Math.floor(currentMin / 60));
  const [startMin, setStartMin] = useState(currentMin % 60);

  const endTotalMin = startHour * 60 + startMin + duration;
  const endHour = Math.floor(endTotalMin / 60);
  const endMin = endTotalMin % 60;
  const startStr = `${String(startHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')}`;
  const endStr = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;

  const dayBlocks = schedule.filter((b) => b.date === selectedStr);
  const hasCollision = dayBlocks.some((b) => b.start < endStr && b.end > startStr);

  const handleSuggestionPick = (s: ScheduleSuggestion) => {
    addTimeBlock({
      id: crypto.randomUUID(),
      taskId: task.id,
      date: s.date,
      start: s.start,
      end: s.end,
      createdAt: new Date().toISOString(),
    });
    addToast(`Scheduled ${to12h(s.start)} \u2013 ${to12h(s.end)}`, 'success');
    setActiveView('day');
    onClose();
  };

  const handleManual = () => {
    if (hasCollision) return;
    addTimeBlock({
      id: crypto.randomUUID(),
      taskId: task.id,
      date: selectedStr,
      start: startStr,
      end: endStr,
      createdAt: new Date().toISOString(),
    });
    addToast(`Scheduled ${to12h(startStr)} \u2013 ${to12h(endStr)}`, 'success');
    setActiveView('day');
    onClose();
  };

  const hours = Array.from({ length: 15 }, (_, i) => i + 7);
  const mins = [0, 15, 30, 45];
  const formatTime = (h: number, m: number) => {
    const period = h >= 12 ? 'pm' : 'am';
    const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${display}:${String(m).padStart(2, '0')}${period}`;
  };

  const selectStyle = {
    padding: '6px 8px',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text1)',
    fontSize: 13,
    fontFamily: 'var(--font-mono)',
  };

  return createPortal(
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 320,
          maxHeight: 'calc(100vh - 40px)',
          overflow: 'auto',
          background: 'var(--surface-high)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-glow)',
          boxShadow: '0 18px 45px rgba(0,0,0,0.55)',
          padding: 16,
          color: 'var(--text1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Schedule Task</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: 16, cursor: 'pointer' }}>
            {'\u2715'}
          </button>
        </div>

        {/* Task name + duration */}
        <div style={{
          fontSize: 12, color: 'var(--text2)', fontFamily: 'var(--font-mono)',
          marginBottom: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {task.title} ({duration}min)
          {task.energyRequired && (
            <span style={{ marginLeft: 8, color: 'var(--text3)' }}>
              {energyIcons[task.energyRequired]} {task.energyRequired}
            </span>
          )}
        </div>

        {/* Date strip */}
        <div
          ref={scrollRef}
          style={{
            display: 'flex',
            gap: 4,
            overflowX: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            scrollBehavior: 'smooth',
            marginBottom: 12,
            paddingBottom: 2,
          }}
        >
          {dateStrip.map((day) => {
            const dayStr = format(day, 'yyyy-MM-dd');
            const isToday = dayStr === todayStr;
            const isSelected = dayStr === selectedStr;
            const bg = isSelected ? 'var(--accent)' : isToday ? 'var(--surface)' : 'transparent';
            const fg = isSelected ? '#fff' : 'var(--text1)';
            const border = isSelected ? 'var(--accent)' : isToday ? 'var(--border)' : 'transparent';

            return (
              <button
                key={dayStr}
                ref={isToday ? todayRef : undefined}
                onClick={() => setSelectedDate(day)}
                style={{
                  minWidth: 40, width: 40,
                  padding: '4px 2px',
                  borderRadius: 'var(--radius-sm)',
                  border: `1px solid ${border}`,
                  background: bg,
                  color: fg,
                  fontSize: 10,
                  fontFamily: 'var(--font-mono)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <span style={{ opacity: 0.7 }}>{format(day, 'EEE')}</span>
                <span style={{ fontWeight: isToday ? 700 : 500 }}>{format(day, 'd')}</span>
              </button>
            );
          })}
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
            <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
              Suggested times
            </span>
            {suggestions.map((s) => {
              const matchColor = s.energyMatch === 'perfect' ? 'var(--green)'
                : s.energyMatch === 'good' ? 'var(--teal)' : 'var(--text3)';
              const matchLabel = s.energyMatch === 'perfect' ? 'Perfect match'
                : s.energyMatch === 'good' ? 'Good match' : '';
              return (
                <button
                  key={s.id}
                  onClick={() => handleSuggestionPick(s)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    background: s.isBest
                      ? 'color-mix(in srgb, var(--accent) 10%, var(--surface))'
                      : 'var(--surface)',
                    border: `1px solid ${s.isBest ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left',
                    color: 'var(--text1)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {s.energyLevel && (
                      <span style={{ fontSize: 12 }}>{energyIcons[s.energyLevel]}</span>
                    )}
                    <span style={{
                      fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 600,
                    }}>
                      {to12h(s.start)} {'\u2013'} {to12h(s.end)}
                    </span>
                    {matchLabel && (
                      <span style={{
                        fontSize: 10, fontFamily: 'var(--font-mono)',
                        color: matchColor,
                      }}>
                        {matchLabel}
                      </span>
                    )}
                  </div>
                  {s.isBest && (
                    <span style={{
                      fontSize: 9, fontFamily: 'var(--font-mono)', fontWeight: 700,
                      color: 'var(--accent)', textTransform: 'uppercase',
                    }}>
                      Best
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div style={{
            padding: '12px', textAlign: 'center',
            fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--font-mono)',
            marginBottom: 12,
          }}>
            No available slots on this day
          </div>
        )}

        {/* Divider */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
        }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>or pick a time</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        {/* Manual time picker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <select
            value={startHour}
            onChange={(e) => setStartHour(Number(e.target.value))}
            style={selectStyle}
          >
            {hours.map((h) => (
              <option key={h} value={h}>{h === 0 ? 12 : h > 12 ? h - 12 : h}{h >= 12 ? 'pm' : 'am'}</option>
            ))}
          </select>
          <span style={{ color: 'var(--text3)' }}>:</span>
          <select
            value={startMin}
            onChange={(e) => setStartMin(Number(e.target.value))}
            style={selectStyle}
          >
            {mins.map((m) => (
              <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
            ))}
          </select>
          <span style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
            {'\u2192'} {formatTime(endHour, endMin)}
          </span>
        </div>

        {hasCollision && (
          <div style={{ fontSize: 11, color: 'var(--red)', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>
            Conflicts with an existing block
          </div>
        )}

        <Btn
          variant="secondary"
          disabled={hasCollision}
          onClick={handleManual}
          style={{ width: '100%' }}
        >
          Schedule at {formatTime(startHour, startMin)}
        </Btn>
      </div>
    </div>,
    document.body,
  );
}
