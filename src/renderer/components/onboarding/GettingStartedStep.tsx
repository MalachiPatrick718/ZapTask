import { Btn } from '../shared/Btn';

interface GettingStartedStepProps {
  onContinue: () => void;
}

const tips = [
  {
    icon: '\uD83D\uDD17',
    title: 'Connect your tools',
    description: 'Pull in tasks from Jira, Notion, Google Calendar, and more. Tap the gear icon in the top-right corner and head to the Integrations tab.',
  },
  {
    icon: '\uD83D\uDCC5',
    title: 'Schedule your day',
    description: 'Use the Schedule tab to time-block tasks into your day. ZapTask suggests times that match your energy levels for peak productivity.',
  },
  {
    icon: '\uD83C\uDFAF',
    title: 'Smart suggestions',
    description: 'Check the Suggested tab for task recommendations matched to your focus capacity. Deep work when you have energy, lighter tasks when you don\'t.',
  },
];

export function GettingStartedStep({ onContinue }: GettingStartedStepProps) {
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
          You're all set
        </h2>
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>
          Here's how to get the most out of ZapTask.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {tips.map((tip) => (
          <div
            key={tip.title}
            style={{
              display: 'flex',
              gap: 12,
              padding: '12px 14px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <span style={{ fontSize: 20, flexShrink: 0, lineHeight: 1.4 }}>
              {tip.icon}
            </span>
            <div>
              <div style={{
                fontSize: 14, fontWeight: 600, color: 'var(--text1)',
                marginBottom: 4,
              }}>
                {tip.title}
              </div>
              <div style={{
                fontSize: 12, color: 'var(--text2)', lineHeight: 1.5,
              }}>
                {tip.description}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Btn onClick={onContinue} style={{ width: '100%' }}>
        Got it, let's go
      </Btn>
    </div>
  );
}
