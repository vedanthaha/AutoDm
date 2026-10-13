import Link from 'next/link';
import { ArrowLeft, Trash2, ShieldAlert, Mail, ExternalLink } from 'lucide-react';

export const metadata = {
  title: 'Data Deletion — AutoDm',
  description:
    'Request deletion of your AutoDm account and all associated Instagram data. Clear instructions for removing your data from our platform.',
};

export default function DataDeletionPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
      <header className="border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to AutoDm</span>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <article className="space-y-10">
          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight text-white">Data Deletion</h1>
            <p className="text-sm text-zinc-400 leading-relaxed">
              You have the right to request deletion of your account and all data we store about you. This page
              describes exactly what data we hold and how to request its removal.
            </p>
          </div>

          {/* What we store */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-zinc-200">What data we store</h2>
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/80">
                <h3 className="text-sm font-semibold text-zinc-200 mb-1">Account credentials</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Your email address and hashed password (managed by Supabase Auth).
                </p>
              </div>
              <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/80">
                <h3 className="text-sm font-semibold text-zinc-200 mb-1">Connected Instagram account data</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Instagram User ID, username, display name, profile picture URL, account type, and an encrypted
                  access token (AES-256-GCM).
                </p>
              </div>
              <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/80">
                <h3 className="text-sm font-semibold text-zinc-200 mb-1">Automation rules</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Trigger keywords, match type, reply templates, associated post IDs, and active/inactive status.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/80">
                <h3 className="text-sm font-semibold text-zinc-200 mb-1">Comment dispatch records</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Comment ID, comment text, commenter username, matched keyword, reply text, delivery status, and
                  timestamps. Used for your activity log and deduplication.
                </p>
              </div>
            </div>
          </section>

          {/* Self-service deletion */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-zinc-200">Option 1: Self-service deletion</h2>
            <div className="p-5 rounded-xl bg-zinc-900/50 border border-zinc-800/80 space-y-4">
              <div className="flex items-start gap-3">
                <Trash2 className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
                <div className="space-y-2">
                  <p className="text-sm text-zinc-300 font-medium">From within your AutoDm dashboard:</p>
                  <ol className="list-decimal list-inside text-sm text-zinc-400 space-y-1.5 ml-1">
                    <li>Go to <strong className="text-zinc-300">Accounts</strong> and disconnect all Instagram accounts.</li>
                    <li>Go to <strong className="text-zinc-300">Automations</strong> and delete all automation rules.</li>
                    <li>Go to <strong className="text-zinc-300">Settings</strong> and click <strong className="text-zinc-300">&quot;Delete Account&quot;</strong>.</li>
                  </ol>
                  <p className="text-xs text-zinc-500">
                    This immediately deletes your encrypted tokens, automation rules, and account credentials. Dispatch
                    records are purged within 90 days.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Revoke directly on Instagram */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-zinc-200">Option 2: Revoke access from Instagram</h2>
            <div className="p-5 rounded-xl bg-zinc-900/50 border border-zinc-800/80 space-y-4">
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
                <div className="space-y-2">
                  <p className="text-sm text-zinc-300 font-medium">Remove AutoDm&apos;s access from your Instagram settings:</p>
                  <ol className="list-decimal list-inside text-sm text-zinc-400 space-y-1.5 ml-1">
                    <li>Open Instagram → Settings → Website Permissions → Apps and Websites.</li>
                    <li>Find <strong className="text-zinc-300">AutoDm</strong> in the active list.</li>
                    <li>Click <strong className="text-zinc-300">Remove</strong> to revoke API access.</li>
                  </ol>
                  <p className="text-xs text-zinc-500">
                    Instagram will send a deauthorization callback to our server. We will automatically invalidate the
                    stored encrypted token and mark the account as disconnected.
                  </p>
                  <a
                    href="https://www.instagram.com/accounts/manage_access/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 font-medium"
                  >
                    Open Instagram App Settings <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Manual request */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-zinc-200">Option 3: Email us</h2>
            <div className="p-5 rounded-xl bg-zinc-900/50 border border-zinc-800/80 space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-sky-400 mt-0.5 shrink-0" />
                <div className="space-y-2">
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    If you cannot access your account or prefer to request deletion manually, send an email from the
                    address associated with your AutoDm account requesting full data deletion. Include your Instagram
                    username for verification.
                  </p>
                  <p className="text-xs text-zinc-500">
                    We will process your request within 30 days and send confirmation once all data has been deleted.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Deletion timeline */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-zinc-200">Deletion timeline</h2>
            <div className="overflow-hidden rounded-xl border border-zinc-800/80">
              <table className="w-full text-sm">
                <thead className="bg-zinc-900/80 border-b border-zinc-800">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-300 uppercase tracking-wider">Data type</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-300 uppercase tracking-wider">Deletion timeline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  <tr>
                    <td className="px-4 py-3 text-zinc-300">Encrypted access tokens</td>
                    <td className="px-4 py-3 text-zinc-400">Immediately upon request</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-zinc-300">Account credentials</td>
                    <td className="px-4 py-3 text-zinc-400">Immediately upon request</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-zinc-300">Automation rules</td>
                    <td className="px-4 py-3 text-zinc-400">Immediately upon request</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-zinc-300">Connected account metadata</td>
                    <td className="px-4 py-3 text-zinc-400">Immediately upon request</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-zinc-300">Comment dispatch records</td>
                    <td className="px-4 py-3 text-zinc-400">Within 90 days</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Meta Data Deletion Callback */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-zinc-200">Meta Data Deletion Callback</h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              AutoDm implements Meta&apos;s required data deletion callback endpoint. When you remove our app from your
              Instagram settings, Meta sends a signed request to our server, and we automatically:
            </p>
            <ul className="list-disc list-inside text-sm text-zinc-400 space-y-1 ml-2">
              <li>Delete the encrypted access token for your Instagram account.</li>
              <li>Deactivate and remove the connected account record.</li>
              <li>Deactivate all automation rules associated with that account.</li>
              <li>Return a confirmation ID that you can use to check deletion status.</li>
            </ul>
          </section>
        </article>
      </main>

      <footer className="border-t border-zinc-800/60 py-8 px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between text-xs text-zinc-600">
          <p>&copy; {new Date().getFullYear()} AutoDm</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-zinc-400 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-zinc-400 transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
