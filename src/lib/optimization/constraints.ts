import type { ConstraintViolation } from '../../types/optimizer';
import type { RestrictionEnzyme } from '../../types/analysis';

export function checkRestrictionSites(dna: string, enzymes: RestrictionEnzyme[]): ConstraintViolation[] {
  const violations: ConstraintViolation[] = [];
  for (const enzyme of enzymes) {
    let idx = dna.indexOf(enzyme.recognitionSequence);
    while (idx !== -1) {
      violations.push({
        type: 'restriction_site',
        position: idx,
        description: `${enzyme.name} recognition sequence (${enzyme.recognitionSequence}) at position ${idx}`,
      });
      idx = dna.indexOf(enzyme.recognitionSequence, idx + 1);
    }
  }
  return violations;
}

export function checkTandemRepeats(dna: string, threshold: number = 4): ConstraintViolation[] {
  const violations: ConstraintViolation[] = [];
  for (let i = 0; i + 2 < dna.length; i += 3) {
    const codon = dna.substring(i, i + 3);
    let count = 1;
    let j = i + 3;
    while (j + 2 < dna.length && dna.substring(j, j + 3) === codon) {
      count++;
      j += 3;
    }
    if (count >= threshold) {
      violations.push({
        type: 'tandem_repeat',
        position: i,
        description: `Codon ${codon} repeated ${count} times consecutively (position ${i}-${j})`,
      });
      i = j - 3; // skip past the repeat
    }
  }
  return violations;
}

export function checkHomopolymers(dna: string, threshold: number = 5): ConstraintViolation[] {
  const violations: ConstraintViolation[] = [];
  let i = 0;
  while (i < dna.length) {
    const ch = dna[i];
    let count = 1;
    while (i + count < dna.length && dna[i + count] === ch) count++;
    if (count >= threshold) {
      violations.push({
        type: 'homopolymer',
        position: i,
        description: `${ch} repeated ${count} times consecutively (position ${i}-${i + count})`,
      });
    }
    i += count;
  }
  return violations;
}

export function checkSecondaryStructure(dna: string, gcRunThreshold: number = 6): ConstraintViolation[] {
  const violations: ConstraintViolation[] = [];
  let i = 0;
  while (i < dna.length) {
    const ch = dna[i];
    if (ch === 'G' || ch === 'C') {
      let count = 1;
      while (i + count < dna.length && (dna[i + count] === 'G' || dna[i + count] === 'C')) count++;
      if (count > gcRunThreshold) {
        violations.push({
          type: 'secondary_structure',
          position: i,
          description: `G/C run of ${count}bp (position ${i}-${i + count}) — RNA secondary structure risk`,
        });
      }
      i += count;
    } else {
      i++;
    }
  }
  return violations;
}

export function checkGCContent(dna: string, target: [number, number]): ConstraintViolation[] {
  if (dna.length === 0) return [];
  let gc = 0;
  for (let i = 0; i < dna.length; i++) {
    if (dna[i] === 'G' || dna[i] === 'C') gc++;
  }
  const ratio = gc / dna.length;
  if (ratio < target[0] || ratio > target[1]) {
    return [{
      type: 'gc_content',
      position: 0,
      description: `GC content ${(ratio * 100).toFixed(1)}% (target: ${(target[0] * 100).toFixed(0)}-${(target[1] * 100).toFixed(0)}%)`,
    }];
  }
  return [];
}
