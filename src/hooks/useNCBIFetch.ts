import { useState, useCallback } from 'react';
import { fetchByAccession } from '../lib/ncbiApi';

type Status = 'idle' | 'loading' | 'success' | 'error';

export function useNCBIFetch(onSuccess: (seq: string, header: string, accession: string) => void) {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  const fetch_ = useCallback(async (accession: string) => {
    setStatus('loading');
    setError(null);

    try {
      const result = await fetchByAccession(accession);
      setStatus('success');
      onSuccess(result.sequence, result.header, result.accession);
    } catch (e) {
      setStatus('error');
      setError(e instanceof Error ? e.message : 'NCBI fetch failed');
    }
  }, [onSuccess]);

  return { status, error, fetch: fetch_ };
}
