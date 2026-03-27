import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import type { OptimizationResult, OrganismId } from '../../types/optimizer';
import { Tabs } from '../ui/Tabs';
import { CopyButton } from '../ui/CopyButton';
import { CodonComparisonChart } from './CodonComparisonChart';
import { streamOptimizerInterpretation } from '../../lib/interpreter/optimizerInterpreter';
import { Markdown } from '../ui/Markdown';
import { computeBasicStats } from '../../lib/analysis/basicStats';
import { findRestrictionSites } from '../../lib/analysis/restrictionSites';
import { computeCodonUsage } from '../../lib/analysis/codonUsage';
import { computeGCWindow } from '../../lib/analysis/gcWindow';
import { RESTRICTION_ENZYMES } from '../../constants/restrictionEnzymes';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, ReferenceLine, CartesianGrid } from 'recharts';

function exportFasta(result: OptimizationResult): string {
  return `>Optimized_sequence length=${result.optimizedDNA.length}bp CAI=${result.caiAfterOptimization.toFixed(3)} GC=${(result.gcContentAfter * 100).toFixed(1)}%\n${result.optimizedDNA.match(/.{1,80}/g)?.join('\n') || result.optimizedDNA}`;
}

function exportGenBank(result: OptimizationResult): string {
  const len = result.optimizedDNA.length;
  const lines = [
    `LOCUS       Optimized        ${len} bp    DNA     linear   SYN`,
    `DEFINITION  Codon-optimized sequence, ${result.inputProtein.length} aa.`,
    `FEATURES             Location/Qualifiers`,
    `     CDS             1..${len}`,
    `                     /translation="${result.inputProtein}"`,
    `                     /note="CAI=${result.caiAfterOptimization.toFixed(3)}, GC=${(result.gcContentAfter * 100).toFixed(1)}%"`,
    `ORIGIN`,
  ];
  for (let i = 0; i < len; i += 60) {
    const num = String(i + 1).padStart(9);
    const chunks = [];
    for (let j = i; j < Math.min(i + 60, len); j += 10) {
      chunks.push(result.optimizedDNA.substring(j, Math.min(j + 10, len)));
    }
    lines.push(`${num} ${chunks.join(' ')}`);
  }
  lines.push('//');
  return lines.join('\n');
}

function downloadFile(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const NT_COLORS = { A: '#22c55e', T: '#ef4444', G: '#eab308', C: '#3b82f6' };

export function OptimizerResults({ result, organism }: { result: OptimizationResult; organism: OrganismId }) {
  const [tab, setTab] = useState(0);

  // AI interpretation state
  const [apiKey, setApiKey] = useState<string>(() => {
    try { return localStorage.getItem('claude-api-key') || ''; } catch { return ''; }
  });
  const [aiStatus, setAiStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [aiText, setAiText] = useState('');
  const [aiError, setAiError] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    try { localStorage.setItem('claude-api-key', apiKey); } catch { /* noop */ }
  }, [apiKey]);

  const runAI = useCallback(async () => {
    if (!apiKey.trim()) { setAiError('Please enter an API key.'); return; }
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setAiStatus('loading'); setAiText(''); setAiError('');
    try {
      let text = '';
      for await (const chunk of streamOptimizerInterpretation(apiKey, result, organism, controller.signal)) {
        text += chunk;
        setAiText(text);
      }
      setAiStatus('done');
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') { setAiStatus('idle'); return; }
      setAiStatus('error');
      setAiError(e instanceof Error ? e.message : 'AI interpretation error');
    }
  }, [apiKey, result, organism]);

  const stopAI = useCallback(() => {
    abortRef.current?.abort();
    setAiStatus(aiText ? 'done' : 'idle');
  }, [aiText]);

  const codingDNA = useMemo(() => {
    // Strip UTR if present (coding region = protein length * 3)
    const codingLen = result.inputProtein.length * 3;
    if (result.optimizedDNA.length > codingLen) {
      const offset = result.optimizedDNA.indexOf('ATG');
      return result.optimizedDNA.substring(offset >= 0 ? offset : 0, (offset >= 0 ? offset : 0) + codingLen);
    }
    return result.optimizedDNA;
  }, [result]);

  const stats = useMemo(() => computeBasicStats(codingDNA), [codingDNA]);
  const sites = useMemo(() => findRestrictionSites(codingDNA, RESTRICTION_ENZYMES), [codingDNA]);
  const codonUsage = useMemo(() => computeCodonUsage(codingDNA), [codingDNA]);
  const gcWindow = useMemo(() => computeGCWindow(codingDNA, 30, 3), [codingDNA]);

  const ntData = (['A', 'T', 'G', 'C'] as const).map(base => ({
    name: base, count: stats.frequency[base], pct: ((stats.frequency[base] / stats.frequency.total) * 100).toFixed(1),
  }));

  const gcData = gcWindow.map(d => ({ position: d.position, gc: +(d.gcContent * 100).toFixed(1) }));

  const uniqueEnzymes = [...new Set(sites.map(s => s.enzyme))];
  const topCodons = [...codonUsage].sort((a, b) => b.count - a.count).slice(0, 20);

  return (
    <div className="bg-white dark:bg-stone-800 rounded border border-stone-200 dark:border-stone-700 p-3">
      <h2 className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2">Optimization Results</h2>
      <Tabs tabs={['Sequence', 'Codon Usage', 'Analysis', 'Change Log', 'AI Analysis']} active={tab} onChange={setTab} />

      {tab === 0 && (
        <div className="space-y-4">
          {/* Key metrics */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'CAI', value: result.caiAfterOptimization.toFixed(3), highlight: true },
              { label: 'GC%', value: `${(result.gcContentAfter * 100).toFixed(1)}%` },
              { label: 'Length', value: `${result.optimizedDNA.length} bp` },
              { label: 'Changes', value: `${result.changes.length}` },
            ].map(m => (
              <div key={m.label} className="p-2 bg-stone-50 dark:bg-stone-700/50 rounded border border-stone-100 dark:border-stone-600">
                <p className="text-[10px] text-stone-400 uppercase tracking-wider">{m.label}</p>
                <p className={`text-lg font-mono font-bold ${m.highlight ? 'text-stone-900 dark:text-white' : 'text-stone-700 dark:text-stone-300'}`}>{m.value}</p>
              </div>
            ))}
          </div>

          {/* Optimized sequence */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[10px] text-stone-400 uppercase tracking-wider">Optimized DNA Sequence</h3>
              <div className="flex gap-2">
                <CopyButton text={result.optimizedDNA} />
                <button onClick={() => downloadFile(exportFasta(result), 'optimized.fasta')} className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600">FASTA</button>
                <button onClick={() => downloadFile(exportGenBank(result), 'optimized.gb')} className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600">GenBank</button>
              </div>
            </div>
            <div className="p-3 bg-stone-50 dark:bg-stone-700/50 rounded font-mono text-xs break-all leading-relaxed max-h-48 overflow-y-auto">
              {result.optimizedDNA}
            </div>
          </div>

          {/* Warnings */}
          {result.remainingViolations.length > 0 && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-xs font-medium text-yellow-700 dark:text-yellow-400 mb-1">Warnings ({result.remainingViolations.length})</p>
              {result.remainingViolations.map((v, i) => (
                <p key={i} className="text-xs text-yellow-600 dark:text-yellow-500">{v.description}</p>
              ))}
            </div>
          )}

          {/* Nucleotide chart */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-[10px] text-stone-400 uppercase tracking-wider mb-2">Nucleotide Composition</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={ntData} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: 'monospace', fill: '#78716c' }} axisLine={{ stroke: '#d6d3d1' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#a8a29e' }} axisLine={false} tickLine={false} width={35} />
                  <Tooltip formatter={(v) => `${Number(v).toLocaleString()}`} contentStyle={{ fontSize: 11, border: '1px solid #d6d3d1', borderRadius: 4, boxShadow: 'none' }} />
                  <Bar dataKey="count" radius={[1, 1, 0, 0]}>
                    {ntData.map(e => <Cell key={e.name} fill={NT_COLORS[e.name as keyof typeof NT_COLORS]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <CodonComparisonChart naiveDNA={result.naiveDNA} optimizedDNA={codingDNA} />
          </div>
        </div>
      )}

      {tab === 1 && (
        <div className="space-y-4">
          <p className="text-[10px] text-stone-400 uppercase tracking-wider">Top 20 Codons by Frequency</p>
          <div className="overflow-x-auto max-h-80 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-gray-50 dark:bg-gray-700">
                <tr className="text-left text-stone-500">
                  <th className="py-2 px-2">Codon</th>
                  <th className="py-2 px-2">Amino Acid</th>
                  <th className="py-2 px-2 text-right">Count</th>
                  <th className="py-2 px-2 text-right">Freq (/1000)</th>
                  <th className="py-2 px-2 text-right">RSCU</th>
                </tr>
              </thead>
              <tbody>
                {topCodons.map(entry => (
                  <tr key={entry.codon} className="border-t border-gray-100 dark:border-gray-700">
                    <td className="py-1 px-2 font-mono font-bold">{entry.codon}</td>
                    <td className="py-1 px-2">{entry.aminoAcid}</td>
                    <td className="py-1 px-2 text-right font-mono">{entry.count}</td>
                    <td className="py-1 px-2 text-right">{entry.frequency.toFixed(1)}</td>
                    <td className="py-1 px-2 text-right">{entry.fraction.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 2 && (
        <div className="space-y-4">
          {/* GC window */}
          <div>
            <h3 className="text-[10px] text-stone-400 uppercase tracking-wider mb-2">GC Content Distribution (window: 30bp)</h3>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={gcData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
                <XAxis dataKey="position" tick={{ fontSize: 10, fill: '#a8a29e' }} axisLine={{ stroke: '#d6d3d1' }} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#a8a29e' }} tickFormatter={(v: number) => `${v}%`} axisLine={false} tickLine={false} width={35} />
                <Tooltip formatter={(v) => [`${v}%`, 'GC']} labelFormatter={(l) => `pos: ${l}`} contentStyle={{ fontSize: 11, border: '1px solid #d6d3d1', borderRadius: 4, boxShadow: 'none' }} />
                <ReferenceLine y={result.gcContentAfter * 100} stroke="#a8a29e" strokeDasharray="3 3" strokeWidth={1} />
                <Line type="monotone" dataKey="gc" stroke="#57534e" dot={false} strokeWidth={1.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Restriction sites */}
          <div>
            <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">
              Restriction Sites ({sites.length} sites, {uniqueEnzymes.length} enzymes)
            </h3>
            {sites.length === 0 ? (
              <p className="text-xs text-stone-500 p-2 bg-stone-50 dark:bg-stone-700/50 rounded font-mono">No restriction sites detected</p>
            ) : (
              <div className="space-y-1">
                {uniqueEnzymes.map(enzyme => (
                  <div key={enzyme} className="flex items-center gap-2 text-sm">
                    <span className="font-mono font-semibold w-16">{enzyme}</span>
                    <div className="flex flex-wrap gap-1">
                      {sites.filter(s => s.enzyme === enzyme).map((s, i) => (
                        <span key={i} className="px-1.5 py-0.5 text-xs font-mono bg-gray-100 dark:bg-gray-700 rounded">{s.position}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 3 && (
        <div className="overflow-x-auto max-h-80 overflow-y-auto">
          {result.changes.length === 0 ? (
            <p className="text-xs text-stone-400 p-4 text-center font-mono">No changes made</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50 dark:bg-gray-700">
                <tr className="text-left text-stone-500">
                  <th className="py-2 px-2">Position</th>
                  <th className="py-2 px-2">AA</th>
                  <th className="py-2 px-2">Original</th>
                  <th className="py-2 px-2">Changed</th>
                  <th className="py-2 px-2">Reason</th>
                </tr>
              </thead>
              <tbody>
                {result.changes.map((c, i) => (
                  <tr key={i} className="border-t border-gray-100 dark:border-gray-700">
                    <td className="py-1 px-2 font-mono">{c.position + 1}</td>
                    <td className="py-1 px-2 font-mono font-bold">{c.aminoAcid}</td>
                    <td className="py-1 px-2 font-mono text-red-500">{c.originalCodon}</td>
                    <td className="py-1 px-2 font-mono text-stone-900 dark:text-stone-100">{c.optimizedCodon}</td>
                    <td className="py-1 px-2 text-xs text-stone-500">{c.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 4 && (
        <div className="space-y-3">
          {/* API Key */}
          <div className="flex items-center gap-2 p-2 bg-stone-50 dark:bg-stone-700/50 border border-stone-200 dark:border-stone-600 rounded">
            <span className="text-[10px] text-stone-400 uppercase tracking-wider whitespace-nowrap">API Key</span>
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="sk-ant-..."
              className="flex-1 px-2 py-1 text-xs font-mono bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded focus:outline-none focus:border-stone-500"
            />
            {apiKey && <span className="text-[10px] text-stone-400">saved</span>}
          </div>

          {/* Action */}
          <div className="flex items-center gap-2">
            {aiStatus === 'loading' ? (
              <button onClick={stopAI} className="px-3 py-1.5 bg-red-700 text-white text-xs font-medium rounded hover:bg-red-800 transition-colors">
                Stop
              </button>
            ) : (
              <button
                onClick={runAI}
                disabled={!apiKey.trim()}
                className="px-3 py-1.5 bg-stone-900 dark:bg-stone-200 text-white dark:text-stone-900 text-xs font-medium rounded hover:bg-stone-800 dark:hover:bg-stone-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Run AI Analysis
              </button>
            )}
            <span className="text-[10px] text-stone-400">Analyzes optimization quality, predicts expression, suggests cloning strategy</span>
          </div>

          {/* Error */}
          {aiError && (
            <div className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded text-xs text-red-600 dark:text-red-400">
              {aiError}
            </div>
          )}

          {/* Streaming output */}
          {aiText && (
            <div className="border border-stone-200 dark:border-stone-600 rounded p-3">
              <Markdown text={aiText} />
              {aiStatus === 'loading' && (
                <span className="inline-block w-1.5 h-3 bg-stone-400 animate-pulse mt-1" />
              )}
            </div>
          )}

          {/* Empty state */}
          {!aiText && aiStatus === 'idle' && !aiError && (
            <div className="p-6 text-center border border-dashed border-stone-300 dark:border-stone-600 rounded">
              <p className="text-xs text-stone-400">
                AI analysis will evaluate CAI score, GC content, predict expression level,
                and suggest optimal vector, tags, and culture conditions for your target organism.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
