import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Btn } from './Btn';
import type { EnergyLevel, Task } from '../../../shared/types';

interface EnergySetModalProps {
  tasks: Task[];
  onSetEnergy: (taskId: string, energy: EnergyLevel) => void;
  onClose: () => void;
}

const energyOptions: { value: EnergyLevel; icon: string; label: string; color: string }[] = [
  { value: 'high', icon: '\uD83C\uDFAF', label: 'Deep', color: 'var(--energy-high)' },
  { value: 'medium', icon: '\u2699\uFE0F', label: 'Med', color: 'var(--energy-med)' },
  { value: 'low', icon: '\u2615', label: 'Low', color: 'var(--energy-low)' },
];

export function EnergySetModal({ tasks, onSetEnergy, onClose }: EnergySetModalProps) {
  const [index, setIndex] = useState(0);
  const [selections, setSelections] = useState<Record<string, EnergyLevel>>({});

  const total = tasks.length;
  if (total === 0) return null;

  const current = tasks[index];
  const selected = selections[current.id] ?? null;
  const setCount = Object.keys(selections).length;
  const isLast = index === total - 1;

  const handlePick = (energy: EnergyLevel) => {
    setSelections((prev) => ({ ...prev, [current.id]: energy }));
    onSetEnergy(current.id, energy);
  };

  const handlePrev = () => setIndex((i) => Math.max(0, i - 1));
  const handleNext = () => setIndex((i) => Math.min(total - 1, i + 1));

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
          width: 340,
          background: 'var(--surface-high)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-glow)',
          boxShadow: '0 18px 45px rgba(0,0,0,0.55)',
          padding: 20,
          color: 'var(--text1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Set Focus Levels</span>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: 16, cursor: 'pointer' }}
          >
            {'\u2715'}
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ display: 'flex', gap: 3, marginBottom: 16 }}>
          {tasks.map((t, i) => (
            <div
              key={t.id}
              style={{
                flex: 1, height: 3,
                borderRadius: 2,
                background: selections[t.id]
                  ? 'var(--accent)'
                  : i === index
                    ? 'var(--text3)'
                    : 'var(--border)',
                transition: 'background 200ms ease',
              }}
            />
          ))}
        </div>

        {/* Counter */}
        <div style={{
          fontSize: 11, fontFamily: 'var(--font-mono)',
          color: 'var(--text3)', marginBottom: 12,
          display: 'flex', justifyContent: 'space-between',
        }}>
          <span>{index + 1} of {total}</span>
          <span>{setCount} set</span>
        </div>

        {/* Task info */}
        <div style={{
          padding: '12px 14px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          marginBottom: 16,
        }}>
          <div style={{
            fontSize: 14, fontWeight: 600, color: 'var(--text1)',
            marginBottom: current.description ? 6 : 0,
            overflow: 'hidden', textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}>
            {current.title}
          </div>
          {current.description && (
            <div style={{
              fontSize: 12, color: 'var(--text2)', lineHeight: 1.4,
              overflow: 'hidden', textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}>
              {current.description}
            </div>
          )}
        </div>

        {/* Energy level question */}
        <div style={{
          fontSize: 12, color: 'var(--text2)', fontFamily: 'var(--font-mono)',
          marginBottom: 10,
        }}>
          How much focus does this need?
        </div>

        {/* Energy buttons */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {energyOptions.map((e) => {
            const isSelected = selected === e.value;
            return (
              <button
                key={e.value}
                onClick={() => handlePick(e.value)}
                style={{
                  flex: 1,
                  padding: '12px 0',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  background: isSelected
                    ? `color-mix(in srgb, ${e.color} 15%, transparent)`
                    : 'var(--surface)',
                  color: isSelected ? e.color : 'var(--text3)',
                  border: `1.5px solid ${isSelected ? e.color : 'var(--border)'}`,
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                }}
              >
                <span style={{ fontSize: 18 }}>{e.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                  {e.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={handlePrev}
            disabled={index === 0}
            style={{
              background: 'none', border: 'none',
              color: index === 0 ? 'var(--border)' : 'var(--text2)',
              fontSize: 13, fontFamily: 'var(--font-mono)',
              cursor: index === 0 ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            {'\u2190'} Prev
          </button>

          {isLast ? (
            <Btn size="sm" onClick={onClose}>
              {selected ? 'Done' : 'Close'}
            </Btn>
          ) : selected ? (
            <Btn size="sm" onClick={handleNext}>
              Next {'\u2192'}
            </Btn>
          ) : (
            <button
              onClick={handleNext}
              style={{
                background: 'none', border: 'none',
                color: 'var(--text3)',
                fontSize: 13, fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              Skip {'\u2192'}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
