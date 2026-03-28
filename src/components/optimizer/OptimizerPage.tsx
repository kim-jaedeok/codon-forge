import { useState } from 'react';
import { useCodonOptimizer } from '../../hooks/useCodonOptimizer';
import { ProteinInput } from './ProteinInput';
import { OrganismSelector } from './OrganismSelector';
import { OptionsPanel } from './OptionsPanel';
import { OptimizerResults } from './OptimizerResults';
import { Tabs } from '../ui/Tabs';
import type { CodonFrequencyTable } from '../../types/optimizer';

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
  const [inputMode, setInputMode] = useState(0); // 0=single, 1=batch, 2=custom table

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(340px,1fr)_2fr] gap-6">
      <div className="space-y-4">
        <div className="bg-white dark:bg-stone-800 rounded border border-stone-200 dark:border-stone-700 p-4">
          <h2 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-3">Sequence Input</h2>
          <Tabs tabs={['Single', 'Batch', 'Custom Table']} active={inputMode} onChange={setInputMode} />

          {inputMode === 0 && (
            <ProteinInput value={opt.protein} onChange={opt.setProtein} onOptimize={opt.optimize} error={opt.error} />
          )}

          {inputMode === 1 && (
            <div className="space-y-2">
              <textarea
                value={opt.batchInput}
                onChange={e => opt.setBatchInput(e.target.value)}
                placeholder={">Protein1\nMVSKGEELFT...\n>Protein2\nMKWVTFISL..."}
                className="w-full h-32 p-2 text-xs font-mono bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded focus:outline-none focus:border-stone-500 resize-y"
                spellCheck={false}
              />
              <button
                onClick={opt.batchOptimize}
                disabled={!opt.batchInput.trim()}
                className="px-3 py-1.5 bg-stone-900 dark:bg-stone-200 text-white dark:text-stone-900 text-xs font-medium rounded hover:bg-stone-800 dark:hover:bg-stone-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Run Batch
              </button>
              {opt.error && (
                <div className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded text-xs text-red-600 dark:text-red-400">
                  {opt.error}
                </div>
              )}
            </div>
          )}

          {inputMode === 2 && (
            <div className="space-y-2">
              <p className="text-[10px] text-stone-400 uppercase tracking-wider">
                Paste codon frequency table (64 codons, per 1000). Format: codon[tab]frequency
              </p>
              <textarea
                placeholder="TTT  17.6&#10;TTC  20.3&#10;TTA  7.7&#10;..."
                className="w-full h-32 p-2 text-xs font-mono bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded focus:outline-none focus:border-stone-500 resize-y"
                onChange={e => {
                  const table = parseCustomTable(e.target.value);
                  if (table) {
                    opt.setCustomCodonTable(table);
                    opt.setOrganism('custom');
                  }
                }}
              />
              {opt.organism === 'custom' && opt.customCodonTable && (
                <p className="text-[10px] text-stone-500 font-mono">Custom table loaded (64 codons)</p>
              )}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-stone-800 rounded border border-stone-200 dark:border-stone-700 p-4 space-y-4">
          <h2 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-3">Parameters</h2>
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
      </div>
      <div>
        {opt.result ? (
          <OptimizerResults result={opt.result} organism={opt.organism} />
        ) : opt.batchResults.length > 0 ? (
          <div className="bg-white dark:bg-stone-800 rounded border border-stone-200 dark:border-stone-700 p-4">
            <h2 className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-3">Batch Results ({opt.batchResults.length})</h2>
            <div className="space-y-2">
              {opt.batchResults.map((b, i) => (
                <div key={i} className="p-2 bg-stone-50 dark:bg-stone-700/50 rounded border border-stone-100 dark:border-stone-600">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-xs font-semibold text-stone-800 dark:text-stone-200 font-mono">{b.name}</h3>
                    <span className="text-[10px] text-stone-400 font-mono">
                      {b.result.inputProtein.length}aa | {b.result.optimizedDNA.length}bp | CAI {b.result.caiAfterOptimization.toFixed(3)} | GC {(b.result.gcContentAfter * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="font-mono text-[10px] break-all max-h-16 overflow-y-auto text-stone-500 dark:text-stone-400 leading-relaxed">
                    {b.result.optimizedDNA.substring(0, 200)}{b.result.optimizedDNA.length > 200 ? '...' : ''}
                  </div>
                  <button
                    onClick={() => {
                      const fasta = `>${b.name}_optimized\n${b.result.optimizedDNA.match(/.{1,80}/g)?.join('\n')}`;
                      navigator.clipboard.writeText(fasta);
                    }}
                    className="mt-1 px-2 py-0.5 text-[10px] text-stone-500 border border-stone-200 dark:border-stone-600 rounded hover:bg-stone-100 dark:hover:bg-stone-600 transition-colors"
                  >
                    Copy FASTA
                  </button>
                </div>
              ))}
            </div>
          </div>
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
