import { CODON_TABLE } from '../../constants/codonTable';

export function translateDNA(seq: string, frame: number = 0): string {
  const result: string[] = [];
  for (let i = frame; i + 2 < seq.length; i += 3) {
    const codon = seq.substring(i, i + 3);
    result.push(CODON_TABLE[codon] || 'X');
  }
  return result.join('');
}
