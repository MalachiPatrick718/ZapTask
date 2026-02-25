import { useMemo, useState } from 'react';
import {
  addDays,
  addMonths,
  endOfMonth,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns';

interface CalendarModalProps {
  isOpen: boolean;
  selectedDate: string | null;
  onSelect: (value: string) => void;
  onClose: () => void;
  title?: string;
}

const weekdayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function CalendarModal({
  isOpen,
  selectedDate,
  onSelect,
  onClose,
  title = 'Select due date',
}: CalendarModalProps) {
  // Append T00:00:00 so date-only strings parse as local time, not UTC
  const initialDate = selectedDate ? new Date(selectedDate + 'T00:00:00') : new Date();
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(initialDate));

  const days = useMemo(() => {
    const monthStart = currentMonth;
    const monthEnd = endOfMonth(monthStart);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const grid: Date[] = [];

    let day = gridStart;
    while (day <= monthEnd || grid.length < 42) {
      grid.push(day);
      day = addDays(day, 1);
    }

    return grid;
  }, [currentMonth]);

  if (!isOpen) return null;

  const selected = selectedDate ? new Date(selectedDate + 'T00:00:00') : null;
  const today = new Date();

  const handleSelect = (date: Date) => {
    const iso = format(date, 'yyyy-MM-dd');
    onSelect(iso);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
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
          boxShadow: '0 18px 45px rgba(0, 0, 0, 0.55)',
          padding: 14,
          color: 'var(--text1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 10,
          }}
        >
          <span style={{ fontSize: 14, fontFamily: 'var(--font-mono)', color: 'var(--text2)' }}>
            {title}
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text3)',
              fontSize: 16,
              cursor: 'pointer',
            }}
          >
            {'\u2715'}
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 8,
          }}
        >
          <button
            onClick={() => setCurrentMonth((m) => startOfMonth(addMonths(m, -1)))}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '2px 6px',
              cursor: 'pointer',
              fontSize: 12,
              color: 'var(--text2)',
            }}
          >
            {'\u2039'}
          </button>
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              fontFamily: 'var(--font-mono)',
            }}
          >
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button
            onClick={() => setCurrentMonth((m) => startOfMonth(addMonths(m, 1)))}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '2px 6px',
              cursor: 'pointer',
              fontSize: 12,
              color: 'var(--text2)',
            }}
          >
            {'\u203A'}
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 4,
            marginBottom: 4,
          }}
        >
          {weekdayLabels.map((w) => (
            <div
              key={w}
              style={{
                textAlign: 'center',
                fontSize: 11,
                color: 'var(--text3)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {w}
            </div>
          ))}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 4,
          }}
        >
          {days.map((day) => {
            const isSelected = selected && isSameDay(day, selected);
            const isToday = isSameDay(day, today);
            const inMonth = isSameMonth(day, currentMonth);

            let bg = 'var(--surface)';
            let fg = inMonth ? 'var(--text1)' : 'var(--text3)';
            let border = 'var(--border)';

            if (isSelected) {
              bg = 'var(--accent)';
              fg = '#fff';
              border = 'var(--accent)';
            } else if (isToday) {
              bg = 'rgba(240, 109, 61, 0.15)';
              fg = 'var(--accent)';
              border = 'var(--accent-dim)';
            }

            return (
              <button
                key={day.toISOString()}
                onClick={() => handleSelect(day)}
                style={{
                  height: 30,
                  borderRadius: 999,
                  border: `1px solid ${border}`,
                  background: bg,
                  color: fg,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => {
            onSelect('');
            onClose();
          }}
          style={{
            marginTop: 10,
            width: '100%',
            padding: '6px 0',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            color: 'var(--text3)',
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          {'\u2715'} Clear due date
        </button>
      </div>
    </div>
  );
}

