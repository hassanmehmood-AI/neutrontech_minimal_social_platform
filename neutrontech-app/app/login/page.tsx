'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './login.module.css';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [showPwd, setShowPwd] = useState<Record<string, boolean>>({});

  // Shared form state
  const [loginEmail, setLoginEmail]       = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupFullName, setSignupFullName]   = useState('');
  const [signupEmail, setSignupEmail]         = useState('');
  const [signupPassword, setSignupPassword]   = useState('');

  const [loginError, setLoginError]   = useState('');
  const [signupError, setSignupError] = useState('');
  const [signupMsg, setSignupMsg]     = useState('');
  const [loading, setLoading]         = useState(false);

  const togglePwd = (id: string) =>
    setShowPwd((prev) => ({ ...prev, [id]: !prev[id] }));

  const ensureProfile = async (accessToken: string) => {
    const response = await fetch('/api/auth/profile', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) {
      throw new Error('Your account exists, but your profile could not be prepared. Please try signing in again.');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail.trim(),
        password: loginPassword,
      });
      if (error) throw error;
      if (!data.session) throw new Error('Unable to start your session. Please try again.');
      await ensureProfile(data.session.access_token);
      router.push('/feed');
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Unable to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');
    setSignupMsg('');
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: signupEmail.trim(),
        password: signupPassword,
        options: { data: { full_name: signupFullName.trim() } },
      });
      if (error) throw error;
      if (data.session) {
        await ensureProfile(data.session.access_token);
        router.push('/feed');
      } else {
        // Confirmation-required accounts get their profile on their first login.
        setSignupMsg('Check your email to confirm your account, then sign in.');
        setActiveTab('login');
      }
    } catch (error) {
      setSignupError(error instanceof Error ? error.message : 'Unable to sign up. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ══════════════════════════════════
          MOBILE LAYOUT (hidden on lg+)
      ══════════════════════════════════ */}
      <div className={`${styles.mobile} flex flex-col items-center px-margin-mobile py-sm relative bg-surface`}>
        <div className="fixed -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10"></div>
        <div className="fixed -bottom-24 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10"></div>

        <main className="w-full max-w-[28rem] mx-auto flex flex-col items-center space-y-md">
          <header className="w-full text-center">
            <img src="/brand-logo.png" alt="Neutron Tech logo" className="h-10 w-10 object-contain brightness-0 invert opacity-80 mx-auto mb-xs" />
            <span className="font-display text-headline-lg text-on-surface tracking-tight font-bold">Neutron Tech</span>
          </header>

          <div className="w-full bg-surface-container-lowest rounded-2xl border border-outline-variant p-md auth-card space-y-sm">

            {signupMsg && (
              <div className="p-sm bg-secondary-container text-on-secondary-container rounded-lg font-label-sm text-label-sm text-center">{signupMsg}</div>
            )}

            {/* Mobile Login */}
            {activeTab === 'login' && (
              <>
                <form className="space-y-sm" onSubmit={handleLogin}>
                  {loginError && <p className="text-error font-label-sm text-label-sm">{loginError}</p>}
                  <input aria-label="Email address" autoComplete="email" autoCapitalize="none" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="w-full px-md py-sm bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-body-md" placeholder="Email address" type="email" required />
                  <div className="relative">
                    <input aria-label="Password" autoComplete="current-password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="w-full px-md pr-12 py-sm bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-body-md" placeholder="Password" type={showPwd['mob-pwd'] ? 'text' : 'password'} required />
                    <button aria-label="Toggle password visibility" className="absolute right-sm top-1/2 -translate-y-1/2 text-outline hover:text-primary" type="button" onClick={() => togglePwd('mob-pwd')}>
                      <span className="material-symbols-outlined">{showPwd['mob-pwd'] ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                  <button disabled={loading} className="w-full py-sm bg-primary-container text-white font-label-md text-label-md font-bold rounded-lg tap-scale hover:brightness-110 transition-all disabled:opacity-60" type="submit">
                    {loading ? 'Signing in...' : 'Log in'}
                  </button>
                </form>
                <div className="flex items-center gap-sm">
                  <div className="flex-1 h-px bg-outline-variant"></div>
                  <div className="flex-1 h-px bg-outline-variant"></div>
                </div>
                <button className="w-full py-sm border-2 border-outline-variant text-on-surface font-label-md text-label-md font-bold rounded-lg hover:bg-surface-container-low transition-all" onClick={() => setActiveTab('signup')}>
                  Create new account
                </button>
              </>
            )}

            {/* Mobile Signup */}
            {activeTab === 'signup' && (
              <>
                <h3 className="font-headline-md text-headline-md text-on-surface font-bold">Create a new account</h3>
                <form className="space-y-sm" onSubmit={handleSignup}>
                  {signupError && <p className="text-error font-label-sm text-label-sm">{signupError}</p>}
                  <input aria-label="Full name" autoComplete="name" value={signupFullName} onChange={e => setSignupFullName(e.target.value)} className="w-full px-md py-sm bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-body-md" placeholder="Full name" type="text" required />
                  <input aria-label="Email address" autoComplete="email" autoCapitalize="none" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} className="w-full px-md py-sm bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-body-md" placeholder="Email address" type="email" required />
                  <div className="relative">
                    <input aria-label="New password" autoComplete="new-password" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} className="w-full px-md pr-12 py-sm bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-body-md" placeholder="New password (min. 6 chars)" type={showPwd['mob-signup-pwd'] ? 'text' : 'password'} required minLength={6} />
                    <button aria-label="Toggle password visibility" className="absolute right-sm top-1/2 -translate-y-1/2 text-outline hover:text-primary" type="button" onClick={() => togglePwd('mob-signup-pwd')}>
                      <span className="material-symbols-outlined">{showPwd['mob-signup-pwd'] ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                  <button disabled={loading} className="w-full py-sm bg-primary-container text-white font-label-md text-label-md font-bold rounded-lg tap-scale hover:brightness-110 transition-all disabled:opacity-60" type="submit">
                    {loading ? 'Creating account...' : 'Sign Up'}
                  </button>
                </form>
                <button type="button" className="w-full text-center font-label-sm text-label-sm text-primary hover:underline" onClick={() => setActiveTab('login')}>
                  Already have an account?
                </button>
              </>
            )}
          </div>

          <p className="text-center font-label-sm text-label-sm text-on-surface-variant px-md leading-relaxed">
            © 2026 Neutron Tech Inc.
          </p>
          <div className="flex flex-wrap justify-center gap-md font-label-sm text-label-sm text-primary">
            <Link href="/about" className="hover:underline">About</Link>
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <Link href="/terms" className="hover:underline">Terms</Link>
            <Link href="/contact" className="hover:underline">Contact Us</Link>
            <Link href="/portfolio" className="hover:underline">Portfolio</Link>
          </div>
        </main>
      </div>

      {/* ══════════════════════════════════
          DESKTOP LAYOUT (hidden on mobile)
      ══════════════════════════════════ */}
      <div className={styles.desktop}>

        {/* Left branding panel */}
        <section className={`${styles.branding} bg-primary-container relative overflow-hidden flex items-center justify-center p-xl`}>
          <div className="absolute inset-0 z-0">
            {/* <img className="w-full h-full object-cover opacity-30 mix-blend-overlay" src="https://images.unsplash.com/photo-1504639725590-34d0984388bd?q=80&w=1000&auto=format&fit=crop" alt="Tech background" /> */}
          </div>
          <div className="relative z-10 max-w-[32rem] text-left">
            <Link href="/" className="inline-flex items-center gap-sm mb-md">
              {/* <img src="/brand-logo.png" alt="Neutron Tech logo" className="h-10 w-10 object-contain brightness-0 invert opacity-80" /> */}
              <span className="font-display text-headline-lg text-white/80 tracking-tight font-bold">Neutron Tech</span>
            </Link>
            <h1 className="font-display text-display text-on-primary mb-md leading-tight">
              Powering the next generation of Tech-Social.
            </h1>
            <p className="font-body-lg text-body-lg text-primary-fixed mb-lg opacity-90">
              Connect, collaborate, and scale with Neutron Tech&apos;s precision-engineered platform.
            </p>
            <div className="flex flex-wrap gap-md">
              <div className="flex items-center gap-xs bg-white/10 backdrop-blur-md px-md py-sm rounded-xl border border-white/20">
                <span className="material-symbols-outlined text-white">speed</span>
                <span className="font-label-md text-label-md text-white">Ultra Fast</span>
              </div>
              <div className="flex items-center gap-xs bg-white/10 backdrop-blur-md px-md py-sm rounded-xl border border-white/20">
                <span className="material-symbols-outlined text-white">security</span>
                <span className="font-label-md text-label-md text-white">Secure Architecture</span>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
          <Link href="/portfolio" className="absolute bottom-lg left-xl font-label-sm text-label-sm text-white/60 hover:text-white transition-colors z-10">
            Portfolio
          </Link>
        </section>

        {/* Right form panel */}
        <section className={`${styles.formPanel} bg-surface-container-lowest flex flex-col items-center justify-center px-10`}>
          <div className="w-full max-w-[396px]">

            {signupMsg && (
              <div className="mb-md p-sm bg-secondary-container text-on-secondary-container rounded-lg font-label-sm text-label-sm text-center">{signupMsg}</div>
            )}

            {/* Desktop Login */}
            {activeTab === 'login' && (
              <div className="space-y-sm">
                <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold mb-md">Log in to Neutron Tech</h2>
                <form className="space-y-sm" onSubmit={handleLogin}>
                  {loginError && <p className="text-error font-label-sm text-label-sm">{loginError}</p>}
                  <input aria-label="Email address" autoComplete="email" autoCapitalize="none" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="w-full px-md py-sm rounded-xl border border-outline-variant bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body-md" placeholder="Email address" type="email" required />
                  <div className="relative">
                    <input aria-label="Password" autoComplete="current-password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="w-full px-md pr-12 py-sm rounded-xl border border-outline-variant bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body-md" placeholder="Password" type={showPwd['desk-pwd'] ? 'text' : 'password'} required />
                    <button aria-label="Toggle password visibility" className="absolute right-sm top-1/2 -translate-y-1/2 text-outline hover:text-primary" type="button" onClick={() => togglePwd('desk-pwd')}>
                      <span className="material-symbols-outlined">{showPwd['desk-pwd'] ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                  <button disabled={loading} className="w-full bg-primary-container text-white py-sm rounded-xl font-label-md text-label-md font-bold hover:brightness-110 active:scale-[0.98] transition-all flex justify-center items-center gap-xs disabled:opacity-60" type="submit">
                    {loading ? 'Signing in...' : 'Log in'}
                  </button>
                </form>
                <div className="flex items-center gap-sm py-xs">
                  <div className="flex-1 h-px bg-outline-variant"></div>
                  <div className="flex-1 h-px bg-outline-variant"></div>
                </div>
                <button className="w-full py-sm border-2 border-outline-variant text-on-surface font-label-md text-label-md font-bold rounded-xl hover:bg-surface-container-low transition-all" onClick={() => setActiveTab('signup')}>
                  Create new account
                </button>
              </div>
            )}

            {/* Desktop Signup */}
            {activeTab === 'signup' && (
              <div className="space-y-sm">
                <div className="mb-md">
                  <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">Create a new account</h2>
                  <p className="font-body-md text-on-surface-variant mt-xs">Join the hub of modern innovation.</p>
                </div>
                <form className="space-y-sm" onSubmit={handleSignup}>
                  {signupError && <p className="text-error font-label-sm text-label-sm">{signupError}</p>}
                  <input aria-label="Full name" autoComplete="name" value={signupFullName} onChange={e => setSignupFullName(e.target.value)} className="w-full px-md py-sm rounded-xl border border-outline-variant bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body-md" placeholder="Full name" type="text" required />
                  <input aria-label="Email address" autoComplete="email" autoCapitalize="none" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} className="w-full px-md py-sm rounded-xl border border-outline-variant bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body-md" placeholder="Email address" type="email" required />
                  <div className="relative">
                    <input aria-label="New password" autoComplete="new-password" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} className="w-full px-md pr-12 py-sm rounded-xl border border-outline-variant bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body-md" placeholder="New password (min. 6 chars)" type={showPwd['desk-signup-pwd'] ? 'text' : 'password'} required minLength={6} />
                    <button aria-label="Toggle password visibility" className="absolute right-sm top-1/2 -translate-y-1/2 text-outline hover:text-primary" type="button" onClick={() => togglePwd('desk-signup-pwd')}>
                      <span className="material-symbols-outlined">{showPwd['desk-signup-pwd'] ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                  <button disabled={loading} className="w-full bg-primary-container text-white py-sm rounded-xl font-label-md text-label-md font-bold hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-60" type="submit">
                    {loading ? 'Creating account...' : 'Sign Up'}
                  </button>
                </form>
                <p className="text-center font-label-sm text-label-sm text-outline">
                  By signing up, you agree to our <Link className="text-primary hover:underline" href="/terms">Terms</Link> and <Link className="text-primary hover:underline" href="/privacy">Privacy Policy</Link>.
                </p>
                <div className="flex items-center gap-sm">
                  <div className="flex-1 h-px bg-outline-variant"></div>
                  <div className="flex-1 h-px bg-outline-variant"></div>
                </div>
                <button className="w-full py-sm border border-outline-variant text-on-surface font-label-md text-label-md rounded-xl hover:bg-surface-container-low transition-all" onClick={() => setActiveTab('login')}>
                  Already have an account?
                </button>
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-md font-label-sm text-label-sm text-primary mt-lg">
              <Link href="/about" className="hover:underline">About</Link>
              <Link href="/privacy" className="hover:underline">Privacy</Link>
              <Link href="/terms" className="hover:underline">Terms</Link>
              <Link href="/contact" className="hover:underline">Contact Us</Link>
            </div>
            <p className="text-center font-label-sm text-label-sm text-outline mt-sm">© 2026 Neutron Tech. All rights reserved.</p>
          </div>
        </section>
      </div>
    </>
  );
}
