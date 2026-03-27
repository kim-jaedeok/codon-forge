import { describe, it, expect } from 'vitest';
import { extractFeatures } from '../lib/interpreter/featureExtractor';

describe('extractFeatures', () => {
  const GFP_DNA = 'ATGGTGAGCAAGGGCGAGGAGCTGTTCACCGGGGTGGTGCCCATCCTGGTCGAGCTGGACGGCGACGTAAACGGCCACAAGTTCAGCGTGTCCGGCGAGGGCGAGGGCGATGCCACCTACGGCAAGCTGACCCTGAAGTTCATCTGCACCACCGGCAAGCTGCCCGTGCCCTGGCCCACCCTCGTGACCACCCTGACCTACGGCGTGCAGTGCTTCAGCCGCTACCCCGACCACATGAAGCAGCACGACTTCTTCAAGTCCGCCATGCCCGAAGGCTACGTCCAGGAGCGCACCATCTTCTTCAAGGACGACGGCAACTACAAGACCCGCGCCGAGGTGAAGTTCGAGGGCGACACCCTGGTGAACCGCATCGAGCTGAAGGGCATCGACTTCAAGGAGGACGGCAACATCCTGGGGCACAAGCTGGAGTACAACTACAACAGCCACAACGTCTATATCATGGCCGACAAGCAGAAGAACGGCATCAAGGTGAACTTCAAGATCCGCCACAACATCGAGGACGGCAGCGTGCAGCTCGCCGACCACTACCAGCAGAACACCCCCATCGGCGACGGCCCCGTGCTGCTGCCCGACAACCACTACCTGAGCACCCAGTCCGCCCTGAGCAAAGACCCCAACGAGAAGCGCGATCACATGGTCCTGCTGGAGTTCGTGACCGCCGCCGGGATCACTCTCGGCATGGACGAGCTGTACAAGTAA';

  it('기본 통계 추출', () => {
    const features = extractFeatures(GFP_DNA);
    expect(features.basicStats.length).toBe(720);
    expect(features.basicStats.gcContent).toBeGreaterThan(0.5);
    expect(features.basicStats.gcContent).toBeLessThan(0.7);
  });

  it('ORF 정보 추출', () => {
    const features = extractFeatures(GFP_DNA);
    expect(features.orfs.count).toBeGreaterThan(0);
    expect(features.orfs.longest).not.toBeNull();
    expect(features.orfs.longest!.length).toBe(720);
  });

  it('코돈 편향 분석', () => {
    const features = extractFeatures(GFP_DNA);
    expect(features.codonBias.mostLikelyOrganism).toBeTruthy();
    expect(Object.keys(features.codonBias.caiScores).length).toBeGreaterThanOrEqual(6);
  });

  it('조절 요소 검색', () => {
    const features = extractFeatures(GFP_DNA);
    expect(features.regulatoryMotifs.length).toBeGreaterThan(0);
    for (const motif of features.regulatoryMotifs) {
      expect(motif.name).toBeTruthy();
      expect(motif.nameKo).toBeTruthy();
      expect(typeof motif.found).toBe('boolean');
    }
  });

  it('서열 스니펫', () => {
    const features = extractFeatures(GFP_DNA);
    expect(features.sequenceSnippet.first50.length).toBe(50);
    expect(features.sequenceSnippet.last50.length).toBe(50);
  });
});
