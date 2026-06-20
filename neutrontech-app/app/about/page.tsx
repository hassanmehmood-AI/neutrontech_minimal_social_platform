import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-surface font-body-md text-body-md">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant h-16 flex items-center px-margin-mobile md:px-margin-desktop shadow-sm">
        <div className="max-w-[1280px] mx-auto w-full flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-sm">
            <img src="/brand-logo.png" alt="" className="h-8 w-8 object-contain brightness-0" />
            <span className="font-display text-headline-sm text-on-surface font-bold tracking-tight">Neutron Tech</span>
          </Link>
          <Link href="/profile" className="font-label-md text-label-md text-secondary hover:text-primary transition-colors">
            Back to Profile
          </Link>
        </div>
      </header>

      <main className="pt-24 pb-16 px-margin-mobile md:px-margin-desktop max-w-[800px] mx-auto">
        {/* Hero */}
        <div className="mb-12 text-center">
          <h1 className="font-headline-lg text-headline-lg text-on-surface mb-4">About Neutron Tech</h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-[560px] mx-auto leading-relaxed">
            We&apos;re building the future of professional social networking — a platform where ideas collide and communities thrive.
          </p>
        </div>

        {/* Mission */}
        <section className="bg-surface-container-lowest rounded-2xl p-8 mb-6 border border-outline-variant">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-4">Our Mission</h2>
          <p className="text-on-surface-variant leading-relaxed mb-4">
            Neutron Tech was founded in 2024 with a simple belief: people do their best work when they&apos;re connected to others who share their passion. We set out to create a minimal, fast, and respectful space for professionals, creators, and curious minds to share ideas, celebrate milestones, and grow together.
          </p>
          <p className="text-on-surface-variant leading-relaxed">
            Unlike legacy social platforms, we don&apos;t optimise for outrage or endless scrolling. We optimise for genuine connection and meaningful content.
          </p>
        </section>

        {/* Values */}
        <section className="bg-surface-container-lowest rounded-2xl p-8 mb-6 border border-outline-variant">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-6">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: 'privacy_tip', title: 'Privacy First', desc: 'Your data is yours. We never sell personal information and keep data collection to the minimum needed to run the platform.' },
              { icon: 'verified', title: 'Authenticity', desc: 'We believe in real identities and real conversations. No bots, no fake engagement — just genuine human interaction.' },
              { icon: 'bolt', title: 'Speed & Simplicity', desc: 'We obsess over performance. The platform is lightweight by design so you can focus on content, not waiting.' },
              { icon: 'diversity_3', title: 'Inclusive Community', desc: 'We welcome professionals from every industry, background, and level of experience. Curiosity is the only requirement.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex gap-4">
                <div className="shrink-0 w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-secondary-container text-[20px]">{icon}</span>
                </div>
                <div>
                  <p className="font-label-md text-label-md text-on-surface font-bold mb-1">{title}</p>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="bg-primary-container rounded-2xl p-8 mb-6">
          <h2 className="font-headline-md text-headline-md text-on-primary-container mb-6">By the Numbers</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { value: '12K+', label: 'Active Members' },
              { value: '48K+', label: 'Posts Shared' },
              { value: '120+', label: 'Countries' },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="font-display text-headline-lg text-on-primary-container font-bold">{value}</p>
                <p className="font-label-sm text-label-sm text-on-primary-container/70 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="bg-surface-container-lowest rounded-2xl p-8 mb-6 border border-outline-variant">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-6">The Team</h2>
          <p className="text-on-surface-variant leading-relaxed mb-6">
            We&apos;re a small, remote-first team of engineers, designers, and community builders spread across the globe. We care deeply about the product and the people who use it.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'Alex Rivera', role: 'Co-founder & CEO', initials: 'AR' },
              { name: 'Priya Singh', role: 'Co-founder & CTO', initials: 'PS' },
              { name: 'Jordan Kim', role: 'Head of Design', initials: 'JK' },
            ].map(({ name, role, initials }) => (
              <div key={name} className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low">
                <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
                  <span className="font-label-md text-label-md text-on-secondary-container font-bold">{initials}</span>
                </div>
                <div>
                  <p className="font-label-md text-label-md text-on-surface font-bold">{name}</p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-4">Get in Touch</h2>
          <p className="text-on-surface-variant leading-relaxed mb-4">
            Have questions, feedback, or partnership enquiries? We&apos;d love to hear from you.
          </p>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-[20px]">mail</span>
              <span className="text-on-surface-variant">hello@neutrontech.io</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-[20px]">language</span>
              <span className="text-on-surface-variant">www.neutrontech.io</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-[20px]">location_on</span>
              <span className="text-on-surface-variant">San Francisco, CA · Remote-first</span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-outline-variant py-6 px-margin-mobile md:px-margin-desktop">
        <div className="max-w-[800px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-label-sm text-label-sm text-secondary">© 2026 Neutron Tech Inc.</span>
          <div className="flex gap-6">
            <Link href="/about" className="font-label-sm text-label-sm text-primary font-bold">About</Link>
            <Link href="/privacy" className="font-label-sm text-label-sm text-secondary hover:text-primary transition-colors">Privacy</Link>
            <Link href="/terms" className="font-label-sm text-label-sm text-secondary hover:text-primary transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
