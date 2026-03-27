import type { OptimizationResult } from '../../types/optimizer';
import { ORGANISMS } from '../../constants/organismCodonUsage';
import type { OrganismId } from '../../types/optimizer';

const SYSTEM_PROMPT = `You are a molecular biology and protein expression expert. Analyze codon optimization results and provide practical experimental advice.

Response format:
## Optimization Quality Assessment
[Evaluate CAI, GC content, and constraint modifications. Judge overall optimization quality.]

## Expression Prediction
[Predict how well this sequence will express in the target organism. Identify potential issues.]

## Expression Strategy
[Suggest optimal expression conditions: vector choice, fusion tags, culture conditions, induction parameters. Include specific conditions (temperature, time, concentrations).]

## Cloning Strategy
[Recommend vectors, restriction sites, and primer design approach.]

Be professional and practical. Include specific experimental conditions.`;

function buildPrompt(result: OptimizationResult, organism: OrganismId): string {
  const orgInfo = ORGANISMS.find(o => o.id === organism);
  const orgName = orgInfo?.name || organism;

  const changesByReason: Record<string, number> = {};
  for (const c of result.changes) {
    changesByReason[c.reason] = (changesByReason[c.reason] || 0) + 1;
  }
  const changeSummary = Object.entries(changesByReason)
    .map(([reason, count]) => `  - ${reason}: ${count}`)
    .join('\n');

  return `Analyze the following codon optimization result and suggest an expression strategy.

### Basic Information
- Target organism: ${orgName}
- Protein length: ${result.inputProtein.length} amino acids
- Optimized DNA length: ${result.optimizedDNA.length} bp

### Optimization Metrics
- CAI (before): ${result.caiBeforeOptimization.toFixed(4)}
- CAI (after): ${result.caiAfterOptimization.toFixed(4)}
- GC content (before): ${(result.gcContentBefore * 100).toFixed(1)}%
- GC content (after): ${(result.gcContentAfter * 100).toFixed(1)}%

### Change Log (${result.changes.length} changes)
${changeSummary || '  - No changes'}

### Remaining Warnings (${result.remainingViolations.length})
${result.remainingViolations.map(v => `  - ${v.description}`).join('\n') || '  - None'}

### Protein Sequence (first 100 AA)
${result.inputProtein.substring(0, 100)}${result.inputProtein.length > 100 ? '...' : ''}

### Optimized DNA Sequence (first 150 bp)
${result.optimizedDNA.substring(0, 150)}${result.optimizedDNA.length > 150 ? '...' : ''}`;
}

export async function* streamOptimizerInterpretation(
  apiKey: string,
  result: OptimizationResult,
  organism: OrganismId,
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
      messages: [{ role: 'user', content: buildPrompt(result, organism) }],
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
