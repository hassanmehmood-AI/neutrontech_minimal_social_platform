'use client';

import { useEffect, useState } from 'react';
import { useAdminContext } from '../AdminContext';

type Keyword = { query: string; count: number };

export default function TopKeywords() {
  const { accessToken } = useAdminContext();
  const [keywords, setKeywords] = useState<Keyword[] | null>(null);

  useEffect(() => {
    fetch('/api/admin/keywords', { headers: { Authorization: `Bearer ${accessToken}` } })
      .then((res) => res.json())
      .then(setKeywords);
  }, [accessToken]);

  const top = keywords?.[0];

  return (
    <div className="bg-surface-container-lowest p-lg rounded-xl card-shadow border border-surface-variant/50">
      <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-lg">
        Top Search Keywords (7d)
      </h3>
      <div className="flex flex-wrap gap-sm">
        {!keywords && <p className="font-body-sm text-body-sm text-secondary">Loading…</p>}
        {keywords?.length === 0 && (
          <p className="font-body-sm text-body-sm text-secondary">No searches logged yet.</p>
        )}
        {keywords?.map((k) => (
          <div
            key={k.query}
            className="px-md py-2 bg-surface-container-low rounded-full flex items-center gap-xs"
          >
            <span className="font-label-md text-label-md text-on-surface font-bold">{k.query}</span>
            <span className="text-[11px] text-secondary">×{k.count}</span>
          </div>
        ))}
      </div>
      {top && (
        <div className="mt-lg p-md bg-primary-container/10 rounded-lg">
          <div className="flex items-center gap-md">
            <span className="material-symbols-outlined text-primary">insights</span>
            <p className="font-body-sm text-body-sm text-primary font-bold">
              &quot;{top.query}&quot; is the top search this week ({top.count} searches)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
