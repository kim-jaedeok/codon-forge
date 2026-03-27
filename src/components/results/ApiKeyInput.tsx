interface Props {
  value: string;
  onChange: (v: string) => void;
}

export function ApiKeyInput({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="password"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Anthropic API Key (sk-ant-...)"
        className="flex-1 px-3 py-1.5 text-sm font-mono bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
      {value && <span className="text-xs text-green-600">saved</span>}
    </div>
  );
}
