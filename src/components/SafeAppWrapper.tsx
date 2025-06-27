
import React, { ErrorInfo } from 'react';
import ErrorBoundary from './ErrorBoundary';

interface SafeAppWrapperProps {
  children: React.ReactNode;
}

class SafeAppWrapper extends React.Component<SafeAppWrapperProps> {
  componentDidMount() {
    console.log('SafeAppWrapper: App mounted successfully');
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('SafeAppWrapper: Caught error in app', error, errorInfo);
  }

  render() {
    return (
      <ErrorBoundary>
        <div id="app-wrapper">
          {this.props.children}
        </div>
      </ErrorBoundary>
    );
  }
}

export default SafeAppWrapper;
