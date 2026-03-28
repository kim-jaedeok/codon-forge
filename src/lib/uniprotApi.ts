export interface UniProtResult {
  accession: string;
  name: string;
  organism: string;
  sequence: string;
  length: number;
}

export async function searchUniProt(query: string): Promise<UniProtResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  // Direct accession lookup (e.g., P01308)
  if (/^[A-Z][0-9][A-Z0-9]{3}[0-9]$/i.test(trimmed) || /^[A-Z][0-9][A-Z0-9]{3}[0-9]-\d+$/i.test(trimmed)) {
    try {
      const res = await fetch(`https://rest.uniprot.org/uniprotkb/${trimmed.toUpperCase()}.json`);
      if (res.ok) {
        const data = await res.json();
        return [{
          accession: data.primaryAccession,
          name: data.proteinDescription?.recommendedName?.fullName?.value || data.proteinDescription?.submissionNames?.[0]?.fullName?.value || trimmed,
          organism: data.organism?.scientificName || '',
          sequence: data.sequence?.value || '',
          length: data.sequence?.length || 0,
        }];
      }
    } catch { /* fall through to search */ }
  }

  // Full-text search
  const url = `https://rest.uniprot.org/uniprotkb/search?query=${encodeURIComponent(trimmed)}&format=json&size=5&fields=accession,protein_name,organism_name,sequence`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`UniProt search failed (${res.status})`);

  const data = await res.json();
  return (data.results || []).map((r: Record<string, unknown>) => {
    const desc = r.proteinDescription as Record<string, unknown> | undefined;
    const recName = desc?.recommendedName as Record<string, unknown> | undefined;
    const fullName = recName?.fullName as Record<string, string> | undefined;
    const subNames = desc?.submissionNames as Array<Record<string, Record<string, string>>> | undefined;
    const org = r.organism as Record<string, string> | undefined;
    const seq = r.sequence as Record<string, unknown> | undefined;

    return {
      accession: (r.primaryAccession as string) || '',
      name: fullName?.value || subNames?.[0]?.fullName?.value || '',
      organism: org?.scientificName || '',
      sequence: (seq?.value as string) || '',
      length: (seq?.length as number) || 0,
    };
  });
}
