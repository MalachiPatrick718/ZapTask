import { Btn } from '../shared/Btn';
import { useStore } from '../../store';
import { DEFAULT_ENERGY_PROFILE } from '../../../shared/types';
import type { EnergyLevel } from '../../../shared/types';

interface EnergyProfileStepProps {
  onComplete: () => void;
}

const levels: { value: EnergyLevel; icon: string; label: string; desc: string; color: string }[] = [
  { value: 'high', icon: '\u26A1', label: 'High', desc: 'Deep work, complex problem solving, creative tasks', color: 'var(--energy-high)' },
  { value: 'medium', icon: '\uD83D\uDD0B', label: 'Medium', desc: 'Meetings, reviews, emails, collaborative work', color: 'var(--energy-med)' },
  { value: 'low', icon: '\uD83C\uDF19', label: 'Low', desc: 'Admin, easy tasks, reading, planning', color: 'var(--energy-low)' },
];

export function EnergyProfileStep({ onComplete }: EnergyProfileStepProps) {
  const energyProfile = useStore((s) => s.energyProfile);
  const setEnergyProfile = useStore((s) => s.setEnergyProfile);

  // Fallback to defaults if persisted store has stale/missing blocks
  const blocks = energyProfile?.blocks ?? DEFAULT_ENERGY_PROFILE.blocks;

  const cycleLevel = (blockId: string) => {
    const order: EnergyLevel[] = ['high', 'medium', 'low'];
    const newBlocks = blocks.map((b) => {
      if (b.id !== blockId) return b;
      const idx = order.indexOf(b.level);
      const next = order[(idx + 1) % order.length];
      return { ...b, level: next };
    });
    setEnergyProfile({ blocks: newBlocks });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 22,
          fontWeight: 700,
          color: 'var(--text1)',
          marginBottom: 8,
        }}>
          Your energy profile
        </h2>
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>
          When do you do your best work? Tap each block to change its energy level.
        </p>
      </div>

      {/* Energy level legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {levels.map((l) => (
          <div key={l.value} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <span style={{ color: l.color }}>{l.icon}</span>
            <span style={{ color: 'var(--text2)', fontWeight: 500 }}>{l.label}:</span>
            <span style={{ color: 'var(--text3)' }}>{l.desc}</span>
          </div>
        ))}
      </div>

      {/* Time blocks */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {blocks.map((block) => {
          const levelInfo = levels.find((l) => l.value === block.level)!;
          const startLabel = block.start <= 12 ? `${block.start}am` : `${block.start - 12}pm`;
          const endLabel = block.end <= 12 ? `${block.end}pm` : `${block.end - 12}pm`;
          // Fix for noon/midnight edge cases
          const startStr = block.start === 0 ? '12am' : block.start === 12 ? '12pm' : startLabel;
          const endStr = block.end === 0 ? '12am' : block.end === 12 ? '12pm' : endLabel;

          return (
            <button
              key={block.id}
              onClick={() => cycleLevel(block.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 14px',
                background: 'var(--surface)',
                border: `1px solid var(--border)`,
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
            >
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text1)', marginBottom: 2 }}>
                  {block.label}
                </div>
                <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text3)' }}>
                  {startStr} {'\u2013'} {endStr}
                </div>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                background: `color-mix(in srgb, ${levelInfo.color} 15%, transparent)`,
                color: levelInfo.color,
                fontSize: 13,
                fontWeight: 500,
              }}>
                <span>{levelInfo.icon}</span>
                <span>{levelInfo.label}</span>
              </div>
            </button>
          );
        })}
      </div>

      <Btn onClick={onComplete} style={{ width: '100%' }}>
        Looks good
      </Btn>
    </div>
  );
}
