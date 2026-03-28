import { useState, useCallback } from 'react';
import { useCodonOptimizer } from '../../hooks/useCodonOptimizer';
import { ProteinInput } from './ProteinInput';
import { OrganismSelector } from './OrganismSelector';
import { OptionsPanel } from './OptionsPanel';
import { OptimizerResults } from './OptimizerResults';
import { Tabs } from '../ui/Tabs';
import type { CodonFrequencyTable } from '../../types/optimizer';
import { searchUniProt } from '../../lib/uniprotApi';
import type { UniProtResult } from '../../lib/uniprotApi';

function parseCustomTable(text: string): CodonFrequencyTable | null {
  try {
    const table: CodonFrequencyTable = {};
    const lines = text.trim().split('\n');
    for (const line of lines) {
      const parts = line.trim().split(/[\t,\s]+/);
      if (parts.length >= 2) {
        const codon = parts[0].toUpperCase();
        const freq = parseFloat(parts[1]);
        if (/^[ATGC]{3}$/.test(codon) && !isNaN(freq)) {
          table[codon] = freq;
        }
      }
    }
    return Object.keys(table).length === 64 ? table : null;
  } catch {
    return null;
  }
}

export function OptimizerPage() {
  const opt = useCodonOptimizer();
  const [inputMode, setInputMode] = useState(0);
  const [paramsOpen, setParamsOpen] = useState(true);
  const [uniprotQuery, setUniprotQuery] = useState('');
  const [uniprotResults, setUniprotResults] = useState<UniProtResult[]>([]);
  const [uniprotLoading, setUniprotLoading] = useState(false);
  const [uniprotError, setUniprotError] = useState('');
  const [batchQueue, setBatchQueue] = useState<{ name: string; sequence: string }[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<number | null>(null);

  const handleUniprotSearch = useCallback(async () => {
    if (!uniprotQuery.trim()) return;
    setUniprotLoading(true);
    setUniprotError('');
    try {
      const results = await searchUniProt(uniprotQuery);
      setUniprotResults(results);
      if (results.length === 0) setUniprotError('No results found.');
    } catch (e) {
      setUniprotError(e instanceof Error ? e.message : 'Search failed');
    }
    setUniprotLoading(false);
  }, [uniprotQuery]);

  const addToBatch = useCallback((r: UniProtResult) => {
    setBatchQueue(prev => {
      if (prev.some(p => p.name === r.accession)) return prev;
      return [...prev, { name: `${r.accession} ${r.name} [${r.organism}]`, sequence: r.sequence }];
    });
  }, []);

  const runBatchFromQueue = useCallback(() => {
    const fasta = batchQueue.map(b => `>${b.name}\n${b.sequence}`).join('\n');
    opt.setBatchInput(fasta);
    opt.batchOptimize(fasta);
  }, [batchQueue, opt]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(340px,1fr)_2fr] gap-6">
      <div className="space-y-4">
        <div className="bg-white dark:bg-stone-800 rounded border border-stone-200 dark:border-stone-700">
          <button
            onClick={() => setParamsOpen(!paramsOpen)}
            className="w-full flex items-center justify-between p-4 text-sm font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700/50 transition-colors"
          >
            <span>Parameters</span>
            <svg className={`w-4 h-4 text-stone-400 transition-transform ${paramsOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {paramsOpen && (
            <div className="px-4 pb-4 space-y-4 border-t border-stone-100 dark:border-stone-700 pt-3">
              <OrganismSelector value={opt.organism} onChange={opt.setOrganism} />
              <OptionsPanel
                avoidEnzymes={opt.avoidEnzymes} onAvoidEnzymesChange={opt.setAvoidEnzymes}
                removeRepeats={opt.removeRepeats} onRemoveRepeatsChange={opt.setRemoveRepeats}
                avoidHomopolymers={opt.avoidHomopolymers} onAvoidHomopolymersChange={opt.setAvoidHomopolymers}
                avoidSecondaryStructure={opt.avoidSecondaryStructure} onAvoidSecondaryStructureChange={opt.setAvoidSecondaryStructure}
                useCodonHarmony={opt.useCodonHarmony} onUseCodonHarmonyChange={opt.setUseCodonHarmony}
                addUTR={opt.addUTR} onAddUTRChange={opt.setAddUTR}
                utrOrganism={opt.utrOrganism} onUtrOrganismChange={opt.setUtrOrganism}
              />
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-stone-800 rounded border border-stone-200 dark:border-stone-700 p-4">
          <h2 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-3">Sequence Input</h2>
          <Tabs tabs={['Single', 'UniProt', 'Batch', 'Custom Table']} active={inputMode} onChange={setInputMode} />

          {inputMode === 0 && (
            <ProteinInput value={opt.protein} onChange={opt.setProtein} onOptimize={opt.optimize} error={opt.error} />
          )}

          {inputMode === 1 && (
            <div className="space-y-3">
              <form onSubmit={e => { e.preventDefault(); handleUniprotSearch(); }} className="flex gap-2">
                <input
                  type="text"
                  value={uniprotQuery}
                  onChange={e => setUniprotQuery(e.target.value)}
                  placeholder="Protein name or UniProt ID (e.g., human insulin, P01308)"
                  className="flex-1 px-3 py-2 text-sm bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded focus:outline-none focus:border-stone-500"
                />
                <button
                  type="submit"
                  disabled={!uniprotQuery.trim() || uniprotLoading}
                  className="px-4 py-2 bg-stone-900 dark:bg-stone-200 text-white dark:text-stone-900 text-sm font-medium rounded hover:bg-stone-800 dark:hover:bg-stone-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                >
                  {uniprotLoading ? 'Searching...' : 'Search'}
                </button>
              </form>
              {uniprotError && <p className="text-xs text-red-500">{uniprotError}</p>}
              {uniprotResults.length > 0 && (
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {uniprotResults.map(r => (
                    <div
                      key={r.accession}
                      className="flex items-center gap-2 p-2 rounded border border-stone-200 dark:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-stone-800 dark:text-stone-200 truncate">{r.name || r.accession}</span>
                          <span className="text-[10px] font-mono text-stone-400 shrink-0">{r.accession} | {r.length} aa</span>
                        </div>
                        <p className="text-xs text-stone-500 truncate">{r.organism}</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => { opt.setProtein(r.sequence); setInputMode(0); }}
                          className="px-2 py-1 text-xs bg-stone-900 dark:bg-stone-200 text-white dark:text-stone-900 rounded hover:bg-stone-800 dark:hover:bg-stone-300 transition-colors"
                        >
                          Use
                        </button>
                        <button
                          onClick={() => addToBatch(r)}
                          disabled={batchQueue.some(b => b.name.startsWith(r.accession))}
                          className="px-2 py-1 text-xs border border-stone-300 dark:border-stone-600 text-stone-600 dark:text-stone-400 rounded hover:bg-stone-100 dark:hover:bg-stone-700 disabled:opacity-30 transition-colors"
                        >
                          + Batch
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Batch queue */}
              {batchQueue.length > 0 && (
                <div className="border-t border-stone-200 dark:border-stone-700 pt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-stone-600 dark:text-stone-400">Batch Queue ({batchQueue.length})</span>
                    <button onClick={() => setBatchQueue([])} className="text-[10px] text-stone-400 hover:text-stone-600 underline">Clear</button>
                  </div>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {batchQueue.map((b, i) => (
                      <div key={i} className="flex items-center justify-between text-xs text-stone-500 bg-stone-50 dark:bg-stone-700/50 rounded px-2 py-1">
                        <span className="truncate">{b.name}</span>
                        <button onClick={() => setBatchQueue(prev => prev.filter((_, j) => j !== i))} className="text-stone-400 hover:text-red-500 ml-2 shrink-0">x</button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={runBatchFromQueue}
                    className="w-full px-4 py-2 bg-stone-900 dark:bg-stone-200 text-white dark:text-stone-900 text-sm font-medium rounded hover:bg-stone-800 dark:hover:bg-stone-300 transition-colors"
                  >
                    Run Batch ({batchQueue.length} sequences)
                  </button>
                </div>
              )}
            </div>
          )}

          {inputMode === 2 && (
            <div className="space-y-2">
              {/* File drop zone */}
              <div
                className="border-2 border-dashed border-stone-300 dark:border-stone-600 rounded p-4 text-center cursor-pointer hover:border-stone-400 dark:hover:border-stone-500 transition-colors"
                onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('border-stone-500'); }}
                onDragLeave={e => { e.currentTarget.classList.remove('border-stone-500'); }}
                onDrop={e => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('border-stone-500');
                  const file = e.dataTransfer.files[0];
                  if (file) file.text().then(text => opt.setBatchInput(text));
                }}
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.fasta,.fa,.faa,.txt';
                  input.onchange = () => {
                    const file = input.files?.[0];
                    if (file) file.text().then(text => opt.setBatchInput(text));
                  };
                  input.click();
                }}
              >
                <p className="text-sm text-stone-400">Drop FASTA file here or click to browse</p>
                <p className="text-xs text-stone-300 mt-1">.fasta, .fa, .faa, .txt</p>
              </div>
              <textarea
                value={opt.batchInput}
                onChange={e => opt.setBatchInput(e.target.value)}
                placeholder={">Protein1\nMVSKGEELFT...\n>Protein2\nMKWVTFISL..."}
                className="w-full h-28 p-3 text-sm font-mono bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded focus:outline-none focus:border-stone-500 resize-y"
                spellCheck={false}
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => opt.batchOptimize()}
                  disabled={!opt.batchInput.trim()}
                  className="px-4 py-2 bg-stone-900 dark:bg-stone-200 text-white dark:text-stone-900 text-sm font-medium rounded hover:bg-stone-800 dark:hover:bg-stone-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Run Batch
                </button>
                {opt.batchInput && (
                  <span className="text-xs text-stone-400 font-mono">
                    {(opt.batchInput.match(/>/g) || []).length} sequences
                  </span>
                )}
              </div>
              {opt.error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded text-sm text-red-600 dark:text-red-400">
                  {opt.error}
                </div>
              )}
            </div>
          )}

          {inputMode === 3 && (
            <div className="space-y-3">
              <p className="text-xs text-stone-500">
                1. Paste codon frequency table (64 codons, per 1000)
              </p>
              <textarea
                placeholder="TTT  17.6&#10;TTC  20.3&#10;TTA  7.7&#10;..."
                className="w-full h-24 p-3 text-sm font-mono bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded focus:outline-none focus:border-stone-500 resize-y"
                onChange={e => {
                  const table = parseCustomTable(e.target.value);
                  if (table) {
                    opt.setCustomCodonTable(table);
                    opt.setOrganism('custom');
                  }
                }}
              />
              {opt.organism === 'custom' && opt.customCodonTable && (
                <p className="text-xs text-stone-500 font-mono">Custom table loaded (64 codons)</p>
              )}
              <p className="text-xs text-stone-500">
                2. Paste protein sequence
              </p>
              <textarea
                value={opt.protein}
                onChange={e => opt.setProtein(e.target.value)}
                placeholder="MVSKGEELFT..."
                className="w-full h-20 p-3 text-sm font-mono bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded focus:outline-none focus:border-stone-500 resize-y"
                spellCheck={false}
              />
              <button
                onClick={opt.optimize}
                disabled={!opt.protein.trim() || !opt.customCodonTable}
                className="px-4 py-2 bg-stone-900 dark:bg-stone-200 text-white dark:text-stone-900 text-sm font-medium rounded hover:bg-stone-800 dark:hover:bg-stone-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Run Optimization
              </button>
              {opt.error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded text-sm text-red-600 dark:text-red-400">
                  {opt.error}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div>
        {opt.result ? (
          <OptimizerResults result={opt.result} organism={opt.organism} />
        ) : opt.batchResults.length > 0 ? (
          selectedBatch !== null && opt.batchResults[selectedBatch] ? (
            <div>
              <button
                onClick={() => setSelectedBatch(null)}
                className="mb-3 flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                Back to batch results ({opt.batchResults.length})
              </button>
              <OptimizerResults result={opt.batchResults[selectedBatch].result} organism={opt.organism} />
            </div>
          ) : (
            <div className="bg-white dark:bg-stone-800 rounded border border-stone-200 dark:border-stone-700 p-4">
              <h2 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-3">Batch Results ({opt.batchResults.length})</h2>
              <div className="space-y-2">
                {opt.batchResults.map((b, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedBatch(i)}
                    className="w-full text-left p-3 bg-stone-50 dark:bg-stone-700/50 rounded border border-stone-100 dark:border-stone-600 hover:border-stone-300 dark:hover:border-stone-500 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-medium text-stone-800 dark:text-stone-200 truncate">{b.name}</h3>
                      <span className="text-xs text-stone-400 font-mono shrink-0 ml-2">
                        {b.result.inputProtein.length}aa | CAI {b.result.caiAfterOptimization.toFixed(3)} | GC {(b.result.gcContentAfter * 100).toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-xs text-stone-400">Click to view detailed analysis</p>
                  </button>
                ))}
              </div>
            </div>
          )
        ) : (
          <div className="bg-white dark:bg-stone-800 rounded border border-dashed border-stone-300 dark:border-stone-600 p-12 text-center">
            <p className="text-base text-stone-400 dark:text-stone-500">
              Enter a protein sequence and click <span className="font-medium text-stone-600 dark:text-stone-300">Run Optimization</span> to generate a codon-optimized DNA sequence.
            </p>
            <p className="text-sm text-stone-300 dark:text-stone-600 mt-3 font-mono">
              Protein &rarr; Reverse translate &rarr; CAI optimization &rarr; Constraint repair &rarr; DNA
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
