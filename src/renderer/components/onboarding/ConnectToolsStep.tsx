import { useState, useEffect, useCallback } from 'react';
import { Btn } from '../shared/Btn';
import { useStore } from '../../store';
import { TOOL_META, TOOL_ORDER } from '../shared/tool-meta';

interface ConnectToolsStepProps {
  onContinue: () => void;
}

export function ConnectToolsStep({ onContinue }: ConnectToolsStepProps) {
  const toolStates = useStore((s) => s.tools);
  const setToolConnected = useStore((s) => s.setToolConnected);
  const addToast = useStore((s) => s.addToast);
  const [connecting, setConnecting] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = window.zaptask.onOAuthCallback((data) => {
      if (data.success && data.toolId) {
        setToolConnected(data.toolId, true, '');
        addToast(`${TOOL_META[data.toolId]?.name || data.toolId} connected!`, 'success');
        window.zaptask.syncNow(data.toolId).catch(() => {});
      } else if (data.error) {
        addToast(`Connection failed: ${data.error}`, 'error');
      }
      setConnecting(null);
    });
    return unsubscribe;
  }, [setToolConnected, addToast]);

  const handleConnect = useCallback(async (toolId: string) => {
    setConnecting(toolId);
    try {
      const result = await window.zaptask.startOAuth({ toolId });
      if (!result?.success) {
        addToast(`Failed to start connection: ${result?.error || 'Unknown error'}`, 'error');
        setConnecting(null);
      }
    } catch (err: any) {
      addToast(`Failed to connect: ${err?.message || 'Unknown error'}`, 'error');
      setConnecting(null);
    }
  }, [addToast]);

  const handleDisconnect = useCallback(async (toolId: string) => {
    setToolConnected(toolId, false);
    await window.zaptask.clearCredentials(toolId);
  }, [setToolConnected]);

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
          Pull tasks from the tools you already use. You can skip this and connect later in Settings.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {TOOL_ORDER.map((toolId) => {
          const meta = TOOL_META[toolId];
          if (!meta) return null;
          const state = toolStates.find((t) => t.toolId === toolId);
          const connected = state?.connected ?? false;
          const isAppleCal = toolId === 'apple_cal';
          const isConnecting = connecting === toolId;

          return (
            <div
              key={toolId}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                background: 'var(--surface)',
                border: `1px solid ${connected ? 'var(--green)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-md)',
                opacity: isAppleCal ? 0.5 : 1,
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
                    background: connected ? 'var(--green)' : meta.color,
                  }} />
                  <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text1)' }}>
                    {meta.name}
                  </span>
                </div>
                <span style={{ fontSize: 11, color: 'var(--text3)' }}>
                  {isAppleCal ? 'Coming soon' : connected ? 'Connected' : meta.description}
                </span>
              </div>

              {isAppleCal ? (
                <span style={{ fontSize: 11, color: 'var(--text3)', fontStyle: 'italic' }}>
                  Soon
                </span>
              ) : connected ? (
                <Btn variant="ghost" size="sm" onClick={() => handleDisconnect(toolId)}>
                  Disconnect
                </Btn>
              ) : (
                <Btn
                  variant="secondary"
                  size="sm"
                  onClick={() => handleConnect(toolId)}
                  disabled={isConnecting}
                >
                  {isConnecting ? 'Connecting...' : 'Connect'}
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
