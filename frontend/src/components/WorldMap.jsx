import { useState, useMemo } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { alpha2ToNumeric } from '../data/countryNumeric.js';
import { countries, countryFlag } from '../data/countries.js';
import { Globe } from 'lucide-react';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

export default function WorldMap({ projects }) {
  const [tooltip, setTooltip] = useState(null);

  // Build a map of numeric country code -> list of projects
  const countryProjects = useMemo(() => {
    const map = {};
    for (const p of projects) {
      if (!p.country) continue;
      const numeric = alpha2ToNumeric[p.country];
      if (!numeric) continue;
      if (!map[numeric]) map[numeric] = { alpha2: p.country, projects: [] };
      map[numeric].projects.push(p);
    }
    return map;
  }, [projects]);

  const hasProjects = Object.keys(countryProjects).length > 0;

  return (
    <div className="bg-nord6 dark:bg-nord1 rounded-xl border border-nord4 dark:border-nord2 p-6 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Globe size={20} className="text-nord7" />
        <h2 className="text-lg font-semibold text-nord0 dark:text-nord6">Projects by Country</h2>
      </div>

      {!hasProjects ? (
        <p className="text-sm text-nord3 dark:text-nord4 italic">No projects with countries assigned</p>
      ) : (
        <div className="relative flex-1 overflow-hidden" style={{ maxHeight: '500px' }}>
          <ComposableMap
            projectionConfig={{ scale: 147, center: [0, 5] }}
            width={800}
            height={450}
            style={{ width: '100%', height: '100%' }}
          >
            <ZoomableGroup zoom={2} center={[9, 34]}>
              <Geographies geography={GEO_URL}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const entry = countryProjects[geo.id];
                    const isHighlighted = !!entry;
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        onMouseEnter={() => {
                          if (entry) {
                            const c = countries.find((x) => x.code === entry.alpha2);
                            setTooltip({
                              name: c?.name || geo.properties.name,
                              flag: countryFlag(entry.alpha2),
                              count: entry.projects.length,
                              titles: entry.projects.map((p) => p.title),
                            });
                          }
                        }}
                        onMouseLeave={() => setTooltip(null)}
                        style={{
                          default: {
                            fill: isHighlighted ? '#81A1C1' : '#D8DEE9',
                            stroke: '#ECEFF4',
                            strokeWidth: 0.5,
                            outline: 'none',
                          },
                          hover: {
                            fill: isHighlighted ? '#5E81AC' : '#C8CED9',
                            stroke: '#ECEFF4',
                            strokeWidth: 0.5,
                            outline: 'none',
                            cursor: isHighlighted ? 'pointer' : 'default',
                          },
                          pressed: {
                            fill: isHighlighted ? '#5E81AC' : '#D8DEE9',
                            outline: 'none',
                          },
                        }}
                      />
                    );
                  })
                }
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>

          {/* Tooltip */}
          {tooltip && (
            <div className="absolute top-3 right-3 bg-nord6 dark:bg-nord2 border border-nord4 dark:border-nord3 rounded-lg shadow-lg px-4 py-3 max-w-[220px] pointer-events-none z-10">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-lg">{tooltip.flag}</span>
                <span className="text-sm font-semibold text-nord0 dark:text-nord6">{tooltip.name}</span>
              </div>
              <p className="text-xs text-nord3 dark:text-nord4 mb-1">
                {tooltip.count} project{tooltip.count !== 1 ? 's' : ''}
              </p>
              <ul className="text-xs text-nord0 dark:text-nord4 space-y-0.5">
                {tooltip.titles.slice(0, 5).map((t, i) => (
                  <li key={i} className="truncate">- {t}</li>
                ))}
                {tooltip.titles.length > 5 && (
                  <li className="text-nord3 dark:text-nord4 italic">+{tooltip.titles.length - 5} more</li>
                )}
              </ul>
            </div>
          )}

          {/* Legend */}
          <div className="flex items-center gap-4 mt-2 text-xs text-nord3 dark:text-nord4">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: '#81A1C1' }} />
              Has projects
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: '#D8DEE9' }} />
              No projects
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
