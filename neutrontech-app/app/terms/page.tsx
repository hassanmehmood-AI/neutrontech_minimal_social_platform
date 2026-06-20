import Link from 'next/link';
import type { ReactNode } from 'react';

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="bg-surface-container-lowest rounded-2xl p-8 mb-6 border border-outline-variant">
    <h2 className="font-headline-md text-headline-md text-on-surface mb-4">{title}</h2>
    <div className="space-y-3 text-on-surface-variant leading-relaxed">{children}</div>
  </section>
);

export default function TermsPage() {
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
          <h1 className="font-headline-lg text-headline-lg text-on-surface mb-3">Terms of Service</h1>
          <p className="text-on-surface-variant">Last updated: 1 June 2026 · Effective: 15 June 2026</p>
        </div>

        <div className="bg-secondary-container rounded-2xl p-6 mb-8 flex gap-4">
          <span className="material-symbols-outlined text-on-secondary-container shrink-0 mt-0.5">info</span>
          <p className="text-on-secondary-container">
            By creating an account or using Neutron Tech (&quot;the Service&quot;), you agree to these terms. Please read them — they&apos;re shorter than you think.
          </p>
        </div>

        <Section title="1. Accepting These Terms">
          <p>These Terms of Service (&quot;Terms&quot;) form a legally binding agreement between you and Neutron Tech Inc. (&quot;Neutron Tech&quot;, &quot;we&quot;, &quot;our&quot;). You must be at least 13 years old to use the Service. If you are between 13 and 18, you confirm that a parent or guardian has reviewed and agreed to these Terms on your behalf.</p>
          <p>If you use the Service on behalf of an organisation, you represent that you have authority to bind that organisation to these Terms.</p>
        </Section>

        <Section title="2. Your Account">
          <p>You are responsible for maintaining the security of your account credentials. Do not share your password. You are responsible for all activity that occurs under your account.</p>
          <p>You must provide accurate information when registering. Impersonating another person or creating fake accounts is prohibited and may result in immediate termination.</p>
          <p>You may delete your account at any time from the Settings page. See our <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link> for details on what happens to your data after deletion.</p>
        </Section>

        <Section title="3. Acceptable Use">
          <p>You agree <strong className="text-on-surface">not</strong> to use the Service to:</p>
          <ul className="list-disc list-inside space-y-2 mt-2">
            <li>Post content that is unlawful, defamatory, harassing, abusive, or discriminatory.</li>
            <li>Spam, phish, or distribute malware.</li>
            <li>Scrape or extract data using automated means without written permission.</li>
            <li>Attempt to gain unauthorised access to any system or account.</li>
            <li>Sell, transfer, or sublicense access to your account.</li>
            <li>Circumvent any technical measure we use to enforce these Terms.</li>
          </ul>
          <p className="mt-3">Violations may result in content removal, account suspension, or a permanent ban at our discretion.</p>
        </Section>

        <Section title="4. Content & Intellectual Property">
          <p><strong className="text-on-surface">Your content:</strong> You retain ownership of everything you post. By posting, you grant Neutron Tech a worldwide, non-exclusive, royalty-free licence to store, display, and distribute your content solely for operating the Service. We do not claim ownership of your work.</p>
          <p><strong className="text-on-surface">Our content:</strong> The Neutron Tech name, logo, design system, and platform code are owned by Neutron Tech Inc. and protected by intellectual property law. You may not reproduce or use them without permission.</p>
          <p><strong className="text-on-surface">DMCA:</strong> If you believe your copyrighted work has been infringed, contact us at <strong className="text-on-surface">dmca@neutrontech.io</strong> with details of the content and your ownership claim.</p>
        </Section>

        <Section title="5. Privacy">
          <p>Our <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link> explains how we collect and handle your data. By using the Service, you agree to our data practices described there.</p>
        </Section>

        <Section title="6. Third-Party Services">
          <p>The Service relies on third-party infrastructure (including Supabase for database and storage). These providers have their own terms and privacy policies. We are not responsible for their services or any changes they make.</p>
          <p>Links to external websites are provided for convenience. We do not endorse and are not responsible for content on external sites.</p>
        </Section>

        <Section title="7. Service Availability">
          <p>We aim for high availability but do not guarantee uninterrupted access. The Service may be temporarily unavailable for maintenance, updates, or reasons beyond our control. We will endeavour to give advance notice for planned downtime.</p>
          <p>We reserve the right to modify, suspend, or discontinue any feature of the Service at any time with reasonable notice.</p>
        </Section>

        <Section title="8. Disclaimers & Limitation of Liability">
          <p>The Service is provided &quot;as is&quot; without warranties of any kind, express or implied. To the maximum extent permitted by law, Neutron Tech is not liable for indirect, incidental, or consequential damages arising from your use of the Service.</p>
          <p>Our total liability to you for any claim arising from these Terms or use of the Service is limited to the amount you paid us in the 12 months preceding the claim, or USD $100, whichever is greater.</p>
        </Section>

        <Section title="9. Indemnification">
          <p>You agree to indemnify and hold harmless Neutron Tech Inc. and its employees from any claims, damages, or expenses arising from your violation of these Terms or your use of the Service.</p>
        </Section>

        <Section title="10. Governing Law & Disputes">
          <p>These Terms are governed by the laws of the State of California, USA, without regard to conflict-of-law principles. Any dispute not resolved informally will be subject to binding arbitration under the AAA Consumer Arbitration Rules, except either party may seek injunctive relief in court.</p>
          <p>You waive the right to participate in a class action lawsuit or class-wide arbitration.</p>
        </Section>

        <Section title="11. Changes to These Terms">
          <p>We may update these Terms. Material changes will be communicated via an in-app notification at least 14 days before they take effect. Continued use after the effective date constitutes acceptance of the updated Terms.</p>
          <p>If you disagree with updated Terms, you may close your account before the effective date.</p>
        </Section>

        <Section title="12. Contact">
          <p>Questions about these Terms? Contact our legal team at:</p>
          <div className="mt-3 space-y-2">
            <p><strong className="text-on-surface">Email:</strong> legal@neutrontech.io</p>
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
            <Link href="/privacy" className="font-label-sm text-label-sm text-secondary hover:text-primary transition-colors">Privacy</Link>
            <Link href="/terms" className="font-label-sm text-label-sm text-primary font-bold">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
