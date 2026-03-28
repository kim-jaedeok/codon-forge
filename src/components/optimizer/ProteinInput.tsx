import { useRef, useCallback } from 'react';

interface Props {
  value: string;
  onChange: (v: string) => void;
  onOptimize: () => void;
  error: string | null;
}

const EXAMPLE_GFP = 'MVSKGEELFTGVVPILVELDGDVNGHKFSVSGEGEGDATYGKLTLKFICTTGKLPVPWPTLVTTLTYGVQCFSRYPDHMKQHDFFKSAMPEGYVQERTIFFKDDGNYKTRAEVKFEGDTLVNRIELKGIDFKEDGNILGHKLEYNYNSHNVYIMADKQKNGIKVNFKIRHNIEDGSVQLADHYQQNTPIGDGPVLLPDNHYLSTQSALSKDPNEKRDHMVLLEFVTAAGITLGMDELYK';

export function ProteinInput({ value, onChange, onOptimize, error }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const cleanLen = value.replace(/[\s\d\n\r>].*\n?/g, '').replace(/[^ACDEFGHIKLMNPQRSTVWY*]/gi, '').length;

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    // Auto-resize
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.max(80, Math.min(el.scrollHeight, 400)) + 'px';
  }, [onChange]);

  const loadExample = useCallback(() => {
    onChange(EXAMPLE_GFP);
    // Trigger resize after state update
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (el) {
        el.style.height = 'auto';
        el.style.height = Math.max(80, Math.min(el.scrollHeight, 400)) + 'px';
      }
    });
  }, [onChange]);

  return (
    <div className="space-y-2">
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          placeholder="Paste amino acid sequence (single-letter code)..."
          className="w-full min-h-[80px] p-3 text-sm font-mono bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded focus:outline-none focus:border-stone-500 resize-none overflow-hidden"
          style={{ height: value ? undefined : '80px' }}
          spellCheck={false}
        />
        {value && (
          <span className="absolute bottom-2 right-2 text-[10px] text-stone-400 font-mono bg-white dark:bg-stone-800 px-1">{cleanLen} aa</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onOptimize}
          disabled={!value.trim()}
          className="px-4 py-2 bg-stone-900 dark:bg-stone-200 text-white dark:text-stone-900 text-sm font-medium rounded hover:bg-stone-800 dark:hover:bg-stone-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Run Optimization
        </button>
        <button
          onClick={loadExample}
          className="px-4 py-2 text-xs text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 border border-stone-300 dark:border-stone-600 rounded hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
        >
          Load GFP example
        </button>
      </div>
      {error && (
        <div className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded text-xs text-red-600 dark:text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}
