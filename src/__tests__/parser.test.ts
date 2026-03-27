import { describe, it, expect } from 'vitest';
import { detectFormat, parseFasta, cleanSequence, parseInput } from '../lib/parser';

describe('detectFormat', () => {
  it('FASTA 형식 감지', () => {
    expect(detectFormat('>header\nATGC')).toBe('fasta');
  });

  it('raw 서열 감지', () => {
    expect(detectFormat('ATGCGATCG')).toBe('raw');
  });

  it('빈 입력은 invalid', () => {
    expect(detectFormat('')).toBe('invalid');
    expect(detectFormat('   ')).toBe('invalid');
  });

  it('유효하지 않은 문자만 있으면 invalid', () => {
    expect(detectFormat('XYZQJ')).toBe('invalid');
  });

  it('IUPAC 모호성 코드 허용', () => {
    expect(detectFormat('ATGRYSWKM')).toBe('raw');
  });
});

describe('parseFasta', () => {
  it('정상적인 FASTA 파싱', () => {
    const result = parseFasta('>GFP gene\nATGGTGAGC\nAAGGGCGAG');
    expect(result).not.toBeNull();
    expect(result!.header).toBe('GFP gene');
    expect(result!.sequence).toBe('ATGGTGAGCAAGGGCGAG');
  });

  it('헤더 없으면 null', () => {
    expect(parseFasta('ATGCGATC')).toBeNull();
  });

  it('서열 없으면 null', () => {
    expect(parseFasta('>header only')).toBeNull();
  });

  it('공백과 숫자 제거', () => {
    const result = parseFasta('>test\n1 ATGC GATC\n2 TTAA');
    expect(result!.sequence).toBe('ATGCGATCTTAA');
  });
});

describe('cleanSequence', () => {
  it('대문자 변환', () => {
    expect(cleanSequence('atgc').sequence).toBe('ATGC');
  });

  it('공백/숫자 제거', () => {
    expect(cleanSequence('ATG 123 CGT\n').sequence).toBe('ATGCGT');
  });

  it('유효하지 않은 문자 제거 + 경고', () => {
    const result = cleanSequence('ATGXCGT');
    expect(result.sequence).toBe('ATGCGT');
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain('X');
  });
});

describe('parseInput', () => {
  it('FASTA 입력 정상 처리', () => {
    const result = parseInput('>test\nATGCGATC');
    expect(result).not.toBeNull();
    expect(result!.sequence).toBe('ATGCGATC');
    expect(result!.header).toBe('test');
  });

  it('raw 입력 정상 처리', () => {
    const result = parseInput('ATGCGATC');
    expect(result).not.toBeNull();
    expect(result!.sequence).toBe('ATGCGATC');
  });

  it('유효하지 않은 입력은 null', () => {
    expect(parseInput('XYZQJ!@#')).toBeNull();
  });
});
