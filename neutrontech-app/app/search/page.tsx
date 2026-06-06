'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type Person = { id: string; name: string; role: string; avatar: string; };

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [people, setPeople] = useState<Person[]>([]);
  const [currentUser, setCurrentUser] = useState<{ name: string; avatar: string } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.replace('/login'); return; }
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', session.user.id)
        .single();
      setCurrentUser({
        name: profile?.full_name || session.user.email?.split('@')[0] || '',
        avatar: profile?.avatar_url || '',
      });
    });
  }, [router]);

  useEffect(() => {
    const params = query ? `?q=${encodeURIComponent(query)}` : '';
    fetch(`/api/search${params}`)
      .then((r) => r.json())
      .then((data) => setPeople(data.people || []));
  }, [query]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  return (
    <div className="font-body-md text-body-md overflow-x-hidden">

      {/* ── TOP NAV ── */}
      <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md shadow-sm border-b border-outline-variant h-16">
        <div className="grid grid-cols-3 items-center px-margin-mobile md:px-margin-desktop h-full w-full max-w-[1280px] mx-auto">
          <div />
          <div className="flex justify-center">
            <nav className="hidden lg:flex items-center space-x-lg">
              <Link href="/feed"   className="text-secondary font-label-md text-label-md hover:text-primary transition-colors">Feed</Link>
              <Link href="/search" className="text-primary font-bold border-b-2 border-primary font-label-md text-label-md">Search</Link>
            </nav>
          </div>
          <div className="flex items-center justify-end gap-sm">
            <button className="lg:hidden p-xs active:scale-95 duration-150">
              <span className="material-symbols-outlined text-secondary">notifications</span>
            </button>
            {currentUser?.name && (
              <span className="hidden lg:block font-label-md text-label-md text-on-surface">
                {currentUser.name.split(' ')[0]}
              </span>
            )}
            <Link href="/profile" className="w-9 h-9 rounded-full border-2 border-primary-fixed overflow-hidden block shrink-0 bg-surface-container-low flex items-center justify-center">
              {currentUser?.avatar
                ? <img alt="User" className="w-full h-full object-cover" src={currentUser.avatar} />
                : <span className="material-symbols-outlined text-primary">person</span>
              }
            </Link>
          </div>
        </div>
      </nav>

      {/* ── LEFT SIDEBAR (lg+) ── */}
      <aside className="h-screen w-64 fixed left-0 top-0 hidden lg:flex flex-col bg-surface border-r border-outline-variant p-md space-y-sm z-40">
        <div className="pt-xl pb-lg">
          <Link href="/" className="inline-flex items-center gap-sm">
            <img src="/brand-logo.png" alt="" className="h-8 w-8 object-contain brightness-0" />
            <span className="font-display text-headline-sm text-on-surface font-bold tracking-tight">Neutron Tech</span>
          </Link>
        </div>
        <nav className="flex-grow space-y-xs">
          <Link className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container-high transition-all rounded-xl" href="/feed">
            <span className="material-symbols-outlined">home</span>
            <span className="font-label-md text-label-md">Home</span>
          </Link>
          <Link className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container-high transition-all rounded-xl" href="/profile">
            <span className="material-symbols-outlined">person</span>
            <span className="font-label-md text-label-md">Profile</span>
          </Link>
          <Link className="flex items-center gap-md px-md py-sm bg-secondary-container text-on-secondary-container rounded-xl font-bold" href="/search">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>search</span>
            <span className="font-label-md text-label-md">Search</span>
          </Link>
          <Link className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container-high transition-all rounded-xl" href="/settings">
            <span className="material-symbols-outlined">settings</span>
            <span className="font-label-md text-label-md">Settings</span>
          </Link>
        </nav>
        <div className="border-t border-outline-variant pt-md space-y-xs">
          <Link className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container-high transition-all rounded-xl" href="/">
            <span className="material-symbols-outlined">logout</span>
            <span className="font-label-md text-label-md">Logout</span>
          </Link>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="lg:ml-64 pt-20 pb-28 md:pb-xl min-h-screen">
        <div className="px-margin-mobile md:px-margin-desktop max-w-[720px] space-y-lg">

          {/* Search bar */}
          <div className="sticky top-16 bg-surface z-40 py-md -mx-margin-mobile px-margin-mobile md:-mx-margin-desktop md:px-margin-desktop">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl py-4 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all font-body-md text-on-surface shadow-sm"
                placeholder="Search people..."
                type="text"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              )}
            </div>
          </div>

          {/* Empty state */}
          {!query && (
            <div className="flex flex-col items-center justify-center py-16 gap-md text-center">
              <span className="material-symbols-outlined text-[48px] text-outline">person_search</span>
              <p className="font-body-md text-on-surface-variant">Type a name to find people</p>
            </div>
          )}

          {/* No results */}
          {query && people.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-md text-center">
              <span className="material-symbols-outlined text-[48px] text-outline">search_off</span>
              <p className="font-headline-md text-on-surface">No results for &ldquo;{query}&rdquo;</p>
              <p className="font-body-md text-on-surface-variant">Try a different name.</p>
            </div>
          )}

          {/* People list — only when query is active */}
          {query && people.length > 0 && (
            <div className="space-y-md">
              <div className="flex items-center justify-between">
                <h2 className="font-headline-md text-headline-md text-on-surface">Results for &ldquo;{query}&rdquo;</h2>
                <span className="font-label-sm text-label-sm text-on-surface-variant">{people.length} found</span>
              </div>
              {people.map((person) => (
                <Link
                  key={person.id}
                  href={`/profile/${person.id}`}
                  className="flex items-center gap-md p-md bg-surface-container-lowest border border-outline-variant rounded-xl hover:shadow-md transition-all active:scale-[0.98] shadow-sm"
                >
                  {person.avatar
                    ? <img alt={person.name} className="w-14 h-14 rounded-full object-cover shrink-0" src={person.avatar} />
                    : <span className="w-14 h-14 rounded-full bg-surface-container-low flex items-center justify-center shrink-0 material-symbols-outlined text-primary text-[28px]">person</span>
                  }
                  <div className="flex-1 min-w-0">
                    <p className="font-headline-md text-[18px] text-on-surface leading-tight">{person.name}</p>
                    <p className="text-on-surface-variant font-label-md text-label-md truncate">{person.role}</p>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant shrink-0">chevron_right</span>
                </Link>
              ))}
            </div>
          )}

        </div>
      </main>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="fixed bottom-0 w-full z-50 bg-surface/80 backdrop-blur-md shadow-[0_-1px_10px_rgba(0,0,0,0.05)] border-t border-outline-variant md:hidden">
        <div className="flex justify-around items-center h-16 w-full px-margin-mobile">
          <Link href="/feed" className="flex flex-col items-center justify-center gap-1 text-on-surface-variant active:scale-95 duration-150">
            <span className="material-symbols-outlined">home</span>
            <span className="font-label-sm text-[10px]">Home</span>
          </Link>
          <Link href="/search" className="flex flex-col items-center justify-center gap-1 text-primary active:scale-95 duration-150">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>search</span>
            <span className="font-label-sm text-[10px] font-bold">Search</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center justify-center gap-1 text-on-surface-variant active:scale-95 duration-150">
            <span className="material-symbols-outlined">person</span>
            <span className="font-label-sm text-[10px]">Profile</span>
          </Link>
          <button onClick={handleLogout} className="flex flex-col items-center justify-center gap-1 text-on-surface-variant active:scale-95 duration-150">
            <span className="material-symbols-outlined">logout</span>
            <span className="font-label-sm text-[10px]">Logout</span>
          </button>
        </div>
      </nav>

    </div>
  );
}
