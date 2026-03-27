import type { NucleotideFrequency } from '../../types/sequence';
import type { BasicStats } from '../../types/analysis';

export function computeBasicStats(seq: string): BasicStats {
  const freq: NucleotideFrequency = { A: 0, T: 0, G: 0, C: 0, N: 0, total: seq.length };

  for (let i = 0; i < seq.length; i++) {
    const ch = seq[i];
    if (ch === 'A') freq.A++;
    else if (ch === 'T') freq.T++;
    else if (ch === 'G') freq.G++;
    else if (ch === 'C') freq.C++;
    else freq.N++;
  }

  const gcContent = freq.total > 0 ? (freq.G + freq.C) / freq.total : 0;

  return { length: seq.length, frequency: freq, gcContent };
}
