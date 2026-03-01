import { useState, useEffect, useCallback } from 'react';
import { useSubscription } from '../hooks/useSubscription';
import { Btn } from './shared/Btn';

const features = [
  { name: 'Local tasks', free: true, pro: true },
  { name: 'Timeboxing', free: false, pro: true },
  { name: 'Up to 10 active tasks', free: true, pro: false },
  { name: 'Unlimited tasks', free: false, pro: true },
  { name: '1 integration', free: true, pro: false },
  { name: 'Unlimited integrations', free: false, pro: true },
  { name: 'Energy-aware scheduling', free: false, pro: true },
  { name: 'Pomodoro timer', free: false, pro: true },
  { name: 'Day summary export', free: false, pro: true },
];

interface LicenseConfig {
  checkoutBaseUrl: string;
}

export function PricingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('yearly');
  const [config, setConfig] = useState<LicenseConfig | null>(null);
  const [licenseKey, setLicenseKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { isPro, isTrialActive, daysRemaining, setSubscription } = useSubscription();

  // Listen for global open event
  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener('zaptask:showPricing', handler);
    return () => window.removeEventListener('zaptask:showPricing', handler);
  }, []);

  // Load license config when modal opens
  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        const cfg = await window.zaptask.license.getConfig();
        setConfig(cfg);
      } catch {
        // Config not available — key input still works
      }
    })();
  }, [isOpen]);

  const openCheckout = useCallback((trial: boolean) => {
    if (config?.checkoutBaseUrl) {
      const url = `${config.checkoutBaseUrl}?plan=${billing}${trial ? '&trial=true' : ''}`;
      window.zaptask.openUrl(url);
      setShowKeyInput(true);
    } else {
      setError('Checkout not configured. Enter a license key to activate.');
      setShowKeyInput(true);
    }
  }, [billing, config]);

  const handleSubscribe = useCallback(() => openCheckout(false), [openCheckout]);
  const handleStartTrial = useCallback(() => openCheckout(true), [openCheckout]);

  const handleActivateKey = useCallback(async () => {
    const key = licenseKey.trim();
    if (!key) {
      setError('Please enter a license key.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await window.zaptask.license.validate(key);

      if (result.valid) {
        setSubscription({
          tier: 'pro',
          status: 'active',
          licenseKey: key,
          currentPeriodEnd: result.expiresAt ?? null,
          lastValidatedAt: new Date().toISOString(),
        });
        setSuccess(true);
        setTimeout(() => {
          setIsOpen(false);
          setSuccess(false);
          setLicenseKey('');
          setShowKeyInput(false);
        }, 1500);
      } else {
        setError(result.error || 'Invalid license key. Please check and try again.');
      }
    } catch {
      setError('Could not validate key. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [licenseKey, setSubscription]);

  const handleClose = () => {
    setIsOpen(false);
    setError(null);
    setSuccess(false);
    setLicenseKey('');
    setShowKeyInput(false);
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={handleClose}
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

        {/* Success */}
        {success && (
          <div style={{
            padding: '8px 12px', marginBottom: 12,
            background: 'color-mix(in srgb, var(--green) 10%, transparent)',
            border: '1px solid var(--green)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 12, color: 'var(--green)',
            textAlign: 'center',
          }}>
            {'\u2713'} Pro activated! Enjoy ZapTask Pro.
          </div>
        )}

        {/* License key input */}
        {showKeyInput && !success && (
          <div style={{
            padding: '14px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 12,
          }}>
            <div style={{
              fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text2)',
              marginBottom: 8,
            }}>
              Paste your license key after completing checkout:
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                placeholder="ZT-XXXX-XXXX-XXXX-XXXX"
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text1)',
                  fontSize: 13,
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: 1,
                }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleActivateKey(); }}
              />
              <Btn onClick={handleActivateKey} disabled={loading || !licenseKey.trim()} size="sm">
                {loading ? 'Validating...' : 'Activate'}
              </Btn>
            </div>
          </div>
        )}

        {/* CTA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {!isPro && !success && (
            <>
              <Btn onClick={handleStartTrial} style={{ width: '100%' }}>
                Start 14-Day Free Trial
              </Btn>
              <Btn variant="secondary" onClick={handleSubscribe} style={{ width: '100%' }}>
                Subscribe Now
              </Btn>
            </>
          )}
          <Btn variant="secondary" onClick={handleClose} style={{ width: '100%' }}>
            Maybe Later
          </Btn>
        </div>

        {/* Have a key link */}
        {!showKeyInput && !isPro && (
          <button
            onClick={() => setShowKeyInput(true)}
            style={{
              display: 'block',
              width: '100%',
              marginTop: 12,
              padding: 0,
              background: 'none',
              border: 'none',
              color: 'var(--text3)',
              fontSize: 12,
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            I have a license key
          </button>
        )}

        {!isPro && !success && (
          <p style={{
            fontSize: 11,
            color: 'var(--text3)',
            textAlign: 'center',
            marginTop: 12,
            lineHeight: 1.4,
          }}>
            Your card won't be charged during the 14-day trial. Cancel anytime.
          </p>
        )}
      </div>
    </div>
  );
}
