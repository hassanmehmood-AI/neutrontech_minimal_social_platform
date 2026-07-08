'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAdminContext } from '../AdminContext';

type AdminUser = { id: string; name: string; joined: string };

export default function RecentSignups({ showMoreHref }: { showMoreHref?: string }) {
  const { accessToken } = useAdminContext();
  const [users, setUsers] = useState<AdminUser[] | null>(null);

  useEffect(() => {
    fetch('/api/admin/users', { headers: { Authorization: `Bearer ${accessToken}` } })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: AdminUser[] | null) => data && setUsers(data.slice(0, 5)));
  }, [accessToken]);

  return (
    <div className="h-full flex flex-col bg-surface-container-lowest p-lg rounded-xl card-shadow border border-surface-variant/50">
      <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-lg">Recent Signups</h3>
      <div className="space-y-md">
        {!users && <p className="font-body-sm text-body-sm text-secondary">Loading…</p>}
        {users?.length === 0 && (
          <p className="font-body-sm text-body-sm text-secondary">No signups yet.</p>
        )}
        {users?.map((u) => (
          <div key={u.id} className="flex items-center justify-between">
            <div className="flex items-center gap-sm">
              <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-[10px]">
                {u.name.slice(0, 2).toUpperCase()}
              </div>
              <span className="font-label-md text-label-md text-on-surface">{u.name}</span>
            </div>
            <span className="text-[11px] text-secondary">
              {new Date(u.joined).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
        ))}
      </div>
      {showMoreHref && (
        <Link
          href={showMoreHref}
          className="block text-center mt-auto pt-md border-t border-surface-variant/50 font-label-md text-label-md text-primary hover:underline"
        >
          Show more
        </Link>
      )}
    </div>
  );
}
