import { useState, useCallback, useRef, useEffect } from 'react';
import type { DNASequence } from '../types/sequence';
import type { InterpreterState } from '../types/interpreter';
import { extractFeatures } from '../lib/interpreter/featureExtractor';
import { streamInterpretation } from '../lib/interpreter/claudeApi';

export function useAIInterpreter(sequence: DNASequence | null) {
  const [apiKey, setApiKey] = useState<string>(() => {
    try { return localStorage.getItem('claude-api-key') || ''; } catch { return ''; }
  });
  const [state, setState] = useState<InterpreterState>({
    status: 'idle', features: null, interpretation: '', error: null,
  });
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    try { localStorage.setItem('claude-api-key', apiKey); } catch { /* noop */ }
  }, [apiKey]);

  const interpret = useCallback(async () => {
    if (!sequence || !apiKey.trim()) {
      setState(s => ({ ...s, error: apiKey.trim() ? 'No sequence available.' : 'Please enter an API key.' }));
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState({ status: 'extracting', features: null, interpretation: '', error: null });

    try {
      const features = extractFeatures(sequence.raw);
      setState(s => ({ ...s, status: 'interpreting', features }));

      let text = '';
      for await (const chunk of streamInterpretation(apiKey, features, controller.signal)) {
        text += chunk;
        setState(s => ({ ...s, interpretation: text }));
      }

      setState(s => ({ ...s, status: 'done' }));
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') {
        setState(s => ({ ...s, status: 'idle' }));
        return;
      }
      setState(s => ({ ...s, status: 'error', error: e instanceof Error ? e.message : 'Error during AI interpretation' }));
    }
  }, [sequence, apiKey]);

  const abort = useCallback(() => {
    abortRef.current?.abort();
    setState(s => ({ ...s, status: s.interpretation ? 'done' : 'idle' }));
  }, []);

  return { state, apiKey, setApiKey, interpret, abort };
}
