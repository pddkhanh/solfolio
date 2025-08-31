'use client';

import { useEffect } from 'react';
import { RootErrorBoundary } from '@/components/error/GlobalErrorBoundary';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('App error boundary:', error);
  }, [error]);

  return <RootErrorBoundary error={error} reset={reset} />;
}