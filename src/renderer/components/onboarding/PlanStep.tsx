import { Btn } from '../shared/Btn';

const freeFeatures = [
  'Up to 10 active tasks',
  '1 integration',
  'Timeboxing',
  'Desktop widget',
];

const proFeatures = [
  'Unlimited tasks',
  'Unlimited integrations',
  'Energy-aware scheduling',
  'Pomodoro timer',
  'Day summary export',
  'Priority support',
];

interface PlanStepProps {
  onChooseFree: () => void;
  onChooseTrial: () => void;
}

export function PlanStep({ onChooseFree, onChooseTrial }: PlanStepProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 20,
          fontWeight: 700,
          color: 'var(--text1)',
          marginBottom: 4,
        }}>
          Choose your plan
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text3)' }}>
          Start free or try everything with a 14-day Pro trial.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        {/* Free plan */}
        <div style={{
          flex: 1,
          padding: 14,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
        }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text1)', marginBottom: 2 }}>
            Free
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text1)', marginBottom: 10 }}>
            $0<span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text3)' }}>/forever</span>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
            {freeFeatures.map((f) => (
              <li key={f} style={{ fontSize: 11, color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ color: 'var(--green)' }}>{'\u2713'}</span> {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Pro plan */}
        <div style={{
          flex: 1,
          padding: 14,
          background: 'color-mix(in srgb, var(--accent) 5%, var(--surface))',
          border: '2px solid var(--accent)',
          borderRadius: 'var(--radius-md)',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute', top: -9, right: 10,
            padding: '2px 8px',
            background: 'var(--accent)',
            color: '#fff',
            borderRadius: 'var(--radius-sm)',
            fontSize: 9,
            fontWeight: 700,
          }}>
            RECOMMENDED
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text1)', marginBottom: 2 }}>
            Pro
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent)', marginBottom: 10 }}>
            $7.99<span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text3)' }}>/month</span>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
            {proFeatures.map((f) => (
              <li key={f} style={{ fontSize: 11, color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ color: 'var(--accent)' }}>{'\u2713'}</span> {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
        <Btn onClick={onChooseTrial} style={{ width: '100%' }}>
          Start 14-Day Free Trial
        </Btn>
        <button
          onClick={onChooseFree}
          style={{
            width: '100%',
            padding: '8px 16px',
            background: 'none',
            border: 'none',
            color: 'var(--text3)',
            fontSize: 13,
            cursor: 'pointer',
            fontFamily: 'var(--font-mono)',
          }}
        >
          Continue with Free
        </button>
      </div>

      <p style={{
        fontSize: 11,
        color: 'var(--text3)',
        textAlign: 'center',
        lineHeight: 1.4,
      }}>
        No credit card required for the trial. You can upgrade anytime.
      </p>
    </div>
  );
}
