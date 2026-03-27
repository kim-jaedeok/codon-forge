export interface DNASequence {
  raw: string;
  header?: string;
  accession?: string;
  length: number;
}

export interface NucleotideFrequency {
  A: number;
  T: number;
  G: number;
  C: number;
  N: number;
  total: number;
}
