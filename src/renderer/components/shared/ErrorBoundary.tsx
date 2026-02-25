import { Component, type ReactNode } from 'react';
import { Btn } from './Btn';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleClearAndReload = () => {
    localStorage.clear();
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg)',
          padding: 24,
          gap: 16,
          borderRadius: 'var(--radius-lg)',
        }}>
          <span style={{ fontSize: 32 }}>{'\u26A0'}</span>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 18,
            fontWeight: 700,
            color: 'var(--text1)',
          }}>
            Something went wrong
          </h2>
          <p style={{
            fontSize: 12,
            color: 'var(--text3)',
            fontFamily: 'var(--font-mono)',
            textAlign: 'center',
            maxWidth: 300,
            wordBreak: 'break-word',
          }}>
            {this.state.error?.message}
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn variant="secondary" onClick={this.handleReset}>Try Again</Btn>
            <Btn variant="ghost" onClick={this.handleClearAndReload} style={{ color: 'var(--red)' }}>
              Reset App
            </Btn>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
