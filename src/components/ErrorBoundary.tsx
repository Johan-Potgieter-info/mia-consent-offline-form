
import React from 'react';

interface State {
  hasError: boolean;
  error: any;
  info: any;
}

class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { hasError: false, error: null, info: null };

  static getDerivedStateFromError(error: any) {
    console.error('ErrorBoundary: getDerivedStateFromError', error);
    return { hasError: true, error, info: null };
  }

  componentDidCatch(error: any, info: any) {
    console.error('❌ ErrorBoundary caught an error:', error, info);
    console.error('Error stack:', error?.stack);
    console.error('Component stack:', info?.componentStack);
    this.setState({ hasError: true, error, info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: 24, 
          fontFamily: 'monospace', 
          backgroundColor: '#fff0f0', 
          color: '#990000',
          minHeight: '100vh',
          overflow: 'auto'
        }}>
          <h2>🚨 Something went wrong.</h2>
          <p><strong>Message:</strong> {this.state.error?.message || String(this.state.error)}</p>
          
          <details style={{ marginTop: 16 }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Error Details</summary>
            <div style={{ marginTop: 8 }}>
              <p><strong>Stack:</strong></p>
              <pre style={{ 
                whiteSpace: 'pre-wrap', 
                backgroundColor: '#f5f5f5', 
                padding: 8, 
                fontSize: '12px',
                maxHeight: '200px',
                overflow: 'auto'
              }}>
                {this.state.error?.stack || '(no stack trace)'}
              </pre>
              
              {this.state.info?.componentStack && (
                <>
                  <p><strong>Component Stack:</strong></p>
                  <pre style={{ 
                    whiteSpace: 'pre-wrap', 
                    backgroundColor: '#f5f5f5', 
                    padding: 8, 
                    fontSize: '12px',
                    maxHeight: '200px',
                    overflow: 'auto'
                  }}>
                    {this.state.info.componentStack}
                  </pre>
                </>
              )}
            </div>
          </details>

          <div style={{ marginTop: 24 }}>
            <button 
              onClick={() => window.location.reload()} 
              style={{ 
                padding: '8px 16px', 
                backgroundColor: '#ef4805', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Reload Page
            </button>
            <button 
              onClick={() => {
                localStorage.clear();
                sessionStorage.clear();
                window.location.reload();
              }} 
              style={{ 
                padding: '8px 16px', 
                backgroundColor: '#dc3545', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer',
                marginLeft: '8px'
              }}
            >
              Clear Storage & Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
