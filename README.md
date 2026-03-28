# CodonForge — Free Codon Optimization Tool

> **Live:** [https://dna-analyzer-mu.vercel.app](https://dna-analyzer-mu.vercel.app)

CodonForge is a free, browser-based codon optimization tool that converts protein sequences into DNA sequences optimized for expression in a target organism. No signup, no installation, no server — everything runs in your browser.

---

## Table of Contents

1. [What Is Codon Optimization and Why Does It Matter?](#1-what-is-codon-optimization-and-why-does-it-matter)
2. [Project Motivation](#2-project-motivation)
3. [Features and Value](#3-features-and-value)
4. [Real-World Use Cases](#4-real-world-use-cases)
5. [Industry Challenges and How CodonForge Helps](#5-industry-challenges-and-how-codonforge-helps)
6. [Getting Started](#6-getting-started)
7. [Tech Stack](#7-tech-stack)

---

## 1. What Is Codon Optimization and Why Does It Matter?

### The Problem: Same Protein, Different DNA

All living organisms use the same 20 amino acids to build proteins, but the DNA codons encoding those amino acids are not used equally. Each organism has a **codon usage bias** — a preference for certain codons over their synonymous alternatives.

For example, the amino acid Leucine (L) can be encoded by 6 different codons:

| Codon | E. coli (per 1000) | Human (per 1000) | Yeast (per 1000) |
|-------|-------------------|-------------------|-------------------|
| CTG   | **52.6**          | **39.6**          | 10.4              |
| CTT   | 11.0              | 13.2              | 12.3              |
| CTC   | 10.9              | 19.6              | 5.4               |
| TTA   | 13.7              | 7.7               | **26.2**          |
| TTG   | 13.3              | 12.9              | **27.0**          |
| CTA   | 3.9               | 7.2               | 13.4              |

When you take a gene from one organism and express it in another, the host cell may struggle to translate codons it rarely uses. This leads to:

- **Low protein yield** — Ribosomes stall at rare codons
- **Protein misfolding** — Uneven translation speed affects folding
- **mRNA instability** — Certain sequence features trigger degradation
- **Complete expression failure** — The protein simply isn't produced

### The Solution: Codon Optimization

Codon optimization replaces rare codons with synonymous codons preferred by the target organism, **without changing the protein sequence**. The result is the same protein, encoded by DNA that the host cell can efficiently translate.

This is not optional — it is a **prerequisite** for:
- Recombinant protein production
- mRNA vaccine development
- Gene therapy
- Synthetic biology
- Agricultural biotechnology

---

## 2. Project Motivation

### The Gap in Existing Tools

Codon optimization tools exist, but they all have significant barriers:

| Tool | Cost | Signup | Open Source |
|------|------|--------|-------------|
| IDT Codon Optimization | Free (limited) | Required | No |
| GenScript OptimumGene | Quote-based | Required | No |
| Thermo Fisher GeneOptimizer | Paid | Required | No |
| JCAT | Free | No | No (server-based) |
| **CodonForge** | **Free** | **No** | **Yes** |

**CodonForge was built to fill this gap**: a free, open-source, no-signup codon optimization tool that runs entirely in the browser. No data leaves your machine (except for the optional AI analysis feature).

### Design Philosophy

- **Expert tool, not a toy** — Professional UI designed for researchers, not a marketing landing page
- **Algorithm first** — Correct, validated optimization with CAI scoring and constraint satisfaction
- **Zero friction** — Paste sequence, select organism, click Run. Results in milliseconds
- **Transparent** — Every codon change is logged with a reason. No black box

---

## 3. Features and Value

### Core Optimization

| Feature | Description |
|---------|-------------|
| **15 Organisms** | E. coli, B. subtilis, P. aeruginosa, S. cerevisiae, P. pastoris, H. sapiens, M. musculus, R. norvegicus, CHO, D. rerio, C. elegans, D. melanogaster, A. thaliana, N. tabacum, Z. mays |
| **CAI Maximization** | Codon Adaptation Index optimization using Kazusa database frequencies |
| **Restriction Site Avoidance** | 20 common enzymes (EcoRI, BamHI, HindIII, NotI, XbaI, etc.) |
| **RNA Secondary Structure** | Avoids G/C runs >6bp that form stable hairpins |
| **Tandem Repeat Removal** | Breaks runs of ≥4 identical consecutive codons |
| **Homopolymer Avoidance** | Eliminates single-nucleotide runs ≥5bp |
| **GC Content Control** | Adjusts to organism-appropriate GC range |
| **Codon Harmony** | Optional: matches natural codon distribution instead of always using the most frequent codon |

### Advanced Features

| Feature | Description |
|---------|-------------|
| **5'/3' UTR Addition** | Automatic Kozak (eukaryotic) or Shine-Dalgarno (prokaryotic) sequences |
| **Batch Processing** | Optimize multiple proteins at once (multi-FASTA input) |
| **Custom Codon Tables** | Upload your own codon usage frequency table |
| **FASTA / GenBank Export** | Download optimized sequences in standard formats |
| **AI Expression Strategy** | Claude API-powered analysis: expression prediction, vector recommendations, cloning strategy |

### Optimization Results Include

- **Optimized DNA sequence** with copy/download buttons
- **CAI score** (before and after)
- **GC content** comparison
- **Nucleotide composition** chart
- **GC content distribution** (sliding window plot)
- **Restriction site analysis** of the optimized sequence
- **Codon usage table** (top 20 codons by frequency)
- **Complete change log** — every codon substitution with position, original/new codon, and reason

---

## 4. Real-World Use Cases

### Case 1: mRNA Vaccine Development (COVID-19)

**Challenge:** Express SARS-CoV-2 Spike protein RBD in human cells for mRNA vaccine production.

Both Pfizer/BioNTech and Moderna used codon optimization as a critical step in their mRNA vaccine development. The viral sequence had to be recoded using human-preferred codons to ensure efficient translation in human cells.

- Xia, X. (2021). *Detailed Dissection and Critical Evaluation of the Pfizer/BioNTech and Moderna mRNA Vaccines.* Vaccines, 9(7), 734. [DOI: 10.3390/vaccines9070734](https://doi.org/10.3390/vaccines9070734)
- Spike RBD sequence: [UniProt P0DTC2](https://www.uniprot.org/uniprot/P0DTC2) (positions 319–541)

**CodonForge result:**
- Input: Spike RBD (223 amino acids)
- Target: H. sapiens
- Output: 693 bp (with Kozak + PolyA UTR)
- CAI: **0.993** | GC: 59.0% | 7 constraint-based changes | 0 warnings

### Case 2: Reporter Protein in E. coli

**Challenge:** Express GFP at high levels in E. coli for use as a fluorescent reporter.

GFP originates from jellyfish (*Aequorea victoria*), whose codon usage is very different from E. coli. Without optimization, GFP expression in E. coli is 10-100x lower.

- Tsien, R.Y. (1998). *The Green Fluorescent Protein.* Annual Review of Biochemistry, 67, 509–544. [DOI: 10.1146/annurev.biochem.67.1.509](https://doi.org/10.1146/annurev.biochem.67.1.509)
- eGFP sequence: [GenBank U55762](https://www.ncbi.nlm.nih.gov/nuccore/U55762)

**CodonForge result:**
- Input: Enhanced GFP (239 amino acids)
- Target: E. coli K12
- Output: 730 bp (with Shine-Dalgarno)
- CAI: **0.979** | GC: 49.5% | 9 changes | 0 warnings

### Case 3: Recombinant Insulin Production

**Challenge:** Produce human proinsulin in Pichia pastoris for pharmaceutical manufacturing.

Insulin is the most widely used biopharmaceutical. Pichia pastoris is a preferred host for secreted protein production, but requires codon optimization of the human insulin gene.

- Polez, S. et al. (2016). *A Simplified and Efficient Process for Insulin Production in Pichia pastoris.* PLOS ONE, 11(12), e0167207. [DOI: 10.1371/journal.pone.0167207](https://doi.org/10.1371/journal.pone.0167207)
- Human insulin: [UniProt P01308](https://www.uniprot.org/uniprot/P01308)

**CodonForge result:**
- Input: Human proinsulin (86 amino acids)
- Target: P. pastoris
- Output: 258 bp
- CAI: **0.891** | GC: 40.3% | 33 changes | 1 warning

### Case 4: CRISPR-Cas9 in Plant Genome Editing

**Challenge:** Express SpCas9 in corn (Zea mays) for agricultural genome editing.

Cas9 is a bacterial protein (from S. pyogenes) with very different codon usage from plants. Plant-optimized Cas9 shows 5-10x higher editing efficiency compared to the native bacterial sequence.

- Svitashev, S. et al. (2015). *Targeted Mutagenesis, Precise Gene Editing, and Site-Specific Gene Insertion in Maize Using Cas9 and Guide RNA.* Plant Physiology, 169(2), 931–945. [DOI: 10.1104/pp.15.00793](https://doi.org/10.1104/pp.15.00793)
- SpCas9: [UniProt Q99ZW2](https://www.uniprot.org/uniprot/Q99ZW2)

**CodonForge result:**
- Input: SpCas9 N-terminal domain (361 amino acids)
- Target: Z. mays (corn)
- Output: 1,083 bp
- CAI: **0.999** | GC: 57.5% | 3 changes | 0 warnings

### Case 5: Therapeutic Antibody Manufacturing

**Challenge:** Produce Trastuzumab (Herceptin) light chain in CHO cells for cancer therapy.

CHO (Chinese Hamster Ovary) cells are the industry standard for antibody production. Codon optimization is essential for high-yield manufacturing of therapeutic antibodies.

- Kunert, R. & Reinhart, D. (2016). *Advances in recombinant antibody manufacturing.* Applied Microbiology and Biotechnology, 100(8), 3451–3461. [DOI: 10.1007/s00253-016-7388-9](https://doi.org/10.1007/s00253-016-7388-9)
- Trastuzumab: [DrugBank DB00072](https://go.drugbank.com/drugs/DB00072)

**CodonForge result:**
- Input: Trastuzumab light chain (214 amino acids)
- Target: CHO cells
- Output: 666 bp (with Kozak + PolyA UTR)
- CAI: **0.996** | GC: 63.4% | 6 changes | 0 warnings

---

## 5. Industry Challenges and How CodonForge Helps

### Challenge 1: Accessibility

**Problem:** Most codon optimization tools require institutional accounts, vendor relationships, or paid subscriptions. Academic labs in developing countries, independent researchers, and students are often excluded.

**CodonForge:** Completely free, no signup, no data collection. Open source on GitHub. Anyone with a browser can optimize codons immediately.

### Challenge 2: Black Box Algorithms

**Problem:** Commercial tools rarely explain *why* specific codons were chosen. Researchers can't verify or customize the optimization logic. When expression fails, there's no way to diagnose whether the optimization was the issue.

**CodonForge:** Every codon change is logged with a specific reason (restriction site removal, homopolymer avoidance, GC adjustment, etc.). The complete change log lets researchers understand exactly what was modified and why.

### Challenge 3: Multi-Constraint Optimization

**Problem:** Researchers need to simultaneously satisfy multiple constraints — high CAI, appropriate GC content, no restriction sites in their cloning enzymes, no sequence features that cause synthesis failure — but most free tools handle only one constraint at a time.

**CodonForge:** Runs a multi-pass iterative constraint repair algorithm that handles all constraints simultaneously:
1. Greedy CAI maximization
2. Restriction site elimination
3. Tandem repeat disruption
4. Homopolymer removal
5. RNA secondary structure mitigation
6. GC content adjustment

Each pass respects previous fixes, and the algorithm converges within 10 iterations.

### Challenge 4: Organism Coverage

**Problem:** Many free tools support only E. coli and human. Researchers working with non-model organisms (Pichia, CHO, zebrafish, plants) must manually look up codon usage tables and perform optimization by hand.

**CodonForge:** Supports 15 organisms spanning prokaryotes, yeast, mammals, invertebrates, and plants. Custom codon usage tables can also be uploaded for any organism not in the built-in list.

### Challenge 5: Integration with Experimental Workflow

**Problem:** After optimization, researchers need the sequence in formats compatible with their cloning and synthesis workflows. They also need to verify the optimized sequence doesn't contain restriction sites they're using for cloning.

**CodonForge:** Exports in FASTA and GenBank formats. The built-in restriction site analysis of the optimized sequence shows exactly which sites are present. UTR sequences (Kozak or Shine-Dalgarno) can be automatically added for expression-ready constructs.

### Validation

All optimization results maintain **100% protein identity** — the optimized DNA translates back to the exact input protein sequence. This is verified by an automated round-trip test for every optimization run.

---

## 6. Getting Started

### Use Online

Visit [https://dna-analyzer-mu.vercel.app](https://dna-analyzer-mu.vercel.app)

### Run Locally

```bash
git clone https://github.com/kim-jaedeok/codon-forge.git
cd codon-forge
npm install
npm run dev
```

### Run Tests

```bash
npm test
```

71 tests covering parser, analysis modules, optimization algorithm, CAI calculation, and feature extraction.

---

## 7. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 |
| Charts | Recharts |
| AI | Claude API (optional, browser-direct) |
| Hosting | Vercel |
| Tests | Vitest |

**Runtime dependencies:** React, ReactDOM, Recharts (3 packages total).

No backend. No database. No user accounts. Everything runs in the browser.

---

## License

MIT

---

Built with [Claude Code](https://claude.ai/code)
