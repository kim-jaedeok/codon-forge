import { RESTRICTION_ENZYMES } from '../../constants/restrictionEnzymes';

interface Props {
  avoidEnzymes: string[];
  onAvoidEnzymesChange: (v: string[]) => void;
  removeRepeats: boolean;
  onRemoveRepeatsChange: (v: boolean) => void;
  avoidHomopolymers: boolean;
  onAvoidHomopolymersChange: (v: boolean) => void;
  avoidSecondaryStructure: boolean;
  onAvoidSecondaryStructureChange: (v: boolean) => void;
  useCodonHarmony: boolean;
  onUseCodonHarmonyChange: (v: boolean) => void;
  addUTR: boolean;
  onAddUTRChange: (v: boolean) => void;
  utrOrganism: 'prokaryote' | 'eukaryote';
  onUtrOrganismChange: (v: 'prokaryote' | 'eukaryote') => void;
}

export function OptionsPanel({
  avoidEnzymes, onAvoidEnzymesChange,
  removeRepeats, onRemoveRepeatsChange,
  avoidHomopolymers, onAvoidHomopolymersChange,
  avoidSecondaryStructure, onAvoidSecondaryStructureChange,
  useCodonHarmony, onUseCodonHarmonyChange,
  addUTR, onAddUTRChange,
  utrOrganism, onUtrOrganismChange,
}: Props) {
  const toggleEnzyme = (name: string) => {
    if (avoidEnzymes.includes(name)) {
      onAvoidEnzymesChange(avoidEnzymes.filter(e => e !== name));
    } else {
      onAvoidEnzymesChange([...avoidEnzymes, name]);
    }
  };

  const selectAll = () => onAvoidEnzymesChange(RESTRICTION_ENZYMES.map(e => e.name));
  const selectNone = () => onAvoidEnzymesChange([]);

  return (
    <div className="space-y-3">
      {/* Restriction enzymes */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">Restriction Sites to Avoid</label>
          <div className="flex gap-1">
            <button onClick={selectAll} className="text-[10px] text-stone-400 hover:text-stone-600 underline">All</button>
            <button onClick={selectNone} className="text-[10px] text-stone-400 hover:text-stone-600 underline">None</button>
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          {RESTRICTION_ENZYMES.map(e => (
            <button
              key={e.name}
              onClick={() => toggleEnzyme(e.name)}
              className={`px-1.5 py-0.5 text-[10px] font-mono rounded transition-colors ${
                avoidEnzymes.includes(e.name)
                  ? 'bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900'
                  : 'bg-stone-100 dark:bg-stone-700 text-stone-400 hover:text-stone-600'
              }`}
            >
              {e.name}
            </button>
          ))}
        </div>
      </div>

      {/* Constraints */}
      <div>
        <label className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider block mb-1.5">Constraints</label>
        <div className="space-y-1">
          {[
            { checked: removeRepeats, onChange: onRemoveRepeatsChange, label: 'Remove tandem repeats (>=4)' },
            { checked: avoidHomopolymers, onChange: onAvoidHomopolymersChange, label: 'Avoid homopolymers (>=5nt)' },
            { checked: avoidSecondaryStructure, onChange: onAvoidSecondaryStructureChange, label: 'Avoid RNA secondary structure (G/C >6bp)' },
            { checked: useCodonHarmony, onChange: onUseCodonHarmonyChange, label: 'Codon harmony (match natural distribution)' },
          ].map(({ checked, onChange, label }) => (
            <label key={label} className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-400 cursor-pointer hover:text-stone-800 dark:hover:text-stone-200">
              <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="rounded-sm w-3 h-3" />
              {label}
            </label>
          ))}
        </div>
      </div>

      {/* UTR */}
      <div className="border-t border-stone-200 dark:border-stone-700 pt-2">
        <label className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-400 cursor-pointer hover:text-stone-800 dark:hover:text-stone-200">
          <input type="checkbox" checked={addUTR} onChange={e => onAddUTRChange(e.target.checked)} className="rounded-sm w-3 h-3" />
          Add 5'/3' UTR
        </label>
        {addUTR && (
          <div className="mt-1.5 ml-5 flex gap-3">
            {(['prokaryote', 'eukaryote'] as const).map(type => (
              <label key={type} className="flex items-center gap-1 text-[11px] text-stone-500 cursor-pointer">
                <input type="radio" name="utr" checked={utrOrganism === type} onChange={() => onUtrOrganismChange(type)} className="w-3 h-3" />
                {type === 'prokaryote' ? 'Prokaryotic (SD)' : 'Eukaryotic (Kozak)'}
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
