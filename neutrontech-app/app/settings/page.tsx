'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function SettingsPage() {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [name, setName] = useState('');
  const [originalName, setOriginalName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<{ name: string; avatar: string; isAdmin: boolean } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.replace('/login'); return; }
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, is_admin')
        .eq('id', session.user.id)
        .single();

      const displayName = profile?.full_name || session.user.email?.split('@')[0] || '';
      setUserId(session.user.id);
      setName(displayName);
      setOriginalName(displayName);
      setCurrentUser({ name: displayName, avatar: profile?.avatar_url || '', isAdmin: !!profile?.is_admin });
      setLoading(false);
    });
  }, [router]);

  const handleSave = async () => {
    if (!name.trim()) { setError('Name cannot be empty.'); return; }
    setSaving(true);
    setError('');
    setSaved(false);

    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token ?? '';

    const res = await fetch(`/api/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ name: name.trim() }),
    });

    if (!res.ok) {
      setError('Failed to save. Please try again.');
    } else {
      setOriginalName(name.trim());
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  const isDirty = name.trim() !== originalName;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-primary text-[40px]">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="font-body-md text-body-md overflow-x-hidden">

      {/* ── TOP NAV ── */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant h-16 flex items-center px-margin-mobile md:px-margin-desktop shadow-sm">
        <div className="grid grid-cols-3 items-center w-full max-w-[1280px] mx-auto">
          <div />
          <div className="flex justify-center">
            <nav className="hidden lg:flex items-center space-x-lg">
              <Link href="/feed"    className="font-label-md text-label-md text-secondary hover:text-primary transition-colors">Feed</Link>
              <Link href="/search"  className="font-label-md text-label-md text-secondary hover:text-primary transition-colors">Search</Link>
              <Link href="/profile" className="font-label-md text-label-md text-secondary hover:text-primary transition-colors">Profile</Link>
            </nav>
          </div>
          <div className="flex items-center justify-end gap-sm">
            <Link href="/profile" className="w-9 h-9 rounded-full border-2 border-primary-fixed overflow-hidden block shrink-0 bg-surface-container-low flex items-center justify-center">
              {currentUser?.avatar
                ? <img alt="User" className="w-full h-full object-cover" src={currentUser.avatar} />
                : <span className="material-symbols-outlined text-primary">person</span>
              }
            </Link>
          </div>
        </div>
      </header>

      {/* ── LEFT SIDEBAR (lg+) ── */}
      <aside className="h-screen w-64 fixed left-0 top-0 hidden lg:flex flex-col bg-surface border-r border-outline-variant p-md pt-0 space-y-sm z-40">
        <div className="h-16 flex items-center mb-sm">
            <Link href="/" className="inline-flex items-center gap-sm">
            <img src="/brand-logo.png" alt="" className="h-8 w-8 object-contain brightness-0" />
            <span className="font-display text-headline-sm text-on-surface font-bold tracking-tight">Neutron Tech</span>
          </Link>
        </div>
        <nav className="flex-1 flex flex-col space-y-xs pt-md">
          <Link className="flex items-center space-x-sm px-md py-sm text-on-surface-variant hover:bg-surface-container-high transition-all rounded-xl" href="/feed">
            <span className="material-symbols-outlined">home</span>
            <span className="font-label-md text-label-md">Home</span>
          </Link>
          <Link className="flex items-center space-x-sm px-md py-sm text-on-surface-variant hover:bg-surface-container-high transition-all rounded-xl" href="/profile">
            <span className="material-symbols-outlined">person</span>
            <span className="font-label-md text-label-md">Profile</span>
          </Link>
          <Link className="flex items-center space-x-sm px-md py-sm text-on-surface-variant hover:bg-surface-container-high transition-all rounded-xl" href="/search">
            <span className="material-symbols-outlined">search</span>
            <span className="font-label-md text-label-md">Search</span>
          </Link>
          <Link className="flex items-center space-x-sm px-md py-sm bg-secondary-container text-on-secondary-container rounded-xl font-bold" href="/settings">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>settings</span>
            <span className="font-label-md text-label-md">Settings</span>
          </Link>
          {currentUser?.isAdmin && (
            <Link className="flex items-center space-x-sm px-md py-sm text-on-surface-variant hover:bg-surface-container-high transition-all rounded-xl" href="/admin">
              <span className="material-symbols-outlined">admin_panel_settings</span>
              <span className="font-label-md text-label-md">Admin Console</span>
            </Link>
          )}
        </nav>
        <div className="pt-md border-t border-outline-variant flex flex-col space-y-xs">
          <button onClick={handleLogout} className="flex items-center space-x-sm px-md py-sm text-on-surface-variant hover:bg-surface-container-high transition-all rounded-xl text-left w-full">
            <span className="material-symbols-outlined">logout</span>
            <span className="font-label-md text-label-md">Logout</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="lg:ml-64 pt-20 pb-28 lg:pb-8 min-h-screen">
        <div className="max-w-[640px] mx-auto px-margin-mobile md:px-margin-desktop space-y-lg">

          <h1 className="font-headline-lg text-headline-lg text-on-surface">Settings</h1>

          {/* Profile name section */}
          <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
            <div className="px-lg py-md border-b border-outline-variant">
              <h2 className="font-label-md text-label-md font-bold text-on-surface-variant uppercase tracking-widest">Profile</h2>
            </div>
            <div className="p-lg space-y-lg">
              <div className="space-y-xs">
                <label className="font-label-md text-label-md text-on-surface font-medium">Display Name</label>
                <p className="font-body-md text-label-sm text-on-surface-variant">This is the name shown on your profile and posts.</p>
                <input
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(''); setSaved(false); }}
                  onKeyDown={(e) => { if (e.key === 'Enter' && isDirty) handleSave(); }}
                  placeholder="Your name"
                  maxLength={60}
                  className="w-full bg-surface border border-outline-variant rounded-xl px-md py-sm font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                <div className="flex items-center justify-between pt-xs">
                  <div className="flex items-center gap-sm">
                    {error && (
                      <p className="font-label-sm text-label-sm text-error flex items-center gap-xs">
                        <span className="material-symbols-outlined text-[16px]">error</span>
                        {error}
                      </p>
                    )}
                    {saved && (
                      <p className="font-label-sm text-label-sm text-primary flex items-center gap-xs">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                        Saved successfully
                      </p>
                    )}
                  </div>
                  <button
                    onClick={handleSave}
                    disabled={saving || !isDirty}
                    className="bg-primary text-on-primary px-lg py-sm rounded-xl font-label-md text-label-md active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Account section */}
          <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
            <div className="px-lg py-md border-b border-outline-variant">
              <h2 className="font-label-md text-label-md font-bold text-on-surface-variant uppercase tracking-widest">Account</h2>
            </div>
            <div className="divide-y divide-outline-variant">
              <Link href="/profile" className="flex items-center justify-between px-lg py-md hover:bg-surface-container-low transition-colors group">
                <div className="flex items-center gap-md">
                  <span className="material-symbols-outlined text-primary">manage_accounts</span>
                  <span className="font-label-md text-label-md text-on-surface">Edit full profile</span>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-on-surface transition-colors">chevron_right</span>
              </Link>
              <button onClick={handleLogout} className="w-full flex items-center justify-between px-lg py-md hover:bg-surface-container-low transition-colors group text-left">
                <div className="flex items-center gap-md">
                  <span className="material-symbols-outlined text-error">logout</span>
                  <span className="font-label-md text-label-md text-error">Log out</span>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-on-surface transition-colors">chevron_right</span>
              </button>
            </div>
          </section>

        </div>
      </main>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="fixed bottom-0 w-full z-50 bg-surface border-t border-outline-variant h-16 lg:hidden">
        <div className="flex justify-around items-center h-full">
          <Link href="/feed" className="flex flex-col items-center text-on-surface-variant active:scale-95">
            <span className="material-symbols-outlined">home</span>
            <span className="text-label-sm font-label-sm">Home</span>
          </Link>
          <Link href="/search" className="flex flex-col items-center text-on-surface-variant active:scale-95">
            <span className="material-symbols-outlined">search</span>
            <span className="text-label-sm font-label-sm">Search</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center text-on-surface-variant active:scale-95">
            <span className="material-symbols-outlined">person</span>
            <span className="text-label-sm font-label-sm">Profile</span>
          </Link>
          <Link href="/contact" className="flex flex-col items-center text-on-surface-variant active:scale-95">
            <span className="material-symbols-outlined">mail</span>
            <span className="text-label-sm font-label-sm">Contact</span>
          </Link>
          <button onClick={handleLogout} style={{ touchAction: 'manipulation' }} className="flex flex-col items-center text-on-surface-variant active:scale-95">
            <span className="material-symbols-outlined">logout</span>
            <span className="text-label-sm font-label-sm">Logout</span>
          </button>
        </div>
      </nav>

    </div>
  );
}
