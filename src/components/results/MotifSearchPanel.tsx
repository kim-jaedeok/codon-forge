import type { MotifMatch } from '../../types/analysis';

interface Props {
  matches: MotifMatch[];
  pattern: string;
  onPatternChange: (p: string) => void;
  useRegex: boolean;
  onUseRegexChange: (v: boolean) => void;
}

export function MotifSearchPanel({ matches, pattern, onPatternChange, useRegex, onUseRegexChange }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex gap-2 items-center">
        <input
          type="text"
          value={pattern}
          onChange={e => onPatternChange(e.target.value)}
          placeholder={useRegex ? 'Regex pattern...' : 'DNA motif (IUPAC codes supported)...'}
          className="flex-1 px-3 py-2 text-sm font-mono bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <label className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
          <input
            type="checkbox"
            checked={useRegex}
            onChange={e => onUseRegexChange(e.target.checked)}
            className="rounded"
          />
          Regex
        </label>
      </div>

      {!useRegex && (
        <p className="text-xs text-gray-500">
          IUPAC codes: R=[AG] Y=[CT] S=[GC] W=[AT] K=[GT] M=[AC] N=[ATGC]
        </p>
      )}

      {pattern && (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {matches.length} matches
        </p>
      )}

      {matches.length > 0 && (
        <div className="overflow-x-auto max-h-64 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-gray-50 dark:bg-gray-700">
              <tr className="text-left text-gray-500">
                <th className="py-2 px-2">#</th>
                <th className="py-2 px-2">Strand</th>
                <th className="py-2 px-2 text-right">Start</th>
                <th className="py-2 px-2 text-right">End</th>
                <th className="py-2 px-2">Sequence</th>
              </tr>
            </thead>
            <tbody>
              {matches.slice(0, 100).map((m, i) => (
                <tr key={i} className="border-t border-gray-100 dark:border-gray-700">
                  <td className="py-1 px-2 text-gray-400">{i + 1}</td>
                  <td className="py-1 px-2 font-mono">{m.strand}</td>
                  <td className="py-1 px-2 text-right font-mono">{m.start.toLocaleString()}</td>
                  <td className="py-1 px-2 text-right font-mono">{m.end.toLocaleString()}</td>
                  <td className="py-1 px-2 font-mono text-xs">{m.matchedSequence}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
