import { describe, it, expect } from 'vitest';
import { translateDNA } from '../lib/analysis/translation';

describe('translateDNA', () => {
  it('ATG → M (메티오닌)', () => {
    expect(translateDNA('ATG')).toBe('M');
  });

  it('종료 코돈 → *', () => {
    expect(translateDNA('TAA')).toBe('*');
    expect(translateDNA('TAG')).toBe('*');
    expect(translateDNA('TGA')).toBe('*');
  });

  it('다중 코돈 번역', () => {
    expect(translateDNA('ATGAAATTT')).toBe('MKF');
  });

  it('프레임 오프셋', () => {
    expect(translateDNA('XATGAAA', 1)).toBe('MK');
  });

  it('불완전 코돈 무시', () => {
    expect(translateDNA('ATGA')).toBe('M'); // 마지막 A는 무시
  });
});
