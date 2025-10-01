'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { X, MessageCircle } from 'lucide-react';
import { createDefaultAgent, type LLMAgent } from '@/lib/llm/agent';
import { useLLMStatus } from '../hooks/llm-status';
import { stripWrappingQuotes } from '@/lib/utils';

interface AssistantClippyProps {
  context: string;
  /**
   * Number of new characters the user must type before the assistant
   * generates the first suggestion. Defaults to 20.
   */
  triggerAfterChars?: number;
}
export function AssistantClippy({ context, triggerAfterChars = 20 }: AssistantClippyProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentSuggestion, setCurrentSuggestion] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [changeCount, setChangeCount] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const prevLengthRef = useRef(context.length);
  const hasMountedRef = useRef(false);
  const agentRef = useRef<LLMAgent | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);
  const { status, setStatus, setProgress } = useLLMStatus();

  const abortOngoingRequest = useCallback(
    (updateState = true) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
        if (updateState) {
          setIsGenerating(false);
          setStatus('ready');
        }
      }
    },
    [setStatus],
  );

  const fetchSuggestion = useCallback(async () => {
    if (!agentRef.current?.isReady()) return;
    abortOngoingRequest();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const requestId = ++requestIdRef.current;
    setIsGenerating(true);
    setStatus('executing');
    try {
      const suggestion = await agentRef.current.getSuggestion(context);
      if (!controller.signal.aborted && requestId === requestIdRef.current) {
        setCurrentSuggestion(stripWrappingQuotes(suggestion));
        setChangeCount(0);
        prevLengthRef.current = context.length;
      }
    } finally {
      if (!controller.signal.aborted && requestId === requestIdRef.current) {
        setStatus('ready');
        setIsGenerating(false);
      }
    }
  }, [context, setStatus, abortOngoingRequest]);

  useEffect(() => {
    agentRef.current = createDefaultAgent({
      model: 'Llama-3.2-1B-Instruct-q4f32_1-MLC', // default model
      initProgressCallback: (report: unknown) => {
        if (typeof report === 'number') {
          setProgress(Math.round(report * 100));
        } else if (
          report &&
          typeof report === 'object' &&
          'progress' in report &&
          typeof (report as { progress: number }).progress === 'number'
        ) {
          setProgress(Math.round((report as { progress: number }).progress * 100));
        }
        setStatus('loading');
      },
    });
    setStatus('loading');
    agentRef.current
      .initialize()
      .then(() => {
        setProgress(100);
        setStatus('ready');
      })
      .catch(console.error);
  }, [setStatus, setProgress]);

  useEffect(() => {
    if (!hasMountedRef.current) {
      prevLengthRef.current = context.length;
      hasMountedRef.current = true;
      return;
    }

    const diff = Math.abs(context.length - prevLengthRef.current);
    if (diff > 0) {
      setChangeCount((c) => c + diff);
    }
    prevLengthRef.current = context.length;
  }, [context]);

  useEffect(() => {
    const wordCount = context.trim().split(/\s+/).filter(Boolean).length;
    if (
      status === 'ready' &&
      changeCount >= triggerAfterChars &&
      !isVisible &&
      !isGenerating &&
      wordCount > 25
    ) {
      fetchSuggestion().then(() => {
        setIsVisible(true);
      });
    }
  }, [status, changeCount, fetchSuggestion, isVisible, isGenerating, triggerAfterChars, context]);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handleMinimize = () => {
    setIsExpanded(false);
  };

  const handleClose = () => {
    setIsExpanded(false);
    setIsVisible(false);
    setCurrentSuggestion('');
    setChangeCount(0);
    setIsGenerating(false);
    prevLengthRef.current = context.length;
  };

  useEffect(() => {
    if (context.length === 0) {
      setChangeCount(0);
      prevLengthRef.current = 0;
    }
  }, [context]);

  useEffect(() => {
    abortOngoingRequest();
  }, [context, abortOngoingRequest]);

  useEffect(() => {
    return () => abortOngoingRequest(false);
  }, [abortOngoingRequest]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {currentSuggestion.trim() &&
        (isExpanded ? (
          <Card className="w-80 p-4 shadow-lg border-2 border-primary/20 bg-card/95 backdrop-blur-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <MessageCircle className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-medium text-foreground">Writing Assistant</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleClose} className="h-6 w-6 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Pro tip to improve your entry:</p>

              {currentSuggestion.trim() && (
                <Card className="p-3 bg-accent/50 border-accent">
                  <p className="text-sm font-medium text-foreground italic">{currentSuggestion}</p>
                </Card>
              )}

              <div className="flex justify-end items-center">
                <Button variant="ghost" size="sm" onClick={handleMinimize} className="text-xs">
                  Hide for now
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <TooltipProvider delayDuration={0}>
            <Tooltip defaultOpen={false}>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleToggle}
                  className="rounded-full w-12 h-12 shadow-lg hover:scale-105 transition-transform"
                  size="sm"
                >
                  <MessageCircle className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" align="center">
                Writing Assistant
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
    </div>
  );
}
