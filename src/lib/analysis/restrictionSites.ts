import type { RestrictionSite, RestrictionEnzyme } from '../../types/analysis';
import { reverseComplement } from './reverseComplement';

export function findRestrictionSites(
  seq: string,
  enzymes: RestrictionEnzyme[]
): RestrictionSite[] {
  const sites: RestrictionSite[] = [];
  const revComp = reverseComplement(seq);

  for (const enzyme of enzymes) {
    const recSeq = enzyme.recognitionSequence;

    let idx = seq.indexOf(recSeq);
    while (idx !== -1) {
      sites.push({
        enzyme: enzyme.name,
        recognitionSequence: recSeq,
        position: idx,
        strand: '+',
      });
      idx = seq.indexOf(recSeq, idx + 1);
    }

    if (recSeq !== reverseComplement(recSeq)) {
      let ridx = revComp.indexOf(recSeq);
      while (ridx !== -1) {
        sites.push({
          enzyme: enzyme.name,
          recognitionSequence: recSeq,
          position: seq.length - ridx - recSeq.length,
          strand: '-',
        });
        ridx = revComp.indexOf(recSeq, ridx + 1);
      }
    }
  }

  sites.sort((a, b) => a.position - b.position);
  return sites;
}
