export const IUPAC_MAP: Record<string, string> = {
  A: 'A', T: 'T', G: 'G', C: 'C',
  R: '[AG]', Y: '[CT]', S: '[GC]', W: '[AT]',
  K: '[GT]', M: '[AC]', B: '[CGT]', D: '[AGT]',
  H: '[ACT]', V: '[ACG]', N: '[ATGC]',
};

export function iupacToRegex(pattern: string): string {
  return pattern
    .toUpperCase()
    .split('')
    .map(ch => IUPAC_MAP[ch] || ch)
    .join('');
}
