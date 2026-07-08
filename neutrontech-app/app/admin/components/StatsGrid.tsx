'use client';

import { useEffect, useState } from 'react';
import { useAdminContext } from '../AdminContext';

type Stats = {
  totalUsers: number;
  activeUsers: number;
  totalPosts: number;
  contactRequests: number;
};

const CARDS: {
  key: keyof Stats;
  label: string;
  icon: string;
}[] = [
  { key: 'totalUsers', label: 'Total Users', icon: 'group' },
  { key: 'activeUsers', label: 'Active Users (7d)', icon: 'bolt' },
  { key: 'totalPosts', label: 'Total Posts', icon: 'description' },
  { key: 'contactRequests', label: 'Open Contact Requests', icon: 'mail' },
];

export default function StatsGrid() {
  const { accessToken } = useAdminContext();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${accessToken}` } })
      .then((res) => (res.ok ? res.json() : null))
      .then(setStats);
  }, [accessToken]);

  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-sm sm:gap-lg mb-xl">
      {CARDS.map((card) => (
        <div
          key={card.key}
          className="bg-surface-container-lowest p-lg rounded-xl card-shadow border border-surface-variant/50"
        >
          <div className="flex justify-between items-start mb-sm">
            <div className="w-12 h-12 bg-primary-container/10 text-primary flex items-center justify-center rounded-lg">
              <span className="material-symbols-outlined">{card.icon}</span>
            </div>
          </div>
          <p className="font-label-md text-label-md text-secondary">{card.label}</p>
          <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
            {stats ? stats[card.key].toLocaleString() : '—'}
          </h3>
        </div>
      ))}
    </section>
  );
}
