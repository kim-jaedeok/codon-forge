import type { ExtractedFeatures } from '../../types/interpreter';
import { computeBasicStats } from '../analysis/basicStats';
import { findORFs } from '../analysis/orfFinder';
import { findRestrictionSites } from '../analysis/restrictionSites';
import { RESTRICTION_ENZYMES } from '../../constants/restrictionEnzymes';
import { REGULATORY_MOTIFS } from '../../constants/regulatoryMotifs';
import { ORGANISM_CODON_USAGE, ORGANISMS } from '../../constants/organismCodonUsage';
import { calculateCAI } from '../optimization/cai';

export function extractFeatures(seq: string): ExtractedFeatures {
  const stats = computeBasicStats(seq);
  const orfs = findORFs(seq, 100);
  const sites = findRestrictionSites(seq, RESTRICTION_ENZYMES);

  const longest = orfs.length > 0 ? orfs[0] : null;

  const uniqueEnzymes = [...new Set(sites.map(s => s.enzyme))];

  // CAI scores for each organism
  const caiScores: Record<string, number> = {};
  let bestOrg = '';
  let bestCAI = 0;
  for (const org of ORGANISMS) {
    const usageTable = ORGANISM_CODON_USAGE[org.id];
    if (!usageTable) continue;
    const cai = calculateCAI(seq, usageTable);
    caiScores[org.name] = +cai.toFixed(3);
    if (cai > bestCAI) {
      bestCAI = cai;
      bestOrg = org.name;
    }
  }

  // Regulatory motifs
  const motifResults = REGULATORY_MOTIFS.map(motif => {
    const regex = new RegExp(motif.pattern, 'gi');
    const positions: number[] = [];
    let match;
    while ((match = regex.exec(seq)) !== null) {
      positions.push(match.index);
      regex.lastIndex = match.index + 1;
    }
    return {
      name: motif.name,
      nameKo: motif.nameKo,
      found: positions.length > 0,
      positions,
    };
  });

  return {
    basicStats: { length: stats.length, gcContent: stats.gcContent },
    orfs: {
      count: orfs.length,
      longest: longest ? { frame: longest.frame, length: longest.length, aaCount: Math.floor(longest.length / 3) } : null,
    },
    restrictionSites: {
      enzymeCount: uniqueEnzymes.length,
      totalSites: sites.length,
      enzymes: uniqueEnzymes,
    },
    codonBias: {
      mostLikelyOrganism: bestOrg,
      caiScores,
    },
    regulatoryMotifs: motifResults,
    sequenceSnippet: {
      first50: seq.substring(0, 50),
      last50: seq.substring(Math.max(0, seq.length - 50)),
    },
  };
}
