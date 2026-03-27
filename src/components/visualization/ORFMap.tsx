import type { ORF } from '../../types/analysis';
import { useState } from 'react';

const FRAME_COLORS: Record<number, string> = {
  1: '#3b82f6', 2: '#06b6d4', 3: '#8b5cf6',
  [-1]: '#f97316', [-2]: '#ef4444', [-3]: '#eab308',
};

const FRAME_LABELS = ['+1', '+2', '+3', '-1', '-2', '-3'];
const FRAME_VALUES = [1, 2, 3, -1, -2, -3];

interface Props {
  orfs: ORF[];
  seqLength: number;
}

export function ORFMap({ orfs, seqLength }: Props) {
  const [hovered, setHovered] = useState<number | null>(null);

  const width = 700;
  const trackHeight = 20;
  const trackGap = 4;
  const marginTop = 30;
  const marginLeft = 30;
  const marginRight = 10;
  const usableWidth = width - marginLeft - marginRight;
  const height = marginTop + (trackHeight + trackGap) * 6 + 20;

  const scale = (pos: number) => marginLeft + (pos / seqLength) * usableWidth;

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">ORF Map (6 Frames)</h3>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ minWidth: 500 }}>
          {/* Scale bar */}
          <line x1={marginLeft} y1={20} x2={marginLeft + usableWidth} y2={20} stroke="#d1d5db" strokeWidth={1} />
          {[0, 0.25, 0.5, 0.75, 1].map(frac => {
            const x = scale(frac * seqLength);
            const label = frac === 0 ? '0' : `${((frac * seqLength) / 1000).toFixed(1)}k`;
            return (
              <g key={frac}>
                <line x1={x} y1={16} x2={x} y2={24} stroke="#9ca3af" strokeWidth={1} />
                <text x={x} y={12} textAnchor="middle" fontSize={9} fill="#6b7280">{label}</text>
              </g>
            );
          })}

          {/* Tracks */}
          {FRAME_VALUES.map((frame, i) => {
            const y = marginTop + i * (trackHeight + trackGap);
            const frameOrfs = orfs.filter(o => o.frame === frame);

            return (
              <g key={frame}>
                <text x={5} y={y + trackHeight / 2 + 3} fontSize={9} fill="#6b7280" fontFamily="monospace">
                  {FRAME_LABELS[i]}
                </text>
                <rect
                  x={marginLeft} y={y}
                  width={usableWidth} height={trackHeight}
                  fill="#f3f4f6" rx={2}
                />
                {frameOrfs.map((orf, j) => {
                  const x = scale(orf.start);
                  const w = Math.max(2, scale(orf.end) - scale(orf.start));
                  const idx = orfs.indexOf(orf);
                  return (
                    <rect
                      key={j}
                      x={x} y={y + 2}
                      width={w} height={trackHeight - 4}
                      fill={FRAME_COLORS[frame]}
                      opacity={hovered === idx ? 1 : 0.7}
                      rx={2}
                      onMouseEnter={() => setHovered(idx)}
                      onMouseLeave={() => setHovered(null)}
                      className="cursor-pointer"
                    />
                  );
                })}
              </g>
            );
          })}

          {/* Tooltip */}
          {hovered !== null && orfs[hovered] && (() => {
            const orf = orfs[hovered];
            const x = Math.min(scale(orf.start), width - 160);
            const frameIdx = FRAME_VALUES.indexOf(orf.frame);
            const y = marginTop + frameIdx * (trackHeight + trackGap) - 30;
            return (
              <g>
                <rect x={x} y={y} width={150} height={24} fill="white" stroke="#d1d5db" rx={4} />
                <text x={x + 6} y={y + 16} fontSize={10} fill="#374151">
                  {orf.length}nt | {Math.floor(orf.length / 3)}aa | {orf.start}-{orf.end}
                </text>
              </g>
            );
          })()}
        </svg>
      </div>
    </div>
  );
}
