export function Header() {
  return (
    <header className="bg-stone-900 text-stone-300 px-5 py-3 flex items-center justify-between text-base border-b border-stone-700">
      <div className="flex items-center gap-2.5">
        <span className="font-bold text-lg text-white tracking-tight">CodonForge</span>
        <span className="text-stone-500 text-sm">v1.0</span>
        <span className="text-stone-600">|</span>
        <span className="text-stone-400">Codon Optimization Tool</span>
      </div>
      <div className="hidden sm:flex items-center gap-3 text-stone-500 text-sm">
        <span>15 organisms</span>
        <span className="text-stone-700">|</span>
        <span>20 restriction enzymes</span>
        <span className="text-stone-700">|</span>
        <span>FASTA / GenBank export</span>
        <span className="text-stone-700">|</span>
        <a href="https://github.com/kim-jaedeok/codon-forge" target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-white transition-colors">
          GitHub
        </a>
      </div>
    </header>
  );
}
