import type { RestrictionSite } from '../../types/analysis';

interface Props {
  sites: RestrictionSite[];
  seqLength: number;
}

const ENZYME_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4',
  '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e',
];

export function RestrictionMap({ sites, seqLength }: Props) {
  if (sites.length === 0) return null;

  const width = 700;
  const height = 200;
  const marginLeft = 10;
  const marginRight = 10;
  const lineY = 60;
  const usableWidth = width - marginLeft - marginRight;

  const scale = (pos: number) => marginLeft + (pos / seqLength) * usableWidth;

  const enzymeColorMap = new Map<string, string>();
  const enzymes = [...new Set(sites.map(s => s.enzyme))];
  enzymes.forEach((e, i) => enzymeColorMap.set(e, ENZYME_COLORS[i % ENZYME_COLORS.length]));

  // Stagger labels to avoid overlap
  const labelSites = sites.map((site, i) => ({
    ...site,
    labelY: lineY + 20 + (i % 4) * 16,
  }));

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Restriction Enzyme Cut Map</h3>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ minWidth: 500 }}>
          {/* Sequence line */}
          <line x1={marginLeft} y1={lineY} x2={marginLeft + usableWidth} y2={lineY} stroke="#6b7280" strokeWidth={3} />

          {/* Scale ticks */}
          {[0, 0.25, 0.5, 0.75, 1].map(frac => {
            const x = scale(frac * seqLength);
            return (
              <g key={frac}>
                <line x1={x} y1={lineY - 5} x2={x} y2={lineY + 5} stroke="#9ca3af" strokeWidth={1} />
                <text x={x} y={lineY - 10} textAnchor="middle" fontSize={9} fill="#6b7280">
                  {frac === 0 ? '0' : `${((frac * seqLength) / 1000).toFixed(1)}k`}
                </text>
              </g>
            );
          })}

          {/* Cut sites */}
          {labelSites.map((site, i) => {
            const x = scale(site.position);
            const color = enzymeColorMap.get(site.enzyme)!;
            return (
              <g key={i}>
                <line x1={x} y1={lineY - 8} x2={x} y2={site.labelY - 2} stroke={color} strokeWidth={1} />
                <circle cx={x} cy={lineY} r={3} fill={color} />
                <text x={x} y={site.labelY + 8} textAnchor="middle" fontSize={7} fill={color} fontWeight="bold">
                  {site.enzyme}
                </text>
              </g>
            );
          })}

          {/* Legend */}
          {enzymes.slice(0, 10).map((enzyme, i) => (
            <g key={enzyme} transform={`translate(${marginLeft + (i % 5) * 130}, ${height - 20 + Math.floor(i / 5) * 14})`}>
              <rect width={8} height={8} fill={enzymeColorMap.get(enzyme)} rx={1} />
              <text x={12} y={8} fontSize={8} fill="#6b7280">{enzyme}</text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
