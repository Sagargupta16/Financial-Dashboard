import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import React from "react";

interface EnhancedErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: (_props: {
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
    reset: () => void;
  }) => React.ReactNode;
  onError?: (_error: Error, _errorInfo: React.ErrorInfo) => void;
}

interface EnhancedErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorCount: number;
}

/**
 * Enhanced Error Boundary with better UX and error reporting
 * Catches JavaScript errors anywhere in the child component tree
 */
class EnhancedErrorBoundary extends React.Component<
  EnhancedErrorBoundaryProps,
  EnhancedErrorBoundaryState
> {
  constructor(props: EnhancedErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    if (import.meta.env.MODE === "development") {
      console.error("Error caught by boundary:", error, errorInfo);
    }

    // Update state with error details
    this.setState((prevState) => ({
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Send to error monitoring service (e.g., Sentry)
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to analytics or error tracking service
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService = (error: Error, errorInfo: React.ErrorInfo) => {
    // Implement error logging service here
    // Example: Sentry, LogRocket, or custom endpoint
    const errorDetails = {
      message: error.toString(),
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,

      url: globalThis.location.href,
    };

    // In production, send to monitoring service
    if (import.meta.env.PROD) {
      // Example: fetch('/api/log-error', { method: 'POST', body: JSON.stringify(errorDetails) })
      console.error("Error logged:", errorDetails);
    }
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    globalThis.location.reload();
  };

  handleGoHome = () => {
    globalThis.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, errorCount } = this.state;
      const { fallback } = this.props;

      // Use custom fallback if provided
      if (fallback) {
        return fallback({ error, errorInfo, reset: this.handleReset });
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-gray-800/50 border border-red-500/30 rounded-xl p-8 shadow-2xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-red-500/20 rounded-lg">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white mb-2">Oops! Something went wrong</h1>
                <p className="text-gray-300">
                  We encountered an unexpected error. Don&apos;t worry, your data is safe in your
                  browser.
                </p>
              </div>
            </div>

            {import.meta.env.MODE === "development" && error && (
              <div className="mb-6 bg-gray-900/50 border border-gray-700 rounded-lg p-4 overflow-auto max-h-60">
                <p className="text-red-400 font-mono text-sm mb-2">{error.toString()}</p>
                {errorInfo && (
                  <pre className="text-gray-400 text-xs overflow-auto">
                    {errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            {errorCount > 2 && (
              <div className="mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <p className="text-yellow-300 text-sm">
                  ⚠️ Multiple errors detected ({errorCount}). You may need to reload the page or
                  clear your browser data.
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                aria-label="Try again"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              <button
                type="button"
                onClick={this.handleReload}
                className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
                aria-label="Reload page"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
                aria-label="Go to home"
              >
                <Home className="w-4 h-4" />
                Go Home
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-700">
              <p className="text-gray-400 text-sm">
                <strong>What you can do:</strong>
              </p>
              <ul className="list-disc list-inside text-gray-400 text-sm mt-2 space-y-1">
                <li>Try clicking &quot;Try Again&quot; to recover</li>
                <li>Reload the page to start fresh</li>
                <li>Check your browser console for more details</li>
                <li>Clear your browser&apos;s local storage if the problem persists</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default EnhancedErrorBoundary;
