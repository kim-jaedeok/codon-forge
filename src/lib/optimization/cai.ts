import { CODON_TABLE } from '../../constants/codonTable';
import type { CodonFrequencyTable } from '../../types/optimizer';

export function buildReverseCodonTable(usage: CodonFrequencyTable): Map<string, { codon: string; freq: number }[]> {
  const table = new Map<string, { codon: string; freq: number }[]>();
  for (const [codon, aa] of Object.entries(CODON_TABLE)) {
    if (aa === '*') continue;
    if (!table.has(aa)) table.set(aa, []);
    table.get(aa)!.push({ codon, freq: usage[codon] || 0 });
  }
  for (const entries of table.values()) {
    entries.sort((a, b) => b.freq - a.freq);
  }
  return table;
}

export function calculateCAI(dna: string, usage: CodonFrequencyTable): number {
  // Build max frequency per amino acid
  const maxFreq = new Map<string, number>();
  for (const [codon, aa] of Object.entries(CODON_TABLE)) {
    if (aa === '*') continue;
    const freq = usage[codon] || 0;
    maxFreq.set(aa, Math.max(maxFreq.get(aa) || 0, freq));
  }

  let logSum = 0;
  let count = 0;

  for (let i = 0; i + 2 < dna.length; i += 3) {
    const codon = dna.substring(i, i + 3);
    const aa = CODON_TABLE[codon];
    if (!aa || aa === '*') continue;

    const freq = usage[codon] || 0.5;
    const max = maxFreq.get(aa) || 1;
    const w = freq / max;

    logSum += Math.log(Math.max(w, 0.001));
    count++;
  }

  if (count === 0) return 0;
  return Math.exp(logSum / count);
}
