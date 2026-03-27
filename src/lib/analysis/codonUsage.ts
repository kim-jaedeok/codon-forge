import type { CodonUsageEntry } from '../../types/analysis';
import { CODON_TABLE } from '../../constants/codonTable';

export function computeCodonUsage(seq: string): CodonUsageEntry[] {
  const counts: Record<string, number> = {};
  const codons = Object.keys(CODON_TABLE);
  for (const c of codons) counts[c] = 0;

  let totalCodons = 0;
  for (let i = 0; i + 2 < seq.length; i += 3) {
    const codon = seq.substring(i, i + 3);
    if (codon in counts) {
      counts[codon]++;
      totalCodons++;
    }
  }

  const aaCounts: Record<string, number> = {};
  for (const [codon, aa] of Object.entries(CODON_TABLE)) {
    aaCounts[aa] = (aaCounts[aa] || 0) + counts[codon];
  }

  return codons.map(codon => {
    const aa = CODON_TABLE[codon];
    const count = counts[codon];
    const frequency = totalCodons > 0 ? (count / totalCodons) * 1000 : 0;
    const synonymousTotal = aaCounts[aa] || 0;
    const synonymousCount = codons.filter(c => CODON_TABLE[c] === aa).length;
    const fraction = synonymousTotal > 0
      ? (count / synonymousTotal) * synonymousCount
      : 0;

    return { codon, aminoAcid: aa, count, frequency, fraction };
  });
}
