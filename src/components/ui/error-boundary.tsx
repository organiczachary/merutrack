import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from './button';
import { Alert, AlertDescription } from './alert';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Call the optional onError callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReportError = () => {
    // In a real app, this would send the error to a logging service
    const errorReport = {
      message: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };
    
    console.log('Error report:', errorReport);
    
    // For now, just copy to clipboard
    navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2))
      .then(() => alert('Error details copied to clipboard'))
      .catch(() => alert('Failed to copy error details'));
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center p-6 auth-background">
          <div className="max-w-lg w-full space-y-6">
            <div className="glass-card rounded-lg p-8 text-center space-y-6">
              <div className="flex justify-center">
                <div className="rounded-full bg-destructive/10 p-3">
                  <AlertTriangle className="h-8 w-8 text-destructive" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h1 className="text-2xl font-semibold text-foreground">
                  Oops! Something went wrong
                </h1>
                <p className="text-muted-foreground">
                  We encountered an unexpected error. Don't worry, this has been logged and we'll look into it.
                </p>
              </div>

              {this.state.error && (
                <Alert variant="destructive" className="text-left">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="font-mono text-sm">
                    {this.state.error.message}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={this.handleRetry}
                  className="flex-1"
                  variant="default"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                
                <Button 
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex-1"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
              </div>

              <div className="pt-4 border-t border-border/50">
                <Button 
                  onClick={this.handleReportError}
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                >
                  <Bug className="h-4 w-4 mr-2" />
                  Report Error
                </Button>
              </div>
            </div>

            {/* Development error details */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="glass-card rounded-lg p-6 space-y-4">
                <h3 className="font-medium text-destructive">Development Error Details</h3>
                
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Error:</span>
                    <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-auto">
                      {this.state.error.message}
                    </pre>
                  </div>
                  
                  {this.state.error.stack && (
                    <div>
                      <span className="font-medium">Stack Trace:</span>
                      <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-auto max-h-40">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                  
                  {this.state.errorInfo?.componentStack && (
                    <div>
                      <span className="font-medium">Component Stack:</span>
                      <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-auto max-h-40">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for error handling in functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    console.error('useErrorHandler:', error, errorInfo);
    
    // In a real app, send to error reporting service
    const errorReport = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      ...errorInfo,
    };
    
    console.log('Error report:', errorReport);
  };
}

// Simple error fallback component
export function ErrorFallback({ 
  error, 
  resetError 
}: { 
  error: Error; 
  resetError: () => void; 
}) {
  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-4">
      <AlertTriangle className="h-12 w-12 text-destructive" />
      <div className="text-center space-y-2">
        <h2 className="text-lg font-semibold">Something went wrong</h2>
        <p className="text-sm text-muted-foreground">{error.message}</p>
      </div>
      <Button onClick={resetError} variant="outline" size="sm">
        <RefreshCw className="h-4 w-4 mr-2" />
        Try again
      </Button>
    </div>
  );
}

// Network error component
export function NetworkError({ 
  onRetry, 
  message = "Network connection failed" 
}: { 
  onRetry?: () => void; 
  message?: string; 
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="rounded-full bg-destructive/10 p-3">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      <div className="text-center space-y-2">
        <h3 className="font-medium">Connection Error</h3>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      )}
    </div>
  );
}

// Loading error with retry
export function LoadingError({ 
  onRetry, 
  message = "Failed to load data" 
}: { 
  onRetry?: () => void; 
  message?: string; 
}) {
  return (
    <Alert variant="destructive" className="my-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>{message}</span>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}