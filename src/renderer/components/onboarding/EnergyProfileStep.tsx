import { Btn } from '../shared/Btn';
import { useStore } from '../../store';
import { EnergyEditor, ENERGY_LEVELS } from '../shared/EnergyEditor';

interface EnergyProfileStepProps {
  onComplete: () => void;
}

export function EnergyProfileStep({ onComplete }: EnergyProfileStepProps) {
  const energyProfile = useStore((s) => s.energyProfile);
  const setEnergyProfile = useStore((s) => s.setEnergyProfile);
  const addToast = useStore((s) => s.addToast);

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
          When do you do your best work? Pick a template or customize your own blocks.
        </p>
      </div>

      {/* Energy level legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {ENERGY_LEVELS.map((l) => (
          <div key={l.value} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <span style={{ color: l.color }}>{l.icon}</span>
            <span style={{ color: 'var(--text2)', fontWeight: 500 }}>{l.label}:</span>
            <span style={{ color: 'var(--text3)' }}>
              {l.value === 'high' && 'Deep work, complex problem solving, creative tasks'}
              {l.value === 'medium' && 'Meetings, reviews, emails, collaborative work'}
              {l.value === 'low' && 'Admin, easy tasks, reading, planning'}
            </span>
          </div>
        ))}
      </div>

      <EnergyEditor
        energyProfile={energyProfile}
        setEnergyProfile={setEnergyProfile}
        compact
        onToast={(message, type) => addToast(message, type)}
      />

      <Btn onClick={onComplete} style={{ width: '100%' }}>
        Looks good
      </Btn>
    </div>
  );
}
