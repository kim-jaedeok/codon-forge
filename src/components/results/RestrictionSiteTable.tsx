import type { RestrictionSite } from '../../types/analysis';

export function RestrictionSiteTable({ sites }: { sites: RestrictionSite[] }) {
  const grouped: Record<string, RestrictionSite[]> = {};
  for (const site of sites) {
    if (!grouped[site.enzyme]) grouped[site.enzyme] = [];
    grouped[site.enzyme].push(site);
  }

  const enzymes = Object.keys(grouped).sort();

  return (
    <div className="space-y-3">
      <p className="text-base text-gray-600 dark:text-gray-400">
        {sites.length} cut sites found ({enzymes.length} enzymes)
      </p>

      {sites.length === 0 ? (
        <p className="text-base text-gray-500 p-4 text-center">No restriction enzyme cut sites found.</p>
      ) : (
        <div className="space-y-2">
          {enzymes.map(enzyme => (
            <div key={enzyme} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-base">{enzyme}</span>
                <span className="text-sm text-gray-500 font-mono">{grouped[enzyme][0].recognitionSequence}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {grouped[enzyme].map((site, i) => (
                  <span
                    key={i}
                    className={`px-2 py-0.5 text-sm font-mono rounded ${
                      site.strand === '+'
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                    }`}
                  >
                    {site.position.toLocaleString()} ({site.strand})
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
