'use client';

import { Component, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorWrapperState {
  hasError: boolean;
  error?: Error;
}

export class ErrorWrapper extends Component<ErrorWrapperProps, ErrorWrapperState> {
  constructor(props: ErrorWrapperProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorWrapperState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error capturado:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="bg-card rounded-3xl p-8 mb-8 card-shadow">
          <div className="flex flex-col items-center justify-center text-center gap-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <h3 className="font-semibold text-xl">Algo salió mal</h3>
            <p className="text-muted-foreground max-w-md">
              No pudimos cargar esta sección. Por favor, intenta de nuevo.
            </p>
            <Button
              onClick={() => this.setState({ hasError: false, error: undefined })}
              variant="outline"
            >
              Reintentar
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}