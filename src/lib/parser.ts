export function detectFormat(input: string): 'fasta' | 'raw' | 'invalid' {
  const trimmed = input.trim();
  if (!trimmed) return 'invalid';
  if (trimmed.startsWith('>')) return 'fasta';
  const cleaned = trimmed.replace(/[\s\d]/g, '').toUpperCase();
  if (/^[ATGCNRYSWKMBDHV]+$/.test(cleaned)) return 'raw';
  return 'invalid';
}

export function parseFasta(input: string): { header: string; sequence: string } | null {
  const lines = input.trim().split('\n');
  if (!lines[0]?.startsWith('>')) return null;
  const header = lines[0].substring(1).trim();
  const sequence = lines
    .slice(1)
    .filter(l => !l.startsWith('>'))
    .join('')
    .replace(/[\s\d]/g, '')
    .toUpperCase();
  if (!sequence) return null;
  return { header, sequence };
}

export function cleanSequence(input: string): { sequence: string; warnings: string[] } {
  const warnings: string[] = [];
  let cleaned = input.replace(/[\s\d\n\r]/g, '').toUpperCase();

  const invalid = cleaned.replace(/[ATGCNRYSWKMBDHV]/g, '');
  if (invalid.length > 0) {
    const unique = [...new Set(invalid)].join(', ');
    warnings.push(`Removed characters: ${unique}`);
    cleaned = cleaned.replace(/[^ATGCNRYSWKMBDHV]/g, '');
  }

  const ambiguous = cleaned.replace(/[ATGCN]/g, '');
  if (ambiguous.length > 0) {
    warnings.push(`Contains ${ambiguous.length} IUPAC ambiguity codes`);
  }

  return { sequence: cleaned, warnings };
}

export function parseInput(input: string): {
  sequence: string;
  header?: string;
  warnings: string[];
} | null {
  const format = detectFormat(input);
  if (format === 'invalid') return null;

  if (format === 'fasta') {
    const parsed = parseFasta(input);
    if (!parsed) return null;
    const { sequence, warnings } = cleanSequence(parsed.sequence);
    return { sequence, header: parsed.header, warnings };
  }

  const { sequence, warnings } = cleanSequence(input);
  if (!sequence) return null;
  return { sequence, warnings };
}
