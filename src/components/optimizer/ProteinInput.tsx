interface Props {
  value: string;
  onChange: (v: string) => void;
  onOptimize: () => void;
  error: string | null;
}

const EXAMPLE_GFP = 'MVSKGEELFTGVVPILVELDGDVNGHKFSVSGEGEGDATYGKLTLKFICTTGKLPVPWPTLVTTLTYGVQCFSRYPDHMKQHDFFKSAMPEGYVQERTIFFKDDGNYKTRAEVKFEGDTLVNRIELKGIDFKEDGNILGHKLEYNYNSHNVYIMADKQKNGIKVNFKIRHNIEDGSVQLADHYQQNTPIGDGPVLLPDNHYLSTQSALSKDPNEKRDHMVLLEFVTAAGITLGMDELYK';

export function ProteinInput({ value, onChange, onOptimize, error }: Props) {
  const cleanLen = value.replace(/[\s\d\n\r>].*\n?/g, '').replace(/[^ACDEFGHIKLMNPQRSTVWY*]/gi, '').length;

  return (
    <div className="space-y-2">
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Paste amino acid sequence (single-letter code)..."
        className="w-full h-36 p-3 text-sm font-mono bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded focus:outline-none focus:border-stone-500 resize-y"
        spellCheck={false}
      />
      <div className="flex items-center gap-2">
        <button
          onClick={onOptimize}
          disabled={!value.trim()}
          className="px-4 py-2 bg-stone-900 dark:bg-stone-200 text-white dark:text-stone-900 text-sm font-medium rounded hover:bg-stone-800 dark:hover:bg-stone-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Run Optimization
        </button>
        <button
          onClick={() => { onChange(EXAMPLE_GFP); }}
          className="px-4 py-2 text-xs text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 border border-stone-300 dark:border-stone-600 rounded hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
        >
          Load GFP example
        </button>
        {value && <span className="text-xs text-stone-400 ml-auto font-mono">{cleanLen} aa</span>}
      </div>
      {error && (
        <div className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded text-xs text-red-600 dark:text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}
