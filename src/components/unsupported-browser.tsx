'use client';

import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function UnsupportedBrowserNotice() {
  const [supported, setSupported] = useState<boolean | null>(null);

  useEffect(() => {
    const hasWebGPU = typeof navigator !== 'undefined' && 'gpu' in navigator;
    setSupported(hasWebGPU);
  }, []);

  if (supported === null || supported) return null;

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertDescription>
        Your browser does not support WebLLM; AI suggestions will be unavailable offline.
      </AlertDescription>
    </Alert>
  );
}
