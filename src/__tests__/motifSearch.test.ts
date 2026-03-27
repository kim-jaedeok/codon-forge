import { describe, it, expect } from 'vitest';
import { searchMotifs } from '../lib/analysis/motifSearch';

describe('searchMotifs', () => {
  it('단순 패턴 검색', () => {
    const matches = searchMotifs('ATGCATGCATGC', 'ATG');
    expect(matches.length).toBe(3);
  });

  it('IUPAC 코드 (N=[ATGC])', () => {
    const matches = searchMotifs('ATGCATGC', 'NTG');
    expect(matches.length).toBe(2); // ATG x2
  });

  it('정규식 모드', () => {
    const matches = searchMotifs('ATGCATGC', 'ATG.', { useRegex: true });
    expect(matches.length).toBe(2);
  });

  it('빈 패턴은 빈 결과', () => {
    expect(searchMotifs('ATGC', '').length).toBe(0);
  });

  it('유효하지 않은 정규식은 빈 결과', () => {
    expect(searchMotifs('ATGC', '[invalid', { useRegex: true }).length).toBe(0);
  });

  it('역상보 가닥 검색', () => {
    const matches = searchMotifs('ATGC', 'GCAT', { searchComplement: true });
    expect(matches.filter(m => m.strand === '-').length).toBe(1);
  });
});
