import type { ORF } from '../../types/analysis';

interface Props {
  orfs: ORF[];
  minLength: number;
  onMinLengthChange: (v: number) => void;
}

export function ORFTable({ orfs, minLength, onMinLengthChange }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <label className="text-base text-gray-600 dark:text-gray-400">Min ORF length:</label>
        <input
          type="number"
          value={minLength}
          onChange={e => onMinLengthChange(Math.max(30, parseInt(e.target.value) || 100))}
          className="w-24 px-2 py-1 text-base border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
          min={30}
          step={10}
        />
        <span className="text-base text-gray-500">nt</span>
        <span className="ml-auto text-base text-gray-500">{orfs.length} found</span>
      </div>

      {orfs.length === 0 ? (
        <p className="text-base text-gray-500 p-4 text-center">No ORFs found matching the criteria.</p>
      ) : (
        <div className="overflow-x-auto max-h-80 overflow-y-auto">
          <table className="w-full text-base">
            <thead className="sticky top-0 bg-gray-50 dark:bg-gray-700">
              <tr className="text-left text-gray-500 dark:text-gray-400">
                <th className="py-2 px-2">#</th>
                <th className="py-2 px-2">Frame</th>
                <th className="py-2 px-2 text-right">Start</th>
                <th className="py-2 px-2 text-right">End</th>
                <th className="py-2 px-2 text-right">Length (nt)</th>
                <th className="py-2 px-2 text-right">Amino Acids</th>
              </tr>
            </thead>
            <tbody>
              {orfs.slice(0, 50).map((orf, i) => (
                <tr key={i} className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="py-1.5 px-2 text-gray-400">{i + 1}</td>
                  <td className="py-1.5 px-2 font-mono">
                    <span className={orf.frame > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}>
                      {orf.frame > 0 ? '+' : ''}{orf.frame}
                    </span>
                  </td>
                  <td className="py-1.5 px-2 text-right font-mono">{orf.start.toLocaleString()}</td>
                  <td className="py-1.5 px-2 text-right font-mono">{orf.end.toLocaleString()}</td>
                  <td className="py-1.5 px-2 text-right font-mono">{orf.length.toLocaleString()}</td>
                  <td className="py-1.5 px-2 text-right font-mono">{Math.floor(orf.length / 3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {orfs.length > 50 && (
            <p className="text-sm text-gray-500 p-2 text-center">Showing top 50 of {orfs.length} total</p>
          )}
        </div>
      )}
    </div>
  );
}
