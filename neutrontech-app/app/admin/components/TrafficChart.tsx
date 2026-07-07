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

export default function TrafficChart() {
  const { accessToken } = useAdminContext();
  const [range, setRange] = useState<Range>('today');
  const [data, setData] = useState<Activity | null>(null);

  useEffect(() => {
    setData(null);
    fetch(`/api/admin/activity?range=${range}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((res) => res.json())
      .then(setData);
  }, [accessToken, range]);

  const max = data ? Math.max(1, ...data.counts) : 1;

  return (
    <div className="lg:col-span-2 h-full flex flex-col bg-surface-container-lowest p-lg rounded-xl card-shadow border border-surface-variant/50">
      <div className="flex justify-between items-center mb-lg">
        <div>
          <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Activity Overview</h3>
          <p className="font-body-sm text-body-sm text-secondary">
            Posts, comments &amp; signups over time
          </p>
        </div>
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

      {!data ? (
        <div className="h-64 flex items-center justify-center text-secondary font-body-sm text-body-sm">
          Loading…
        </div>
      ) : (
        <>
          <div className="h-64 flex items-end gap-1 px-md">
            {data.counts.map((count, i) => (
              <div
                key={i}
                title={`${data.labels[i]}: ${count}`}
                className={
                  count === max && max > 0
                    ? 'flex-1 bg-primary rounded-t-md transition-all'
                    : 'flex-1 bg-primary/10 hover:bg-primary/30 rounded-t-md transition-all'
                }
                style={{ height: `${Math.max(4, (count / max) * 100)}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-md px-md text-[10px] text-outline font-bold uppercase tracking-widest">
            {data.labels
              .filter((_, i) => i % Math.ceil(data.labels.length / 6) === 0)
              .map((label) => (
                <span key={label}>{label}</span>
              ))}
          </div>
        </>
      )}
    </div>
  );
}
