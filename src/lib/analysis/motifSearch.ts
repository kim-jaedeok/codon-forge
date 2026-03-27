import type { MotifMatch } from '../../types/analysis';
import { iupacToRegex } from '../../constants/iupac';
import { reverseComplement } from './reverseComplement';

export function searchMotifs(
  seq: string,
  pattern: string,
  options: { useRegex?: boolean; searchComplement?: boolean } = {}
): MotifMatch[] {
  if (!pattern.trim()) return [];

  const matches: MotifMatch[] = [];

  let regexStr: string;
  try {
    regexStr = options.useRegex ? pattern : iupacToRegex(pattern);
    new RegExp(regexStr);
  } catch {
    return [];
  }

  const regex = new RegExp(regexStr, 'gi');

  let match: RegExpExecArray | null;
  while ((match = regex.exec(seq)) !== null) {
    matches.push({
      pattern,
      start: match.index,
      end: match.index + match[0].length,
      matchedSequence: match[0],
      strand: '+',
    });
    regex.lastIndex = match.index + 1;
  }

  if (options.searchComplement) {
    const revComp = reverseComplement(seq);
    const regex2 = new RegExp(regexStr, 'gi');
    while ((match = regex2.exec(revComp)) !== null) {
      matches.push({
        pattern,
        start: seq.length - match.index - match[0].length,
        end: seq.length - match.index,
        matchedSequence: match[0],
        strand: '-',
      });
      regex2.lastIndex = match.index + 1;
    }
  }

  return matches;
}
