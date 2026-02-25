import { useState } from 'react';
import { createPortal } from 'react-dom';
import { format } from 'date-fns';
import { Btn } from './Btn';
import { scheduleTaskIntoDay } from '../../services/scheduler';
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

export function SchedulePickerModal({ task, onClose }: SchedulePickerModalProps) {
  const energyProfile = useStore((s) => s.energyProfile);
  const override = useStore((s) => s.currentEnergyOverride);
  const schedule = useStore((s) => s.schedule);
  const addTimeBlock = useStore((s) => s.addTimeBlock);
  const addToast = useStore((s) => s.addToast);
  const setActiveView = useStore((s) => s.setActiveView);

  const duration = task.estimatedMinutes || 30;
  const now = new Date();
  const currentMin = Math.ceil((now.getHours() * 60 + now.getMinutes()) / 15) * 15;
  const defaultHour = Math.floor(currentMin / 60);
  const defaultMin = currentMin % 60;

  const [startHour, setStartHour] = useState(defaultHour);
  const [startMin, setStartMin] = useState(defaultMin);

  const endTotalMin = startHour * 60 + startMin + duration;
  const endHour = Math.floor(endTotalMin / 60);
  const endMin = endTotalMin % 60;
  const endStr = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;
  const startStr = `${String(startHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')}`;

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const dayBlocks = schedule.filter((b) => b.date === todayStr);
  const hasCollision = dayBlocks.some((b) => b.start < endStr && b.end > startStr);

  const handleAuto = () => {
    const block = scheduleTaskIntoDay(task, new Date(), energyProfile, schedule, override);
    if (!block) {
      addToast('No available slot today. Try adjusting your schedule.', 'error');
      onClose();
      return;
    }
    addTimeBlock(block);
    addToast(`Scheduled ${to12h(block.start)} \u2013 ${to12h(block.end)}`, 'success');
    setActiveView('day');
    onClose();
  };

  const handleManual = () => {
    if (hasCollision) return;
    const block = {
      id: crypto.randomUUID(),
      taskId: task.id,
      date: todayStr,
      start: startStr,
      end: endStr,
      createdAt: new Date().toISOString(),
    };
    addTimeBlock(block);
    addToast(`Scheduled ${to12h(startStr)} \u2013 ${to12h(endStr)}`, 'success');
    setActiveView('day');
    onClose();
  };

  // Generate hour options (7am - 9pm)
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
          width: 280,
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Add to Today's Work</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: 16, cursor: 'pointer' }}>
            {'\u2715'}
          </button>
        </div>

        {/* Task name */}
        <div style={{
          fontSize: 12, color: 'var(--text2)', fontFamily: 'var(--font-mono)',
          marginBottom: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {task.title} ({duration}min)
        </div>

        {/* Auto pick */}
        <Btn onClick={handleAuto} style={{ width: '100%', marginBottom: 12 }}>
          {'\u26A1'} Auto-pick best time
        </Btn>

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
