import { describe, it, expect } from 'vitest';
import { computeBasicStats } from '../lib/analysis/basicStats';

describe('computeBasicStats', () => {
  it('기본 통계 계산', () => {
    const stats = computeBasicStats('ATGCATGC');
    expect(stats.length).toBe(8);
    expect(stats.frequency.A).toBe(2);
    expect(stats.frequency.T).toBe(2);
    expect(stats.frequency.G).toBe(2);
    expect(stats.frequency.C).toBe(2);
    expect(stats.gcContent).toBe(0.5);
  });

  it('GC 함량 정확도', () => {
    const stats = computeBasicStats('GGCC');
    expect(stats.gcContent).toBe(1.0);
  });

  it('AT only', () => {
    const stats = computeBasicStats('AATT');
    expect(stats.gcContent).toBe(0.0);
  });

  it('N 카운트', () => {
    const stats = computeBasicStats('ATGN');
    expect(stats.frequency.N).toBe(1);
  });

  it('빈 서열', () => {
    const stats = computeBasicStats('');
    expect(stats.length).toBe(0);
    expect(stats.gcContent).toBe(0);
  });
});
