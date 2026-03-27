import type { ORF } from '../../types/analysis';
import { CODON_TABLE } from '../../constants/codonTable';
import { reverseComplement } from './reverseComplement';

const STOP_CODONS = new Set(['TAA', 'TAG', 'TGA']);

function findORFsInFrame(seq: string, frame: number, minLength: number, isReverse: boolean, seqLen: number): ORF[] {
  const orfs: ORF[] = [];
  const starts: number[] = [];

  for (let i = frame; i + 2 < seq.length; i += 3) {
    const codon = seq.substring(i, i + 3);

    if (codon === 'ATG') {
      starts.push(i);
    }

    if (STOP_CODONS.has(codon) && starts.length > 0) {
      const orfStart = starts[0];
      const orfEnd = i + 3;
      const orfLength = orfEnd - orfStart;

      if (orfLength >= minLength) {
        const aaSeq: string[] = [];
        for (let j = orfStart; j + 2 < orfEnd; j += 3) {
          aaSeq.push(CODON_TABLE[seq.substring(j, j + 3)] || 'X');
        }

        const displayFrame = isReverse ? -(frame + 1) : frame + 1;

        let displayStart: number, displayEnd: number;
        if (isReverse) {
          displayStart = seqLen - orfEnd;
          displayEnd = seqLen - orfStart;
        } else {
          displayStart = orfStart;
          displayEnd = orfEnd;
        }

        orfs.push({
          frame: displayFrame,
          start: displayStart,
          end: displayEnd,
          length: orfLength,
          aminoAcidSequence: aaSeq.join(''),
        });
      }
      starts.length = 0;
    }
  }

  return orfs;
}

export function findORFs(seq: string, minLength: number = 100): ORF[] {
  const allOrfs: ORF[] = [];
  const seqLen = seq.length;

  for (let frame = 0; frame < 3; frame++) {
    allOrfs.push(...findORFsInFrame(seq, frame, minLength, false, seqLen));
  }

  const revComp = reverseComplement(seq);
  for (let frame = 0; frame < 3; frame++) {
    allOrfs.push(...findORFsInFrame(revComp, frame, minLength, true, seqLen));
  }

  allOrfs.sort((a, b) => b.length - a.length);
  return allOrfs;
}
