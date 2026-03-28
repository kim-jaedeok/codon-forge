#!/usr/bin/env node

import { readFileSync } from 'fs';
import { optimizeProtein } from '../src/lib/optimization/codonOptimizer';
import { CODON_TABLE } from '../src/constants/codonTable';
import { ORGANISMS } from '../src/constants/organismCodonUsage';
import type { OptimizationOptions, OrganismId } from '../src/types/optimizer';

const HELP = `
CodonForge — Free Codon Optimization Tool
https://github.com/kim-jaedeok/codon-forge

Usage:
  npx codonforge <sequence> [options]
  npx codonforge --input <file.fasta> [options]
  echo "MVSK..." | npx codonforge [options]

Options:
  --organism, -o    Target organism (default: ecoli)
  --input, -i       Input FASTA file
  --output, -O      Output file (default: stdout)
  --format, -f      Output format: fasta, genbank, raw (default: fasta)
  --avoid, -a       Restriction enzymes to avoid (comma-separated)
  --harmony         Use codon harmony (match natural distribution)
  --utr             Add UTR (prokaryote or eukaryote)
  --no-repeats      Disable tandem repeat removal
  --no-homopolymer  Disable homopolymer avoidance
  --no-secondary    Disable RNA secondary structure avoidance
  --json            Output full result as JSON
  --list-organisms  List available organisms
  --help, -h        Show this help

Organisms:
${ORGANISMS.map(o => `  ${o.id.padEnd(14)} ${o.scientificName}`).join('\n')}

Examples:
  npx codonforge "MVSKGEELFT..." --organism human
  npx codonforge -i protein.fasta -o optimized.fasta -o ecoli
  npx codonforge "MVSKGEELFT..." --organism ecoli --avoid EcoRI,BamHI --json
  cat protein.fa | npx codonforge --organism yeast > optimized.fa
`;

function parseArgs(args: string[]) {
  const opts: Record<string, string | boolean> = {};
  const positional: string[] = [];
  let i = 0;
  while (i < args.length) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') { opts.help = true; i++; }
    else if (arg === '--list-organisms') { opts.listOrganisms = true; i++; }
    else if (arg === '--harmony') { opts.harmony = true; i++; }
    else if (arg === '--no-repeats') { opts.noRepeats = true; i++; }
    else if (arg === '--no-homopolymer') { opts.noHomopolymer = true; i++; }
    else if (arg === '--no-secondary') { opts.noSecondary = true; i++; }
    else if (arg === '--json') { opts.json = true; i++; }
    else if ((arg === '--organism' || arg === '-o') && args[i + 1]) { opts.organism = args[++i]; i++; }
    else if ((arg === '--input' || arg === '-i') && args[i + 1]) { opts.input = args[++i]; i++; }
    else if ((arg === '--output' || arg === '-O') && args[i + 1]) { opts.output = args[++i]; i++; }
    else if ((arg === '--format' || arg === '-f') && args[i + 1]) { opts.format = args[++i]; i++; }
    else if ((arg === '--avoid' || arg === '-a') && args[i + 1]) { opts.avoid = args[++i]; i++; }
    else if (arg === '--utr' && args[i + 1]) { opts.utr = args[++i]; i++; }
    else if (!arg.startsWith('-')) { positional.push(arg); i++; }
    else { console.error(`Unknown option: ${arg}`); process.exit(1); }
  }
  return { opts, positional };
}

function readStdin(): Promise<string> {
  return new Promise((resolve) => {
    if (process.stdin.isTTY) { resolve(''); return; }
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => data += chunk);
    process.stdin.on('end', () => resolve(data));
  });
}

function parseProtein(input: string): string {
  const lines = input.trim().split('\n');
  const seqLines = lines.filter(l => !l.startsWith('>'));
  return seqLines.join('').replace(/[\s\d]/g, '').replace(/[^ACDEFGHIKLMNPQRSTVWY*]/gi, '').toUpperCase().replace(/\*$/, '');
}

function formatFasta(result: { optimizedDNA: string; caiAfterOptimization: number; gcContentAfter: number }): string {
  return `>Optimized_sequence CAI=${result.caiAfterOptimization.toFixed(3)} GC=${(result.gcContentAfter * 100).toFixed(1)}%\n${result.optimizedDNA.match(/.{1,80}/g)?.join('\n') || result.optimizedDNA}\n`;
}

function formatGenBank(result: { optimizedDNA: string; inputProtein: string; caiAfterOptimization: number; gcContentAfter: number }): string {
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
      chunks.push(result.optimizedDNA.substring(j, Math.min(j + 10, len)).toLowerCase());
    }
    lines.push(`${num} ${chunks.join(' ')}`);
  }
  lines.push('//\n');
  return lines.join('\n');
}

async function main() {
  const { opts, positional } = parseArgs(process.argv.slice(2));

  if (opts.help) { console.log(HELP); process.exit(0); }
  if (opts.listOrganisms) {
    ORGANISMS.forEach(o => console.log(`${o.id.padEnd(14)} ${o.scientificName} (GC: ${(o.gcRange[0]*100).toFixed(0)}-${(o.gcRange[1]*100).toFixed(0)}%)`));
    process.exit(0);
  }

  // Get protein sequence
  let proteinInput = '';
  if (opts.input) {
    proteinInput = readFileSync(opts.input as string, 'utf8');
  } else if (positional.length > 0) {
    proteinInput = positional.join(' ');
  } else {
    proteinInput = await readStdin();
  }

  const protein = parseProtein(proteinInput);
  if (!protein) {
    console.error('Error: No valid protein sequence provided.');
    console.error('Usage: npx codonforge "MVSKGEELFT..." --organism ecoli');
    console.error('       npx codonforge --help');
    process.exit(1);
  }

  // Build options
  const organism = (opts.organism as OrganismId) || 'ecoli';
  if (!ORGANISMS.find(o => o.id === organism)) {
    console.error(`Error: Unknown organism "${organism}". Use --list-organisms to see available options.`);
    process.exit(1);
  }

  const orgInfo = ORGANISMS.find(o => o.id === organism)!;
  const avoidEnzymes = opts.avoid ? (opts.avoid as string).split(',').map(s => s.trim()) : ['EcoRI', 'BamHI', 'HindIII', 'NotI', 'XbaI', 'XhoI'];

  const options: OptimizationOptions = {
    organism,
    gcTarget: orgInfo.gcRange,
    avoidEnzymes,
    removeRepeats: !opts.noRepeats,
    avoidHomopolymers: !opts.noHomopolymer,
    avoidSecondaryStructure: !opts.noSecondary,
    useCodonHarmony: !!opts.harmony,
    addUTR: !!opts.utr,
    utrOrganism: opts.utr === 'prokaryote' ? 'prokaryote' : 'eukaryote',
  };

  // Run optimization
  const result = optimizeProtein(protein, options);

  // Verify round-trip
  let translated = '';
  const codingDNA = options.addUTR
    ? result.optimizedDNA.substring(
        options.utrOrganism === 'prokaryote' ? 13 : 6,
        options.utrOrganism === 'prokaryote' ? result.optimizedDNA.length : result.optimizedDNA.length - 18
      )
    : result.optimizedDNA;
  for (let i = 0; i + 2 < codingDNA.length; i += 3) {
    translated += CODON_TABLE[codingDNA.substring(i, i + 3)] || '?';
  }
  if (translated !== result.inputProtein) {
    console.error('Warning: Round-trip verification failed. Please report this bug.');
  }

  // Output
  if (opts.json) {
    const output = JSON.stringify({
      protein: result.inputProtein,
      dna: result.optimizedDNA,
      organism: orgInfo.scientificName,
      cai: +result.caiAfterOptimization.toFixed(4),
      gc: +(result.gcContentAfter * 100).toFixed(1),
      length: result.optimizedDNA.length,
      changes: result.changes.length,
      warnings: result.remainingViolations.length,
      verified: translated === result.inputProtein,
    }, null, 2);
    if (opts.output) {
      require('fs').writeFileSync(opts.output as string, output);
      console.error(`Written to ${opts.output}`);
    } else {
      console.log(output);
    }
  } else {
    const format = (opts.format as string) || 'fasta';
    let output: string;
    if (format === 'genbank' || format === 'gb') {
      output = formatGenBank(result);
    } else if (format === 'raw') {
      output = result.optimizedDNA + '\n';
    } else {
      output = formatFasta(result);
    }

    if (opts.output) {
      require('fs').writeFileSync(opts.output as string, output);
      console.error(`${result.inputProtein.length} aa → ${result.optimizedDNA.length} bp | CAI: ${result.caiAfterOptimization.toFixed(3)} | GC: ${(result.gcContentAfter*100).toFixed(1)}% | Written to ${opts.output}`);
    } else {
      process.stdout.write(output);
    }
  }
}

main().catch(e => { console.error(e.message); process.exit(1); });
