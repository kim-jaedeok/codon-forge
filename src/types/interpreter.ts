export interface ExtractedFeatures {
  basicStats: {
    length: number;
    gcContent: number;
  };
  orfs: {
    count: number;
    longest: { frame: number; length: number; aaCount: number } | null;
  };
  restrictionSites: {
    enzymeCount: number;
    totalSites: number;
    enzymes: string[];
  };
  codonBias: {
    mostLikelyOrganism: string;
    caiScores: Record<string, number>;
  };
  regulatoryMotifs: {
    name: string;
    nameKo: string;
    found: boolean;
    positions: number[];
  }[];
  sequenceSnippet: {
    first50: string;
    last50: string;
  };
}

export interface InterpreterState {
  status: 'idle' | 'extracting' | 'interpreting' | 'done' | 'error';
  features: ExtractedFeatures | null;
  interpretation: string;
  error: string | null;
}
