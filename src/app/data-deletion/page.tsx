import Link from 'next/link';
import { ArrowLeft, Trash2, ShieldAlert, Mail, ExternalLink } from 'lucide-react';

export const metadata = {
  title: 'Data Deletion — AutoDm',
  description:
    'Request deletion of your AutoDm account and all associated Instagram data. Clear instructions for removing your data from our platform.',
};

export default function DataDeletionPage() {
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
        <article className="space-y-10">
          <div className="space-y-2 pb-6 border-b border-[#E7E5E4]">
            <h1 className="text-2xl font-bold tracking-tight text-[#191919]">Data Deletion</h1>
            <p className="text-xs text-[#737373] leading-relaxed">
              You have the right to request deletion of your account and all data we store about you. This page
              describes exactly what data we hold and how to request its removal.
            </p>
          </div>

          {/* What we store */}
          <section className="space-y-4">
            <h2 className="text-base font-semibold text-[#191919]">What data we store</h2>
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-white border border-[#E7E5E4] shadow-2xs">
                <h3 className="text-xs font-semibold text-[#191919] mb-1">Account credentials</h3>
                <p className="text-xs text-[#737373] leading-relaxed">
                  Your email address and hashed password (managed securely by Supabase Auth).
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white border border-[#E7E5E4] shadow-2xs">
                <h3 className="text-xs font-semibold text-[#191919] mb-1">Connected Instagram account data</h3>
                <p className="text-xs text-[#737373] leading-relaxed">
                  Instagram User ID, username, display name, profile picture URL, account type, and an encrypted
                  access token (AES-256-GCM authenticated encryption).
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white border border-[#E7E5E4] shadow-2xs">
                <h3 className="text-xs font-semibold text-[#191919] mb-1">Automation rules</h3>
                <p className="text-xs text-[#737373] leading-relaxed">
                  Trigger keywords, match type, reply templates, associated post IDs, and active/inactive status.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white border border-[#E7E5E4] shadow-2xs">
                <h3 className="text-xs font-semibold text-[#191919] mb-1">Comment dispatch records</h3>
                <p className="text-xs text-[#737373] leading-relaxed">
                  Comment ID, comment text, commenter username, matched keyword, reply text, delivery status, and
                  timestamps. Used for your activity log and deduplication.
                </p>
              </div>
            </div>
          </section>

          {/* Self-service deletion */}
          <section className="space-y-4">
            <h2 className="text-base font-semibold text-[#191919]">Option 1: Self-service deletion</h2>
            <div className="p-5 rounded-xl bg-white border border-[#E7E5E4] shadow-2xs space-y-4">
              <div className="flex items-start gap-3">
                <Trash2 className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
                <div className="space-y-2">
                  <p className="text-xs text-[#191919] font-medium">From within your AutoDm dashboard:</p>
                  <ol className="list-decimal list-inside text-xs text-[#525252] space-y-1.5 ml-1">
                    <li>Go to <strong className="text-[#191919]">Accounts</strong> and disconnect all Instagram accounts.</li>
                    <li>Go to <strong className="text-[#191919]">Automations</strong> and delete all automation rules.</li>
                    <li>Go to <strong className="text-[#191919]">Settings</strong> and click <strong className="text-[#191919]">&quot;Delete Account&quot;</strong>.</li>
                  </ol>
                  <p className="text-[11px] text-[#737373]">
                    This immediately deletes your encrypted tokens, automation rules, and account credentials. Dispatch
                    records are purged within 90 days.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Revoke directly on Instagram */}
          <section className="space-y-4">
            <h2 className="text-base font-semibold text-[#191919]">Option 2: Revoke access from Instagram</h2>
            <div className="p-5 rounded-xl bg-white border border-[#E7E5E4] shadow-2xs space-y-4">
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                <div className="space-y-2">
                  <p className="text-xs text-[#191919] font-medium">Remove AutoDm&apos;s access from your Instagram settings:</p>
                  <ol className="list-decimal list-inside text-xs text-[#525252] space-y-1.5 ml-1">
                    <li>Open Instagram &rarr; Settings &rarr; Website Permissions &rarr; Apps and Websites.</li>
                    <li>Find <strong className="text-[#191919]">AutoDm</strong> in the active list.</li>
                    <li>Click <strong className="text-[#191919]">Remove</strong> to revoke API access.</li>
                  </ol>
                  <p className="text-[11px] text-[#737373]">
                    Instagram will send a deauthorization callback to our server. We will automatically invalidate the
                    stored encrypted token and mark the account as disconnected.
                  </p>
                  <a
                    href="https://www.instagram.com/accounts/manage_access/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-[#A33B56] hover:underline font-medium pt-1"
                  >
                    Open Instagram App Settings <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Manual request */}
          <section className="space-y-4">
            <h2 className="text-base font-semibold text-[#191919]">Option 3: Email request</h2>
            <div className="p-5 rounded-xl bg-white border border-[#E7E5E4] shadow-2xs space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#191919] mt-0.5 shrink-0" />
                <div className="space-y-2">
                  <p className="text-xs text-[#525252] leading-relaxed">
                    If you cannot access your account or prefer to request deletion manually, send an email from the
                    address associated with your AutoDm account requesting full data deletion. Include your Instagram
                    username for verification.
                  </p>
                  <p className="text-[11px] text-[#737373]">
                    We will process your request within 30 days and send confirmation once all data has been deleted.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Deletion timeline */}
          <section className="space-y-4">
            <h2 className="text-base font-semibold text-[#191919]">Deletion timeline</h2>
            <div className="overflow-hidden rounded-xl border border-[#E7E5E4] bg-white shadow-2xs">
              <table className="w-full text-xs">
                <thead className="bg-[#FAF9F7] border-b border-[#E7E5E4]">
                  <tr>
                    <th className="text-left px-4 py-2.5 font-medium text-[#737373] text-[11px]">Data type</th>
                    <th className="text-left px-4 py-2.5 font-medium text-[#737373] text-[11px]">Deletion timeline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EFEB]">
                  <tr>
                    <td className="px-4 py-3 font-medium text-[#191919]">Encrypted access tokens</td>
                    <td className="px-4 py-3 text-[#737373]">Immediately upon request</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-[#191919]">Account credentials</td>
                    <td className="px-4 py-3 text-[#737373]">Immediately upon request</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-[#191919]">Automation rules</td>
                    <td className="px-4 py-3 text-[#737373]">Immediately upon request</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-[#191919]">Connected account metadata</td>
                    <td className="px-4 py-3 text-[#737373]">Immediately upon request</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-[#191919]">Comment dispatch records</td>
                    <td className="px-4 py-3 text-[#737373]">Within 90 days</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Meta Data Deletion Callback */}
          <section className="space-y-3">
            <h2 className="text-base font-semibold text-[#191919]">Meta Data Deletion Callback</h2>
            <p className="text-xs text-[#525252] leading-relaxed">
              AutoDm implements Meta&apos;s required data deletion callback endpoint. When you remove our app from your
              Instagram settings, Meta sends a signed request to our server, and we automatically:
            </p>
            <ul className="list-disc list-inside text-xs text-[#525252] space-y-1 ml-2">
              <li>Delete the encrypted access token for your Instagram account.</li>
              <li>Deactivate and remove the connected account record.</li>
              <li>Deactivate all automation rules associated with that account.</li>
              <li>Return a confirmation ID that you can use to check deletion status.</li>
            </ul>
          </section>
        </article>
      </main>

      <footer className="border-t border-[#E7E5E4] py-8 px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between text-xs text-[#737373]">
          <p>&copy; {new Date().getFullYear()} AutoDm</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-[#191919] transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-[#191919] transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
