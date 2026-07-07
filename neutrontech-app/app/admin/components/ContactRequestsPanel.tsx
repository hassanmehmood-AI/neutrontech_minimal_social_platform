'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAdminContext } from '../AdminContext';

type ContactRequest = {
  id: string;
  name: string;
  email: string;
  message: string;
  status: 'new' | 'resolved';
  time: string;
};

export default function ContactRequestsPanel({ showMoreHref }: { showMoreHref?: string }) {
  const { accessToken } = useAdminContext();
  const [requests, setRequests] = useState<ContactRequest[] | null>(null);
  const [selected, setSelected] = useState<ContactRequest | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = () => {
    fetch('/api/admin/contact-requests', { headers: { Authorization: `Bearer ${accessToken}` } })
      .then((res) => res.json())
      .then(setRequests);
  };

  useEffect(load, [accessToken]);

  const deleteRequest = async (req: ContactRequest) => {
    if (!window.confirm(`Delete this query from ${req.name}? This cannot be undone.`)) return;
    setBusyId(req.id);
    const res = await fetch(`/api/admin/contact-requests/${req.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (res.ok) {
      load();
      setSelected(null);
    }
    setBusyId(null);
  };

  return (
    <div className="h-full flex flex-col bg-surface-container-lowest p-lg rounded-xl card-shadow border border-surface-variant/50">
      <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-lg">Contact Requests</h3>
      <div className="space-y-sm">
        {!requests && <p className="font-body-sm text-body-sm text-secondary">Loading…</p>}
        {requests?.length === 0 && (
          <p className="font-body-sm text-body-sm text-secondary">No contact requests yet.</p>
        )}
        {(showMoreHref ? requests?.slice(0, 5) : requests)?.map((req) => (
          <button
            key={req.id}
            onClick={() => setSelected(req)}
            className={
              req.status === 'new'
                ? 'w-full flex items-center gap-md p-md rounded-lg bg-primary/5 border border-primary/10 text-left'
                : 'w-full flex items-center gap-md p-md rounded-lg hover:bg-surface-container-low transition-colors text-left'
            }
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {req.name.slice(0, 1).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between">
                <p className="font-label-md text-label-md font-bold text-on-surface">{req.name}</p>
                {req.status === 'new' && (
                  <span className="text-[10px] font-bold text-primary">New</span>
                )}
              </div>
              <p className="text-[12px] text-secondary truncate">{req.message}</p>
            </div>
          </button>
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

      {selected && (
        <div
          onClick={() => setSelected(null)}
          className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-md"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[28rem] bg-surface-container-lowest rounded-xl card-shadow border border-surface-variant/50 p-lg"
          >
            <div className="flex justify-between items-start mb-md">
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Query Details</h3>
              <button
                onClick={() => setSelected(null)}
                className="text-secondary hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-md">
              <div>
                <p className="text-[11px] uppercase tracking-wider font-bold text-secondary mb-1">Submitted By</p>
                <p className="font-body-md text-body-md font-bold text-on-surface">{selected.name}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider font-bold text-secondary mb-1">Email</p>
                <a
                  href={`mailto:${selected.email}`}
                  className="font-body-md text-body-md text-primary hover:underline break-all"
                >
                  {selected.email}
                </a>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider font-bold text-secondary mb-1">Message</p>
                <p className="font-body-md text-body-md text-on-surface whitespace-pre-wrap leading-relaxed">
                  {selected.message}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider font-bold text-secondary mb-1">Time Submitted</p>
                <p className="font-body-sm text-body-sm text-on-surface">{selected.time}</p>
              </div>
            </div>

            {selected.status === 'resolved' && (
              <div className="mt-lg">
                <button
                  disabled={busyId === selected.id}
                  onClick={() => deleteRequest(selected)}
                  className="w-full py-2 rounded-md border border-red-200 text-red-600 font-label-md text-label-md hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  {busyId === selected.id ? 'Deleting…' : 'Delete Query'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
