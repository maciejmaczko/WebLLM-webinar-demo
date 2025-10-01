'use client';

import { createContext, useContext, useState } from 'react';

export type LLMStatus = 'loading' | 'ready' | 'executing';

interface LLMStatusContextValue {
  status: LLMStatus;
  setStatus: (status: LLMStatus) => void;
  progress: number;
  setProgress: (progress: number) => void;
}

const LLMStatusContext = createContext<LLMStatusContextValue | null>(null);

export function LLMStatusProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<LLMStatus>('loading');
  const [progress, setProgress] = useState(0);
  return (
    <LLMStatusContext.Provider value={{ status, setStatus, progress, setProgress }}>
      {children}
    </LLMStatusContext.Provider>
  );
}

export function useLLMStatus() {
  const ctx = useContext(LLMStatusContext);
  if (!ctx) throw new Error('useLLMStatus must be used within LLMStatusProvider');
  return ctx;
}
