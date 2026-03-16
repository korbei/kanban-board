import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProjects } from '../api/projects.js';
import { BarChart3, CheckCircle, Clock, AlertTriangle, FolderKanban } from 'lucide-react';
import WorldMap from '../components/WorldMap.jsx';

const statusColors = {
  New: { bg: 'bg-nord9', bar: '#81A1C1' },
  Active: { bg: 'bg-nord10', bar: '#5E81AC' },
  InProgress: { bg: 'bg-nord13', bar: '#EBCB8B' },
  Done: { bg: 'bg-nord14', bar: '#A3BE8C' },
  'On Hold': { bg: 'bg-nord12', bar: '#D08770' },
};

const statusLabels = {
  New: 'New',
  Active: 'Active',
  InProgress: 'In Progress',
  Done: 'Done',
  'On Hold': 'On Hold',
};

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function parseDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return d;
}

// --- Status Statistics Card ---
function StatusStats({ projects }) {
  const counts = {};
  for (const p of projects) {
    counts[p.status] = (counts[p.status] || 0) + 1;
  }
  const total = projects.length;
  const statuses = ['New', 'InProgress', 'Done', 'On Hold'];

  return (
    <div className="bg-nord6 dark:bg-nord1 rounded-xl border border-nord4 dark:border-nord2 p-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 size={20} className="text-nord9" />
        <h2 className="text-lg font-semibold text-nord0 dark:text-nord6">Project Status</h2>
      </div>
      <div className="space-y-3">
        {statuses.map((s) => {
          const count = counts[s] || 0;
          const pct = total > 0 ? (count / total) * 100 : 0;
          return (
            <div key={s}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-nord0 dark:text-nord4 font-medium">{statusLabels[s]}</span>
                <span className="text-nord3 dark:text-nord4">
                  {count} <span className="text-xs">({Math.round(pct)}%)</span>
                </span>
              </div>
              <div className="w-full h-2.5 bg-nord4/40 dark:bg-nord2 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: statusColors[s]?.bar || '#81A1C1' }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 pt-4 border-t border-nord4 dark:border-nord2 text-sm text-nord3 dark:text-nord4">
        Total projects: <span className="font-semibold text-nord0 dark:text-nord6">{total}</span>
      </div>
    </div>
  );
}

// --- Deadline Stats Card ---
function DeadlineStats({ projects }) {
  const done = projects.filter((p) => p.status === 'Done');
  const doneWithDeadline = done.filter((p) => p.deadline);
  const beforeDeadline = doneWithDeadline.filter((p) => {
    const end = parseDate(p.endDate);
    const deadline = parseDate(p.deadline);
    if (!end || !deadline) return true; // no end date = assume on time
    return end <= deadline;
  });
  const afterDeadline = doneWithDeadline.filter((p) => {
    const end = parseDate(p.endDate);
    const deadline = parseDate(p.deadline);
    if (!end || !deadline) return false;
    return end > deadline;
  });
  const noDeadline = done.filter((p) => !p.deadline);

  const total = done.length;
  const onTimePct = total > 0 ? Math.round((beforeDeadline.length / total) * 100) : 0;

  return (
    <div className="bg-nord6 dark:bg-nord1 rounded-xl border border-nord4 dark:border-nord2 p-6">
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle size={20} className="text-nord14" />
        <h2 className="text-lg font-semibold text-nord0 dark:text-nord6">Completed Projects</h2>
      </div>

      {total === 0 ? (
        <p className="text-sm text-nord3 dark:text-nord4 italic">No completed projects yet</p>
      ) : (
        <>
          {/* Big donut-style stat */}
          <div className="flex items-center gap-6 mb-4">
            <div className="relative w-24 h-24 shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.5" fill="none" strokeWidth="3" className="stroke-nord4/40 dark:stroke-nord2" />
                <circle
                  cx="18" cy="18" r="15.5" fill="none" strokeWidth="3"
                  strokeDasharray={`${onTimePct} ${100 - onTimePct}`}
                  strokeLinecap="round"
                  className="stroke-nord14"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-nord0 dark:text-nord6">{onTimePct}%</span>
              </div>
            </div>
            <div className="text-sm space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-nord14" />
                <span className="text-nord0 dark:text-nord4">On time: <span className="font-semibold">{beforeDeadline.length}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-nord11" />
                <span className="text-nord0 dark:text-nord4">Overdue: <span className="font-semibold">{afterDeadline.length}</span></span>
              </div>
              {noDeadline.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-nord3" />
                  <span className="text-nord0 dark:text-nord4">No deadline: <span className="font-semibold">{noDeadline.length}</span></span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-nord4 dark:border-nord2 text-sm text-nord3 dark:text-nord4">
            Total completed: <span className="font-semibold text-nord0 dark:text-nord6">{total}</span>
          </div>
        </>
      )}
    </div>
  );
}

// --- Summary Cards ---
function SummaryCards({ projects }) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const oneWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const active = projects.filter((p) => p.status === 'New').length;
  const done = projects.filter((p) => p.status === 'Done').length;
  const urgent = projects.filter((p) => {
    if (p.status === 'Done' || !p.deadline) return false;
    const dl = parseDate(p.deadline);
    return dl && dl <= oneWeek && dl >= now;
  }).length;
  const overdue = projects.filter((p) => {
    if (!p.deadline) return false;
    const dl = parseDate(p.deadline);
    if (!dl || dl >= now) return false;
    // Not done yet and past deadline
    if (p.status !== 'Done') return true;
    // Done but finished after deadline
    const end = parseDate(p.endDate);
    return end && end > dl;
  }).length;

  const cards = [
    { label: 'Total', value: projects.length, icon: FolderKanban, cardBg: 'bg-nord9', iconBg: 'bg-white/20' },
    { label: 'New', value: active, icon: Clock, cardBg: 'bg-nord10', iconBg: 'bg-white/20' },
    { label: 'Completed', value: done, icon: CheckCircle, cardBg: 'bg-nord14', iconBg: 'bg-nord0/15' },
    { label: 'Due Soon', value: urgent, icon: AlertTriangle, cardBg: 'bg-nord13', iconBg: 'bg-nord0/15' },
    { label: 'Overdue', value: overdue, icon: AlertTriangle, cardBg: 'bg-nord11', iconBg: 'bg-white/20' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((c) => {
        const isLight = c.cardBg === 'bg-nord13' || c.cardBg === 'bg-nord14';
        return (
          <div key={c.label} className={`${c.cardBg} rounded-xl p-4 shadow-sm`}>
            <div className={`inline-flex p-2 rounded-lg ${c.iconBg} mb-2`}>
              <c.icon size={18} className={isLight ? 'text-nord0' : 'text-white'} />
            </div>
            <p className={`text-3xl font-bold ${isLight ? 'text-nord0' : 'text-white'}`}>{c.value}</p>
            <p className={`text-sm font-medium mt-0.5 ${isLight ? 'text-nord0/70' : 'text-white/75'}`}>{c.label}</p>
          </div>
        );
      })}
    </div>
  );
}

// --- Timeline Component ---
function Timeline({ projects }) {
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const timelineProjects = useMemo(() => {
    return projects
      .filter((p) => p.startDate || p.endDate || p.deadline)
      .sort((a, b) => {
        const aDate = a.startDate || a.deadline || a.endDate;
        const bDate = b.startDate || b.deadline || b.endDate;
        return new Date(aDate) - new Date(bDate);
      });
  }, [projects]);

  const today = new Date().toISOString().split('T')[0];

  const { minDate, maxDate, totalDays } = useMemo(() => {
    if (timelineProjects.length === 0) return { minDate: new Date(), maxDate: new Date(), totalDays: 1 };
    let min = Infinity, max = -Infinity;
    for (const p of timelineProjects) {
      const effectiveEnd = p.endDate || (p.startDate ? today : null);
      for (const d of [p.startDate, effectiveEnd, p.deadline]) {
        if (d) {
          const t = new Date(d).getTime();
          if (t < min) min = t;
          if (t > max) max = t;
        }
      }
    }
    // Add padding
    const pad = (max - min) * 0.05 || 7 * 24 * 60 * 60 * 1000;
    min -= pad;
    max += pad;
    const days = Math.max(Math.ceil((max - min) / (24 * 60 * 60 * 1000)), 1);
    return { minDate: new Date(min), maxDate: new Date(max), totalDays: days };
  }, [timelineProjects]);

  function dateToPercent(dateStr) {
    if (!dateStr) return null;
    const t = new Date(dateStr).getTime();
    return ((t - minDate.getTime()) / (maxDate.getTime() - minDate.getTime())) * 100;
  }

  // Generate axis markers with adaptive interval based on range
  const monthMarkers = useMemo(() => {
    const rangeMs = maxDate.getTime() - minDate.getTime();
    const rangeDays = rangeMs / (24 * 60 * 60 * 1000);
    const rangeMonths = rangeDays / 30;

    // Pick interval and label format based on range
    let stepMonths, labelFn;
    if (rangeMonths <= 6) {
      stepMonths = 1;
      labelFn = (d) => d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } else if (rangeMonths <= 18) {
      stepMonths = 3; // quarterly
      labelFn = (d) => `Q${Math.floor(d.getMonth() / 3) + 1} ${d.getFullYear()}`;
    } else if (rangeMonths <= 48) {
      stepMonths = 6;
      labelFn = (d) => d.getMonth() === 0
        ? `${d.getFullYear()}`
        : `${d.toLocaleDateString('en-US', { month: 'short' })} ${d.getFullYear()}`;
    } else {
      stepMonths = 12; // yearly
      labelFn = (d) => `${d.getFullYear()}`;
    }

    const markers = [];
    const d = new Date(minDate);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    // Align backwards to the nearest step boundary at or before minDate
    const remainder = d.getMonth() % stepMonths;
    d.setMonth(d.getMonth() - remainder);
    while (d <= maxDate) {
      const pct = ((d.getTime() - minDate.getTime()) / rangeMs) * 100;
      // Allow markers slightly outside range so edge labels aren't lost
      if (pct >= -3 && pct <= 103) {
        markers.push({ date: new Date(d), pct: Math.max(0, Math.min(100, pct)), label: labelFn(d) });
      }
      d.setMonth(d.getMonth() + stepMonths);
    }
    return markers;
  }, [minDate, maxDate]);

  // Today marker
  const todayPct = dateToPercent(new Date().toISOString().split('T')[0]);

  if (timelineProjects.length === 0) {
    return (
      <div className="bg-nord6 dark:bg-nord1 rounded-xl border border-nord4 dark:border-nord2 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={20} className="text-nord8" />
          <h2 className="text-lg font-semibold text-nord0 dark:text-nord6">Project Timeline</h2>
        </div>
        <p className="text-sm text-nord3 dark:text-nord4 italic">No projects with dates to display</p>
      </div>
    );
  }

  return (
    <div className="bg-nord6 dark:bg-nord1 rounded-xl border border-nord4 dark:border-nord2 p-6">
      <div className="flex items-center gap-2 mb-2">
        <Clock size={20} className="text-nord8" />
        <h2 className="text-lg font-semibold text-nord0 dark:text-nord6">Project Timeline</h2>
      </div>
      <div className="flex items-center gap-4 mb-4 text-xs text-nord3 dark:text-nord4">
        <span className="flex items-center gap-1.5"><span className="inline-block w-6 h-2 rounded-full bg-nord9" /> Duration</span>
        <span className="flex items-center gap-1.5"><span className="inline-block w-2 h-2 rounded-full bg-nord11" /> Deadline</span>
        <span className="flex items-center gap-1.5"><span className="inline-block w-0 h-3 border-l-2 border-dashed border-nord14" /> Today</span>
      </div>

      <div ref={containerRef} className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Time axis - uses same layout as rows: w-36 label spacer + flex-1 axis area */}
          <div className="flex mb-1 border-b border-nord4/50 dark:border-nord2/50">
            <div className="w-36 shrink-0" />
            <div className="flex-1 relative h-6">
              {monthMarkers.map((m, i) => (
                <div key={i} className="absolute top-0 h-full flex flex-col items-center" style={{ left: `${m.pct}%`, transform: 'translateX(-50%)' }}>
                  <span className="text-[10px] text-nord3 dark:text-nord4 whitespace-nowrap">
                    {m.label}
                  </span>
                  <div className="flex-1 w-px bg-nord4/30 dark:bg-nord2/30" />
                </div>
              ))}
            </div>
          </div>

          {/* Rows */}
          <div className="space-y-1.5">
            {timelineProjects.map((p) => {
              const startPct = dateToPercent(p.startDate);
              const effectiveEndPct = dateToPercent(p.endDate) ?? (p.startDate ? dateToPercent(today) : null);
              const deadlinePct = dateToPercent(p.deadline);
              const color = statusColors[p.status]?.bar || '#81A1C1';
              const hasRange = startPct != null && effectiveEndPct != null;
              const pointPct = startPct ?? effectiveEndPct ?? deadlinePct;
              const hasRealEnd = !!p.endDate;

              return (
                <div
                  key={p.id}
                  className="relative flex items-center h-9 group cursor-pointer hover:bg-nord4/20 dark:hover:bg-nord2/20 rounded-lg transition-colors"
                  onClick={() => navigate(`/projects/${p.id}/tasks`)}
                >
                  {/* Label */}
                  <div className="w-36 shrink-0 pr-3 truncate text-xs font-medium text-nord0 dark:text-nord4" title={p.title}>
                    {p.title}
                  </div>

                  {/* Bar area */}
                  <div className="flex-1 relative h-full">
                    {/* Today line */}
                    {todayPct != null && todayPct >= 0 && todayPct <= 100 && (
                      <div
                        className="absolute top-0 h-full w-0 border-l-2 border-dashed border-nord14/60 z-10"
                        style={{ left: `${todayPct}%` }}
                      />
                    )}

                    {/* Duration bar */}
                    {hasRange ? (
                      <div
                        className={`absolute top-1/2 -translate-y-1/2 h-3 rounded-full opacity-85 group-hover:opacity-100 transition-opacity ${!hasRealEnd ? 'rounded-r-none border-r-2 border-dashed border-nord3 dark:border-nord4' : ''}`}
                        style={{
                          left: `${startPct}%`,
                          width: `${Math.max(effectiveEndPct - startPct, 0.5)}%`,
                          backgroundColor: color,
                        }}
                        title={`${formatDate(p.startDate)} - ${hasRealEnd ? formatDate(p.endDate) : 'Ongoing'}`}
                      />
                    ) : pointPct != null ? (
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full opacity-85 group-hover:opacity-100"
                        style={{ left: `${pointPct}%`, backgroundColor: color }}
                        title={formatDate(p.startDate || p.endDate)}
                      />
                    ) : null}

                    {/* Deadline marker */}
                    {deadlinePct != null && (
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-nord11 border-2 border-nord6 dark:border-nord1 z-20"
                        style={{ left: `${deadlinePct}%`, transform: 'translate(-50%, -50%)' }}
                        title={`Deadline: ${formatDate(p.deadline)}`}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Dashboard Page ---
export default function DashboardPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects()
      .then(setProjects)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-nord8 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-nord0 dark:text-nord6">Dashboard</h1>

      {/* Summary cards */}
      <SummaryCards projects={projects} />

      {/* Stats + Map row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <StatusStats projects={projects} />
          <DeadlineStats projects={projects} />
        </div>
        <div className="lg:col-span-2">
          <WorldMap projects={projects} />
        </div>
      </div>

      {/* Timeline */}
      <Timeline projects={projects} />
    </div>
  );
}
