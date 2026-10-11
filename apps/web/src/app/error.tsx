'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/layout/container';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected errors
    console.error('Application error encountered:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-16 px-4">
      <Container size="sm" className="text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-200">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Something went wrong
          </h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            An unexpected error occurred while processing this page. Our technical team has been notified.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            variant="primary"
            size="md"
            onClick={() => reset()}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Try Again
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={() => {
              window.location.href = '/';
            }}
          >
            Return to Homepage
          </Button>
        </div>
      </Container>
    </div>
  );
}
