import { useMemo, useState } from 'react';
import type { DNASequence } from '../types/sequence';
import type { BasicStats, ORF, RestrictionSite, CodonUsageEntry, GCWindowPoint, MotifMatch } from '../types/analysis';
import { computeBasicStats } from '../lib/analysis/basicStats';
import { reverseComplement } from '../lib/analysis/reverseComplement';
import { findORFs } from '../lib/analysis/orfFinder';
import { translateDNA } from '../lib/analysis/translation';
import { computeCodonUsage } from '../lib/analysis/codonUsage';
import { findRestrictionSites } from '../lib/analysis/restrictionSites';
import { searchMotifs } from '../lib/analysis/motifSearch';
import { computeGCWindow } from '../lib/analysis/gcWindow';
import { RESTRICTION_ENZYMES } from '../constants/restrictionEnzymes';

export function useAnalysis(sequence: DNASequence | null) {
  const [motifPattern, setMotifPattern] = useState('');
  const [useRegex, setUseRegex] = useState(false);
  const [gcWindowSize, setGCWindowSize] = useState(100);
  const [minOrfLength, setMinOrfLength] = useState(100);

  const seq = sequence?.raw ?? '';

  const stats: BasicStats | null = useMemo(
    () => seq ? computeBasicStats(seq) : null,
    [seq]
  );

  const revComp: string | null = useMemo(
    () => seq ? reverseComplement(seq) : null,
    [seq]
  );

  const orfs: ORF[] = useMemo(
    () => seq ? findORFs(seq, minOrfLength) : [],
    [seq, minOrfLength]
  );

  const translation: string = useMemo(
    () => seq ? translateDNA(seq, 0) : '',
    [seq]
  );

  const codonUsage: CodonUsageEntry[] = useMemo(
    () => seq ? computeCodonUsage(seq) : [],
    [seq]
  );

  const restrictionSites: RestrictionSite[] = useMemo(
    () => seq ? findRestrictionSites(seq, RESTRICTION_ENZYMES) : [],
    [seq]
  );

  const motifMatches: MotifMatch[] = useMemo(
    () => seq && motifPattern ? searchMotifs(seq, motifPattern, { useRegex, searchComplement: true }) : [],
    [seq, motifPattern, useRegex]
  );

  const gcWindowData: GCWindowPoint[] = useMemo(
    () => seq ? computeGCWindow(seq, gcWindowSize) : [],
    [seq, gcWindowSize]
  );

  return {
    stats, revComp, orfs, translation, codonUsage,
    restrictionSites, motifMatches, gcWindowData,
    motifPattern, setMotifPattern,
    useRegex, setUseRegex,
    gcWindowSize, setGCWindowSize,
    minOrfLength, setMinOrfLength,
  };
}
