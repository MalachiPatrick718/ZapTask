import { useState, useEffect, useRef, useCallback } from 'react';
import { Btn } from '../shared/Btn';

declare global {
  interface Window {
    Paddle?: any;
  }
}

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

interface PaddleConfig {
  clientToken: string;
  priceIdMonthly: string;
  priceIdYearly: string;
}

function loadPaddleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Paddle) { resolve(); return; }
    const script = document.createElement('script');
    script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Paddle.js'));
    document.head.appendChild(script);
  });
}

function getTrialEndDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
}

interface PlanStepProps {
  onChooseFree: () => void;
  onChooseTrial: () => void;
}

export function PlanStep({ onChooseFree, onChooseTrial }: PlanStepProps) {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('yearly');
  const [paddleConfig, setPaddleConfig] = useState<PaddleConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const paddleInitialized = useRef(false);

  // Load Paddle config + script on mount
  useEffect(() => {
    if (paddleInitialized.current) return;
    let cancelled = false;

    (async () => {
      try {
        const config = await window.zaptask.paddle.getConfig();
        if (cancelled) return;
        setPaddleConfig(config);

        if (!config.clientToken) return;

        await loadPaddleScript();
        if (cancelled || !window.Paddle) return;

        window.Paddle.Initialize({
          token: config.clientToken,
          eventCallback: (event: any) => {
            if (event.name === 'checkout.completed') {
              // Paddle checkout succeeded — complete onboarding as trial
              onChooseTrial();
            }
          },
        });
        paddleInitialized.current = true;
      } catch (err) {
        if (!cancelled) {
          console.error('[Paddle] Init error:', err);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [onChooseTrial]);

  const handleStartTrial = useCallback(() => {
    setError(null);

    // If Paddle is loaded, open real checkout
    if (window.Paddle && paddleConfig?.clientToken) {
      setLoading(true);
      const priceId = billing === 'monthly'
        ? paddleConfig.priceIdMonthly
        : paddleConfig.priceIdYearly;

      try {
        window.Paddle.Checkout.open({
          items: [{ priceId, quantity: 1 }],
        });
      } catch (err) {
        console.error('[Paddle] Checkout error:', err);
        setError('Could not open checkout. Please try again.');
      }
      setLoading(false);
      return;
    }

    // Fallback: no Paddle keys configured — start trial without payment
    onChooseTrial();
  }, [billing, paddleConfig, onChooseTrial]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ textAlign: 'center', marginBottom: 4 }}>
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

      {/* Billing toggle */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 4,
        padding: 3,
        background: 'var(--surface)',
        borderRadius: 'var(--radius-sm)',
        width: 'fit-content',
        margin: '0 auto',
      }}>
        {(['monthly', 'yearly'] as const).map((b) => (
          <button
            key={b}
            onClick={() => setBilling(b)}
            style={{
              padding: '5px 14px',
              borderRadius: 'var(--radius-sm)',
              background: billing === b ? 'var(--accent)' : 'transparent',
              color: billing === b ? '#fff' : 'var(--text3)',
              border: 'none',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {b === 'monthly' ? 'Monthly' : 'Yearly (save 17%)'}
          </button>
        ))}
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
            {billing === 'monthly' ? '$9.99' : '$7.99'}
            <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text3)' }}>/month</span>
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

      {/* Error */}
      {error && (
        <div style={{
          padding: '8px 12px',
          background: 'color-mix(in srgb, var(--red) 10%, transparent)',
          border: '1px solid var(--red)',
          borderRadius: 'var(--radius-sm)',
          fontSize: 12, color: 'var(--red)',
        }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
        <Btn onClick={handleStartTrial} disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Opening checkout...' : 'Start 14-Day Free Trial'}
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
        You won't be charged until {getTrialEndDate()}. Cancel anytime.
      </p>
    </div>
  );
}
