import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
              <AlertTriangle size={40} className="text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-3">
              Something Went Wrong
            </h2>
            <p className="text-surface-500 mb-2">
              An unexpected error occurred while rendering this page.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 mb-6 text-left">
                <summary className="text-sm text-surface-400 cursor-pointer hover:text-surface-600 transition-colors">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 p-4 bg-surface-50 dark:bg-surface-800 rounded-xl text-xs text-surface-700 dark:text-surface-300 overflow-auto max-h-40 border border-surface-100 dark:border-surface-700">
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="flex items-center gap-2 px-5 py-2.5 bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 rounded-xl font-medium hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
              >
                <RefreshCw size={16} />
                Try Again
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
              >
                <Home size={16} />
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
