import type { BasicStats } from '../../types/analysis';

export function BasicStatsCard({ stats }: { stats: BasicStats }) {
  const { frequency: f } = stats;
  const pct = (n: number) => ((n / f.total) * 100).toFixed(1);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400">Sequence Length</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.length.toLocaleString()} <span className="text-sm font-normal">bp</span>
          </p>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400">GC Content</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {(stats.gcContent * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nucleotide Frequency</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 dark:text-gray-400">
              <th className="py-1 px-2">Base</th>
              <th className="py-1 px-2 text-right">Count</th>
              <th className="py-1 px-2 text-right">Ratio</th>
              <th className="py-1 px-2">Distribution</th>
            </tr>
          </thead>
          <tbody>
            {(['A', 'T', 'G', 'C'] as const).map(base => {
              const colors = { A: 'bg-green-500', T: 'bg-red-500', G: 'bg-yellow-500', C: 'bg-blue-500' };
              return (
                <tr key={base} className="border-t border-gray-100 dark:border-gray-700">
                  <td className="py-1.5 px-2 font-mono font-bold">{base}</td>
                  <td className="py-1.5 px-2 text-right font-mono">{f[base].toLocaleString()}</td>
                  <td className="py-1.5 px-2 text-right">{pct(f[base])}%</td>
                  <td className="py-1.5 px-2">
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className={`${colors[base]} h-2 rounded-full`}
                        style={{ width: `${(f[base] / f.total) * 100}%` }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
            {f.N > 0 && (
              <tr className="border-t border-gray-100 dark:border-gray-700">
                <td className="py-1.5 px-2 font-mono">N</td>
                <td className="py-1.5 px-2 text-right font-mono">{f.N.toLocaleString()}</td>
                <td className="py-1.5 px-2 text-right">{pct(f.N)}%</td>
                <td />
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
