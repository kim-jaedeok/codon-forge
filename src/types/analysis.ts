export interface BasicStats {
  length: number;
  frequency: import('./sequence').NucleotideFrequency;
  gcContent: number;
}

export interface ORF {
  frame: number;
  start: number;
  end: number;
  length: number;
  aminoAcidSequence: string;
}

export interface RestrictionSite {
  enzyme: string;
  recognitionSequence: string;
  position: number;
  strand: '+' | '-';
}

export interface MotifMatch {
  pattern: string;
  start: number;
  end: number;
  matchedSequence: string;
  strand: '+' | '-';
}

export interface CodonUsageEntry {
  codon: string;
  aminoAcid: string;
  count: number;
  frequency: number;
  fraction: number;
}

export interface GCWindowPoint {
  position: number;
  gcContent: number;
}

export interface RestrictionEnzyme {
  name: string;
  recognitionSequence: string;
  cutOffset5: number;
  cutOffset3: number;
  overhang: 'sticky5' | 'sticky3' | 'blunt';
}
