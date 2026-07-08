'use client';

import { useEffect, useState } from 'react';
import { useAdminContext } from '../AdminContext';

type Range = 'today' | 'week' | 'month';
type Activity = { labels: string[]; counts: number[]; total: number };

const RANGES: { key: Range; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
];

function niceMax(value: number): number {
  if (value <= 0) return 1;
  const exponent = Math.floor(Math.log10(value));
  const fraction = value / Math.pow(10, exponent);
  const niceFraction = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
  return niceFraction * Math.pow(10, exponent);
}

export default function TrafficChart() {
  const { accessToken } = useAdminContext();
  const [range, setRange] = useState<Range>('today');
  const [data, setData] = useState<Activity | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => {
    setData(null);
    setHovered(null);
    fetch(`/api/admin/activity?range=${range}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then(setData);
  }, [accessToken, range]);

  const scaleMax = niceMax(data ? Math.max(...data.counts, 0) : 0);
  const peakIndex =
    data && Math.max(...data.counts, 0) > 0
      ? data.counts.indexOf(Math.max(...data.counts))
      : -1;
  const declutter = data ? Math.max(1, Math.ceil(data.labels.length / 6)) : 1;

  return (
    <div className="lg:col-span-2 h-full flex flex-col bg-surface-container-lowest p-lg rounded-xl card-shadow border border-surface-variant/50">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-md mb-lg">
        <div>
          <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Activity Overview</h3>
          <p className="font-body-sm text-body-sm text-secondary">
            Posts, comments &amp; signups over time
          </p>
        </div>
        <div className="flex items-center gap-md flex-wrap">
          {data && (
            <div className="px-md py-1.5 bg-surface-container-low rounded-lg text-right">
              <p className="text-[10px] font-bold text-outline uppercase tracking-widest">Total</p>
              <p className="font-label-md text-label-md font-bold text-on-surface tabular-nums">
                {data.total.toLocaleString()}
              </p>
            </div>
          )}
          <div className="flex bg-surface-container-low p-1 rounded-lg">
            {RANGES.map((r) => (
              <button
                key={r.key}
                onClick={() => setRange(r.key)}
                className={
                  r.key === range
                    ? 'px-md py-1.5 font-label-md text-label-md font-bold text-primary bg-surface-container-lowest rounded-md shadow-sm'
                    : 'px-md py-1.5 font-label-md text-label-md text-secondary hover:text-on-surface transition-colors'
                }
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {!data ? (
        <div className="h-64 flex items-center justify-center text-secondary font-body-sm text-body-sm">
          Loading…
        </div>
      ) : data.total === 0 ? (
        <div className="h-64 flex items-center justify-center text-secondary font-body-sm text-body-sm">
          No activity in this period.
        </div>
      ) : (
        <>
          <div className="relative h-64">
            {/* Gridlines + y-axis ticks */}
            <div className="absolute inset-0 flex flex-col justify-between">
              {[scaleMax, scaleMax / 2, 0].map((tick, i) => (
                <div key={i} className="flex items-center gap-sm">
                  <span className="w-8 shrink-0 text-right text-[10px] font-bold text-outline tabular-nums">
                    {Math.round(tick).toLocaleString()}
                  </span>
                  <div className="flex-1 border-t border-outline-variant/60" />
                </div>
              ))}
            </div>

            {/* Bars */}
            <div className="absolute inset-0 flex items-end gap-[2px] pl-12">
              {data.counts.map((count, i) => {
                const pct = Math.max(3, (count / scaleMax) * 100);
                const isPeak = i === peakIndex;
                const isHovered = hovered === i;
                return (
                  <div
                    key={i}
                    className="relative flex-1 h-full flex flex-col justify-end items-center"
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered(null)}
                    onFocus={() => setHovered(i)}
                    onBlur={() => setHovered(null)}
                    tabIndex={0}
                    role="img"
                    aria-label={`${data.labels[i]}: ${count}`}
                  >
                    {(isHovered || (isPeak && hovered === null)) && (
                      <div className="pointer-events-none absolute bottom-full mb-2 z-10 flex flex-col items-center whitespace-nowrap rounded-md bg-inverse-surface px-sm py-1 shadow-sm">
                        <span className="font-bold text-inverse-on-surface text-[12px] tabular-nums">
                          {count.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-inverse-on-surface/70 uppercase tracking-wide">
                          {data.labels[i]}
                        </span>
                      </div>
                    )}
                    <div
                      className={
                        isPeak || isHovered
                          ? 'w-full max-w-[24px] mx-auto rounded-t-[4px] bg-primary transition-colors'
                          : 'w-full max-w-[24px] mx-auto rounded-t-[4px] bg-primary/15 transition-colors'
                      }
                      style={{ height: `${pct}%` }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex justify-between mt-md pl-12 text-[10px] text-outline font-bold uppercase tracking-widest">
            {data.labels
              .filter((_, i) => i % declutter === 0)
              .map((label, i) => (
                <span key={`${label}-${i}`} className={i % 2 === 1 ? 'hidden sm:inline' : ''}>
                  {label}
                </span>
              ))}
          </div>
        </>
      )}
    </div>
  );
}
