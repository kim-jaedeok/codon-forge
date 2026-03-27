import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';

interface Props {
  naiveDNA: string;
  optimizedDNA: string;
}

export function CodonComparisonChart({ naiveDNA, optimizedDNA }: Props) {
  const data = useMemo(() => {
    const countBases = (dna: string) => {
      const counts = { A: 0, T: 0, G: 0, C: 0 };
      for (const ch of dna) {
        if (ch in counts) counts[ch as keyof typeof counts]++;
      }
      const total = dna.length;
      return {
        A: +((counts.A / total) * 100).toFixed(1),
        T: +((counts.T / total) * 100).toFixed(1),
        G: +((counts.G / total) * 100).toFixed(1),
        C: +((counts.C / total) * 100).toFixed(1),
      };
    };

    const naive = countBases(naiveDNA);
    const opt = countBases(optimizedDNA);

    return (['A', 'T', 'G', 'C'] as const).map(base => ({
      name: base,
      'Before': naive[base],
      'After': opt[base],
    }));
  }, [naiveDNA, optimizedDNA]);

  return (
    <div>
      <h3 className="text-[10px] text-stone-400 uppercase tracking-wider mb-2">Base Composition (Before / After)</h3>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} barGap={1} barSize={14}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: 'monospace', fill: '#78716c' }} axisLine={{ stroke: '#d6d3d1' }} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#a8a29e' }} tickFormatter={(v: number) => `${v}%`} axisLine={false} tickLine={false} width={35} />
          <Tooltip
            formatter={(v) => `${v}%`}
            contentStyle={{ fontSize: 11, border: '1px solid #d6d3d1', borderRadius: 4, boxShadow: 'none', background: '#fff' }}
          />
          <Legend wrapperStyle={{ fontSize: 10, color: '#78716c' }} />
          <Bar dataKey="Before" fill="#d6d3d1" radius={[1, 1, 0, 0]} />
          <Bar dataKey="After" fill="#57534e" radius={[1, 1, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
