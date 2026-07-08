'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAdminContext } from '../AdminContext';

type AdminUser = {
  id: string;
  username: string | null;
  name: string;
  avatar: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  status: 'active' | 'inactive';
  joined: string;
};

export default function UserManagementTable({ showMoreHref }: { showMoreHref?: string }) {
  const { accessToken, adminId, isSuperAdmin } = useAdminContext();
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = () => {
    fetch('/api/admin/users', { headers: { Authorization: `Bearer ${accessToken}` } })
      .then((res) => (res.ok ? res.json() : null))
      .then(setUsers);
  };

  useEffect(load, [accessToken]);

  const toggleAdmin = async (user: AdminUser) => {
    setBusyId(user.id);
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ isAdmin: !user.isAdmin }),
    });
    if (res.ok) {
      load();
    } else {
      const { error } = await res.json().catch(() => ({ error: 'Request failed' }));
      window.alert(error || 'Request failed');
    }
    setBusyId(null);
  };

  const deleteUser = async (user: AdminUser) => {
    if (!window.confirm(`Delete ${user.name}? This permanently removes their account and all their posts.`)) return;
    setBusyId(user.id);
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (res.ok) {
      load();
    } else {
      const { error } = await res.json().catch(() => ({ error: 'Request failed' }));
      window.alert(error || 'Request failed');
    }
    setBusyId(null);
  };

  return (
    <div className="lg:col-span-2 self-start bg-surface-container-lowest rounded-xl card-shadow border border-surface-variant/50 overflow-hidden">
      <div className="p-lg border-b border-surface-variant/50 flex justify-between items-center">
        <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">User Management</h3>
      </div>
      {!users && <div className="p-md font-body-sm text-body-sm text-secondary">Loading…</div>}

      {/* Mobile: stacked cards (a 6-column table can't fit a phone screen) */}
      <div className="sm:hidden divide-y divide-surface-variant/30">
        {(showMoreHref ? users?.slice(0, 5) : users)?.map((u, i) => (
          <div key={u.id} className="p-md space-y-sm">
            <div className="flex items-center gap-sm">
              <span className="w-4 shrink-0 font-body-sm text-body-sm text-secondary tabular-nums">{i + 1}</span>
              <div className="w-8 h-8 shrink-0 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-[10px]">
                {u.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-body-sm text-body-sm font-bold text-on-surface truncate">{u.name}</p>
                <p className="text-[12px] text-secondary truncate">@{u.username}</p>
              </div>
              <span
                className={
                  u.status === 'active'
                    ? 'shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'
                    : 'shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-variant text-on-surface-variant'
                }
              >
                {u.status === 'active' ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex items-center justify-between pl-11 text-[12px] text-secondary">
              <span>{u.isAdmin ? 'Admin' : 'User'}</span>
              <span>
                {new Date(u.joined).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
              </span>
            </div>
            <div className="pl-11">
              {u.isSuperAdmin ? (
                <span className="text-[11px] uppercase tracking-wide font-bold text-secondary">Protected</span>
              ) : (
                <div className="flex items-center gap-md">
                  {(u.isAdmin || isSuperAdmin) && (
                    <button
                      disabled={u.id === adminId || busyId === u.id}
                      onClick={() => toggleAdmin(u)}
                      className="font-label-md text-label-md text-primary hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {u.isAdmin ? 'Revoke Admin' : 'Make Admin'}
                    </button>
                  )}
                  <button
                    disabled={u.id === adminId || busyId === u.id}
                    onClick={() => deleteUser(u)}
                    className="font-label-md text-label-md text-red-600 hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* sm+: full table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-surface-container-low">
            <tr>
              <th className="p-md font-label-md text-label-md text-secondary">Sr</th>
              <th className="p-md font-label-md text-label-md text-secondary">User</th>
              <th className="p-md font-label-md text-label-md text-secondary">Status</th>
              <th className="p-md font-label-md text-label-md text-secondary">Role</th>
              <th className="p-md font-label-md text-label-md text-secondary">Joined</th>
              <th className="p-md font-label-md text-label-md text-secondary">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-variant/30">
            {(showMoreHref ? users?.slice(0, 5) : users)?.map((u, i) => (
              <tr key={u.id} className="hover:bg-surface-container-low transition-colors">
                <td className="p-md font-body-sm text-body-sm text-secondary tabular-nums">{i + 1}</td>
                <td className="p-md">
                  <div className="flex items-center gap-md">
                    <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-[10px]">
                      {u.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-body-sm text-body-sm font-bold text-on-surface">{u.name}</p>
                      <p className="text-[12px] text-secondary">@{u.username}</p>
                    </div>
                  </div>
                </td>
                <td className="p-md">
                  <span
                    className={
                      u.status === 'active'
                        ? 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'
                        : 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-variant text-on-surface-variant'
                    }
                  >
                    {u.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-md font-body-sm text-body-sm text-on-surface">
                  {u.isAdmin ? 'Admin' : 'User'}
                </td>
                <td className="p-md font-body-sm text-body-sm text-on-surface">
                  {new Date(u.joined).toLocaleDateString('en-US', {
                    month: 'short',
                    day: '2-digit',
                    year: 'numeric',
                  })}
                </td>
                <td className="p-md">
                  {u.isSuperAdmin ? (
                    <span className="text-[11px] uppercase tracking-wide font-bold text-secondary">Protected</span>
                  ) : (
                    <div className="flex items-center gap-md">
                      {(u.isAdmin || isSuperAdmin) && (
                        <button
                          disabled={u.id === adminId || busyId === u.id}
                          onClick={() => toggleAdmin(u)}
                          className="font-label-md text-label-md text-primary hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {u.isAdmin ? 'Revoke Admin' : 'Make Admin'}
                        </button>
                      )}
                      <button
                        disabled={u.id === adminId || busyId === u.id}
                        onClick={() => deleteUser(u)}
                        className="font-label-md text-label-md text-red-600 hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showMoreHref && (
        <Link
          href={showMoreHref}
          className="block text-center p-md border-t border-surface-variant/50 font-label-md text-label-md text-primary hover:underline"
        >
          Show more
        </Link>
      )}
    </div>
  );
}
