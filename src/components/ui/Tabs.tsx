interface TabsProps {
  tabs: string[];
  active: number;
  onChange: (index: number) => void;
}

export function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div className="flex border-b border-stone-200 dark:border-stone-700 mb-3 -mx-1">
      {tabs.map((tab, i) => (
        <button
          key={tab}
          onClick={() => onChange(i)}
          className={`px-3 py-2 text-base font-medium border-b-2 -mb-px transition-colors ${
            i === active
              ? 'border-stone-900 dark:border-stone-200 text-stone-900 dark:text-stone-200'
              : 'border-transparent text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
