import { useState } from 'react';
import { useStore } from '../../store';
import { AccountStep } from './AccountStep';
import { EnergyProfileStep } from './EnergyProfileStep';
import { GettingStartedStep } from './GettingStartedStep';
import { PlanStep } from './PlanStep';

const TOTAL_STEPS = 4;

export function Onboarding() {
  const [step, setStep] = useState(1);
  const setUser = useStore((s) => s.setUser);
  const setOnboardingComplete = useStore((s) => s.setOnboardingComplete);
  const setSubscription = useStore((s) => s.setSubscription);

  const handleAccountContinue = (name: string, email: string) => {
    setUser({ name, email });
    setStep(2);
  };

  const handleEnergyComplete = () => {
    setStep(3);
  };

  const handleGettingStartedContinue = () => {
    setStep(4);
  };

  const handleChooseFree = () => {
    setSubscription({ tier: 'free', status: 'active' });
    setOnboardingComplete(true);
  };

  const handleActivateLicense = (key: string, expiresAt: string | null) => {
    setSubscription({
      tier: 'pro',
      status: 'active',
      licenseKey: key,
      currentPeriodEnd: expiresAt,
      lastValidatedAt: new Date().toISOString(),
    });
    setOnboardingComplete(true);
  };

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div
        className="drag-region"
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}
      >
        <span style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 16,
          color: 'var(--accent)',
        }}>
          ZapTask
        </span>
      </div>

      {/* Step indicator */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 8,
        padding: '16px 0 8px',
      }}>
        {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s) => (
          <div key={s} style={{
            width: s === step ? 24 : 8,
            height: 8,
            borderRadius: 4,
            background: s === step ? 'var(--accent)' : s < step ? 'var(--accent)' : 'var(--border)',
            transition: 'all 200ms ease',
          }} />
        ))}
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '16px 24px 24px',
      }}>
        {step === 1 && <AccountStep onContinue={handleAccountContinue} />}
        {step === 2 && <EnergyProfileStep onComplete={handleEnergyComplete} />}
        {step === 3 && <GettingStartedStep onContinue={handleGettingStartedContinue} />}
        {step === 4 && <PlanStep onChooseFree={handleChooseFree} onActivateLicense={handleActivateLicense} />}
      </div>
    </div>
  );
}
