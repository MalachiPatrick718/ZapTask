import { useState } from 'react';
import { Btn } from '../shared/Btn';

interface AccountStepProps {
  onContinue: (name: string, email: string) => void;
}

export function AccountStep({ onContinue }: AccountStepProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const valid = name.trim().length > 0 && email.includes('@');

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
          Let's get started
        </h2>
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>
          Tell us a bit about yourself.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{
            display: 'block', marginBottom: 6,
            fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text2)',
          }}>
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            autoFocus
            style={{
              width: '100%',
              padding: '10px 12px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text1)',
              fontSize: 14,
            }}
          />
        </div>

        <div>
          <label style={{
            display: 'block', marginBottom: 6,
            fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text2)',
          }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={{
              width: '100%',
              padding: '10px 12px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text1)',
              fontSize: 14,
            }}
          />
          <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
            Used to categorize work vs personal tasks.
          </p>
        </div>
      </div>

      <Btn
        disabled={!valid}
        onClick={() => onContinue(name.trim(), email.trim())}
        style={{ width: '100%' }}
      >
        Continue
      </Btn>
    </div>
  );
}
