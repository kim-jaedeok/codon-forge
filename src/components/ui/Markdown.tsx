import type { ReactNode } from 'react';

interface Props {
  text: string;
}

function parseLine(line: string): ReactNode {
  // Bold
  const parts: (string | ReactNode)[] = [];
  const boldRegex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match;

  let processed = line;
  // Inline code
  const codeSegments: ReactNode[] = [];
  processed = processed.replace(/`([^`]+)`/g, (_m, code, offset) => {
    const placeholder = `\x00CODE${codeSegments.length}\x00`;
    codeSegments.push(
      <code key={`c${offset}`} className="px-1 py-0.5 bg-stone-100 dark:bg-stone-700 rounded text-xs font-mono">
        {code}
      </code>
    );
    return placeholder;
  });

  // Bold
  lastIndex = 0;
  while ((match = boldRegex.exec(processed)) !== null) {
    if (match.index > lastIndex) {
      parts.push(processed.slice(lastIndex, match.index));
    }
    parts.push(<strong key={match.index} className="font-semibold text-stone-800 dark:text-stone-200">{match[1]}</strong>);
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < processed.length) {
    parts.push(processed.slice(lastIndex));
  }

  // Restore code placeholders
  const result = parts.map((part, i) => {
    if (typeof part !== 'string') return part;
    const codeParts: (string | ReactNode)[] = [];
    const codeRegex = /\x00CODE(\d+)\x00/g;
    let cLastIndex = 0;
    let cMatch;
    while ((cMatch = codeRegex.exec(part)) !== null) {
      if (cMatch.index > cLastIndex) codeParts.push(part.slice(cLastIndex, cMatch.index));
      codeParts.push(codeSegments[parseInt(cMatch[1])]);
      cLastIndex = cMatch.index + cMatch[0].length;
    }
    if (cLastIndex < part.length) codeParts.push(part.slice(cLastIndex));
    return codeParts.length > 1 ? <span key={i}>{codeParts}</span> : codeParts[0] || part;
  });

  return <>{result}</>;
}

export function Markdown({ text }: Props) {
  const lines = text.split('\n');
  const elements: ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      elements.push(
        <div key={`code${i}`} className="my-2 rounded border border-stone-200 dark:border-stone-600 overflow-hidden">
          {lang && (
            <div className="px-2 py-0.5 bg-stone-100 dark:bg-stone-700 border-b border-stone-200 dark:border-stone-600">
              <span className="text-[9px] font-mono text-stone-400 uppercase">{lang}</span>
            </div>
          )}
          <pre className="p-2 bg-stone-50 dark:bg-stone-800 overflow-x-auto">
            <code className="text-xs font-mono text-stone-700 dark:text-stone-300 leading-relaxed">
              {codeLines.join('\n')}
            </code>
          </pre>
        </div>
      );
      continue;
    }

    // Headers
    if (line.startsWith('## ')) {
      elements.push(
        <h3 key={i} className="text-sm font-semibold text-stone-800 dark:text-stone-200 uppercase tracking-wider mt-4 mb-1.5 pb-1 border-b border-stone-200 dark:border-stone-700">
          {line.slice(3)}
        </h3>
      );
      i++;
      continue;
    }
    if (line.startsWith('### ')) {
      elements.push(
        <h4 key={i} className="text-sm font-semibold text-stone-700 dark:text-stone-300 mt-3 mb-1">
          {line.slice(4)}
        </h4>
      );
      i++;
      continue;
    }

    // Unordered list (supports indented sub-items)
    if (/^(\s*)[-*] /.test(line)) {
      const items: { text: string; indent: number }[] = [];
      while (i < lines.length && /^(\s*)[-*] /.test(lines[i])) {
        const match = lines[i].match(/^(\s*)[-*] (.*)/)!;
        items.push({ text: match[2], indent: match[1].length });
        i++;
      }
      const minIndent = Math.min(...items.map(it => it.indent));
      elements.push(
        <ul key={`ul${i}`} className="space-y-0.5 my-1">
          {items.map((item, j) => {
            const depth = Math.floor((item.indent - minIndent) / 2);
            return (
              <li key={j} className="text-sm text-stone-600 dark:text-stone-400 flex gap-1.5" style={{ paddingLeft: depth * 12 }}>
                <span className="text-stone-300 mt-0.5 shrink-0">{depth > 0 ? '\u25E6' : '\u2022'}</span>
                <span>{parseLine(item.text)}</span>
              </li>
            );
          })}
        </ul>
      );
      continue;
    }

    // Numbered list
    if (/^\d+\. /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\. /, ''));
        i++;
      }
      elements.push(
        <ol key={`ol${i}`} className="space-y-0.5 my-1">
          {items.map((item, j) => (
            <li key={j} className="text-sm text-stone-600 dark:text-stone-400 flex gap-1.5">
              <span className="text-stone-400 font-mono text-xs mt-0.5 shrink-0 w-3 text-right">{j + 1}.</span>
              <span>{parseLine(item)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Empty line
    if (!line.trim()) {
      i++;
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={i} className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed my-1">
        {parseLine(line)}
      </p>
    );
    i++;
  }

  return <div>{elements}</div>;
}
