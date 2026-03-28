import { ORGANISMS } from '../../constants/organismCodonUsage';
import type { OrganismId } from '../../types/optimizer';

interface Props {
  value: OrganismId;
  onChange: (v: OrganismId) => void;
}

export function OrganismSelector({ value, onChange }: Props) {
  return (
    <div>
      <label className="block text-base font-medium text-stone-600 dark:text-stone-400 mb-1">Target Organism</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value as OrganismId)}
        className="w-full px-3 py-2 text-base bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded focus:outline-none focus:border-stone-500"
      >
        <optgroup label="Prokaryotes">
          {ORGANISMS.filter(o => ['ecoli', 'bacillus', 'pseudomonas'].includes(o.id)).map(org => (
            <option key={org.id} value={org.id}>{org.scientificName}</option>
          ))}
        </optgroup>
        <optgroup label="Yeast / Fungi">
          {ORGANISMS.filter(o => ['yeast', 'pichia'].includes(o.id)).map(org => (
            <option key={org.id} value={org.id}>{org.scientificName}</option>
          ))}
        </optgroup>
        <optgroup label="Mammals">
          {ORGANISMS.filter(o => ['human', 'mouse', 'rat', 'cho'].includes(o.id)).map(org => (
            <option key={org.id} value={org.id}>{org.scientificName}</option>
          ))}
        </optgroup>
        <optgroup label="Other Animals">
          {ORGANISMS.filter(o => ['zebrafish', 'celegans', 'drosophila'].includes(o.id)).map(org => (
            <option key={org.id} value={org.id}>{org.scientificName}</option>
          ))}
        </optgroup>
        <optgroup label="Plants">
          {ORGANISMS.filter(o => ['arabidopsis', 'tobacco', 'corn'].includes(o.id)).map(org => (
            <option key={org.id} value={org.id}>{org.scientificName}</option>
          ))}
        </optgroup>
        <optgroup label="Custom">
          <option value="custom">Upload custom table</option>
        </optgroup>
      </select>
    </div>
  );
}
