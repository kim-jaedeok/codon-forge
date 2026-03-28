import { CopyButton } from '../ui/CopyButton';

export function TranslationView({ translation }: { translation: string }) {
  const display = translation.length > 300 ? translation.substring(0, 300) + '...' : translation;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300">Amino Acid Translation (Frame +1)</h3>
        <CopyButton text={translation} />
      </div>
      <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg font-mono text-sm break-all leading-relaxed max-h-48 overflow-y-auto">
        {display.split('').map((aa, i) => (
          <span
            key={i}
            className={aa === '*' ? 'text-red-500 font-bold' : aa === 'M' ? 'text-green-600 font-bold' : ''}
          >
            {aa}
          </span>
        ))}
      </div>
      <p className="text-sm text-gray-500">
        {translation.length} amino acids | <span className="text-green-600">M</span>=Start <span className="text-red-500">*</span>=Stop
      </p>
    </div>
  );
}
