import React from 'react';

interface State {
  hasError: boolean;
  error: any;
}

class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { hasError: false, error: null };

  componentDidCatch(error: any, info: any) {
    console.error('❌ ErrorBoundary caught an error:', error, info);
    this.setState({ hasError: true, error });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, color: 'red', fontFamily: 'sans-serif' }}>
          <h2>🚨 Something went wrong.</h2>
          <pre>{String(this.state.error?.message || this.state.error || 'Unknown Error')}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
