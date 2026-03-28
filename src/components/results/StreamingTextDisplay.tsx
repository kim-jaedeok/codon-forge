interface Props {
  text: string;
  isStreaming: boolean;
}

export function StreamingTextDisplay({ text, isStreaming }: Props) {
  if (!text) return null;

  const sections = text.split(/\n## /).map((section, i) => {
    if (i === 0 && !section.startsWith('## ')) {
      return { title: null, content: section };
    }
    const lines = (i === 0 ? section.replace(/^## /, '') : section).split('\n');
    return { title: lines[0], content: lines.slice(1).join('\n') };
  });

  return (
    <div className="space-y-4">
      {sections.map((section, i) => (
        <div key={i}>
          {section.title && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{section.title}</h3>
          )}
          <div className="text-base text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
            {section.content}
          </div>
        </div>
      ))}
      {isStreaming && (
        <span className="inline-block w-2 h-4 bg-purple-500 animate-pulse" />
      )}
    </div>
  );
}
