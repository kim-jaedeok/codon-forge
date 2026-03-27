import type { ExtractedFeatures } from '../../types/interpreter';

function buildPrompt(features: ExtractedFeatures): string {
  const motifLines = features.regulatoryMotifs
    .map(m => `- ${m.nameKo}: ${m.found ? `Found (positions: ${m.positions.join(', ')})` : 'Not found'}`)
    .join('\n');

  const caiLines = Object.entries(features.codonBias.caiScores)
    .sort((a, b) => b[1] - a[1])
    .map(([org, score]) => `  - ${org}: ${score}`)
    .join('\n');

  return `Interpret the following DNA sequence analysis results.

### Basic Information
- Length: ${features.basicStats.length} bp
- GC content: ${(features.basicStats.gcContent * 100).toFixed(1)}%

### ORF Analysis
- ORFs found: ${features.orfs.count}
${features.orfs.longest ? `- Longest ORF: frame ${features.orfs.longest.frame}, ${features.orfs.longest.length}nt (${features.orfs.longest.aaCount} amino acids)` : '- No ORFs found'}

### Restriction Sites
- ${features.restrictionSites.totalSites} sites (${features.restrictionSites.enzymeCount} enzymes: ${features.restrictionSites.enzymes.join(', ') || 'none'})

### Codon Usage Bias (CAI Scores)
- Most similar organism: ${features.codonBias.mostLikelyOrganism}
${caiLines}

### Regulatory Elements
${motifLines}

### Sequence Snippet
5' start: ${features.sequenceSnippet.first50}
3' end: ${features.sequenceSnippet.last50}`;
}

const SYSTEM_PROMPT = `You are a molecular biology expert. Provide a comprehensive interpretation of DNA sequence analysis data.

Response format:
## Sequence Identification
[Identify what this sequence likely is — known gene, synthetic construct, vector backbone, etc.]

## Key Features
[Notable aspects of GC content, ORF structure, codon usage bias, etc.]

## Functional Interpretation
[Significance of regulatory elements found, restriction sites, expression potential, etc.]

## Experimental Suggestions
[2-3 practical experimental approaches using this sequence.]

Be professional yet accessible. Clearly mark speculative conclusions.`;

export async function* streamInterpretation(
  apiKey: string,
  features: ExtractedFeatures,
  signal?: AbortSignal,
): AsyncGenerator<string, void, unknown> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      stream: true,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildPrompt(features) }],
    }),
    signal,
  });

  if (!response.ok) {
    const text = await response.text();
    if (response.status === 401) throw new Error('Invalid API key.');
    if (response.status === 429) throw new Error('API rate limit exceeded. Please try again later.');
    throw new Error(`API error (${response.status}): ${text.substring(0, 200)}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('Streaming is not supported in this environment.');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.substring(6).trim();
      if (data === '[DONE]') return;

      try {
        const event = JSON.parse(data);
        if (event.type === 'content_block_delta' && event.delta?.text) {
          yield event.delta.text;
        }
        if (event.type === 'message_stop') return;
        if (event.type === 'error') throw new Error(event.error?.message || 'API streaming error');
      } catch (e) {
        if (e instanceof SyntaxError) continue;
        throw e;
      }
    }
  }
}
