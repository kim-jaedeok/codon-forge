import { CopyButton } from '../ui/CopyButton';

export function ReverseComplementView({ revComp }: { revComp: string }) {
  const display = revComp.length > 500 ? revComp.substring(0, 500) + '...' : revComp;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Reverse Complement</h3>
        <CopyButton text={revComp} />
      </div>
      <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg font-mono text-xs break-all leading-relaxed max-h-48 overflow-y-auto">
        {display}
      </div>
      <p className="text-xs text-gray-500">{revComp.length.toLocaleString()} bp</p>
    </div>
  );
}
