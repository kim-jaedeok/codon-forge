import { useMemo, useRef, useState, useEffect, useCallback } from 'react';

const COLORS: Record<string, string> = {
  A: '#22c55e', T: '#ef4444', G: '#eab308', C: '#3b82f6',
};
const LINE_WIDTH = 60;
const LINE_HEIGHT = 20;

export function SequenceViewer({ sequence }: { sequence: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(400);

  const totalLines = Math.ceil(sequence.length / LINE_WIDTH);
  const totalHeight = totalLines * LINE_HEIGHT;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(entries => {
      setContainerHeight(entries[0].contentRect.height);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  }, []);

  const visibleLines = useMemo(() => {
    const startLine = Math.max(0, Math.floor(scrollTop / LINE_HEIGHT) - 2);
    const endLine = Math.min(totalLines, Math.ceil((scrollTop + containerHeight) / LINE_HEIGHT) + 2);
    const lines = [];

    for (let i = startLine; i < endLine; i++) {
      const start = i * LINE_WIDTH;
      const chunk = sequence.substring(start, start + LINE_WIDTH);
      lines.push({ index: i, start, chunk });
    }

    return lines;
  }, [sequence, scrollTop, containerHeight, totalLines]);

  return (
    <div>
      <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">
        Sequence Viewer
        <span className="font-normal text-gray-500 ml-2">({sequence.length.toLocaleString()} bp)</span>
      </h3>
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-80 overflow-y-auto bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
        style={{ position: 'relative' }}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          {visibleLines.map(({ index, start, chunk }) => (
            <div
              key={index}
              style={{
                position: 'absolute',
                top: index * LINE_HEIGHT,
                left: 0,
                right: 0,
                height: LINE_HEIGHT,
                display: 'flex',
                alignItems: 'center',
                paddingLeft: 8,
              }}
            >
              <span
                className="text-gray-400 text-sm select-none"
                style={{ width: 60, fontFamily: 'monospace', textAlign: 'right', paddingRight: 12 }}
              >
                {(start + 1).toLocaleString()}
              </span>
              <span style={{ fontFamily: 'monospace', fontSize: 12, letterSpacing: 0.5 }}>
                {chunk.split('').map((ch, j) => (
                  <span key={j} style={{ color: COLORS[ch] || '#6b7280' }}>{ch}</span>
                ))}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
