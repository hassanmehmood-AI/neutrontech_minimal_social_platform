'use client';

import { useEffect, useState } from 'react';
import { useAdminContext } from '../AdminContext';

type Settings = {
  allow_signups: boolean;
  post_approval: boolean;
  public_profiles: boolean;
  contact_form: boolean;
};

const TOGGLES: { key: keyof Settings; label: string; hint: string }[] = [
  { key: 'allow_signups', label: 'Allow Signups', hint: 'New user registrations' },
  { key: 'post_approval', label: 'Post Approval', hint: 'Manual review required' },
  { key: 'public_profiles', label: 'Public Profiles', hint: 'Visible to non-members' },
  { key: 'contact_form', label: 'Contact Form', hint: 'Enable site-wide inquiry' },
];

export default function QuickSettings() {
  const { accessToken } = useAdminContext();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/settings', { headers: { Authorization: `Bearer ${accessToken}` } })
      .then((res) => (res.ok ? res.json() : null))
      .then(setSettings);
  }, [accessToken]);

  const toggle = async (key: keyof Settings) => {
    if (!settings) return;
    const next = { ...settings, [key]: !settings[key] };
    setSettings(next);
    setSaving(key);
    await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ [key]: next[key] }),
    });
    setSaving(null);
  };

  return (
    <div className="h-full flex flex-col bg-surface-container-lowest p-lg rounded-xl card-shadow border border-surface-variant/50">
      <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-lg">Quick Settings</h3>
      <div className="flex-1 flex flex-col justify-between">
        {TOGGLES.map((t) => (
          <div key={t.key} className="flex items-center justify-between">
            <div>
              <p className="font-label-md text-label-md font-bold text-on-surface">{t.label}</p>
              <p className="text-[11px] text-secondary">{t.hint}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings?.[t.key] ?? false}
                disabled={!settings || saving === t.key}
                onChange={() => toggle(t.key)}
              />
              <div className="w-11 h-6 bg-surface-container-highest peer-focus:ring-2 peer-focus:ring-primary-container rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
