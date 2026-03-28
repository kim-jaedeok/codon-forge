import { useState } from 'react';
import type { DNASequence } from '../../types/sequence';
import { useAIInterpreter } from '../../hooks/useAIInterpreter';
import { ApiKeyInput } from './ApiKeyInput';
import { StreamingTextDisplay } from './StreamingTextDisplay';

export function AIInterpreterTab({ sequence }: { sequence: DNASequence }) {
  const { state, apiKey, setApiKey, interpret, abort } = useAIInterpreter(sequence);
  const [showFeatures, setShowFeatures] = useState(false);

  return (
    <div className="space-y-4">
      <div className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
        <p className="text-base text-purple-700 dark:text-purple-300 mb-2">
          Uses the Claude API to automatically interpret sequences. The API key is stored only in your browser and sent only to the Anthropic API.
        </p>
        <ApiKeyInput value={apiKey} onChange={setApiKey} />
      </div>

      <div className="flex gap-2">
        {state.status === 'interpreting' ? (
          <button
            onClick={abort}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-base font-medium"
          >
            Stop
          </button>
        ) : (
          <button
            onClick={interpret}
            disabled={!apiKey.trim() || state.status === 'extracting'}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-base font-medium"
          >
            {state.status === 'extracting' ? 'Extracting features...' : 'Start AI Interpretation'}
          </button>
        )}
      </div>

      {state.error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-base text-red-700 dark:text-red-400">
          {state.error}
        </div>
      )}

      {state.interpretation && (
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <StreamingTextDisplay text={state.interpretation} isStreaming={state.status === 'interpreting'} />
        </div>
      )}

      {state.features && (
        <div>
          <button
            onClick={() => setShowFeatures(!showFeatures)}
            className="text-base text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            {showFeatures ? 'Hide extracted features ▲' : 'Show extracted features ▼'}
          </button>
          {showFeatures && (
            <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-mono overflow-x-auto max-h-48 overflow-y-auto">
              {JSON.stringify(state.features, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
