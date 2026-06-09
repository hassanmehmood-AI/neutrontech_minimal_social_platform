'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LandingPage() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/feed');
      } else {
        router.replace('/login');
      }
    });
  }, [router]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  if (!checked) return null;

  return (
    <div className="overflow-x-hidden">
      {/* ── TOP NAV ── */}
      <header className={`fixed top-0 w-full z-50 bg-surface/90 blur-nav border-b border-outline-variant h-16 ${scrolled ? 'shadow-md' : 'shadow-sm'}`}>
        <nav className="grid grid-cols-3 items-center px-margin-mobile md:px-margin-desktop h-full w-full max-w-[1280px] mx-auto">
          {/* Left spacer */}
          <div className="flex items-center">
            <button className="lg:hidden text-primary p-xs" onClick={() => setMenuOpen(true)}>
              <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>menu</span>
            </button>
          </div>
          {/* Center: nav links */}
          <div className="flex justify-center">
            <div className="hidden lg:flex gap-sm">
              <Link href="/feed" className="font-label-md text-label-md text-secondary hover:text-primary hover:bg-surface-container-low transition-colors px-xs py-base rounded-lg">Feed</Link>
              <Link href="/search" className="font-label-md text-label-md text-secondary hover:text-primary hover:bg-surface-container-low transition-colors px-xs py-base rounded-lg">Search</Link>
            </div>
          </div>
          {/* Right: actions */}
          <div className="flex items-center justify-end gap-md">
            <div className="hidden sm:flex items-center gap-sm">
              <Link href="/login" className="font-label-md text-label-md text-primary bg-surface border border-outline-variant px-md py-xs rounded-full hover:bg-surface-container-low active:scale-95 duration-150">Login</Link>
              <Link href="/login" className="font-label-md text-label-md bg-primary-container text-white px-md py-xs rounded-full hover:brightness-110 active:scale-95 duration-150 shadow-md shadow-primary/20">Sign Up</Link>
            </div>
          </div>
        </nav>
      </header>

      {/* ── MOBILE MENU OVERLAY ── */}
      <div className={`fixed inset-0 z-[60] bg-surface transition-transform duration-300 ease-in-out lg:hidden ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col p-md h-full">
          <div className="flex justify-between items-center mb-xl">
            <img src="/logo.png" alt="Neutron Tech" className="h-12 w-auto drop-shadow-sm" />
            <button className="p-xs text-primary" onClick={() => setMenuOpen(false)}>
              <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>close</span>
            </button>
          </div>
          <nav className="flex flex-col space-y-md">
            <Link className="font-label-md text-headline-md text-primary font-bold border-b-2 border-primary pb-xs w-fit" href="/feed" onClick={() => setMenuOpen(false)}>Feed</Link>
            <Link className="font-label-md text-headline-md text-secondary hover:text-primary transition-colors" href="/search" onClick={() => setMenuOpen(false)}>Search</Link>
          </nav>
          <div className="mt-auto flex flex-col gap-sm pb-xl">
            <Link href="/login" className="w-full py-md bg-primary-container text-on-primary text-label-md font-bold rounded-xl active:scale-95 duration-150 text-center">Sign Up</Link>
            <Link href="/login" className="w-full py-md border border-outline text-primary text-label-md font-bold rounded-xl active:scale-95 duration-150 text-center">Login</Link>
          </div>
        </div>
      </div>

      <main className="pt-16">

        {/* ── HERO ── */}
        <section className="relative pt-8 pb-16 lg:pt-16 lg:pb-40 bg-surface-bright">
          <div className="absolute top-0 right-0 -z-10 w-1/2 h-full bg-[radial-gradient(circle_at_70%_30%,_#e0e0e0_0%,_transparent_60%)] opacity-40 hidden lg:block"></div>
          <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop">
            {/* Mobile */}
            <div className="flex flex-col items-center text-center lg:hidden">
              <div className="inline-flex items-center gap-xs px-sm py-xs bg-secondary-container rounded-full mb-md">
                <span className="material-symbols-outlined text-[18px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                <span className="font-label-sm text-on-secondary-container">VERSION 2.0 IS LIVE</span>
              </div>
              <h1 className="font-display text-[42px] leading-[1.1] text-primary mb-md tracking-tight">INNOVATION AT ITS FOREFRONT</h1>
              <p className="font-body-md text-on-surface-variant mb-xl max-w-[24rem]">Empowering the next generation of creators through high-energy connectivity and professional precision.</p>
              <div className="flex flex-col w-full gap-sm max-w-[24rem]">
                <Link href="/login" className="w-full py-md bg-primary-container text-on-primary text-label-md font-bold rounded-xl shadow-lg active:scale-95 transition-all text-center">Join Neutron Tech</Link>
                <Link href="/feed" className="w-full py-md bg-surface text-primary border border-outline-variant text-label-md font-bold rounded-xl active:scale-95 transition-all text-center">Explore Feed</Link>
              </div>
            </div>
            {/* Mobile image */}
            <div className="px-0 mb-xl mt-lg lg:hidden">
              <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-xl border border-outline-variant">
                <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuChvSUjRblG1KhR2Rc335vs-xGrD3lMxp8LrYlTe8luuT8GI2Ef7BsSETp1ksTwAj6p51NaX6nqgs6F6B1MRGQUf0kp1LP20g-GrIMfbWfzVXafOfsKscRVEg-akgCA4CcRGOAcISyC9f7rB7aFkq1LmI0KCU_wBF0kCzXygWu8ObR5VLpYLS3nObBoTN3gafZAHX4qkyQCZh3GGv3KZLdo0EH-Wl7FpXzKdDwGv9DRLgAZRXV2kbWjLbVYAEDBHHmnKrYE_npVhw" alt="Neutron Tech Platform" />
                <div className="absolute inset-0 bg-linear-to-t from-primary/20 to-transparent"></div>
              </div>
            </div>
            {/* Desktop */}
            <div className="hidden lg:grid grid-cols-2 gap-xl items-center">
              <div className="space-y-lg">
                <div className="inline-flex items-center gap-xs px-md py-xs bg-secondary-container text-on-secondary-container rounded-full font-label-sm text-label-sm tracking-widest">
                  <span className="material-symbols-outlined !text-[16px]">bolt</span>
                  INNOVATION AT ITS FOREFRONT
                </div>
                <h1 className="font-display text-display lg:text-[72px] leading-[1.05] text-on-surface">
                  Connecting <span className="text-primary-container">Technology-minded</span> people.
                </h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant max-w-[36rem]">The definitive hub for engineers, designers, and tech pioneers. Build your network, showcase your breakthroughs, and stay ahead of the curve.</p>
                <div className="flex flex-wrap gap-md pt-md">
                  <Link href="/login" className="bg-primary-container text-white px-xl py-md rounded-xl font-label-md text-label-md hover:brightness-110 shadow-lg shadow-primary/20 active:scale-95 transition-all">Join Neutron Tech</Link>
                  <Link href="/feed" className="border border-outline-variant text-on-surface px-xl py-md rounded-xl font-label-md text-label-md hover:bg-surface-container-low active:scale-95 transition-all">Explore Feed</Link>
                </div>
              </div>
              <div className="relative">
                <div className="glass-card rounded-[40px] shadow-2xl p-md overflow-hidden transform hover:scale-[1.02] transition-transform duration-500">
                  <img alt="Server room visual" className="w-full h-[500px] object-cover rounded-2xl grayscale hover:grayscale-0 transition-all duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBbyOGnJb6xjFH5jLdYDPuzLetRiyxPEU-pI6bBy1g6Qgqi9BN3tB3kNHmGx5Vs0i9rxbDPnqeCH43OdkwghxH78NBUY69l5GsMR714iVk0AaYCSEKYqwF4lDUaQ70mvxPIjYuULq95gGVRsyucIzokN1FJfUYA8dFdHG0BZi6UvRWWfz1xQDZdMDomzGjORpsfOoP70NW2AFLUIVy-K7Mk6YVeTLfwyv1nbcSPUhR52xV79WTLXKqVysgT9O0ork_6q17RxnKqQ1Y" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── MOBILE: FEED PREVIEW ── */}
        <section className="px-margin-mobile mb-xl lg:hidden">
          <div className="flex justify-between items-end mb-md">
            <h2 className="font-headline-lg-mobile text-on-surface">Trending Feed</h2>
            <Link className="text-primary font-label-md" href="/feed">View all</Link>
          </div>
          <div className="flex flex-col gap-md">
            <div className="bg-surface-container-lowest p-md rounded-2xl border border-outline-variant shadow-sm">
              <div className="flex items-center gap-sm mb-sm">
                <img className="w-10 h-10 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBQZIWLQde2lRUfQWsubY6StLCaMTmq89X_4gX3qjzGxHGVIZSJm7klH7wHynwu9_S4lro3nt_F62DqnVrycWbuwyd4cAlaRurw2CKP0HtLtsNRnYp-aA6Ah_pE7206zSPOKngd1m59ANbwHsVk_0gIADZy7SO-YE8oB7XNvPIdadrkknqSK0JhktfV9L0yMudpaLeRKtziGGzuIV6r4F4hjoia2bhSZ0FHTgozzASUymog1tb4dMfMZ0sW5liLDDmUJzvJNAALlGA" alt="Alex Rivera" />
                <div>
                  <p className="font-label-md text-on-surface font-bold">Alex Rivera</p>
                  <p className="font-label-sm text-on-surface-variant">2 hours ago</p>
                </div>
              </div>
              <p className="font-body-md text-on-surface-variant mb-md">Just pushed the final update to the Neutron core. The latency improvements are beyond expectations. ⚡️</p>
              <div className="aspect-video rounded-xl overflow-hidden mb-md border border-outline-variant">
                <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzKo5U4Cq8prtEjlZKrTovDiPGxd3IrWrmLGlMi0NAaX5ulC6ZB_W9ISEiNBIElWJs_HVviD0b7lqABqDy72LJGqBR5G9SI8cFedfbqePw4qswBQ73tfjo6cGxmeVRZvahz2sZdHJiA1GCl-KaAMO9zv3A9X3BsoiYof-GyNCVoNawUd3_ZleKGXqJSDZxEoOGe94gUxf_72_VSV79g4eWdCYzCpaCeV1V3f9obTgOO7oDqBRNREsxqrFaPxa9mj_apJqcou8uRKU" alt="Code visualization" />
              </div>
              <div className="flex gap-md">
                <button className="flex items-center gap-xs text-secondary"><span className="material-symbols-outlined text-[20px]">favorite</span><span className="font-label-sm ml-1">2.4k</span></button>
                <button className="flex items-center gap-xs text-secondary"><span className="material-symbols-outlined text-[20px]">chat_bubble</span><span className="font-label-sm ml-1">128</span></button>
              </div>
            </div>
          </div>
        </section>

        {/* ── MOBILE: FEATURES ── */}
        <section className="px-margin-mobile mb-xl flex flex-col gap-md lg:hidden">
          <h2 className="font-headline-lg-mobile text-on-surface mb-xs">The Ecosystem</h2>
          <div className="bg-primary p-md rounded-3xl text-on-primary flex flex-col gap-md min-h-[200px] justify-between overflow-hidden relative">
            <div className="z-10">
              <span className="material-symbols-outlined text-[40px] mb-xs">search</span>
              <h3 className="font-headline-md mb-xs">Smart Search</h3>
              <p className="font-body-md opacity-80">Precision-engineered discovery for the tech-social hub.</p>
            </div>
            <Link href="/search" className="self-start bg-white/20 text-white px-md py-xs rounded-full font-label-md text-label-md hover:bg-white/30 transition-colors">Explore Search</Link>
            <div className="absolute -right-8 -bottom-8 opacity-20 transform rotate-12">
              <span className="material-symbols-outlined text-[200px]" style={{ fontVariationSettings: "'FILL' 1" }}>manage_search</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-md">
            <Link href="/profile" className="bg-surface-container p-md rounded-3xl border border-outline-variant flex flex-col gap-sm hover:shadow-md transition-shadow">
              <span className="material-symbols-outlined text-primary text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
              <h3 className="font-label-md font-bold text-on-surface">Digital Profile</h3>
              <p className="font-label-sm text-on-surface-variant">Your identity, secured and polished.</p>
            </Link>
            <Link href="/feed" className="bg-secondary-container p-md rounded-3xl border border-outline-variant flex flex-col gap-sm hover:shadow-md transition-shadow">
              <span className="material-symbols-outlined text-on-secondary-container text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
              <h3 className="font-label-md font-bold text-on-secondary-container">Community</h3>
              <p className="font-label-sm text-on-secondary-container/80">Collaborate with fellow innovators.</p>
            </Link>
          </div>
        </section>

        {/* ── DESKTOP: BENTO FEATURES ── */}
        <section className="bg-surface-container-low py-24 lg:py-40 hidden lg:block">
          <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="flex flex-col items-center text-center mb-24">
              <h2 className="font-headline-lg text-display text-on-surface mb-md">Engineered for Collaboration</h2>
              <p className="text-on-surface-variant max-w-2xl font-body-lg text-body-lg">Precision tools designed for the modern tech workflow, enabling seamless discovery and professional growth.</p>
            </div>
            <div className="grid grid-cols-12 gap-gutter">
              <div className="col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl p-lg overflow-hidden group shadow-sm hover:shadow-xl transition-all duration-300 bento-card">
                <div className="flex justify-between items-start mb-md">
                  <div>
                    <span className="material-symbols-outlined text-primary-container mb-sm">dynamic_feed</span>
                    <h3 className="font-headline-md text-headline-md">Community Feed</h3>
                    <p className="text-on-surface-variant font-label-md">Real-time updates from your tech ecosystem.</p>
                  </div>
                  <Link href="/feed" className="text-primary-container font-label-sm hover:underline">View All</Link>
                </div>
                <div className="space-y-md mt-lg">
                  <div className="flex gap-md p-md bg-surface-container/30 rounded-lg border border-outline-variant/50 group-hover:-translate-y-1 transition-transform duration-300">
                    <div className="w-10 h-10 rounded-full bg-primary-container/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary-container !text-[20px]">person</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold font-label-md">Sarah Chen</span>
                        <span className="text-label-sm text-outline">2m ago</span>
                      </div>
                      <p className="font-body-md text-on-surface-variant mt-xs">Just pushed a major update to the open-source neural engine. Check out the repository!</p>
                      <div className="flex gap-sm mt-sm">
                        <span className="px-xs py-[2px] bg-secondary-container/50 text-[10px] rounded font-bold">GITHUB</span>
                        <span className="px-xs py-[2px] bg-tertiary-container/20 text-[10px] rounded font-bold">AI</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <Link href="/search" className="col-span-4 bg-primary-container text-white rounded-xl p-lg flex flex-col justify-between group shadow-lg hover:brightness-110 transition-all bento-card">
                <div>
                  <span className="material-symbols-outlined mb-sm" style={{ fontVariationSettings: "'FILL' 1" }}>search</span>
                  <h3 className="font-headline-md text-headline-md">Advanced Search</h3>
                  <p className="text-white/80 font-label-md mt-sm">Find specialists, repos, and topics across the entire global network.</p>
                </div>
                <div className="mt-xl relative">
                  <div className="bg-white/10 rounded-lg p-sm border border-white/20 flex items-center gap-sm">
                    <span className="material-symbols-outlined text-white/50">search</span>
                    <span className="text-white/50 text-label-md">Search keywords...</span>
                  </div>
                </div>
              </Link>
              <Link href="/profile" className="col-span-4 bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col items-center text-center shadow-sm hover:shadow-xl transition-all duration-300 bento-card">
                <div className="w-24 h-24 rounded-full border-4 border-primary-container/20 p-1 mb-md">
                  <img alt="User avatar" className="w-full h-full object-cover rounded-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDI7Gp0M93O_45TEfaPyBQN1etVXJ1Q1hH88GxPFByL0bIleIeQXrK_g0uF8jL9_Q2pv1d-cfl28RyDJBe692CZj2fUZkViNNf6finC-nZ23pugVZSpR9RLVqbJa1Ca-6RWA6ENdfiETmWG-BIVfsNTMaWfqriTxa5zJGRC-2UQ9jFB4xMET-Hyf-1g92APWGKGyyYt_LFeahcxtutwC9N28XNPBgtqFsFkbxLWOWRmdAnEVzuBgUtK6AQEMb7L9fdECeSVtqta3Rs" />
                </div>
                <h3 className="font-headline-md text-headline-md">Your Profile</h3>
                <p className="text-on-surface-variant font-label-md mb-md">Showcase your career highlights</p>
                <div className="w-full h-px bg-outline-variant mb-md"></div>
                <div className="flex justify-around w-full">
                  <div><span className="block font-bold text-primary-container">1.2k</span><span className="text-[10px] text-outline uppercase font-bold tracking-wider">Followers</span></div>
                  <div><span className="block font-bold text-primary-container">48</span><span className="text-[10px] text-outline uppercase font-bold tracking-wider">Projects</span></div>
                </div>
              </Link>
              <div className="col-span-8 bg-surface-container-highest rounded-xl p-lg flex items-center relative overflow-hidden shadow-sm">
                <div className="z-10 max-w-[28rem]">
                  <span className="font-label-sm text-primary-container font-bold mb-sm block uppercase tracking-widest">Our Creed</span>
                  <h3 className="font-headline-lg text-headline-lg mb-sm">Integrity in Innovation.</h3>
                  <p className="font-body-md text-on-surface-variant leading-relaxed">We believe technology should empower, not distract. Our community is built on mutual respect, rigorous peer review, and a commitment to solving the world&apos;s hardest problems.</p>
                </div>
                <div className="absolute -right-16 bottom-0 opacity-10">
                  <span className="material-symbols-outlined !text-[200px]" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── MOBILE: CREED ── */}
        <section className="px-margin-mobile mb-xl py-xl bg-surface-container-low rounded-[40px] mx-4 lg:hidden">
          <div className="text-center max-w-[20rem] mx-auto">
            <h2 className="font-display text-headline-lg text-primary mb-md">The Creed</h2>
            <div className="w-12 h-1 bg-primary mx-auto mb-lg rounded-full"></div>
            <p className="font-body-lg text-on-surface italic mb-lg leading-relaxed">
              &ldquo;We believe that technology should be an accelerator of human connection, not a barrier. Our mission is to engineer spaces that foster radical transparency and high-octane innovation.&rdquo;
            </p>
            <div className="flex flex-col items-center gap-xs">
              <p className="font-label-md font-bold text-primary">NEUTRONTECH LEADERSHIP</p>
              <p className="font-label-sm text-on-surface-variant tracking-widest">EST. 2024</p>
            </div>
          </div>
        </section>

        {/* ── DESKTOP: CTA ── */}
        <section className="py-24 lg:py-40 hidden lg:block">
          <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="bg-primary-container p-16 lg:p-24 rounded-[40px] text-center text-white relative overflow-hidden shadow-2xl shadow-primary-container/30">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
              <div className="relative z-10 space-y-lg">
                <h2 className="font-display text-4xl md:text-[56px] leading-tight">Ready to join the next wave?</h2>
                <p className="font-body-lg text-body-lg text-white/80 max-w-2xl mx-auto">Join thousands of tech leaders already building the future on Neutron Tech.</p>
                <div className="flex flex-col sm:flex-row justify-center gap-md pt-lg">
                  <Link href="/login" className="bg-white text-primary-container px-xl py-md rounded-xl font-bold font-label-md hover:bg-surface-container-low transition-all active:scale-95">Get Started</Link>
                  <Link href="/search" className="border border-white/30 text-white px-xl py-md rounded-xl font-label-md hover:bg-white/10 transition-all active:scale-95">Explore</Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── MOBILE: CTA ── */}
        <section className="px-margin-mobile mb-xl lg:hidden">
          <div className="bg-primary-container p-lg rounded-3xl text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
            <div className="relative z-10">
              <h2 className="font-display text-2xl leading-tight mb-md">Ready to join?</h2>
              <p className="font-body-md text-white/80 mb-lg">Join thousands of tech leaders already building the future.</p>
              <Link href="/login" className="inline-block bg-white text-primary-container px-xl py-md rounded-xl font-bold font-label-md hover:bg-surface-container-low transition-all active:scale-95">Get Started Free</Link>
            </div>
          </div>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <footer className="bg-surface-container-lowest border-t border-outline-variant py-xl px-margin-mobile md:px-margin-desktop">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex flex-col gap-lg lg:hidden">
            <div>
              <div className="mb-xs"><img src="/logo.png" alt="Neutron Tech" className="h-12 w-auto drop-shadow-sm" /></div>
              <p className="font-body-md text-on-surface-variant">Pioneering the tech-social intersection.</p>
            </div>
            <div className="grid grid-cols-2 gap-md">
              <div className="flex flex-col gap-sm">
                <span className="font-label-sm text-primary uppercase tracking-wider">Company</span>
                <a className="font-body-md text-on-surface-variant hover:text-primary transition-colors" href="#">About</a>
                <a className="font-body-md text-on-surface-variant hover:text-primary transition-colors" href="#">Privacy</a>
              </div>
              <div className="flex flex-col gap-sm">
                <span className="font-label-sm text-primary uppercase tracking-wider">Help</span>
                <a className="font-body-md text-on-surface-variant hover:text-primary transition-colors" href="#">Terms</a>
                <a className="font-body-md text-on-surface-variant hover:text-primary transition-colors" href="#">Support</a>
              </div>
            </div>
            <div className="pt-md border-t border-outline-variant flex flex-col gap-md items-center">
              <div className="flex gap-md">
                <a className="text-secondary hover:text-primary transition-colors" href="#"><span className="material-symbols-outlined">public</span></a>
                <a className="text-secondary hover:text-primary transition-colors" href="#"><span className="material-symbols-outlined">alternate_email</span></a>
                <a className="text-secondary hover:text-primary transition-colors" href="#"><span className="material-symbols-outlined">share</span></a>
              </div>
              <p className="font-label-sm text-on-surface-variant">© 2024 Neutron Tech Inc.</p>
            </div>
          </div>
          <div className="hidden lg:flex flex-row justify-between items-center gap-xl">
            <div className="flex flex-col items-start gap-xs">
              <img src="/logo.png" alt="Neutron Tech" className="h-12 w-auto drop-shadow-sm" />
              <p className="font-body-md text-on-surface-variant font-label-sm">© 2024 Neutron Tech Inc.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-lg">
              <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary-container transition-colors" href="#">About</a>
              <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary-container transition-colors" href="#">Privacy</a>
              <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary-container transition-colors" href="#">Terms</a>
              <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary-container transition-colors" href="#">Support</a>
            </div>
            <div className="flex gap-md">
              <button className="p-sm text-on-surface-variant hover:text-primary-container transition-colors bg-surface-container rounded-full">
                <span className="material-symbols-outlined !text-[20px]">public</span>
              </button>
              <button className="p-sm text-on-surface-variant hover:text-primary-container transition-colors bg-surface-container rounded-full">
                <span className="material-symbols-outlined !text-[20px]">code</span>
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
