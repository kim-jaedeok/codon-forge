export type OrganismId =
  | 'ecoli' | 'yeast' | 'human' | 'celegans' | 'drosophila' | 'arabidopsis'
  | 'mouse' | 'rat' | 'zebrafish' | 'cho' | 'pichia' | 'bacillus'
  | 'pseudomonas' | 'tobacco' | 'corn'
  | 'custom';

export interface OrganismInfo {
  id: OrganismId;
  name: string;
  scientificName: string;
  gcRange: [number, number];
}

export interface OptimizationOptions {
  organism: OrganismId;
  customCodonTable?: CodonFrequencyTable;
  gcTarget: [number, number];
  avoidEnzymes: string[];
  removeRepeats: boolean;
  avoidHomopolymers: boolean;
  avoidSecondaryStructure: boolean;
  useCodonHarmony: boolean;
  addUTR: boolean;
  utrOrganism?: 'prokaryote' | 'eukaryote';
}

export interface CodonChange {
  position: number;
  aminoAcid: string;
  originalCodon: string;
  optimizedCodon: string;
  reason: string;
}

export interface ConstraintViolation {
  type: 'gc_content' | 'restriction_site' | 'tandem_repeat' | 'homopolymer' | 'secondary_structure';
  position: number;
  description: string;
}

export interface OptimizationResult {
  inputProtein: string;
  optimizedDNA: string;
  naiveDNA: string;
  caiBeforeOptimization: number;
  caiAfterOptimization: number;
  gcContentBefore: number;
  gcContentAfter: number;
  changes: CodonChange[];
  remainingViolations: ConstraintViolation[];
}

export type CodonFrequencyTable = Record<string, number>;
