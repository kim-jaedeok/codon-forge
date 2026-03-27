export interface RegulatoryMotif {
  name: string;
  nameKo: string;
  pattern: string;
  description: string;
}

export const REGULATORY_MOTIFS: RegulatoryMotif[] = [
  { name: 'TATA box', nameKo: 'TATA box', pattern: 'TATA[AT]A[AT]', description: 'Eukaryotic promoter core element' },
  { name: 'Kozak sequence', nameKo: 'Kozak sequence', pattern: '[AG]CC[AG]CCATGG', description: 'Eukaryotic translation initiation sequence' },
  { name: 'Poly-A signal', nameKo: 'Poly-A signal', pattern: 'AATAAA', description: 'Transcription termination and polyadenylation signal' },
  { name: 'Shine-Dalgarno', nameKo: 'Shine-Dalgarno', pattern: 'A?GGAG[GA]T?', description: 'Prokaryotic ribosome binding site' },
  { name: 'T7 promoter', nameKo: 'T7 promoter', pattern: 'TAATACGACTCACTATAG', description: 'T7 RNA polymerase promoter' },
  { name: 'SP6 promoter', nameKo: 'SP6 promoter', pattern: 'ATTTAGGTGACACTATA', description: 'SP6 RNA polymerase promoter' },
  { name: 'lac operator', nameKo: 'lac operator', pattern: 'AATTGTGAGCG[GC]ATAACAATT', description: 'lac operon regulatory sequence' },
];
