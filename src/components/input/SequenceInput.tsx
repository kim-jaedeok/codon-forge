import { useState } from 'react';
import { Tabs } from '../ui/Tabs';
import { TextPasteInput } from './TextPasteInput';
import { NCBIFetchInput } from './NCBIFetchInput';

interface Props {
  onTextSubmit: (text: string) => void;
  onNCBIFetch: (accession: string) => void;
  ncbiStatus: 'idle' | 'loading' | 'success' | 'error';
  ncbiError: string | null;
  sequenceInfo: { length: number; header?: string; accession?: string } | null;
  warnings: string[];
  error: string | null;
}

export function SequenceInput({
  onTextSubmit, onNCBIFetch, ncbiStatus, ncbiError,
  sequenceInfo, warnings, error
}: Props) {
  const [tab, setTab] = useState(0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Sequence Input</h2>
      <Tabs tabs={['Direct Input', 'NCBI Search']} active={tab} onChange={setTab} />

      {tab === 0 && <TextPasteInput onSubmit={onTextSubmit} />}
      {tab === 1 && <NCBIFetchInput onFetch={onNCBIFetch} status={ncbiStatus} error={ncbiError} />}

      {error && (
        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {warnings.length > 0 && (
        <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm text-yellow-700 dark:text-yellow-400">
          {warnings.map((w, i) => <p key={i}>{w}</p>)}
        </div>
      )}

      {sequenceInfo && (
        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm">
          <p className="text-blue-800 dark:text-blue-300 font-medium">
            Sequence loaded: {sequenceInfo.length.toLocaleString()} bp
          </p>
          {sequenceInfo.header && (
            <p className="text-blue-600 dark:text-blue-400 truncate mt-1">{sequenceInfo.header}</p>
          )}
        </div>
      )}
    </div>
  );
}
