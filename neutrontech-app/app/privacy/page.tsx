import Link from 'next/link';
import type { ReactNode } from 'react';

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="bg-surface-container-lowest rounded-2xl p-8 mb-6 border border-outline-variant">
    <h2 className="font-headline-md text-headline-md text-on-surface mb-4">{title}</h2>
    <div className="space-y-3 text-on-surface-variant leading-relaxed">{children}</div>
  </section>
);

export default function PrivacyPage() {
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
        <div className="mb-10">
          <h1 className="font-headline-lg text-headline-lg text-on-surface mb-3">Privacy Policy</h1>
          <p className="text-on-surface-variant">Last updated: 1 June 2026</p>
        </div>

        <div className="bg-secondary-container rounded-2xl p-6 mb-8 flex gap-4">
          <span className="material-symbols-outlined text-on-secondary-container shrink-0 mt-0.5">info</span>
          <p className="text-on-secondary-container">
            This policy explains what data we collect, how we use it, and the choices you have. We keep it plain and jargon-free on purpose.
          </p>
        </div>

        <Section title="1. Information We Collect">
          <p>
            <strong className="text-on-surface">Account data:</strong> When you register, we collect your email address, display name, and a hashed password. You may optionally provide a profile photo, bio, and job title.
          </p>
          <p>
            <strong className="text-on-surface">Content you post:</strong> Any posts, comments, images, or videos you publish on the platform are stored on our servers and visible to other users per your sharing settings.
          </p>
          <p>
            <strong className="text-on-surface">Usage data:</strong> We collect anonymised interaction logs (page views, feature clicks) to understand how the product is used and where to invest engineering effort. This data is never tied to your identity for advertising purposes.
          </p>
          <p>
            <strong className="text-on-surface">Device & network data:</strong> IP address, browser type, and operating system are logged temporarily for security and rate-limiting purposes. Logs are purged after 30 days.
          </p>
        </Section>

        <Section title="2. How We Use Your Information">
          <ul className="list-disc list-inside space-y-2">
            <li>To operate and improve the platform.</li>
            <li>To authenticate your account and keep it secure.</li>
            <li>To send transactional emails (password reset, security alerts). We do not send marketing emails unless you opt in.</li>
            <li>To detect and prevent abuse, spam, and fraudulent activity.</li>
            <li>To comply with legal obligations where required.</li>
          </ul>
          <p className="mt-3">We do <strong className="text-on-surface">not</strong> sell your personal data to third parties. Ever.</p>
        </Section>

        <Section title="3. Cookies & Tracking">
          <p>We use a single session cookie to keep you logged in. We do not use third-party tracking pixels, advertising cookies, or fingerprinting techniques.</p>
          <p>You can disable cookies in your browser, but the platform will require you to log in on every visit.</p>
        </Section>

        <Section title="4. Data Sharing">
          <p>We share data only in these limited circumstances:</p>
          <ul className="list-disc list-inside space-y-2 mt-2">
            <li><strong className="text-on-surface">Infrastructure providers:</strong> Our hosting and database run on Supabase (EU region). They process data on our behalf under a Data Processing Agreement.</li>
            <li><strong className="text-on-surface">Legal requirements:</strong> We may disclose data if required by a court order or applicable law, and will notify affected users where legally permitted.</li>
            <li><strong className="text-on-surface">Business transfer:</strong> In the event of a merger or acquisition, data may transfer to the acquiring entity, who will be bound by this policy.</li>
          </ul>
        </Section>

        <Section title="5. Data Retention">
          <p>Your account data is retained for as long as your account is active. If you delete your account, all personal data is permanently removed within 30 days, except where retention is required by law (e.g. financial records).</p>
          <p>Anonymised, aggregated analytics are retained indefinitely as they cannot identify you.</p>
        </Section>

        <Section title="6. Your Rights">
          <p>Depending on your jurisdiction, you may have the right to:</p>
          <ul className="list-disc list-inside space-y-2 mt-2">
            <li>Access a copy of the personal data we hold about you.</li>
            <li>Correct inaccurate data.</li>
            <li>Request deletion of your data ("right to be forgotten").</li>
            <li>Restrict or object to certain processing activities.</li>
            <li>Data portability — receive your data in a machine-readable format.</li>
          </ul>
          <p className="mt-3">To exercise any of these rights, email us at <strong className="text-on-surface">privacy@neutrontech.io</strong>. We respond within 30 days.</p>
        </Section>

        <Section title="7. Security">
          <p>We implement industry-standard security measures including TLS encryption in transit, encrypted storage at rest, and regular third-party security audits. Access to production data is restricted to essential personnel only.</p>
          <p>If you discover a security vulnerability, please report it responsibly to <strong className="text-on-surface">security@neutrontech.io</strong>.</p>
        </Section>

        <Section title="8. Children's Privacy">
          <p>Neutron Tech is not directed at children under 13. We do not knowingly collect personal data from anyone under 13. If we learn that we have inadvertently done so, we will delete that data immediately.</p>
        </Section>

        <Section title="9. Changes to This Policy">
          <p>We may update this policy from time to time. Material changes will be announced via an in-app notification at least 14 days before taking effect. Continued use of the platform after that date constitutes acceptance of the updated policy.</p>
        </Section>

        <Section title="10. Contact">
          <p>Questions about this policy? Reach our Data Protection Officer at:</p>
          <div className="mt-3 space-y-2">
            <p><strong className="text-on-surface">Email:</strong> privacy@neutrontech.io</p>
            <p><strong className="text-on-surface">Postal:</strong> Neutron Tech Inc., 350 Mission Street, San Francisco, CA 94105, USA</p>
          </div>
        </Section>
      </main>

      {/* Footer */}
      <footer className="border-t border-outline-variant py-6 px-margin-mobile md:px-margin-desktop">
        <div className="max-w-[800px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-label-sm text-label-sm text-secondary">© 2026 Neutron Tech Inc.</span>
          <div className="flex gap-6">
            <Link href="/about" className="font-label-sm text-label-sm text-secondary hover:text-primary transition-colors">About</Link>
            <Link href="/privacy" className="font-label-sm text-label-sm text-primary font-bold">Privacy</Link>
            <Link href="/terms" className="font-label-sm text-label-sm text-secondary hover:text-primary transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
