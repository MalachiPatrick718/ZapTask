import { Btn } from './Btn';
import { DEFAULT_ENERGY_PROFILE } from '../../../shared/types';
import type { EnergyLevel, EnergyProfile } from '../../../shared/types';

export const ENERGY_LEVELS: { value: EnergyLevel; icon: string; label: string; color: string }[] = [
  { value: 'high', icon: '\u26A1', label: 'High', color: 'var(--energy-high)' },
  { value: 'medium', icon: '\uD83D\uDD0B', label: 'Medium', color: 'var(--energy-med)' },
  { value: 'low', icon: '\uD83C\uDF19', label: 'Low', color: 'var(--energy-low)' },
];

export const ENERGY_TEMPLATES: { label: string; profile: EnergyProfile }[] = [
  {
    label: 'Morning Person',
    profile: {
      blocks: [
        { id: 'morning', label: 'Morning', start: 6, end: 12, level: 'high' },
        { id: 'early_afternoon', label: 'Early Afternoon', start: 12, end: 15, level: 'medium' },
        { id: 'late_afternoon', label: 'Late Afternoon', start: 15, end: 18, level: 'low' },
        { id: 'evening', label: 'Evening', start: 18, end: 22, level: 'low' },
      ],
    },
  },
  {
    label: 'Night Owl',
    profile: {
      blocks: [
        { id: 'morning', label: 'Morning', start: 6, end: 12, level: 'low' },
        { id: 'early_afternoon', label: 'Early Afternoon', start: 12, end: 15, level: 'medium' },
        { id: 'late_afternoon', label: 'Late Afternoon', start: 15, end: 18, level: 'high' },
        { id: 'evening', label: 'Evening', start: 18, end: 22, level: 'high' },
      ],
    },
  },
  {
    label: 'Steady',
    profile: {
      blocks: [
        { id: 'morning', label: 'Morning', start: 6, end: 12, level: 'medium' },
        { id: 'afternoon', label: 'Afternoon', start: 12, end: 18, level: 'medium' },
        { id: 'evening', label: 'Evening', start: 18, end: 22, level: 'low' },
      ],
    },
  },
];

const HOURS = Array.from({ length: 19 }, (_, i) => i + 5);

function formatHour(h: number): string {
  if (h === 0 || h === 24) return '12am';
  if (h === 12) return '12pm';
  return h < 12 ? `${h}am` : `${h - 12}pm`;
}

interface EnergyEditorProps {
  energyProfile: EnergyProfile;
  setEnergyProfile: (profile: EnergyProfile) => void;
  compact?: boolean;
  onToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

export function EnergyEditor({
  energyProfile,
  setEnergyProfile,
  compact = false,
  onToast,
}: EnergyEditorProps) {

  const cycleLevel = (blockId: string) => {
    const order: EnergyLevel[] = ['high', 'medium', 'low'];
    const newBlocks = energyProfile.blocks.map((b) => {
      if (b.id !== blockId) return b;
      const idx = order.indexOf(b.level);
      return { ...b, level: order[(idx + 1) % order.length] };
    });
    setEnergyProfile({ blocks: newBlocks });
  };

  const updateBlockTime = (blockId: string, field: 'start' | 'end', value: number) => {
    const newBlocks = energyProfile.blocks.map((b) => {
      if (b.id !== blockId) return b;
      return { ...b, [field]: value };
    });
    newBlocks.sort((a, b) => a.start - b.start);
    setEnergyProfile({ blocks: newBlocks });
  };

  const addBlock = () => {
    const lastBlock = energyProfile.blocks[energyProfile.blocks.length - 1];
    const newStart = lastBlock ? lastBlock.end : 6;
    if (newStart >= 23) {
      onToast?.('No more room to add a block', 'error');
      return;
    }
    const newBlock = {
      id: crypto.randomUUID(),
      label: 'New Block',
      start: newStart,
      end: Math.min(newStart + 2, 23),
      level: 'medium' as EnergyLevel,
    };
    setEnergyProfile({ blocks: [...energyProfile.blocks, newBlock] });
  };

  const removeBlock = (blockId: string) => {
    if (energyProfile.blocks.length <= 1) {
      onToast?.('Need at least one energy block', 'error');
      return;
    }
    setEnergyProfile({ blocks: energyProfile.blocks.filter((b) => b.id !== blockId) });
  };

  const updateLabel = (blockId: string, label: string) => {
    setEnergyProfile({
      blocks: energyProfile.blocks.map((b) => b.id === blockId ? { ...b, label } : b),
    });
  };

  const selectStyle = {
    padding: compact ? '4px 6px' : '6px 8px',
    background: 'var(--surface-high)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text1)',
    fontSize: compact ? 12 : 13,
    fontFamily: 'var(--font-mono)',
  };

  const previewStart = 5;
  const previewEnd = 23;
  const previewRange = previewEnd - previewStart;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 12 : 16, maxWidth: compact ? undefined : 560 }}>
      {/* Templates */}
      <div>
        <div style={{ fontSize: compact ? 11 : 12, fontFamily: 'var(--font-mono)', color: 'var(--text3)', marginBottom: 6 }}>
          Templates
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {ENERGY_TEMPLATES.map((t) => (
            <Btn
              key={t.label}
              variant="secondary"
              size="sm"
              onClick={() => {
                setEnergyProfile(t.profile);
                onToast?.(`Applied "${t.label}" template`, 'success');
              }}
              style={{ flex: 1, fontSize: compact ? 11 : undefined }}
            >
              {t.label}
            </Btn>
          ))}
        </div>
      </div>

      {/* Visual preview bar */}
      <div>
        <div style={{ fontSize: compact ? 11 : 12, fontFamily: 'var(--font-mono)', color: 'var(--text3)', marginBottom: 4 }}>
          Preview
        </div>
        <div style={{
          display: 'flex', height: compact ? 20 : 24, borderRadius: 'var(--radius-sm)', overflow: 'hidden',
          border: '1px solid var(--border)',
        }}>
          {energyProfile.blocks
            .filter((b) => b.end > previewStart && b.start < previewEnd)
            .sort((a, b) => a.start - b.start)
            .map((block) => {
              const clampedStart = Math.max(block.start, previewStart);
              const clampedEnd = Math.min(block.end, previewEnd);
              const widthPercent = ((clampedEnd - clampedStart) / previewRange) * 100;
              const levelInfo = ENERGY_LEVELS.find((l) => l.value === block.level)!;
              return (
                <div
                  key={block.id}
                  title={`${block.label}: ${formatHour(block.start)}\u2013${formatHour(block.end)} (${levelInfo.label})`}
                  style={{
                    width: `${widthPercent}%`,
                    background: `color-mix(in srgb, ${levelInfo.color} 40%, var(--surface))`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: compact ? 9 : 10, color: levelInfo.color, fontWeight: 600,
                  }}
                >
                  {widthPercent > 8 ? levelInfo.icon : ''}
                </div>
              );
            })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: compact ? 9 : 10, fontFamily: 'var(--font-mono)', color: 'var(--text3)', marginTop: 2 }}>
          <span>{formatHour(previewStart)}</span>
          <span>{formatHour(12)}</span>
          <span>{formatHour(previewEnd)}</span>
        </div>
      </div>

      {/* Blocks */}
      {energyProfile.blocks
        .slice()
        .sort((a, b) => a.start - b.start)
        .map((block) => {
          const levelInfo = ENERGY_LEVELS.find((l) => l.value === block.level)!;
          return (
            <div
              key={block.id}
              style={{
                display: 'flex', alignItems: 'center', gap: compact ? 8 : 10,
                padding: compact ? '10px 12px' : '12px 14px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <input
                  type="text"
                  value={block.label}
                  onChange={(e) => updateLabel(block.id, e.target.value)}
                  style={{
                    background: 'transparent', border: 'none', color: 'var(--text1)',
                    fontSize: compact ? 13 : 14, fontWeight: 500, width: '100%', outline: 'none',
                    padding: 0, marginBottom: 4,
                  }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <select
                    value={block.start}
                    onChange={(e) => updateBlockTime(block.id, 'start', Number(e.target.value))}
                    style={selectStyle}
                  >
                    {HOURS.map((h) => (
                      <option key={h} value={h}>{formatHour(h)}</option>
                    ))}
                  </select>
                  <span style={{ color: 'var(--text3)', fontSize: 12 }}>{'\u2013'}</span>
                  <select
                    value={block.end}
                    onChange={(e) => updateBlockTime(block.id, 'end', Number(e.target.value))}
                    style={selectStyle}
                  >
                    {HOURS.map((h) => (
                      <option key={h} value={h}>{formatHour(h)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={() => cycleLevel(block.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: compact ? '4px 8px' : '6px 10px', borderRadius: 'var(--radius-sm)',
                  background: `color-mix(in srgb, ${levelInfo.color} 15%, transparent)`,
                  color: levelInfo.color, fontSize: compact ? 12 : 13, fontWeight: 500,
                  border: 'none', cursor: 'pointer',
                }}
              >
                {levelInfo.icon} {levelInfo.label}
              </button>

              <button
                onClick={() => removeBlock(block.id)}
                style={{
                  background: 'none', border: 'none',
                  color: 'var(--text3)', fontSize: 14,
                  cursor: 'pointer', padding: '2px 4px',
                  flexShrink: 0,
                }}
                title="Remove block"
              >
                {'\u2715'}
              </button>
            </div>
          );
        })}

      {/* Add block + Reset */}
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <Btn variant="secondary" size="sm" onClick={addBlock}>
          + Add Block
        </Btn>
        <Btn
          variant="ghost"
          size="sm"
          onClick={() => {
            setEnergyProfile(DEFAULT_ENERGY_PROFILE);
            onToast?.('Energy profile reset to defaults', 'info');
          }}
        >
          Reset
        </Btn>
      </div>
    </div>
  );
}
