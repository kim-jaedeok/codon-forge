import type { RestrictionEnzyme } from '../types/analysis';

export const RESTRICTION_ENZYMES: RestrictionEnzyme[] = [
  { name: 'EcoRI',  recognitionSequence: 'GAATTC',   cutOffset5: 1, cutOffset3: 5, overhang: 'sticky5' },
  { name: 'BamHI',  recognitionSequence: 'GGATCC',   cutOffset5: 1, cutOffset3: 5, overhang: 'sticky5' },
  { name: 'HindIII',recognitionSequence: 'AAGCTT',   cutOffset5: 1, cutOffset3: 5, overhang: 'sticky5' },
  { name: 'NotI',   recognitionSequence: 'GCGGCCGC', cutOffset5: 2, cutOffset3: 6, overhang: 'sticky5' },
  { name: 'XbaI',   recognitionSequence: 'TCTAGA',   cutOffset5: 1, cutOffset3: 5, overhang: 'sticky5' },
  { name: 'SalI',   recognitionSequence: 'GTCGAC',   cutOffset5: 1, cutOffset3: 5, overhang: 'sticky5' },
  { name: 'PstI',   recognitionSequence: 'CTGCAG',   cutOffset5: 5, cutOffset3: 1, overhang: 'sticky3' },
  { name: 'SmaI',   recognitionSequence: 'CCCGGG',   cutOffset5: 3, cutOffset3: 3, overhang: 'blunt' },
  { name: 'KpnI',   recognitionSequence: 'GGTACC',   cutOffset5: 5, cutOffset3: 1, overhang: 'sticky3' },
  { name: 'SacI',   recognitionSequence: 'GAGCTC',   cutOffset5: 5, cutOffset3: 1, overhang: 'sticky3' },
  { name: 'NcoI',   recognitionSequence: 'CCATGG',   cutOffset5: 1, cutOffset3: 5, overhang: 'sticky5' },
  { name: 'NdeI',   recognitionSequence: 'CATATG',   cutOffset5: 2, cutOffset3: 4, overhang: 'sticky5' },
  { name: 'XhoI',   recognitionSequence: 'CTCGAG',   cutOffset5: 1, cutOffset3: 5, overhang: 'sticky5' },
  { name: 'BglII',  recognitionSequence: 'AGATCT',   cutOffset5: 1, cutOffset3: 5, overhang: 'sticky5' },
  { name: 'EcoRV',  recognitionSequence: 'GATATC',   cutOffset5: 3, cutOffset3: 3, overhang: 'blunt' },
  { name: 'NheI',   recognitionSequence: 'GCTAGC',   cutOffset5: 1, cutOffset3: 5, overhang: 'sticky5' },
  { name: 'ClaI',   recognitionSequence: 'ATCGAT',   cutOffset5: 2, cutOffset3: 4, overhang: 'sticky5' },
  { name: 'ScaI',   recognitionSequence: 'AGTACT',   cutOffset5: 3, cutOffset3: 3, overhang: 'blunt' },
  { name: 'AvrII',  recognitionSequence: 'CCTAGG',   cutOffset5: 1, cutOffset3: 5, overhang: 'sticky5' },
  { name: 'MluI',   recognitionSequence: 'ACGCGT',   cutOffset5: 1, cutOffset3: 5, overhang: 'sticky5' },
];
