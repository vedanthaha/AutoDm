import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service — AutoDm',
  description:
    'AutoDm Terms of Service. Read the terms governing the use of our Instagram comment-to-DM automation platform.',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#F7F7F5] text-[#191919] antialiased">
      <header className="border-b border-[#E7E5E4] bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xs font-medium text-[#737373] hover:text-[#191919] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to AutoDm</span>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-14">
        <article className="space-y-8">
          <div className="space-y-2 pb-6 border-b border-[#E7E5E4]">
            <h1 className="text-2xl font-bold tracking-tight text-[#191919]">Terms of Service</h1>
            <p className="text-xs text-[#737373]">Last updated: October 2026</p>
          </div>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-[#191919]">1. Acceptance of Terms</h2>
            <p className="text-xs text-[#525252] leading-relaxed">
              By accessing or using AutoDm (&quot;the Service&quot;), you agree to be bound by these Terms of Service.
              If you do not agree to these terms, do not use the Service. These terms apply to all users, including
              those who create accounts and connect Instagram Professional accounts.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-[#191919]">2. Description of Service</h2>
            <p className="text-xs text-[#525252] leading-relaxed">
              AutoDm is a web-based platform that allows users to create automated comment-to-DM workflows for
              Instagram Professional accounts (Business and Creator). The Service operates through the official Instagram
              Graph API provided by Meta Platforms, Inc.
            </p>
            <p className="text-xs text-[#525252] leading-relaxed">
              AutoDm is not affiliated with, endorsed by, or sponsored by Meta Platforms, Inc. or Instagram.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-[#191919]">3. Account Requirements</h2>
            <ul className="list-disc list-inside text-xs text-[#525252] space-y-2 ml-2">
              <li>You must be at least 18 years old to use the Service.</li>
              <li>You must provide a valid email address and maintain the security of your account credentials.</li>
              <li>
                You must have a valid Instagram Professional account (Business or Creator) to use automation features.
              </li>
              <li>
                You are responsible for all activity that occurs under your account.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-[#191919]">4. Instagram API Compliance</h2>
            <p className="text-xs text-[#525252] leading-relaxed">
              AutoDm operates under Meta&apos;s Platform Terms and Instagram API policies. By using the Service, you
              agree to comply with:
            </p>
            <ul className="list-disc list-inside text-xs text-[#525252] space-y-1 ml-2">
              <li>
                <a href="https://developers.facebook.com/terms" className="text-[#A33B56] hover:underline" target="_blank" rel="noopener noreferrer">
                  Meta Platform Terms
                </a>
              </li>
              <li>
                <a href="https://developers.facebook.com/devpolicy/" className="text-[#A33B56] hover:underline" target="_blank" rel="noopener noreferrer">
                  Meta Developer Policies
                </a>
              </li>
              <li>
                <a href="https://help.instagram.com/581066165581870" className="text-[#A33B56] hover:underline" target="_blank" rel="noopener noreferrer">
                  Instagram Community Guidelines
                </a>
              </li>
            </ul>
            <p className="text-xs text-[#525252] leading-relaxed">
              You must not use AutoDm to send spam, harass users, distribute misleading content, or violate any
              Instagram or Meta policy. We reserve the right to suspend or terminate accounts that violate these
              policies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-[#191919]">5. Acceptable Use</h2>
            <p className="text-xs text-[#525252] leading-relaxed">You agree not to use the Service to:</p>
            <ul className="list-disc list-inside text-xs text-[#525252] space-y-1 ml-2">
              <li>Send unsolicited bulk messages or spam DMs.</li>
              <li>Impersonate other users or brands.</li>
              <li>Distribute content that is illegal, harmful, abusive, or deceptive.</li>
              <li>Attempt to circumvent API rate limits or abuse the Instagram API.</li>
              <li>Reverse-engineer, scrape, or exploit the Service beyond its intended use.</li>
              <li>Share your account credentials with unauthorized third parties.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-[#191919]">6. Service Availability</h2>
            <p className="text-xs text-[#525252] leading-relaxed">
              AutoDm depends on the Instagram Graph API and third-party infrastructure (Supabase, Vercel). We do not
              guarantee uninterrupted service. The Service may be temporarily unavailable due to:
            </p>
            <ul className="list-disc list-inside text-xs text-[#525252] space-y-1 ml-2">
              <li>Instagram API changes, rate limits, or outages.</li>
              <li>Scheduled or emergency maintenance.</li>
              <li>Infrastructure provider outages.</li>
            </ul>
            <p className="text-xs text-[#525252] leading-relaxed">
              We will make reasonable efforts to notify users of planned maintenance but are not liable for service
              interruptions beyond our control.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-[#191919]">7. Data &amp; Privacy</h2>
            <p className="text-xs text-[#525252] leading-relaxed">
              Your use of the Service is also governed by our{' '}
              <Link href="/privacy" className="text-[#A33B56] hover:underline">
                Privacy Policy
              </Link>
              , which describes how we collect, use, store, and protect your data including Instagram access tokens and
              webhook event data.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-[#191919]">8. Intellectual Property</h2>
            <p className="text-xs text-[#525252] leading-relaxed">
              The AutoDm application, including its design, code, and documentation, is our intellectual property. You
              are granted a limited, non-exclusive, non-transferable license to use the Service for its intended purpose.
              You retain full ownership of your Instagram content and automation configurations.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-[#191919]">9. Limitation of Liability</h2>
            <p className="text-xs text-[#525252] leading-relaxed">
              AutoDm is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, whether
              express or implied. To the maximum extent permitted by law, we are not liable for:
            </p>
            <ul className="list-disc list-inside text-xs text-[#525252] space-y-1 ml-2">
              <li>Lost revenue or business opportunities resulting from DM delivery failures.</li>
              <li>Instagram account restrictions or bans resulting from your use of the Service.</li>
              <li>Data loss caused by third-party service outages.</li>
              <li>Indirect, incidental, or consequential damages of any kind.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-[#191919]">10. Account Termination</h2>
            <p className="text-xs text-[#525252] leading-relaxed">
              You may delete your account at any time. We reserve the right to suspend or terminate accounts that
              violate these terms, abuse the platform, or engage in activity that could jeopardize our Meta app approval
              or API access.
            </p>
            <p className="text-xs text-[#525252] leading-relaxed">
              Upon termination, your encrypted access tokens and automation rules will be deleted. Dispatch records may
              be retained for up to 90 days for audit purposes.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-[#191919]">11. Changes to Terms</h2>
            <p className="text-xs text-[#525252] leading-relaxed">
              We may update these Terms of Service from time to time. Material changes will be communicated by updating
              the &quot;Last updated&quot; date at the top of this page. Continued use of the Service after changes are
              posted constitutes acceptance of the revised terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-[#191919]">12. Contact</h2>
            <p className="text-xs text-[#525252] leading-relaxed">
              For questions about these terms, contact us through the settings page in your AutoDm dashboard or via the
              email associated with your account.
            </p>
          </section>
        </article>
      </main>

      <footer className="border-t border-[#E7E5E4] py-8 px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between text-xs text-[#737373]">
          <p>&copy; {new Date().getFullYear()} AutoDm</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-[#191919] transition-colors">Privacy</Link>
            <Link href="/data-deletion" className="hover:text-[#191919] transition-colors">Data Deletion</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
