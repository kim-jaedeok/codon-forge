import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { GCWindowPoint } from '../../types/analysis';

interface Props {
  data: GCWindowPoint[];
  overallGC: number;
  windowSize: number;
  onWindowSizeChange: (v: number) => void;
}

export function GCWindowPlot({ data, overallGC, windowSize, onWindowSizeChange }: Props) {
  const chartData = data.map(d => ({
    position: d.position,
    gc: +(d.gcContent * 100).toFixed(1),
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">GC Content Sliding Window</h3>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500">Window:</label>
          <input
            type="range"
            min={20}
            max={500}
            step={10}
            value={windowSize}
            onChange={e => onWindowSizeChange(Number(e.target.value))}
            className="w-24"
          />
          <span className="text-xs text-gray-500 w-12">{windowSize}bp</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData}>
          <XAxis dataKey="position" tickFormatter={(v: number) => `${(v / 1000).toFixed(1)}k`} />
          <YAxis domain={[0, 100]} tickFormatter={(v: number) => `${v}%`} />
          <Tooltip
            formatter={(value) => [`${value}%`, 'GC Content']}
            labelFormatter={(label) => `Position: ${Number(label).toLocaleString()}`}
          />
          <ReferenceLine y={overallGC * 100} stroke="#9ca3af" strokeDasharray="5 5" label={`Mean ${(overallGC * 100).toFixed(1)}%`} />
          <Line type="monotone" dataKey="gc" stroke="#8b5cf6" dot={false} strokeWidth={1.5} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
