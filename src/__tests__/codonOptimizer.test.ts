import { describe, it, expect } from 'vitest';
import { optimizeProtein } from '../lib/optimization/codonOptimizer';
import { calculateCAI, buildReverseCodonTable } from '../lib/optimization/cai';
import { CODON_TABLE } from '../constants/codonTable';
import { ORGANISM_CODON_USAGE } from '../constants/organismCodonUsage';
import type { OptimizationOptions } from '../types/optimizer';

const DEFAULT_OPTIONS: OptimizationOptions = {
  organism: 'ecoli',
  gcTarget: [0.40, 0.60],
  avoidEnzymes: ['EcoRI', 'BamHI', 'HindIII', 'NotI', 'XbaI', 'XhoI'],
  removeRepeats: true,
  avoidHomopolymers: true,
  avoidSecondaryStructure: true,
  useCodonHarmony: false,
  addUTR: false,
};

function translateBack(dna: string): string {
  let protein = '';
  for (let i = 0; i + 2 < dna.length; i += 3) {
    protein += CODON_TABLE[dna.substring(i, i + 3)] || '?';
  }
  return protein;
}

describe('코돈 최적화기 — 역번역 정확성', () => {
  it('GFP 단백질 역번역 일치', () => {
    const gfp = 'MVSKGEELFTGVVPILVELDGDVNGHKFSVSGEGEGDATYGKLTLKFICTTGKLPVPWPTLVTTLTYGVQCFSRYPDHMKQHDFFKSAMPEGYVQERTIFFKDDGNYKTRAEVKFEGDTLVNRIELKGIDFKEDGNILGHKLEYNYNSHNVYIMADKQKNGIKVNFKIRHNIEDGSVQLADHYQQNTPIGDGPVLLPDNHYLSTQSALSKDPNEKRDHMVLLEFVTAAGITLGMDELYK';
    const result = optimizeProtein(gfp, DEFAULT_OPTIONS);
    expect(translateBack(result.optimizedDNA)).toBe(gfp);
  });

  it('6개 유기체 모두 역번역 일치', () => {
    const protein = 'MVSKGEELFTGVVPILVELD';
    const organisms = ['ecoli', 'yeast', 'human', 'celegans', 'drosophila', 'arabidopsis'] as const;

    for (const org of organisms) {
      const result = optimizeProtein(protein, { ...DEFAULT_OPTIONS, organism: org });
      expect(translateBack(result.optimizedDNA)).toBe(protein);
    }
  });

  it('모든 아미노산 포함 서열', () => {
    const allAA = 'ACDEFGHIKLMNPQRSTVWY';
    const result = optimizeProtein(allAA, DEFAULT_OPTIONS);
    expect(translateBack(result.optimizedDNA)).toBe(allAA);
  });

  it('단일 아미노산', () => {
    expect(optimizeProtein('M', DEFAULT_OPTIONS).optimizedDNA).toBe('ATG');
  });

  it('M과 W는 유일한 코돈', () => {
    const result = optimizeProtein('MW', DEFAULT_OPTIONS);
    expect(result.optimizedDNA).toBe('ATGTGG');
  });
});

describe('코돈 최적화기 — CAI 점수', () => {
  it('최적화 후 CAI ≥ 0.8', () => {
    const protein = 'MVSKGEELFTGVVPILVELD';
    const result = optimizeProtein(protein, DEFAULT_OPTIONS);
    expect(result.caiAfterOptimization).toBeGreaterThanOrEqual(0.8);
  });

  it('대장균 Leu 최빈 코돈은 CTG', () => {
    const result = optimizeProtein('ML', {
      ...DEFAULT_OPTIONS,
      removeRepeats: false,
      avoidHomopolymers: false,
      avoidEnzymes: [],
    });
    expect(result.optimizedDNA).toBe('ATGCTG');
  });
});

describe('코돈 최적화기 — 제한효소 회피', () => {
  it('EcoRI 부위(GAATTC) 회피', () => {
    const result = optimizeProtein('MVSKGEELFTGVVPILVELD', DEFAULT_OPTIONS);
    expect(result.optimizedDNA).not.toContain('GAATTC');
  });

  it('BamHI 부위(GGATCC) 회피', () => {
    const result = optimizeProtein('MVSKGEELFTGVVPILVELD', DEFAULT_OPTIONS);
    expect(result.optimizedDNA).not.toContain('GGATCC');
  });

  it('효소 선택 해제 시 회피하지 않음', () => {
    const result = optimizeProtein('MVSKGEELFTGVVPILVELD', {
      ...DEFAULT_OPTIONS,
      avoidEnzymes: [], // 아무 효소도 회피하지 않음
    });
    // 부위가 있을 수도 없을 수도 있지만 에러는 없어야 함
    expect(result.optimizedDNA.length).toBe(20 * 3);
  });
});

describe('코돈 최적화기 — GC 함량', () => {
  it('대장균 GC 범위 내', () => {
    const gfp = 'MVSKGEELFTGVVPILVELDGDVNGHKFSVSGEGEGDATYGKLTLKFICTTGKLPVPWPTLVTTLTYGVQCFSRYPDHMKQHDFFKSAMPEGYVQERTIFFKDDGNYKTRAEVKFEGDTLVNRIELKGIDFKEDGNILGHKLEYNYNSHNVYIMADKQKNGIKVNFKIRHNIEDGSVQLADHYQQNTPIGDGPVLLPDNHYLSTQSALSKDPNEKRDHMVLLEFVTAAGITLGMDELYK';
    const result = optimizeProtein(gfp, DEFAULT_OPTIONS);
    expect(result.gcContentAfter).toBeGreaterThanOrEqual(0.35);
    expect(result.gcContentAfter).toBeLessThanOrEqual(0.65);
  });
});

describe('코돈 최적화기 — 제약 조건 위반', () => {
  it('남은 위반 수 보고', () => {
    const result = optimizeProtein('MVSKGEELFT', DEFAULT_OPTIONS);
    expect(Array.isArray(result.remainingViolations)).toBe(true);
  });

  it('변경 내역에 사유 포함', () => {
    const gfp = 'MVSKGEELFTGVVPILVELDGDVNGHKFSVSGEGEGDATYGKLTLKFICTTGKLPVPWPTLVTTLTYGVQCFSRYPDHMKQHDFFKSAMPEGYVQERTIFFKDDGNYKTRAEVKFEGDTLVNRIELKGIDFKEDGNILGHKLEYNYNSHNVYIMADKQKNGIKVNFKIRHNIEDGSVQLADHYQQNTPIGDGPVLLPDNHYLSTQSALSKDPNEKRDHMVLLEFVTAAGITLGMDELYK';
    const result = optimizeProtein(gfp, DEFAULT_OPTIONS);
    for (const change of result.changes) {
      expect(change.reason).toBeTruthy();
      expect(change.aminoAcid).toBeTruthy();
      expect(change.originalCodon.length).toBe(3);
      expect(change.optimizedCodon.length).toBe(3);
    }
  });
});

describe('CAI 계산', () => {
  it('최적 코돈만 사용 시 CAI ≈ 1.0', () => {
    const usage = ORGANISM_CODON_USAGE.ecoli;
    const revTable = buildReverseCodonTable(usage);

    // 각 AA에 대해 최빈 코돈만 사용한 DNA 생성
    let dna = '';
    for (const aa of 'MVSK') {
      dna += revTable.get(aa)![0].codon;
    }
    const cai = calculateCAI(dna, usage);
    expect(cai).toBeCloseTo(1.0, 1);
  });

  it('CAI 범위는 0~1', () => {
    const cai = calculateCAI('ATGAAAGGG', ORGANISM_CODON_USAGE.ecoli);
    expect(cai).toBeGreaterThanOrEqual(0);
    expect(cai).toBeLessThanOrEqual(1);
  });
});

describe('역코돈 테이블', () => {
  it('모든 아미노산에 대해 동의 코돈 존재', () => {
    const table = buildReverseCodonTable(ORGANISM_CODON_USAGE.ecoli);
    const aminoAcids = 'ACDEFGHIKLMNPQRSTVWY';
    for (const aa of aminoAcids) {
      expect(table.has(aa)).toBe(true);
      expect(table.get(aa)!.length).toBeGreaterThan(0);
    }
  });

  it('빈도 내림차순 정렬', () => {
    const table = buildReverseCodonTable(ORGANISM_CODON_USAGE.ecoli);
    for (const [, codons] of table) {
      for (let i = 1; i < codons.length; i++) {
        expect(codons[i - 1].freq).toBeGreaterThanOrEqual(codons[i].freq);
      }
    }
  });
});
