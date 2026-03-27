import { ORGANISM_CODON_USAGE } from '../../constants/organismCodonUsage';
import { RESTRICTION_ENZYMES } from '../../constants/restrictionEnzymes';
import { buildReverseCodonTable, calculateCAI } from './cai';
import { checkRestrictionSites, checkTandemRepeats, checkHomopolymers, checkGCContent, checkSecondaryStructure } from './constraints';
import type { OptimizationOptions, OptimizationResult, CodonChange, ConstraintViolation, CodonFrequencyTable } from '../../types/optimizer';
import type { RestrictionEnzyme } from '../../types/analysis';

function gcOf(codon: string): number {
  let gc = 0;
  for (const ch of codon) if (ch === 'G' || ch === 'C') gc++;
  return gc;
}

function getSelectedEnzymes(names: string[]): RestrictionEnzyme[] {
  return RESTRICTION_ENZYMES.filter(e => names.includes(e.name));
}

function getUsageTable(options: OptimizationOptions): CodonFrequencyTable {
  if (options.organism === 'custom' && options.customCodonTable) {
    return options.customCodonTable;
  }
  return ORGANISM_CODON_USAGE[options.organism] || ORGANISM_CODON_USAGE.ecoli;
}

// Codon Harmony: instead of always picking the most frequent codon,
// probabilistically select codons to match the natural distribution
function selectCodonWithHarmony(
  synonyms: { codon: string; freq: number }[],
  rng: () => number,
): string {
  const totalFreq = synonyms.reduce((sum, s) => sum + s.freq, 0);
  if (totalFreq === 0) return synonyms[0].codon;

  const r = rng() * totalFreq;
  let cumulative = 0;
  for (const syn of synonyms) {
    cumulative += syn.freq;
    if (r <= cumulative) return syn.codon;
  }
  return synonyms[synonyms.length - 1].codon;
}

// Simple seeded PRNG for reproducibility
function createRNG(seed: number = 42): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

// UTR sequences for expression optimization
const UTR_SEQUENCES = {
  prokaryote: {
    fiveUTR: 'AAGGAGATATACC', // Shine-Dalgarno + spacer
    threeUTR: '',
  },
  eukaryote: {
    fiveUTR: 'GCCACC', // Kozak consensus (before ATG)
    threeUTR: 'TGATAATAAGGCGGCCGC', // Stop + poly-A signal + NotI
  },
};

export function optimizeProtein(protein: string, options: OptimizationOptions): OptimizationResult {
  const usage = getUsageTable(options);
  const reverseTable = buildReverseCodonTable(usage);
  const changes: CodonChange[] = [];
  const cleanProtein = protein.replace(/\*/g, '').toUpperCase();
  const rng = createRNG(42);

  // Phase A: Codon assignment (Greedy or Harmony)
  const codons: string[] = [];
  for (const aa of cleanProtein) {
    const synonyms = reverseTable.get(aa);
    if (!synonyms || synonyms.length === 0) {
      codons.push('NNN');
    } else if (options.useCodonHarmony) {
      codons.push(selectCodonWithHarmony(synonyms, rng));
    } else {
      codons.push(synonyms[0].codon);
    }
  }

  const naiveDNA = codons.join('');

  // Phase B: Constraint repair (iterative)
  const selectedEnzymes = getSelectedEnzymes(options.avoidEnzymes);
  const maxIterations = 10;

  for (let iter = 0; iter < maxIterations; iter++) {
    const dna = codons.join('');
    let fixed = false;

    // B1: Remove restriction sites
    const reSites = checkRestrictionSites(dna, selectedEnzymes);
    for (const v of reSites) {
      const startCodon = Math.floor(v.position / 3);
      const enzyme = selectedEnzymes.find(e => dna.indexOf(e.recognitionSequence, v.position) === v.position);
      if (!enzyme) continue;

      const endPos = v.position + enzyme.recognitionSequence.length;
      const endCodon = Math.min(Math.ceil(endPos / 3), codons.length - 1);

      for (let ci = startCodon; ci <= endCodon && ci < codons.length; ci++) {
        const aa = cleanProtein[ci];
        const synonyms = reverseTable.get(aa);
        if (!synonyms || synonyms.length <= 1) continue;

        const original = codons[ci];
        let swapped = false;
        for (const syn of synonyms) {
          if (syn.codon === original) continue;
          codons[ci] = syn.codon;
          const testDna = codons.join('');
          if (testDna.indexOf(enzyme.recognitionSequence, v.position) !== v.position) {
            changes.push({ position: ci, aminoAcid: aa, originalCodon: original, optimizedCodon: syn.codon, reason: `Remove ${enzyme.name} recognition sequence` });
            swapped = true;
            fixed = true;
            break;
          }
          codons[ci] = original;
        }
        if (swapped) break;
      }
    }

    // B2: Remove tandem repeats
    if (options.removeRepeats) {
      for (let i = 0; i + 2 < codons.length; i++) {
        let count = 1;
        while (i + count < codons.length && codons[i + count] === codons[i]) count++;
        if (count >= 4) {
          const aa = cleanProtein[i];
          const synonyms = reverseTable.get(aa);
          if (synonyms && synonyms.length > 1) {
            for (let k = 1; k < count; k += 2) {
              const pos = i + k;
              const original = codons[pos];
              const alt = synonyms.find(s => s.codon !== original);
              if (alt) {
                codons[pos] = alt.codon;
                changes.push({ position: pos, aminoAcid: aa, originalCodon: original, optimizedCodon: alt.codon, reason: 'Remove tandem codon repeat' });
                fixed = true;
              }
            }
          }
        }
      }
    }

    // B3: Remove homopolymers
    if (options.avoidHomopolymers) {
      const dna2 = codons.join('');
      const homoViolations = checkHomopolymers(dna2);
      for (const v of homoViolations) {
        const midPos = v.position + 2;
        const codonIdx = Math.floor(midPos / 3);
        if (codonIdx >= codons.length) continue;
        const aa = cleanProtein[codonIdx];
        const synonyms = reverseTable.get(aa);
        if (!synonyms || synonyms.length <= 1) continue;
        const original = codons[codonIdx];
        for (const syn of synonyms) {
          if (syn.codon === original) continue;
          codons[codonIdx] = syn.codon;
          const testDna = codons.join('');
          const remaining = checkHomopolymers(testDna.substring(Math.max(0, v.position - 2), Math.min(testDna.length, v.position + 10)));
          if (remaining.length === 0) {
            changes.push({ position: codonIdx, aminoAcid: aa, originalCodon: original, optimizedCodon: syn.codon, reason: 'Remove homopolymer run' });
            fixed = true;
            break;
          }
          codons[codonIdx] = original;
        }
      }
    }

    // B4: Remove secondary structure hotspots (G/C runs > 6bp)
    if (options.avoidSecondaryStructure) {
      const dna2 = codons.join('');
      const ssViolations = checkSecondaryStructure(dna2);
      for (const v of ssViolations) {
        const midPos = v.position + 3;
        const codonIdx = Math.floor(midPos / 3);
        if (codonIdx >= codons.length) continue;
        const aa = cleanProtein[codonIdx];
        const synonyms = reverseTable.get(aa);
        if (!synonyms || synonyms.length <= 1) continue;
        const original = codons[codonIdx];
        for (const syn of synonyms) {
          if (syn.codon === original) continue;
          // Prefer codons that break the GC run
          const hasAT = syn.codon.includes('A') || syn.codon.includes('T');
          if (!hasAT) continue;
          codons[codonIdx] = syn.codon;
          const testDna = codons.join('');
          const region = testDna.substring(Math.max(0, v.position - 1), Math.min(testDna.length, v.position + 12));
          if (checkSecondaryStructure(region).length === 0) {
            changes.push({ position: codonIdx, aminoAcid: aa, originalCodon: original, optimizedCodon: syn.codon, reason: 'Fix RNA secondary structure hotspot' });
            fixed = true;
            break;
          }
          codons[codonIdx] = original;
        }
      }
    }

    // B5: GC content adjustment
    const dna3 = codons.join('');
    const gcViolations = checkGCContent(dna3, options.gcTarget);
    if (gcViolations.length > 0) {
      let totalGC = 0;
      for (const ch of dna3) if (ch === 'G' || ch === 'C') totalGC++;
      const currentGC = totalGC / dna3.length;
      const needMoreGC = currentGC < options.gcTarget[0];

      type SwapCandidate = { idx: number; codon: string; delta: number; freq: number };
      const candidates: SwapCandidate[] = [];

      for (let i = 0; i < codons.length; i++) {
        const aa = cleanProtein[i];
        const synonyms = reverseTable.get(aa);
        if (!synonyms || synonyms.length <= 1) continue;
        for (const syn of synonyms) {
          if (syn.codon === codons[i]) continue;
          const delta = gcOf(syn.codon) - gcOf(codons[i]);
          if ((needMoreGC && delta > 0) || (!needMoreGC && delta < 0)) {
            candidates.push({ idx: i, codon: syn.codon, delta, freq: syn.freq });
          }
        }
      }

      candidates.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta) || b.freq - a.freq);

      for (const c of candidates.slice(0, Math.ceil(codons.length * 0.1))) {
        const original = codons[c.idx];
        codons[c.idx] = c.codon;
        changes.push({ position: c.idx, aminoAcid: cleanProtein[c.idx], originalCodon: original, optimizedCodon: c.codon, reason: 'GC content adjustment' });
        fixed = true;

        const testDna = codons.join('');
        let newGC = 0;
        for (const ch of testDna) if (ch === 'G' || ch === 'C') newGC++;
        const newRatio = newGC / testDna.length;
        if (newRatio >= options.gcTarget[0] && newRatio <= options.gcTarget[1]) break;
      }
    }

    if (!fixed) break;
  }

  let optimizedDNA = codons.join('');

  // Phase C: Add UTR sequences
  if (options.addUTR) {
    const utrType = options.utrOrganism || 'eukaryote';
    const utr = UTR_SEQUENCES[utrType];
    optimizedDNA = utr.fiveUTR + optimizedDNA + utr.threeUTR;
  }

  // Compute final stats (on coding region only for fair comparison)
  const codingDNA = codons.join('');
  let gcBefore = 0, gcAfter = 0;
  for (const ch of naiveDNA) if (ch === 'G' || ch === 'C') gcBefore++;
  for (const ch of codingDNA) if (ch === 'G' || ch === 'C') gcAfter++;

  const remainingViolations: ConstraintViolation[] = [
    ...checkRestrictionSites(codingDNA, selectedEnzymes),
    ...(options.removeRepeats ? checkTandemRepeats(codingDNA) : []),
    ...(options.avoidHomopolymers ? checkHomopolymers(codingDNA) : []),
    ...(options.avoidSecondaryStructure ? checkSecondaryStructure(codingDNA) : []),
    ...checkGCContent(codingDNA, options.gcTarget),
  ];

  return {
    inputProtein: cleanProtein,
    optimizedDNA,
    naiveDNA,
    caiBeforeOptimization: calculateCAI(naiveDNA, usage),
    caiAfterOptimization: calculateCAI(codingDNA, usage),
    gcContentBefore: naiveDNA.length > 0 ? gcBefore / naiveDNA.length : 0,
    gcContentAfter: codingDNA.length > 0 ? gcAfter / codingDNA.length : 0,
    changes,
    remainingViolations,
  };
}
