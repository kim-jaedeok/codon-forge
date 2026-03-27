import { useState, useCallback } from 'react';
import type { DNASequence } from '../types/sequence';
import { parseInput } from '../lib/parser';

export function useSequenceInput() {
  const [sequence, setSequence] = useState<DNASequence | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadFromText = useCallback((input: string) => {
    setError(null);
    setWarnings([]);

    if (!input.trim()) {
      setSequence(null);
      return;
    }

    const result = parseInput(input);
    if (!result) {
      setError('Not a valid DNA sequence.');
      setSequence(null);
      return;
    }

    setWarnings(result.warnings);
    setSequence({
      raw: result.sequence,
      header: result.header,
      length: result.sequence.length,
    });
  }, []);

  const loadFromNCBI = useCallback((seq: string, header: string, accession: string) => {
    setError(null);
    setWarnings([]);
    setSequence({
      raw: seq,
      header,
      accession,
      length: seq.length,
    });
  }, []);

  const clear = useCallback(() => {
    setSequence(null);
    setWarnings([]);
    setError(null);
  }, []);

  return { sequence, warnings, error, loadFromText, loadFromNCBI, clear };
}
