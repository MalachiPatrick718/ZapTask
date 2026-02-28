import { useState, useCallback, useEffect } from 'react';
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
  onActivateLicense: (key: string, expiresAt: string | null) => void;
}

export function PlanStep({ onChooseFree, onActivateLicense }: PlanStepProps) {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('yearly');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [licenseKey, setLicenseKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutBaseUrl, setCheckoutBaseUrl] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const cfg = await window.zaptask.license.getConfig();
        setCheckoutBaseUrl(cfg.checkoutBaseUrl);
      } catch { /* fallback to key input only */ }
    })();
  }, []);

  const handleStartTrial = useCallback(() => {
    if (checkoutBaseUrl) {
      const url = `${checkoutBaseUrl}?plan=${billing}&trial=true`;
      window.zaptask.openUrl(url);
      setShowKeyInput(true);
    } else {
      setError('Checkout not available. Enter a license key to activate.');
      setShowKeyInput(true);
    }
  }, [billing, checkoutBaseUrl]);

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
        onActivateLicense(key, result.expiresAt ?? null);
      } else {
        setError(result.error || 'Invalid license key.');
      }
    } catch {
      setError('Could not validate key. Check your connection.');
    } finally {
      setLoading(false);
    }
  }, [licenseKey, onActivateLicense]);

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

      {/* License key input */}
      {showKeyInput && (
        <div style={{
          padding: '12px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
        }}>
          <div style={{
            fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text2)',
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
                padding: '7px 10px',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text1)',
                fontSize: 12,
                fontFamily: 'var(--font-mono)',
                letterSpacing: 1,
              }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleActivateKey(); }}
            />
            <Btn onClick={handleActivateKey} disabled={loading || !licenseKey.trim()} size="sm">
              {loading ? '...' : 'Activate'}
            </Btn>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
        <Btn onClick={handleStartTrial} style={{ width: '100%' }}>
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

      {!showKeyInput && (
        <button
          onClick={() => setShowKeyInput(true)}
          style={{
            padding: 0,
            background: 'none',
            border: 'none',
            color: 'var(--text3)',
            fontSize: 11,
            fontFamily: 'var(--font-mono)',
            cursor: 'pointer',
            textAlign: 'center',
          }}
        >
          I have a license key
        </button>
      )}

      <p style={{
        fontSize: 11,
        color: 'var(--text3)',
        textAlign: 'center',
        lineHeight: 1.4,
      }}>
        Your card won't be charged during the 14-day trial. Cancel anytime.
      </p>
    </div>
  );
}
