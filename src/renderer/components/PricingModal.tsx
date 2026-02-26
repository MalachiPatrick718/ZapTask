import { useState, useEffect, useRef, useCallback } from 'react';
import { useSubscription } from '../hooks/useSubscription';
import { Btn } from './shared/Btn';

declare global {
  interface Window {
    Paddle?: any;
  }
}

const features = [
  { name: 'Local tasks', free: true, pro: true },
  { name: 'Energy-aware scheduling', free: true, pro: true },
  { name: 'Day planner timeline', free: true, pro: true },
  { name: 'Up to 10 active tasks', free: true, pro: false },
  { name: 'Unlimited tasks', free: false, pro: true },
  { name: '1 integration', free: true, pro: false },
  { name: 'All 6 integrations', free: false, pro: true },
  { name: 'Pomodoro timer', free: false, pro: true },
  { name: 'Day summary export', free: false, pro: true },
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

export function PricingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('yearly');
  const [paddleConfig, setPaddleConfig] = useState<PaddleConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const paddleInitialized = useRef(false);
  const { isPro, isTrialActive, daysRemaining, setSubscription } = useSubscription();

  // Listen for global open event
  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener('zaptask:showPricing', handler);
    return () => window.removeEventListener('zaptask:showPricing', handler);
  }, []);

  // Load Paddle config + script when modal opens
  useEffect(() => {
    if (!isOpen || paddleInitialized.current) return;
    let cancelled = false;

    (async () => {
      try {
        const config = await window.zaptask.paddle.getConfig();
        if (cancelled) return;
        setPaddleConfig(config);

        if (!config.clientToken) return; // No Paddle config — fallback to simulated

        await loadPaddleScript();
        if (cancelled || !window.Paddle) return;

        window.Paddle.Initialize({
          token: config.clientToken,
          eventCallback: (event: any) => {
            if (event.name === 'checkout.completed') {
              const data = event.data;
              setSubscription({
                tier: 'pro',
                status: 'active',
                paddleSubscriptionId: data?.subscription_id || data?.id || 'paddle_sub',
                paddleCustomerId: data?.customer?.id || null,
                currentPeriodEnd: data?.current_billing_period?.ends_at || null,
              });
              setIsOpen(false);
            }
          },
        });
        paddleInitialized.current = true;
      } catch (err) {
        if (!cancelled) {
          console.error('[Paddle] Init error:', err);
          setError('Could not load payment system');
        }
      }
    })();

    return () => { cancelled = true; };
  }, [isOpen, setSubscription]);

  const handleSubscribe = useCallback(() => {
    setError(null);

    // If Paddle is loaded and configured, open real checkout
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

    // Fallback: simulated upgrade (no Paddle keys configured)
    setSubscription({
      tier: 'pro',
      status: 'active',
      paddleSubscriptionId: 'sim_' + crypto.randomUUID().slice(0, 8),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
    setIsOpen(false);
  }, [billing, paddleConfig, setSubscription]);

  if (!isOpen) return null;

  return (
    <div
      onClick={() => setIsOpen(false)}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 520,
          maxHeight: '90vh',
          overflow: 'auto',
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700,
            color: 'var(--text1)', marginBottom: 4,
          }}>
            Upgrade to ZapTask Pro
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text3)' }}>
            {isTrialActive
              ? `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left in your trial`
              : 'Unlock unlimited tasks, all integrations, and more'}
          </p>
        </div>

        {/* Billing toggle */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 4,
          marginBottom: 20,
          padding: 3,
          background: 'var(--surface)',
          borderRadius: 'var(--radius-sm)',
          width: 'fit-content',
          margin: '0 auto 20px',
        }}>
          {(['monthly', 'yearly'] as const).map((b) => (
            <button
              key={b}
              onClick={() => setBilling(b)}
              style={{
                padding: '6px 16px',
                borderRadius: 'var(--radius-sm)',
                background: billing === b ? 'var(--accent)' : 'transparent',
                color: billing === b ? '#fff' : 'var(--text3)',
                border: 'none',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {b === 'monthly' ? 'Monthly' : 'Yearly (save 17%)'}
            </button>
          ))}
        </div>

        {/* Plan cards */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          {/* Free */}
          <div style={{
            flex: 1, padding: '16px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
          }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text1)', marginBottom: 4 }}>Free</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text1)', marginBottom: 12 }}>
              $0<span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text3)' }}>/forever</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {features.filter((f) => f.free).map((f) => (
                <li key={f.name} style={{ fontSize: 12, color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: 'var(--green)' }}>{'\u2713'}</span> {f.name}
                </li>
              ))}
            </ul>
          </div>

          {/* Pro */}
          <div style={{
            flex: 1, padding: '16px',
            background: 'color-mix(in srgb, var(--accent) 5%, var(--surface))',
            border: '2px solid var(--accent)',
            borderRadius: 'var(--radius-md)',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute', top: -10, right: 12,
              padding: '2px 10px',
              background: 'var(--accent)',
              color: '#fff',
              borderRadius: 'var(--radius-sm)',
              fontSize: 10,
              fontWeight: 700,
            }}>
              RECOMMENDED
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text1)', marginBottom: 4 }}>Pro</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent)', marginBottom: 12 }}>
              {billing === 'monthly' ? '$9.99' : '$7.99'}
              <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text3)' }}>/month</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {features.filter((f) => f.pro).map((f) => (
                <li key={f.name} style={{ fontSize: 12, color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: 'var(--accent)' }}>{'\u2713'}</span> {f.name}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: '8px 12px', marginBottom: 12,
            background: 'color-mix(in srgb, var(--red) 10%, transparent)',
            border: '1px solid var(--red)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 12, color: 'var(--red)',
          }}>
            {error}
          </div>
        )}

        {/* CTA */}
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn variant="secondary" onClick={() => setIsOpen(false)} style={{ flex: 1 }}>
            Maybe Later
          </Btn>
          {!isPro && (
            <Btn onClick={handleSubscribe} disabled={loading} style={{ flex: 2 }}>
              {loading ? 'Opening checkout...' : isTrialActive ? 'Subscribe Now' : 'Start Pro Subscription'}
            </Btn>
          )}
        </div>
      </div>
    </div>
  );
}
