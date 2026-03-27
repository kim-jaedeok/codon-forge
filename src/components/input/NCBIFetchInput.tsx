import { useState } from 'react';

interface Props {
  onFetch: (accession: string) => void;
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
}

export function NCBIFetchInput({ onFetch, status, error }: Props) {
  const [accession, setAccession] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (accession.trim()) onFetch(accession.trim());
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={accession}
          onChange={e => setAccession(e.target.value)}
          placeholder="NCBI Accession (e.g., NM_001301717)"
          className="flex-1 px-3 py-2 text-sm font-mono bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={!accession.trim() || status === 'loading'}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          {status === 'loading' ? 'Fetching...' : 'NCBI Fetch'}
        </button>
      </form>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Enter a GenBank or RefSeq Accession Number
      </p>
      {status === 'error' && error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}
