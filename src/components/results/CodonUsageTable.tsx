import type { CodonUsageEntry } from '../../types/analysis';
import { AMINO_ACID_NAMES } from '../../constants/codonTable';

export function CodonUsageTable({ data }: { data: CodonUsageEntry[] }) {
  const grouped: Record<string, CodonUsageEntry[]> = {};
  for (const entry of data) {
    const aa = entry.aminoAcid;
    if (!grouped[aa]) grouped[aa] = [];
    grouped[aa].push(entry);
  }

  const sortedAAs = Object.keys(grouped).sort((a, b) => {
    if (a === '*') return 1;
    if (b === '*') return -1;
    return a.localeCompare(b);
  });

  return (
    <div className="overflow-x-auto max-h-96 overflow-y-auto">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-gray-50 dark:bg-gray-700">
          <tr className="text-left text-gray-500 dark:text-gray-400">
            <th className="py-2 px-2">Amino Acid</th>
            <th className="py-2 px-2">Codon</th>
            <th className="py-2 px-2 text-right">Count</th>
            <th className="py-2 px-2 text-right">Freq (/1000)</th>
            <th className="py-2 px-2 text-right">RSCU</th>
          </tr>
        </thead>
        <tbody>
          {sortedAAs.map(aa =>
            grouped[aa].map((entry, i) => (
              <tr
                key={entry.codon}
                className={`border-t border-gray-100 dark:border-gray-700 ${i === 0 ? 'border-t-2' : ''}`}
              >
                {i === 0 && (
                  <td className="py-1 px-2 font-bold" rowSpan={grouped[aa].length}>
                    {aa} ({AMINO_ACID_NAMES[aa] || aa})
                  </td>
                )}
                <td className="py-1 px-2 font-mono">{entry.codon}</td>
                <td className="py-1 px-2 text-right font-mono">{entry.count}</td>
                <td className="py-1 px-2 text-right">{entry.frequency.toFixed(1)}</td>
                <td className="py-1 px-2 text-right">{entry.fraction.toFixed(2)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
