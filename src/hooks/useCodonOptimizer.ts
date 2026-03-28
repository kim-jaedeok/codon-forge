import { useState, useCallback } from 'react';
import type { OptimizationOptions, OptimizationResult, OrganismId, CodonFrequencyTable } from '../types/optimizer';
import { optimizeProtein } from '../lib/optimization/codonOptimizer';
import { ORGANISMS } from '../constants/organismCodonUsage';

export function useCodonOptimizer() {
  const [protein, setProtein] = useState('');
  const [organism, setOrganism] = useState<OrganismId>('ecoli');
  const [gcTarget, setGCTarget] = useState<[number, number]>([0.40, 0.60]);
  const [avoidEnzymes, setAvoidEnzymes] = useState<string[]>(['EcoRI', 'BamHI', 'HindIII', 'NotI', 'XbaI', 'XhoI']);
  const [removeRepeats, setRemoveRepeats] = useState(true);
  const [avoidHomopolymers, setAvoidHomopolymers] = useState(true);
  const [avoidSecondaryStructure, setAvoidSecondaryStructure] = useState(true);
  const [useCodonHarmony, setUseCodonHarmony] = useState(false);
  const [addUTR, setAddUTR] = useState(false);
  const [utrOrganism, setUtrOrganism] = useState<'prokaryote' | 'eukaryote'>('eukaryote');
  const [customCodonTable, setCustomCodonTable] = useState<CodonFrequencyTable | null>(null);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [batchInput, setBatchInput] = useState('');
  const [batchResults, setBatchResults] = useState<{ name: string; result: OptimizationResult }[]>([]);

  const optimize = useCallback(() => {
    setError(null);
    const clean = protein.replace(/[\s\d\n\r]/g, '').replace(/>.*$/gm, '').replace(/[^ACDEFGHIKLMNPQRSTVWY*]/gi, '').toUpperCase().replace(/\*$/, '');

    if (!clean) {
      setError('Please enter a valid protein sequence.');
      return;
    }
    if (clean.length > 10000) {
      setError('Only sequences of 10,000 amino acids or fewer are supported.');
      return;
    }

    const orgInfo = ORGANISMS.find(o => o.id === organism);
    const options: OptimizationOptions = {
      organism,
      customCodonTable: organism === 'custom' && customCodonTable ? customCodonTable : undefined,
      gcTarget: orgInfo ? orgInfo.gcRange : gcTarget,
      avoidEnzymes,
      removeRepeats,
      avoidHomopolymers,
      avoidSecondaryStructure,
      useCodonHarmony,
      addUTR,
      utrOrganism,
    };

    try {
      const r = optimizeProtein(clean, options);
      setResult(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error during optimization');
    }
  }, [protein, organism, gcTarget, avoidEnzymes, removeRepeats, avoidHomopolymers, avoidSecondaryStructure, useCodonHarmony, addUTR, utrOrganism, customCodonTable]);

  const batchOptimize = useCallback((overrideInput?: string) => {
    setError(null);
    const input = overrideInput || batchInput;
    const entries = input.split(/>/).filter(Boolean).map(entry => {
      const lines = entry.trim().split('\n');
      const name = lines[0].trim();
      const seq = lines.slice(1).join('').replace(/[\s\d]/g, '').replace(/[^ACDEFGHIKLMNPQRSTVWY*]/gi, '').toUpperCase().replace(/\*$/, '');
      return { name, seq };
    }).filter(e => e.seq);

    if (entries.length === 0) {
      setError('No valid protein sequences found. Please enter in FASTA format.');
      return;
    }

    const orgInfo = ORGANISMS.find(o => o.id === organism);
    const options: OptimizationOptions = {
      organism,
      customCodonTable: organism === 'custom' && customCodonTable ? customCodonTable : undefined,
      gcTarget: orgInfo ? orgInfo.gcRange : gcTarget,
      avoidEnzymes,
      removeRepeats,
      avoidHomopolymers,
      avoidSecondaryStructure,
      useCodonHarmony,
      addUTR,
      utrOrganism,
    };

    try {
      const results = entries.map(e => ({
        name: e.name,
        result: optimizeProtein(e.seq, options),
      }));
      setBatchResults(results);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error during batch optimization');
    }
  }, [batchInput, organism, gcTarget, avoidEnzymes, removeRepeats, avoidHomopolymers, avoidSecondaryStructure, useCodonHarmony, addUTR, utrOrganism, customCodonTable]);

  return {
    protein, setProtein,
    organism, setOrganism,
    gcTarget, setGCTarget,
    avoidEnzymes, setAvoidEnzymes,
    removeRepeats, setRemoveRepeats,
    avoidHomopolymers, setAvoidHomopolymers,
    avoidSecondaryStructure, setAvoidSecondaryStructure,
    useCodonHarmony, setUseCodonHarmony,
    addUTR, setAddUTR,
    utrOrganism, setUtrOrganism,
    customCodonTable, setCustomCodonTable,
    result, error,
    optimize,
    batchInput, setBatchInput,
    batchResults, batchOptimize,
  };
}
