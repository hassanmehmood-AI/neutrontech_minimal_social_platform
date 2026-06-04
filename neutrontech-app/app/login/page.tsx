'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [mobileTab, setMobileTab] = useState<'login' | 'signup'>('login');
  const [desktopTab, setDesktopTab] = useState<'login' | 'signup'>('login');
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });
    setLoading(false);
    if (error) { setLoginError(error.message); return; }
    router.push('/feed');
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');
    setSignupMsg('');
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
      options: { data: { full_name: signupFullName } },
    });

    if (error) { setLoading(false); setSignupError(error.message); return; }

    // Create profile via API route (uses service role key — bypasses RLS)
    if (data.user) {
      await fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: data.user.id,
          fullName: signupFullName,
          email: signupEmail,
        }),
      });
    }

    setLoading(false);

    if (data.session) {
      router.push('/feed');
    } else {
      setSignupMsg('Check your email to confirm your account, then sign in.');
      setMobileTab('login');
      setDesktopTab('login');
    }
  };

  return (
    <>
      {/* ══════════════════════════════════
          MOBILE LAYOUT (hidden on md+)
      ══════════════════════════════════ */}
      <div className="lg:hidden min-h-screen flex flex-col items-center justify-center p-margin-mobile relative overflow-hidden">
        <div className="fixed -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10"></div>
        <div className="fixed -bottom-24 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10"></div>

        <main className="w-full max-w-[28rem] mx-auto flex flex-col items-center space-y-xl">
          <header className="text-center space-y-sm">
            <img src="/logo.png" alt="NeutronTech" className="h-32 w-auto mx-auto drop-shadow-sm" />
            <p className="font-label-md text-label-md text-on-surface-variant">The future of social innovation.</p>
          </header>

          <div className="w-full bg-surface-container-lowest rounded-xl border border-outline-variant p-md auth-card">
            {/* Toggle pills */}
            <div className="flex p-xs bg-surface-container-low rounded-lg mb-lg gap-xs">
              <button
                className={`flex-1 py-xs rounded-md font-label-md text-label-md transition-all ${mobileTab === 'login' ? 'bg-surface-container-highest text-primary shadow-sm' : 'text-on-surface-variant'}`}
                onClick={() => setMobileTab('login')}
              >Login</button>
              <button
                className={`flex-1 py-xs rounded-md font-label-md text-label-md transition-all ${mobileTab === 'signup' ? 'bg-surface-container-highest text-primary shadow-sm' : 'text-on-surface-variant'}`}
                onClick={() => setMobileTab('signup')}
              >Sign Up</button>
            </div>

            {signupMsg && (
              <div className="mb-md p-sm bg-secondary-container text-on-secondary-container rounded-lg font-label-sm text-label-sm text-center">{signupMsg}</div>
            )}

            {/* Mobile Login Form */}
            {mobileTab === 'login' && (
              <form className="space-y-md" onSubmit={handleLogin}>
                {loginError && <p className="text-error font-label-sm text-label-sm">{loginError}</p>}
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-base">Email</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">mail</span>
                    <input value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="w-full pl-xl pr-md py-sm bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/15 focus:border-primary outline-none transition-all font-body-md" placeholder="hello@email.com" type="email" required />
                  </div>
                </div>
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-base">Password</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">lock</span>
                    <input value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="w-full pl-xl pr-12 py-sm bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/15 focus:border-primary outline-none transition-all font-body-md" placeholder="••••••••" type={showPwd['mob-pwd'] ? 'text' : 'password'} required />
                    <button className="absolute right-sm top-1/2 -translate-y-1/2 text-outline hover:text-primary" type="button" onClick={() => togglePwd('mob-pwd')}>
                      <span className="material-symbols-outlined">{showPwd['mob-pwd'] ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                </div>
                <button disabled={loading} className="w-full py-md bg-primary-container text-white font-label-md text-label-md rounded-lg shadow-md tap-scale hover:brightness-110 transition-all mt-lg disabled:opacity-60" type="submit">
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
            )}

            {/* Mobile Signup Form */}
            {mobileTab === 'signup' && (
              <form className="space-y-md" onSubmit={handleSignup}>
                {signupError && <p className="text-error font-label-sm text-label-sm">{signupError}</p>}
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-base">Full Name</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">person</span>
                    <input value={signupFullName} onChange={e => setSignupFullName(e.target.value)} className="w-full pl-xl pr-md py-sm bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/15 focus:border-primary outline-none transition-all font-body-md" placeholder="John Doe" type="text" required />
                  </div>
                </div>
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-base">Email Address</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">mail</span>
                    <input value={signupEmail} onChange={e => setSignupEmail(e.target.value)} className="w-full pl-xl pr-md py-sm bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/15 focus:border-primary outline-none transition-all font-body-md" placeholder="hello@neutrontech.io" type="email" required />
                  </div>
                </div>
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-base">Password</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">lock</span>
                    <input value={signupPassword} onChange={e => setSignupPassword(e.target.value)} className="w-full pl-xl pr-12 py-sm bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/15 focus:border-primary outline-none transition-all font-body-md" placeholder="Min. 6 characters" type={showPwd['mob-signup-pwd'] ? 'text' : 'password'} required minLength={6} />
                    <button className="absolute right-sm top-1/2 -translate-y-1/2 text-outline hover:text-primary" type="button" onClick={() => togglePwd('mob-signup-pwd')}>
                      <span className="material-symbols-outlined">{showPwd['mob-signup-pwd'] ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                </div>
                <button disabled={loading} className="w-full py-md bg-primary-container text-white font-label-md text-label-md rounded-lg shadow-md tap-scale hover:brightness-110 transition-all mt-lg disabled:opacity-60" type="submit">
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </form>
            )}

            <div className="mt-md text-center">
              <a className="font-label-sm text-label-sm text-primary hover:underline" href="#">Forgot password?</a>
            </div>
          </div>

          <footer className="w-full space-y-md">
            <p className="text-center font-label-sm text-label-sm text-on-surface-variant px-md leading-relaxed">
              By continuing, you agree to NeutronTech&apos;s{' '}
              <a className="text-primary hover:underline" href="#">Terms of Service</a> and{' '}
              <a className="text-primary hover:underline" href="#">Privacy Policy</a>.
            </p>
          </footer>
        </main>
      </div>

      {/* ══════════════════════════════════
          DESKTOP LAYOUT (hidden on mobile)
      ══════════════════════════════════ */}
      <div className="hidden lg:flex h-screen overflow-hidden flex-col">
        <main className="flex-1 flex flex-row overflow-hidden">

          {/* Left branding panel */}
          <section className="hidden lg:flex w-1/2 bg-primary-container relative overflow-hidden items-center justify-center p-xl">
            <div className="absolute inset-0 z-0">
              <img className="w-full h-full object-cover opacity-30 mix-blend-overlay" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_mngc07qN1BwTUEn9wOMEvj5HquXKfx5XA47N7cSDy7GWAxYKvoZMa-ApNYkqa35hyIBmzCDfGDlgcCdhuUAOxQZCltQFYhKSGORyqCaXFJJa5xrWRGdqrzUTvjzfJk1p4fTWyJeE9JtmzpZfUw7BzixKevW4glRJNJyd1kMGvVqHf3pDODXYDR5_JcC4IeJRVJu30KF3q5EMvhPxwD9n0_x-UXxnusrtqdDue3O-rkaOjjntf_Usx927QuYkMfk3Uln5z8Ykbkc" alt="Tech background" />
            </div>
            <div className="relative z-10 max-w-[32rem] text-left">
              <Link href="/" className="inline-block mb-md">
                <span className="font-display text-headline-lg text-white/80 tracking-tight">NeutronTech</span>
              </Link>
              <h1 className="font-display text-display text-on-primary mb-md leading-tight">
                Powering the next generation of Tech-Social.
              </h1>
              <p className="font-body-lg text-body-lg text-primary-fixed mb-lg opacity-90">
                Connect, collaborate, and scale with NeutronTech&apos;s precision-engineered platform.
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
          </section>

          {/* Right form panel */}
          <section className="w-full lg:w-1/2 bg-surface-container-lowest flex items-center justify-center p-xl overflow-y-auto">
            <div className="w-full max-w-[28rem]">

              <div className="mb-xl flex justify-center mt-lg">
                <Link href="/">
                  <img src="/logo.png" alt="NeutronTech" className="h-28 w-auto drop-shadow-sm" />
                </Link>
              </div>

              {/* Desktop tab nav */}
              <div className="flex gap-lg border-b border-outline-variant mb-xl">
                <button
                  className={`pb-sm font-label-md text-label-md transition-all border-b-2 ${desktopTab === 'login' ? 'border-primary-container text-primary-container font-bold' : 'border-transparent text-secondary hover:text-primary'}`}
                  onClick={() => setDesktopTab('login')}
                >Login</button>
                <button
                  className={`pb-sm font-label-md text-label-md transition-all border-b-2 ${desktopTab === 'signup' ? 'border-primary-container text-primary-container font-bold' : 'border-transparent text-secondary hover:text-primary'}`}
                  onClick={() => setDesktopTab('signup')}
                >Sign Up</button>
              </div>

              {signupMsg && (
                <div className="mb-md p-sm bg-secondary-container text-on-secondary-container rounded-lg font-label-sm text-label-sm text-center">{signupMsg}</div>
              )}

              {/* Desktop Login */}
              {desktopTab === 'login' && (
                <div className="space-y-md">
                  <div className="space-y-xs">
                    <h2 className="font-headline-md text-headline-md text-on-surface">Welcome back</h2>
                    <p className="font-body-md text-body-md text-on-surface-variant">Please enter your details to sign in.</p>
                  </div>
                  <form className="space-y-md mt-lg" onSubmit={handleLogin}>
                    {loginError && <p className="text-error font-label-sm text-label-sm">{loginError}</p>}
                    <div className="space-y-base">
                      <label className="font-label-md text-label-md text-on-surface-variant ml-1">Email Address</label>
                      <input value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="w-full px-md py-sm rounded-xl border border-outline-variant bg-white focus:outline-none focus:ring-2 focus:ring-primary-container/15 focus:border-primary-container transition-all" placeholder="name@company.com" type="email" required />
                    </div>
                    <div className="space-y-base">
                      <div className="flex justify-between">
                        <label className="font-label-md text-label-md text-on-surface-variant ml-1">Password</label>
                        <a className="font-label-md text-label-md text-primary hover:underline" href="#">Forgot password?</a>
                      </div>
                      <div className="relative">
                        <input value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="w-full px-md py-sm rounded-xl border border-outline-variant bg-white focus:outline-none focus:ring-2 focus:ring-primary-container/15 focus:border-primary-container transition-all" placeholder="••••••••" type={showPwd['desk-pwd'] ? 'text' : 'password'} required />
                        <button className="absolute right-sm top-1/2 -translate-y-1/2 text-outline hover:text-primary" type="button" onClick={() => togglePwd('desk-pwd')}>
                          <span className="material-symbols-outlined">{showPwd['desk-pwd'] ? 'visibility_off' : 'visibility'}</span>
                        </button>
                      </div>
                    </div>
                    <button disabled={loading} className="w-full bg-primary-container text-white py-sm rounded-xl font-label-md text-label-md font-bold hover:brightness-110 active:scale-[0.98] transition-all flex justify-center items-center gap-xs disabled:opacity-60" type="submit">
                      {loading ? 'Signing in...' : <> Sign In <span className="material-symbols-outlined text-sm">arrow_forward</span> </>}
                    </button>
                  </form>
                </div>
              )}

              {/* Desktop Signup */}
              {desktopTab === 'signup' && (
                <div className="space-y-md">
                  <div className="space-y-xs">
                    <h2 className="font-headline-md text-headline-md text-on-surface">Create an account</h2>
                    <p className="font-body-md text-body-md text-on-surface-variant">Join the hub of modern innovation.</p>
                  </div>
                  <form className="space-y-md mt-lg" onSubmit={handleSignup}>
                    {signupError && <p className="text-error font-label-sm text-label-sm">{signupError}</p>}
                    <div className="space-y-base">
                      <label className="font-label-md text-label-md text-on-surface-variant ml-1">Full Name</label>
                      <input value={signupFullName} onChange={e => setSignupFullName(e.target.value)} className="w-full px-md py-sm rounded-xl border border-outline-variant bg-white focus:outline-none focus:ring-2 focus:ring-primary-container/15 focus:border-primary-container transition-all" placeholder="John Doe" type="text" required />
                    </div>
                    <div className="space-y-base">
                      <label className="font-label-md text-label-md text-on-surface-variant ml-1">Email Address</label>
                      <input value={signupEmail} onChange={e => setSignupEmail(e.target.value)} className="w-full px-md py-sm rounded-xl border border-outline-variant bg-white focus:outline-none focus:ring-2 focus:ring-primary-container/15 focus:border-primary-container transition-all" placeholder="name@company.com" type="email" required />
                    </div>
                    <div className="space-y-base">
                      <label className="font-label-md text-label-md text-on-surface-variant ml-1">Password</label>
                      <div className="relative">
                        <input value={signupPassword} onChange={e => setSignupPassword(e.target.value)} className="w-full px-md py-sm rounded-xl border border-outline-variant bg-white focus:outline-none focus:ring-2 focus:ring-primary-container/15 focus:border-primary-container transition-all" placeholder="Min. 6 characters" type={showPwd['desk-signup-pwd'] ? 'text' : 'password'} required minLength={6} />
                        <button className="absolute right-sm top-1/2 -translate-y-1/2 text-outline hover:text-primary" type="button" onClick={() => togglePwd('desk-signup-pwd')}>
                          <span className="material-symbols-outlined">{showPwd['desk-signup-pwd'] ? 'visibility_off' : 'visibility'}</span>
                        </button>
                      </div>
                    </div>
                    <button disabled={loading} className="w-full bg-primary-container text-white py-sm rounded-xl font-label-md text-label-md font-bold hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-60" type="submit">
                      {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                  </form>
                  <p className="text-center font-label-sm text-label-sm text-outline pt-sm">
                    By signing up, you agree to our <a className="text-primary hover:underline" href="#">Terms of Service</a> and <a className="text-primary hover:underline" href="#">Privacy Policy</a>.
                  </p>
                </div>
              )}

            </div>
          </section>
        </main>

        <footer className="bg-surface-container-lowest py-md border-t border-outline-variant">
          <div className="max-w-[1280px] mx-auto px-margin-mobile flex flex-col md:flex-row justify-between items-center gap-sm">
            <span className="font-label-sm text-label-sm text-on-surface-variant opacity-60">© 2024 NeutronTech Inc.</span>
            <div className="flex gap-md">
              <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Support</a>
              <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Status</a>
              <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Security</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
