import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy — AutoDm',
  description:
    'AutoDm Privacy Policy. Learn how we collect, use, store, and protect your data when using our Instagram automation service.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
      {/* Minimal header */}
      <header className="border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to AutoDm</span>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <article className="prose-sm space-y-8">
          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight text-white">Privacy Policy</h1>
            <p className="text-sm text-zinc-500">Last updated: October 2026</p>
          </div>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-zinc-200">1. Introduction</h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              AutoDm (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) provides an Instagram comment-to-DM automation
              service for Instagram Professional accounts (Business and Creator). This Privacy Policy explains what data
              we collect, how we use it, and how we protect it.
            </p>
            <p className="text-sm text-zinc-400 leading-relaxed">
              By creating an account or connecting your Instagram Professional account, you agree to the practices
              described in this policy.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-zinc-200">2. Data We Collect</h2>

            <h3 className="text-sm font-semibold text-zinc-300 mt-4">2.1 Account Registration Data</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              When you sign up, we collect the email address and password you provide. Passwords are hashed by our
              authentication provider (Supabase Auth) and never stored in plaintext.
            </p>

            <h3 className="text-sm font-semibold text-zinc-300 mt-4">2.2 Instagram Account Data</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              When you connect an Instagram Professional account via Instagram Login for Business, we receive and store:
            </p>
            <ul className="list-disc list-inside text-sm text-zinc-400 space-y-1 ml-2">
              <li>Instagram User ID</li>
              <li>Username and display name</li>
              <li>Profile picture URL</li>
              <li>Account type (Business or Creator)</li>
              <li>An access token issued by Instagram</li>
            </ul>
            <p className="text-sm text-zinc-400 leading-relaxed">
              We request only the following Instagram permissions:{' '}
              <code className="text-xs bg-zinc-900 px-1.5 py-0.5 rounded text-zinc-300">instagram_business_basic</code>,{' '}
              <code className="text-xs bg-zinc-900 px-1.5 py-0.5 rounded text-zinc-300">instagram_business_manage_comments</code>, and{' '}
              <code className="text-xs bg-zinc-900 px-1.5 py-0.5 rounded text-zinc-300">instagram_business_manage_messages</code>.
            </p>

            <h3 className="text-sm font-semibold text-zinc-300 mt-4">2.3 Instagram Content Metadata</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              To let you select posts and Reels for automation triggers, we retrieve media metadata (post ID, caption,
              media type, permalink, and timestamp) using your access token. We do not download or store media files
              (images or videos).
            </p>

            <h3 className="text-sm font-semibold text-zinc-300 mt-4">2.4 Webhook Event Data</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Instagram sends us real-time webhook notifications when comments are posted on your content. Each
              notification includes the comment ID, comment text, commenter username and ID, and the media ID. We store
              this data in dispatch records to process automations and provide you with activity logs.
            </p>

            <h3 className="text-sm font-semibold text-zinc-300 mt-4">2.5 Automation Configuration</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              We store the automation rules you create, including trigger keywords, match type, DM reply templates,
              associated post IDs, and active/inactive status.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-zinc-200">3. How We Use Your Data</h2>
            <ul className="list-disc list-inside text-sm text-zinc-400 space-y-2 ml-2">
              <li>
                <strong className="text-zinc-300">Automation processing:</strong> We use your access token, automation
                rules, and incoming webhook data to match comments against your triggers and send DM replies via the
                Instagram API.
              </li>
              <li>
                <strong className="text-zinc-300">Activity dashboard:</strong> Comment and dispatch data is displayed in
                your activity log so you can see what automations have run and their delivery status.
              </li>
              <li>
                <strong className="text-zinc-300">Token maintenance:</strong> We periodically refresh long-lived access
                tokens before they expire to maintain uninterrupted service.
              </li>
            </ul>
            <p className="text-sm text-zinc-400 leading-relaxed">
              We do not sell, rent, or share your data with third parties for marketing or advertising purposes.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-zinc-200">4. Token Security</h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Instagram access tokens are encrypted at rest using AES-256-GCM authenticated encryption before being
              stored in the database. The encryption key is stored as a server-side environment variable and is never
              exposed to the client or included in application code.
            </p>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Webhook payloads are validated using timing-safe HMAC-SHA256 signature verification against the Meta App
              Secret before processing.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-zinc-200">5. Data Storage &amp; Retention</h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Your data is stored in a PostgreSQL database hosted by Supabase. Row-level security (RLS) policies ensure
              that each user can only access their own accounts, automation rules, and dispatch records.
            </p>
            <p className="text-sm text-zinc-400 leading-relaxed">
              We retain your data for as long as your account is active. If you delete your account or disconnect an
              Instagram account, we delete the associated access tokens and automation rules. Comment dispatch records
              are retained for 90 days after account deletion for audit purposes, then permanently deleted.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-zinc-200">6. Third-Party Services</h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              AutoDm integrates with the following third-party services to provide its functionality:
            </p>
            <ul className="list-disc list-inside text-sm text-zinc-400 space-y-2 ml-2">
              <li>
                <strong className="text-zinc-300">Meta / Instagram Graph API:</strong> To authenticate Instagram
                accounts, read media metadata, receive comment webhooks, and send DM replies. Subject to{' '}
                <a href="https://www.facebook.com/privacy/policy" className="text-violet-400 hover:text-violet-300 underline" target="_blank" rel="noopener noreferrer">
                  Meta&apos;s Privacy Policy
                </a>.
              </li>
              <li>
                <strong className="text-zinc-300">Supabase:</strong> For authentication, database hosting, and row-level
                security. Subject to{' '}
                <a href="https://supabase.com/privacy" className="text-violet-400 hover:text-violet-300 underline" target="_blank" rel="noopener noreferrer">
                  Supabase&apos;s Privacy Policy
                </a>.
              </li>
              <li>
                <strong className="text-zinc-300">Vercel:</strong> For application hosting and serverless function
                execution. Subject to{' '}
                <a href="https://vercel.com/legal/privacy-policy" className="text-violet-400 hover:text-violet-300 underline" target="_blank" rel="noopener noreferrer">
                  Vercel&apos;s Privacy Policy
                </a>.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-zinc-200">7. Your Rights</h2>
            <p className="text-sm text-zinc-400 leading-relaxed">You have the right to:</p>
            <ul className="list-disc list-inside text-sm text-zinc-400 space-y-1 ml-2">
              <li>Disconnect your Instagram account at any time from the Accounts page.</li>
              <li>Delete your AutoDm account and all associated data.</li>
              <li>Request a copy of the data we store about you.</li>
              <li>
                Revoke AutoDm&apos;s access to your Instagram account directly from{' '}
                <a href="https://www.instagram.com/accounts/manage_access/" className="text-violet-400 hover:text-violet-300 underline" target="_blank" rel="noopener noreferrer">
                  Instagram&apos;s App Settings
                </a>.
              </li>
            </ul>
            <p className="text-sm text-zinc-400 leading-relaxed">
              For data deletion requests, see our{' '}
              <Link href="/data-deletion" className="text-violet-400 hover:text-violet-300 underline">
                Data Deletion page
              </Link>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-zinc-200">8. Cookies</h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              We use a single essential httpOnly cookie (<code className="text-xs bg-zinc-900 px-1.5 py-0.5 rounded text-zinc-300">ig_oauth_state</code>)
              during the Instagram authorization flow to prevent CSRF attacks. This cookie expires after 10 minutes and
              is deleted after the OAuth callback completes. We do not use tracking cookies, analytics cookies, or
              third-party advertising cookies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-zinc-200">9. Changes to This Policy</h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              We may update this Privacy Policy from time to time. If we make significant changes, we will notify you by
              updating the &quot;Last updated&quot; date at the top of this page. Continued use of AutoDm after changes
              constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-zinc-200">10. Contact</h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              For questions about this privacy policy or to exercise your data rights, contact us at the email address
              associated with your AutoDm account or reach out through the settings page in your dashboard.
            </p>
          </section>
        </article>
      </main>

      <footer className="border-t border-zinc-800/60 py-8 px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between text-xs text-zinc-600">
          <p>&copy; {new Date().getFullYear()} AutoDm</p>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-zinc-400 transition-colors">Terms</Link>
            <Link href="/data-deletion" className="hover:text-zinc-400 transition-colors">Data Deletion</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
