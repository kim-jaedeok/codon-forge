import { parseFasta, cleanSequence } from './parser';

const NCBI_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

export async function fetchByAccession(accession: string): Promise<{
  header: string;
  sequence: string;
  accession: string;
}> {
  const trimmed = accession.trim();
  if (!trimmed) throw new Error('Please enter an accession number.');

  const url = `${NCBI_BASE}/efetch.fcgi?db=nuccore&id=${encodeURIComponent(trimmed)}&rettype=fasta&retmode=text`;

  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 400 || response.status === 404) {
      throw new Error(`Invalid accession number: ${trimmed}`);
    }
    throw new Error(`NCBI server error (${response.status})`);
  }

  const text = await response.text();

  if (text.includes('Error') && text.includes('Cannot')) {
    throw new Error(`Invalid accession number: ${trimmed}`);
  }

  const parsed = parseFasta(text);
  if (!parsed) throw new Error('Failed to parse NCBI response.');

  const { sequence } = cleanSequence(parsed.sequence);

  if (sequence.length > 100000) {
    throw new Error(`Sequence is too long (${sequence.length}bp). Only sequences up to 100kb are supported.`);
  }

  return {
    header: parsed.header,
    sequence,
    accession: trimmed,
  };
}
