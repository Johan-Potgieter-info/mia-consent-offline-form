import React from 'react';

interface State {
  hasError: boolean;
  error: any;
  info: any;
}

class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { hasError: false, error: null, info: null };

  componentDidCatch(error: any, info: any) {
    console.error('❌ ErrorBoundary caught an error:', error, info);
    this.setState({ hasError: true, error, info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, fontFamily: 'monospace', backgroundColor: '#fff0f0', color: '#990000' }}>
          <h2>🚨 Something went wrong.</h2>
          <p><strong>Message:</strong> {this.state.error?.message || String(this.state.error)}</p>
          <p><strong>Stack:</strong></p>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.error?.stack || '(no stack trace)'}</pre>
          <p><strong>Component Stack:</strong></p>
          <pre>{this.state.info?.componentStack}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
