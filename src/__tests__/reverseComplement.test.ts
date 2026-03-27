import { describe, it, expect } from 'vitest';
import { reverseComplement } from '../lib/analysis/reverseComplement';

describe('reverseComplement', () => {
  it('기본 역상보', () => {
    expect(reverseComplement('ATGC')).toBe('GCAT');
  });

  it('이중 적용 시 원본 복원', () => {
    const seq = 'ATGCGATCGATCG';
    expect(reverseComplement(reverseComplement(seq))).toBe(seq);
  });

  it('단일 염기', () => {
    expect(reverseComplement('A')).toBe('T');
    expect(reverseComplement('T')).toBe('A');
    expect(reverseComplement('G')).toBe('C');
    expect(reverseComplement('C')).toBe('G');
  });

  it('IUPAC 모호성 코드', () => {
    expect(reverseComplement('R')).toBe('Y');  // R=[AG] -> Y=[CT]
    expect(reverseComplement('M')).toBe('K');  // M=[AC] -> K=[GT]
  });

  it('팔린드롬 서열', () => {
    // GAATTC (EcoRI 인식 서열)은 역상보가 자기 자신
    expect(reverseComplement('GAATTC')).toBe('GAATTC');
  });
});
