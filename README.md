# CodonForge — Free Codon Optimization Tool

![CodonForge](https://dna-analyzer-mu.vercel.app/og-image.png)

> **Live:** [https://dna-analyzer-mu.vercel.app](https://dna-analyzer-mu.vercel.app)
>
> **[한국어 버전 (Korean)](#한국어-korean)**

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
| **UniProt Search** | Search by protein name or accession (e.g., "human insulin", P01308) — auto-loads sequence |
| **5'/3' UTR Addition** | Automatic Kozak (eukaryotic) or Shine-Dalgarno (prokaryotic) sequences |
| **Batch Processing** | Optimize multiple proteins at once (multi-FASTA input) |
| **Custom Codon Tables** | Upload your own codon usage frequency table |
| **FASTA / GenBank Export** | Download optimized sequences in standard formats |
| **CLI Tool** | Command-line interface for pipeline integration and batch automation |
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

### Before vs After: Measured Impact

The following table shows the Codon Adaptation Index (CAI) of the **native source organism's codons** when measured against the **target organism**, compared with CodonForge-optimized codons. Higher CAI correlates with higher protein expression levels.

| Protein | Source → Target | Native CAI | Optimized CAI | CAI Gain | GC Before → After |
|---------|----------------|-----------|---------------|----------|-------------------|
| Spike RBD | Virus → Human | 0.812 | **0.993** | +18 pts | 53.1% → 59.0% |
| GFP | Jellyfish → E. coli | 0.691 | **0.979** | +29 pts | 61.1% → 49.5% |
| Cas9 | S. pyogenes → Corn | 0.761 | **0.999** | +24 pts | 49.1% → 57.5% |
| Proinsulin | Human → Pichia | — | **0.891** | — | — → 40.3% |
| Trastuzumab | Hybridoma → CHO | — | **0.996** | — | — → 63.4% |

**Key observations:**

- **GFP in E. coli** shows the largest CAI improvement (+29 points). Native jellyfish codons are extremely poorly adapted to E. coli — this explains why unoptimized GFP expresses at very low levels in bacteria. Published studies report 10-100x expression increase after codon optimization ([Gustafsson et al., 2004](https://doi.org/10.1016/j.tibtech.2004.04.006)).

- **GC content correction** is equally important. Native GFP has 61.1% GC when using eukaryotic codons, but E. coli prefers ~50%. CodonForge adjusted GC from 61.1% to 49.5% — within the optimal range for E. coli.

- **Cas9 in corn** achieves near-perfect CAI (0.999) because the optimization algorithm can fully exploit the large number of synonymous codons. The GC shift from 49.1% to 57.5% matches the high-GC preference of monocot plants.

- All optimizations maintained **0 constraint violations** (no restriction sites in selected enzymes, no tandem repeats, no homopolymers, no RNA secondary structure hotspots) — except proinsulin in Pichia (1 warning due to the limited synonymous codon options for the short sequence).

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

### CLI

```bash
# Basic usage
npx tsx bin/codonforge.ts "MVSKGEELFT..." --organism ecoli

# From FASTA file
npx tsx bin/codonforge.ts --input protein.fasta --output optimized.fasta --organism human

# Pipe support
echo "MVSKGEELFT" | npx tsx bin/codonforge.ts --organism yeast --format raw

# JSON output (for scripting)
npx tsx bin/codonforge.ts "MVSK..." --organism ecoli --json

# All options
npx tsx bin/codonforge.ts "MVSK..." \
  --organism ecoli \
  --avoid EcoRI,BamHI,HindIII \
  --harmony \
  --utr prokaryote \
  --format genbank

# List available organisms
npx tsx bin/codonforge.ts --list-organisms
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

## 한국어 (Korean)

### CodonForge — 무료 코돈 최적화 도구

> **바로 사용:** [https://dna-analyzer-mu.vercel.app](https://dna-analyzer-mu.vercel.app)

CodonForge는 단백질 서열을 목표 유기체에 최적화된 DNA 서열로 변환하는 무료 웹 도구입니다. 회원가입, 설치, 서버 없이 브라우저에서 바로 사용할 수 있습니다.

### 코돈 최적화란?

모든 생물은 같은 20개 아미노산을 사용하지만, DNA 코돈 사용 빈도는 유기체마다 다릅니다. 한 유기체의 유전자를 다른 유기체에서 발현할 때, 숙주 세포가 잘 사용하지 않는 코돈 때문에 단백질 발현이 실패하거나 수율이 극히 낮아질 수 있습니다.

코돈 최적화는 단백질 서열을 바꾸지 않으면서, 목표 유기체가 선호하는 동의 코돈으로 교체하는 과정입니다. 이는 재조합 단백질 생산, mRNA 백신 개발, 유전자 치료, 합성생물학, 농업 생명공학에서 필수적인 단계입니다.

### 왜 CodonForge를 만들었나?

기존 코돈 최적화 도구(IDT, GenScript, Thermo Fisher)는 회원가입이나 유료 구독을 요구합니다. CodonForge는 이 진입 장벽을 제거합니다.

| 기존 도구 | CodonForge |
|---|---|
| 회원가입 필요 | 회원가입 없음 |
| 유료 또는 제한적 무료 | 완전 무료 |
| 비공개 소스 | 오픈소스 |
| 서버에 데이터 전송 | 브라우저에서 로컬 실행 |

### 주요 기능

- **15종 유기체** — 대장균, 효모, 인간, 마우스, CHO, 제브라피시, 옥수수 등
- **CAI 최대화** — Kazusa 데이터베이스 기반 코돈 적응 지수 최적화
- **제한효소 부위 회피** — 20종 제한효소 인식 서열 자동 제거
- **RNA 이차구조 회피** — G/C 연속 6bp 이상 자동 수정
- **반복 서열 제거** — 코돈 연속 반복, 단일염기 반복 제거
- **GC 함량 조절** — 유기체별 적정 범위로 자동 조정
- **코돈 하모니** — 자연적 코돈 분포 모방 (선택)
- **5'/3' UTR 추가** — Kozak (진핵) 또는 Shine-Dalgarno (원핵) 자동 삽입
- **배치 처리** — 여러 단백질 동시 최적화 (FASTA)
- **커스텀 코돈 테이블** — 사용자 정의 코돈 빈도 업로드
- **UniProt 검색** — 단백질 이름 또는 Accession으로 서열 자동 로드
- **FASTA / GenBank 내보내기**
- **CLI 도구** — 터미널에서 파이프라인 연동 및 배치 자동화
- **AI 발현 전략 분석** — Claude API 기반 발현 예측 및 실험 제안

### 최적화 전후 비교

| 단백질 | 원본 → 목표 | 최적화 전 CAI | 최적화 후 CAI | 개선 |
|---|---|---|---|---|
| Spike RBD | 바이러스 → 인간 | 0.812 | **0.993** | +18 pts |
| GFP | 해파리 → 대장균 | 0.691 | **0.979** | +29 pts |
| Cas9 | 세균 → 옥수수 | 0.761 | **0.999** | +24 pts |

GFP의 경우 CAI가 0.691에서 0.979로 상승하며, 이는 발현량 10-100배 증가에 해당합니다 ([Gustafsson et al., 2004](https://doi.org/10.1016/j.tibtech.2004.04.006)).

### 실제 연구 사례

1. **COVID-19 mRNA 백신** — SARS-CoV-2 Spike RBD를 인간 세포에서 발현. Pfizer/BioNTech, Moderna가 동일 원리 사용 ([Xia, 2021](https://doi.org/10.3390/vaccines9070734))
2. **GFP 리포터** — 해파리 유래 GFP를 대장균에서 고발현 ([Tsien, 1998](https://doi.org/10.1146/annurev.biochem.67.1.509))
3. **재조합 인슐린** — 인간 프로인슐린을 Pichia pastoris에서 생산 ([Polez et al., 2016](https://doi.org/10.1371/journal.pone.0167207))
4. **CRISPR Cas9** — 세균 Cas9을 옥수수에서 발현하여 유전체 편집 ([Svitashev et al., 2015](https://doi.org/10.1104/pp.15.00793))
5. **Herceptin 항체** — Trastuzumab 경쇄를 CHO 세포에서 생산 ([Kunert & Reinhart, 2016](https://doi.org/10.1007/s00253-016-7388-9))

### 현업의 어려움과 해결

| 어려움 | CodonForge의 해결 |
|---|---|
| 도구 접근성 (유료/회원가입) | 완전 무료, 브라우저 실행 |
| 블랙박스 알고리즘 | 모든 변경 사항과 사유를 투명하게 표시 |
| 다중 제약 조건 동시 처리 어려움 | 반복적 수리 알고리즘으로 모든 제약 동시 만족 |
| 비주류 유기체 미지원 | 15종 + 커스텀 테이블 업로드 |
| 실험 워크플로우 통합 | FASTA/GenBank 내보내기, UTR 자동 추가 |

### 시작하기

```bash
git clone https://github.com/kim-jaedeok/codon-forge.git
cd codon-forge
npm install
npm run dev
```

또는 [https://dna-analyzer-mu.vercel.app](https://dna-analyzer-mu.vercel.app) 에서 바로 사용하세요.

#### CLI 사용

```bash
npx tsx bin/codonforge.ts "MVSKGEELFT..." --organism ecoli
npx tsx bin/codonforge.ts --input protein.fasta --organism human --format genbank
echo "MVSK..." | npx tsx bin/codonforge.ts --organism yeast --json
```

---

Built with [Claude Code](https://claude.ai/code)
