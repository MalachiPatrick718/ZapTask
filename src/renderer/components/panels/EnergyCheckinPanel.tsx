import { useStore, getCurrentEnergy } from '../../store';
import type { EnergyLevel } from '../../../shared/types';

const levels: { value: EnergyLevel; icon: string; label: string; desc: string; color: string }[] = [
  { value: 'high', icon: '\u26A1', label: 'High', desc: 'Deep work, complex problem solving, creative tasks', color: 'var(--energy-high)' },
  { value: 'medium', icon: '\uD83D\uDD0B', label: 'Medium', desc: 'Meetings, reviews, emails, collaborative work', color: 'var(--energy-med)' },
  { value: 'low', icon: '\uD83C\uDF19', label: 'Low', desc: 'Admin, easy tasks, reading, planning', color: 'var(--energy-low)' },
];

export function EnergyCheckinPanel() {
  const energyProfile = useStore((s) => s.energyProfile);
  const override = useStore((s) => s.currentEnergyOverride);
  const setOverride = useStore((s) => s.setCurrentEnergyOverride);
  const setActivePanel = useStore((s) => s.setActivePanel);
  const addToast = useStore((s) => s.addToast);

  const current = getCurrentEnergy(energyProfile, override);

  const handleSelect = (level: EnergyLevel) => {
    setOverride(level);
    addToast(`Energy set to ${level}`, 'success');
    setActivePanel(null);
  };

  const handleReset = () => {
    setOverride(null);
    addToast('Energy reset to profile default', 'info');
    setActivePanel(null);
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
          Energy Check-in
        </h2>
        <button
          onClick={() => setActivePanel(null)}
          style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: 18, cursor: 'pointer' }}
        >
          {'\u2715'}
        </button>
      </div>

      <div style={{ flex: 1, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <h3 style={{ fontSize: 17, color: 'var(--text1)', marginBottom: 6 }}>
            How's your energy right now?
          </h3>
          <p style={{ fontSize: 14, color: 'var(--text2)' }}>
            This overrides your profile for the current time block.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {levels.map((level) => {
            const isActive = current === level.value;
            return (
              <button
                key={level.value}
                onClick={() => handleSelect(level.value)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '16px 14px',
                  background: isActive ? `color-mix(in srgb, ${level.color} 10%, var(--surface))` : 'var(--surface)',
                  border: `1px solid ${isActive ? level.color : 'var(--border)'}`,
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  textAlign: 'left' as const,
                  transition: 'all 150ms ease',
                }}
              >
                <span style={{ fontSize: 28 }}>{level.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 600, color: level.color, marginBottom: 3 }}>
                    {level.label}
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--text2)' }}>
                    {level.desc}
                  </div>
                </div>
                {isActive && (
                  <span style={{ color: level.color, fontSize: 18 }}>{'\u2713'}</span>
                )}
              </button>
            );
          })}
        </div>

        {override && (
          <button
            onClick={handleReset}
            style={{
              background: 'none', border: 'none',
              color: 'var(--text2)', fontSize: 14, cursor: 'pointer',
              textAlign: 'center' as const, padding: '8px',
            }}
          >
            Reset to profile default
          </button>
        )}
      </div>
    </div>
  );
}
