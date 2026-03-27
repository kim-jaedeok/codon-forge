import { describe, it, expect } from 'vitest';
import { computeGCWindow } from '../lib/analysis/gcWindow';

describe('computeGCWindow', () => {
  it('전체 GC 서열', () => {
    const points = computeGCWindow('GGCCGGCCGGCC', 4, 4);
    for (const p of points) {
      expect(p.gcContent).toBe(1.0);
    }
  });

  it('전체 AT 서열', () => {
    const points = computeGCWindow('AATTAATTAATT', 4, 4);
    for (const p of points) {
      expect(p.gcContent).toBe(0.0);
    }
  });

  it('윈도우보다 짧은 서열', () => {
    const points = computeGCWindow('ATGC', 100);
    expect(points.length).toBe(1);
    expect(points[0].gcContent).toBe(0.5);
  });

  it('포인트 수 확인', () => {
    const seq = 'A'.repeat(200);
    const points = computeGCWindow(seq, 100, 10);
    expect(points.length).toBeGreaterThan(1);
    expect(points[0].position).toBe(0);
  });
});
