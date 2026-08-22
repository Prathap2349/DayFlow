// src/components/shared/ErrorBoundary.tsx
import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Database } from 'lucide-react';
import { Button } from '../ui/Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Dayflow ErrorBoundary caught an unhandled exception:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      const isDbError =
        this.state.error?.message?.includes('PGRST') ||
        this.state.error?.message?.includes('table') ||
        this.state.error?.message?.includes('Fetch') ||
        this.state.error?.message?.includes('schema');

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6 py-12">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center space-y-6 animate-fade-in">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
              {isDbError ? <Database className="w-8 h-8 text-amber-600" /> : <AlertTriangle className="w-8 h-8" />}
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900">
                {isDbError ? 'Database Connection Error' : 'Something went wrong'}
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                {isDbError
                  ? 'Dayflow encountered an issue querying your Supabase database. Please ensure your database tables are initialized.'
                  : 'An unexpected application error occurred. You can reload the page or check your database configuration.'}
              </p>
            </div>

            {this.state.error?.message && (
              <div className="bg-red-50/70 p-3 rounded-xl text-left text-xs font-mono text-red-700 border border-red-100 break-words max-h-36 overflow-y-auto">
                <span className="font-bold">Details:</span> {this.state.error.message}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                fullWidth
                leftIcon={<RefreshCw className="w-4 h-4" />}
                onClick={this.handleReset}
              >
                Reload Page
              </Button>
              <Button
                fullWidth
                onClick={() => (window.location.href = '/')}
              >
                Return to Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
