import React from 'react';

interface Props {
  children: any;
  fallback?: any;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends (React as any).Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          padding: '40px',
          maxWidth: '600px',
          margin: '40px auto',
          background: '#fff',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#dc2626', marginBottom: '16px' }}>⚠️ Something went wrong</h2>
          <p style={{ color: '#666', marginBottom: '24px' }}>
            An error occurred while loading this page. Please try refreshing.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Refresh Page
          </button>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{ marginTop: '24px', textAlign: 'left' }}>
              <summary style={{ cursor: 'pointer', color: '#999' }}>Error details</summary>
              <pre style={{ 
                marginTop: '12px', 
                padding: '12px', 
                background: '#f5f5f5', 
                borderRadius: '4px',
                overflow: 'auto',
                fontSize: '0.85em'
              }}>
                {this.state.error.toString()}\n{this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
