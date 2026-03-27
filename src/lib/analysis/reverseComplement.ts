const COMPLEMENT: Record<string, string> = {
  A: 'T', T: 'A', G: 'C', C: 'G', N: 'N',
  R: 'Y', Y: 'R', S: 'S', W: 'W',
  K: 'M', M: 'K', B: 'V', V: 'B',
  D: 'H', H: 'D',
};

export function reverseComplement(seq: string): string {
  const result = new Array(seq.length);
  for (let i = 0; i < seq.length; i++) {
    result[seq.length - 1 - i] = COMPLEMENT[seq[i]] || 'N';
  }
  return result.join('');
}
