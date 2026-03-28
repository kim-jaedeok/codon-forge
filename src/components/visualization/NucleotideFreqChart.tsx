import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { BasicStats } from '../../types/analysis';

const COLORS = { A: '#22c55e', T: '#ef4444', G: '#eab308', C: '#3b82f6' };

export function NucleotideFreqChart({ stats }: { stats: BasicStats }) {
  const data = (['A', 'T', 'G', 'C'] as const).map(base => ({
    name: base,
    count: stats.frequency[base],
    pct: ((stats.frequency[base] / stats.frequency.total) * 100).toFixed(1),
  }));

  return (
    <div>
      <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">Nucleotide Frequency</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip
            formatter={(value, _name, props) =>
              [`${Number(value).toLocaleString()} (${(props.payload as { pct: string }).pct}%)`, 'Count']
            }
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map(entry => (
              <Cell key={entry.name} fill={COLORS[entry.name]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
