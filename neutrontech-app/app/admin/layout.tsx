'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { AdminContext } from './AdminContext';

const ADMIN_NAV = [
  { href: '/admin/users', label: 'Users', icon: 'group' },
  { href: '/admin/posts', label: 'Posts', icon: 'article' },
  { href: '/admin/traffic', label: 'Traffic', icon: 'monitoring' },
  { href: '/admin/contact-requests', label: 'Contact Requests', icon: 'mail' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<'checking' | 'allowed' | 'denied'>('checking');
  const [ctx, setCtx] = useState<{
    accessToken: string;
    adminId: string;
    adminName: string;
    adminAvatar: string;
    isSuperAdmin: boolean;
  } | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.replace('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin, is_super_admin, full_name, username, avatar_url')
        .eq('id', session.user.id)
        .single();

      if (!profile?.is_admin) {
        router.replace('/feed');
        return;
      }

      setCtx({
        accessToken: session.access_token,
        adminId: session.user.id,
        adminName: profile.full_name || profile.username || 'Admin',
        adminAvatar: profile.avatar_url || '',
        isSuperAdmin: !!profile.is_super_admin,
      });
      setStatus('allowed');
    });
  }, [router]);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.replace('/login');
  };

  if (status === 'checking' || !ctx) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="font-body-md text-body-md text-on-surface-variant">Loading admin console…</p>
      </div>
    );
  }

  return (
    <AdminContext.Provider value={ctx}>
      <div className="bg-background overflow-x-hidden min-h-screen">
        {/* ── LEFT SIDEBAR (same as feed/profile) ── */}
        <aside className="h-screen w-64 fixed left-0 top-0 hidden lg:flex flex-col bg-surface border-r border-outline-variant p-md pt-0 space-y-sm z-40">
          <div className="h-16 flex items-center mb-sm">
            <Link href="/" className="inline-flex items-center gap-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand-logo.png" alt="" className="h-8 w-8 object-contain brightness-0" />
              <span className="font-display text-headline-sm text-on-surface font-bold tracking-tight">Neutron Tech</span>
            </Link>
          </div>
          <nav className="flex-1 flex flex-col space-y-xs">
            <Link
              className="text-on-surface-variant hover:bg-surface-container-high flex items-center gap-sm p-sm rounded-xl transition-all"
              href="/feed"
            >
              <span className="material-symbols-outlined">home</span>
              <span className="font-label-md text-label-md">Home</span>
            </Link>
            <Link
              className={
                pathname === '/admin'
                  ? 'bg-secondary-container text-on-secondary-container rounded-xl font-bold flex items-center gap-sm p-sm transition-all'
                  : 'text-on-surface-variant hover:bg-surface-container-high flex items-center gap-sm p-sm rounded-xl transition-all'
              }
              href="/admin"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: pathname === '/admin' ? "'FILL' 1" : undefined }}>admin_panel_settings</span>
              <span className="font-label-md text-label-md">Admin Console</span>
            </Link>
            <div className="pl-lg space-y-xs">
              {ADMIN_NAV.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={
                      active
                        ? 'bg-secondary-container text-on-secondary-container rounded-xl font-bold flex items-center gap-sm p-sm text-sm transition-all'
                        : 'text-on-surface-variant hover:bg-surface-container-high flex items-center gap-sm p-sm rounded-xl text-sm transition-all'
                    }
                  >
                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: active ? "'FILL' 1" : undefined }}>
                      {item.icon}
                    </span>
                    <span className="font-label-md text-label-md">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
          <div className="pt-md border-t border-outline-variant flex flex-col space-y-xs">
            <button onClick={handleLogout} disabled={loggingOut} style={{ touchAction: 'manipulation' }} className="flex items-center gap-sm p-sm text-on-surface-variant hover:bg-surface-container-high transition-all rounded-xl text-left w-full disabled:opacity-50">
              <span className="material-symbols-outlined">logout</span>
              <span className="font-label-md text-label-md">{loggingOut ? 'Logging out…' : 'Logout'}</span>
            </button>
          </div>
        </aside>

        <div className="lg:ml-64 flex flex-col min-h-screen">
          <header className="flex justify-between items-center h-16 px-xl bg-surface-container-lowest shadow-sm sticky top-0 z-30">
            <div className="flex items-center gap-lg flex-1">
              <button
                onClick={() => setMobileNavOpen((v) => !v)}
                className="lg:hidden p-xs -ml-xs rounded-full hover:bg-surface-container-high transition-colors"
                aria-label="Toggle menu"
              >
                <span className="material-symbols-outlined">{mobileNavOpen ? 'close' : 'menu'}</span>
              </button>
              <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Admin Dashboard</h2>
            </div>
            <div className="flex items-center gap-xl">
              <div className="flex items-center gap-md border-l border-outline-variant pl-xl">
                {ctx.adminAvatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="w-10 h-10 rounded-full object-cover" src={ctx.adminAvatar} alt={ctx.adminName} />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-[12px]">
                    {ctx.adminName.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="hidden lg:block text-left">
                  <p className="font-label-md text-label-md font-bold text-on-surface">{ctx.adminName}</p>
                  <p className="text-[10px] text-secondary font-medium">SYSTEM ADMIN</p>
                </div>
              </div>
            </div>
          </header>

          {mobileNavOpen && (
            <nav className="lg:hidden sticky top-16 z-20 bg-surface border-b border-outline-variant p-md space-y-xs">
              <Link href="/feed" className="text-on-surface-variant hover:bg-surface-container-high flex items-center gap-sm p-sm rounded-xl transition-all">
                <span className="material-symbols-outlined">home</span>
                <span className="font-label-md text-label-md">Home</span>
              </Link>
              <Link
                className={
                  pathname === '/admin'
                    ? 'bg-secondary-container text-on-secondary-container rounded-xl font-bold flex items-center gap-sm p-sm transition-all'
                    : 'text-on-surface-variant hover:bg-surface-container-high flex items-center gap-sm p-sm rounded-xl transition-all'
                }
                href="/admin"
              >
                <span className="material-symbols-outlined">admin_panel_settings</span>
                <span className="font-label-md text-label-md">Admin Console</span>
              </Link>
              <div className="pl-lg space-y-xs">
                {ADMIN_NAV.map((item) => {
                  const active = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={
                        active
                          ? 'bg-secondary-container text-on-secondary-container rounded-xl font-bold flex items-center gap-sm p-sm text-sm transition-all'
                          : 'text-on-surface-variant hover:bg-surface-container-high flex items-center gap-sm p-sm rounded-xl text-sm transition-all'
                      }
                    >
                      <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                      <span className="font-label-md text-label-md">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
              <div className="pt-xs border-t border-outline-variant">
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  style={{ touchAction: 'manipulation' }}
                  className="flex items-center gap-sm p-sm text-on-surface-variant hover:bg-surface-container-high transition-all rounded-xl text-left w-full disabled:opacity-50"
                >
                  <span className="material-symbols-outlined">logout</span>
                  <span className="font-label-md text-label-md">{loggingOut ? 'Logging out…' : 'Logout'}</span>
                </button>
              </div>
            </nav>
          )}

          <main className="flex-1 p-xl">{children}</main>

          <footer className="flex justify-between items-center py-md px-xl bg-transparent border-t border-outline-variant">
            <p className="font-label-sm text-label-sm font-medium text-secondary">
              © {new Date().getFullYear()} NeutronTech Admin Console
            </p>
          </footer>
        </div>
      </div>
    </AdminContext.Provider>
  );
}
