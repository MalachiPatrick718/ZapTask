import { Btn } from '../shared/Btn';
import { useStore } from '../../store';

interface ConnectToolsStepProps {
  onContinue: () => void;
}

const tools = [
  { id: 'jira' as const, name: 'Jira', desc: 'Track issues and sprints', color: '#2684FF' },
  { id: 'gcal' as const, name: 'Google Calendar', desc: 'Events as tasks', color: '#4285F4' },
  { id: 'notion' as const, name: 'Notion', desc: 'Databases and pages', color: '#999' },
];

export function ConnectToolsStep({ onContinue }: ConnectToolsStepProps) {
  const toolStates = useStore((s) => s.tools);
  const setToolConnected = useStore((s) => s.setToolConnected);

  const handleConnect = (toolId: string) => {
    // Stubbed — simulates connection
    setToolConnected(toolId, true, 'user@example.com');
  };

  const handleDisconnect = (toolId: string) => {
    setToolConnected(toolId, false);
  };

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
          Connect your tools
        </h2>
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>
          Pull tasks from the tools you already use. You can skip this and connect later.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {tools.map((tool) => {
          const state = toolStates.find((t) => t.toolId === tool.id);
          const connected = state?.connected ?? false;

          return (
            <div
              key={tool.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                background: 'var(--surface)',
                border: `1px solid ${connected ? 'var(--green)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 2,
                }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: connected ? 'var(--green)' : tool.color,
                  }} />
                  <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text1)' }}>
                    {tool.name}
                  </span>
                </div>
                <span style={{ fontSize: 11, color: 'var(--text3)' }}>
                  {connected ? 'Connected' : tool.desc}
                </span>
              </div>

              {connected ? (
                <Btn variant="ghost" size="sm" onClick={() => handleDisconnect(tool.id)}>
                  Disconnect
                </Btn>
              ) : (
                <Btn variant="secondary" size="sm" onClick={() => handleConnect(tool.id)}>
                  Connect
                </Btn>
              )}
            </div>
          );
        })}
      </div>

      <Btn onClick={onContinue} style={{ width: '100%' }}>
        Continue
      </Btn>
    </div>
  );
}
