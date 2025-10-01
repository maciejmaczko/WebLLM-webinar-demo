'use client';

import type React from 'react';

import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Loader } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useLLMStatus } from '../hooks/llm-status';

interface JournalEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function JournalEditor({ value, onChange }: JournalEditorProps) {
  const [isSaved, setIsSaved] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { status, progress } = useLLMStatus();

  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;

  useEffect(() => {
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set saved state to false when content changes
    if (value.trim()) {
      setIsSaved(false);

      // Auto-save after 2 seconds of inactivity
      saveTimeoutRef.current = setTimeout(() => {
        setIsSaved(true);
      }, 2000);
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <Card className="flex-1 p-4">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          placeholder="Write about your day…"
          className="w-full h-full resize-none border-none outline-none bg-transparent text-foreground placeholder:text-muted-foreground text-base leading-relaxed custom-scrollbar"
          style={{ minHeight: '400px' }}
        />
      </Card>

      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
        <div className="flex items-center">
          <span className={isSaved ? 'text-green-500' : ''}>
            Saved locally {isSaved ? '✓' : '...'}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {status !== 'ready' && <Loader className="h-4 w-4 animate-spin" />}
          <span>
            {status === 'loading' && `Loading model... ${progress}%`}
            {status === 'executing' && 'Generating...'}
            {status === 'ready' && 'Model ready'}
          </span>
          {status === 'loading' && (
            <div className="w-24">
              <Progress value={progress} />
            </div>
          )}
        </div>
      </div>
      <div className="text-sm text-muted-foreground">Word count: {wordCount}</div>
    </div>
  );
}
