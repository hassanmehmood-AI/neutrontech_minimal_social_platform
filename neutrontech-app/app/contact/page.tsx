'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setError('');

    const res = await fetch('/api/contact-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message }),
    });

    if (res.ok) {
      setStatus('sent');
      setName('');
      setEmail('');
      setMessage('');
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-surface font-body-md text-body-md">
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant h-16 flex items-center px-margin-mobile md:px-margin-desktop shadow-sm">
        <div className="max-w-[1280px] mx-auto w-full flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-sm">
            <img src="/brand-logo.png" alt="" className="h-8 w-8 object-contain brightness-0" />
            <span className="font-display text-headline-sm text-on-surface font-bold tracking-tight">Neutron Tech</span>
          </Link>
          <Link href="/feed" className="font-label-md text-label-md text-secondary hover:text-primary transition-colors">
            Back to Feed
          </Link>
        </div>
      </header>

      <main className="pt-24 pb-16 px-margin-mobile md:px-margin-desktop max-w-[640px] mx-auto">
        <div className="mb-8 text-center">
          <h1 className="font-headline-lg text-headline-lg text-on-surface mb-4">Contact Us</h1>
          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            Have a question, feedback, or found a problem? Send us a message and our team will get back to you.
          </p>
        </div>

        <section className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant">
          {status === 'sent' ? (
            <div className="text-center py-8">
              <span className="material-symbols-outlined text-primary text-[40px] mb-4 inline-block">check_circle</span>
              <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Query submitted</h2>
              <p className="text-on-surface-variant leading-relaxed">
                Thanks for reaching out — our admin team has received your query and will follow up by email.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="flex flex-col gap-5">
              <div>
                <label className="block font-label-md text-label-md font-bold text-on-surface mb-2">Name</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full bg-surface-container-low rounded-xl px-md py-sm outline-none border border-outline-variant focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block font-label-md text-label-md font-bold text-on-surface mb-2">Email</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-surface-container-low rounded-xl px-md py-sm outline-none border border-outline-variant focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block font-label-md text-label-md font-bold text-on-surface mb-2">Message</label>
                <textarea
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what's on your mind..."
                  rows={5}
                  className="w-full bg-surface-container-low rounded-xl px-md py-sm outline-none border border-outline-variant focus:border-primary transition-colors resize-none"
                />
              </div>

              {status === 'error' && (
                <p className="font-body-sm text-body-sm text-red-600">{error}</p>
              )}

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="bg-primary text-on-primary font-label-md text-label-md font-bold rounded-xl py-sm hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {status === 'submitting' ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          )}
        </section>
      </main>

      <footer className="border-t border-outline-variant py-6 px-margin-mobile md:px-margin-desktop">
        <div className="max-w-[640px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-label-sm text-label-sm text-secondary">© 2026 Neutron Tech Inc.</span>
          <div className="flex gap-6">
            <Link href="/about" className="font-label-sm text-label-sm text-secondary hover:text-primary transition-colors">About</Link>
            <Link href="/privacy" className="font-label-sm text-label-sm text-secondary hover:text-primary transition-colors">Privacy</Link>
            <Link href="/terms" className="font-label-sm text-label-sm text-secondary hover:text-primary transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
