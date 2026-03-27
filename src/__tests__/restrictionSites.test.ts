import { describe, it, expect } from 'vitest';
import { findRestrictionSites } from '../lib/analysis/restrictionSites';
import { RESTRICTION_ENZYMES } from '../constants/restrictionEnzymes';

describe('findRestrictionSites', () => {
  it('EcoRI(GAATTC) 부위 탐지', () => {
    const seq = 'AAAGAATTCGGG';
    const sites = findRestrictionSites(seq, RESTRICTION_ENZYMES);
    const ecori = sites.filter(s => s.enzyme === 'EcoRI');
    expect(ecori.length).toBe(1);
    expect(ecori[0].position).toBe(3);
  });

  it('다중 부위 탐지', () => {
    const seq = 'GAATTCAAAGAATTC';
    const sites = findRestrictionSites(seq, RESTRICTION_ENZYMES);
    const ecori = sites.filter(s => s.enzyme === 'EcoRI');
    expect(ecori.length).toBe(2);
  });

  it('없는 부위', () => {
    const seq = 'ATGATGATGATG';
    const sites = findRestrictionSites(seq, RESTRICTION_ENZYMES);
    expect(sites.length).toBe(0);
  });

  it('BamHI(GGATCC) 탐지', () => {
    const seq = 'GGATCC';
    const sites = findRestrictionSites(seq, RESTRICTION_ENZYMES);
    const bamhi = sites.filter(s => s.enzyme === 'BamHI');
    expect(bamhi.length).toBe(1);
  });
});
