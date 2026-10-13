'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  Copy,
  Check,
  Database,
  Lock,
  Layers,
  Radio,
  Users
} from 'lucide-react';

export default function SettingsPage() {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  function copyToClipboard(text: string, field: string) {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }

  const webhookPath = '/api/webhooks/instagram';
  const verifyToken = 'autodm_dev_verify_token_2026';
  const deauthPath = '/api/webhooks/instagram/deauthorize';
  const dataDeletionPath = '/api/webhooks/instagram/data-deletion';

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="pb-6 border-b border-zinc-800">
        <h1 className="text-xl font-bold tracking-tight text-white">System Settings & Meta Readiness</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Multi-tenant platform architecture, Webhook specifications, and Meta App Review compliance.
        </p>
      </div>

      {/* Production Webhook Configuration */}
      <div className="p-6 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <span>Application-Level Webhook Configuration</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                Active Route
              </span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Enter these values into your Meta App Dashboard under <strong>Webhooks ➔ Instagram</strong>.
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-2 text-xs">
          <div>
            <label className="block text-zinc-400 font-mono text-[11px] mb-1">Callback URL (Vercel Production)</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={`https://<your-vercel-domain>.vercel.app${webhookPath}`}
                className="flex-1 px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 font-mono text-zinc-300 text-xs select-all"
              />
              <button
                onClick={() => copyToClipboard(`https://<your-vercel-domain>.vercel.app${webhookPath}`, 'cb')}
                className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center gap-1.5 transition-colors font-medium"
              >
                {copiedField === 'cb' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedField === 'cb' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 font-mono text-[11px] mb-1">Verify Token (hub.verify_token)</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={verifyToken}
                className="flex-1 px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 font-mono text-zinc-300 text-xs select-all"
              />
              <button
                onClick={() => copyToClipboard(verifyToken, 'vt')}
                className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center gap-1.5 transition-colors font-medium"
              >
                {copiedField === 'vt' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedField === 'vt' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div>
              <label className="block text-zinc-400 font-mono text-[11px] mb-1">Subscribed Webhook Fields</label>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 font-mono text-emerald-400 text-xs">
                  comments
                </span>
                <span className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 font-mono text-emerald-400 text-xs">
                  messages
                </span>
              </div>
            </div>
            <div>
              <label className="block text-zinc-400 font-mono text-[11px] mb-1">Per-Account Auto-Subscription</label>
              <span className="text-[11px] font-mono text-zinc-300 flex items-center gap-1">
                <Radio className="w-3.5 h-3.5 text-emerald-400" />
                POST /{'{user_id}'}/subscribed_apps
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Meta App Compliance & Legal Callbacks */}
      <div className="p-6 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-4">
        <div>
          <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <span>Meta App Review & Compliance Endpoints</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-950/60 text-blue-400 border border-blue-800/40">
              Required for Meta Live Mode
            </span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Configure these in Meta Dashboard under <strong>App Settings ➔ Basic</strong> and <strong>Instagram Basic Display / Login</strong>.
          </p>
        </div>

        <div className="space-y-3 pt-2 text-xs">
          <div>
            <label className="block text-zinc-400 font-mono text-[11px] mb-1">Data Deletion Request Callback URL</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={`https://<your-vercel-domain>.vercel.app${dataDeletionPath}`}
                className="flex-1 px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 font-mono text-zinc-300 text-xs select-all"
              />
              <button
                onClick={() => copyToClipboard(`https://<your-vercel-domain>.vercel.app${dataDeletionPath}`, 'dd')}
                className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center gap-1.5 transition-colors font-medium"
              >
                {copiedField === 'dd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedField === 'dd' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 font-mono text-[11px] mb-1">Deauthorization Callback URL</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={`https://<your-vercel-domain>.vercel.app${deauthPath}`}
                className="flex-1 px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 font-mono text-zinc-300 text-xs select-all"
              />
              <button
                onClick={() => copyToClipboard(`https://<your-vercel-domain>.vercel.app${deauthPath}`, 'da')}
                className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center gap-1.5 transition-colors font-medium"
              >
                {copiedField === 'da' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedField === 'da' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800/80">
              <p className="font-semibold text-zinc-300 text-[11px] mb-1">Privacy Policy URL</p>
              <p className="font-mono text-[10px] text-zinc-500 break-all">https://&lt;your-domain&gt;/privacy</p>
            </div>
            <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800/80">
              <p className="font-semibold text-zinc-300 text-[11px] mb-1">Terms of Service URL</p>
              <p className="font-mono text-[10px] text-zinc-500 break-all">https://&lt;your-domain&gt;/terms</p>
            </div>
            <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800/80">
              <p className="font-semibold text-zinc-300 text-[11px] mb-1">User Data Deletion Page</p>
              <p className="font-mono text-[10px] text-zinc-500 break-all">https://&lt;your-domain&gt;/data-deletion</p>
            </div>
          </div>
        </div>
      </div>

      {/* Integration Readiness Checklist */}
      <div className="p-6 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-4">
        <h2 className="text-sm font-bold text-white tracking-tight">Integration Readiness Checklist</h2>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-950 border border-zinc-800/80">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <div>
                <p className="font-semibold text-zinc-200">Meta Graph API Version</p>
                <p className="text-[11px] text-zinc-500 font-mono">v26.0 (Latest active version verified against Meta changelog)</p>
              </div>
            </div>
            <span className="font-mono text-emerald-400 text-[11px]">Ready</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-950 border border-zinc-800/80">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <div>
                <p className="font-semibold text-zinc-200">Instagram Login for Business Flow</p>
                <p className="text-[11px] text-zinc-500 font-mono">instagram.com/oauth/authorize ➔ api.instagram.com ➔ graph.instagram.com</p>
              </div>
            </div>
            <span className="font-mono text-emerald-400 text-[11px]">Standardized</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-950 border border-zinc-800/80">
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4 text-emerald-400" />
              <div>
                <p className="font-semibold text-zinc-200">Multi-Tenant Isolation Architecture</p>
                <p className="text-[11px] text-zinc-500 font-mono">Supabase Row Level Security (RLS) enforces auth.uid() = user_id</p>
              </div>
            </div>
            <span className="font-mono text-emerald-400 text-[11px]">Enforced</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-950 border border-zinc-800/80">
            <div className="flex items-center gap-3">
              <Lock className="w-4 h-4 text-emerald-400" />
              <div>
                <p className="font-semibold text-zinc-200">OAuth Token Encryption at Rest</p>
                <p className="text-[11px] text-zinc-500 font-mono">AES-256-GCM authenticated encryption on Long-Lived User Tokens (60-day)</p>
              </div>
            </div>
            <span className="font-mono text-emerald-400 text-[11px]">Active</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-950 border border-zinc-800/80">
            <div className="flex items-center gap-3">
              <Database className="w-4 h-4 text-emerald-400" />
              <div>
                <p className="font-semibold text-zinc-200">PostgreSQL Durable Idempotency Ledger</p>
                <p className="text-[11px] text-zinc-500 font-mono">comment_id PRIMARY KEY constraint strictly prevents duplicate replies</p>
              </div>
            </div>
            <span className="font-mono text-emerald-400 text-[11px]">Configured</span>
          </div>
        </div>
      </div>

      {/* Meta Developer Dashboard Next Steps */}
      <div className="p-6 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-4">
        <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
          <Layers className="w-4 h-4 text-zinc-400" />
          <span>Meta Developer Dashboard Next Steps</span>
        </h2>

        <div className="space-y-4 text-xs text-zinc-300">
          <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800/80 space-y-2">
            <h3 className="font-semibold text-white flex items-center justify-between">
              <span>1. Development Mode vs Live Mode Testing</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-amber-300 border border-amber-800/40">Important</span>
            </h3>
            <p className="text-zinc-400 leading-relaxed text-[11px]">
              While your Meta App is in <strong>Development Mode</strong>, private replies can only be sent to users who have an assigned <strong>App Role</strong> (Admins, Developers, or Instagram Testers). Attempting to DM ordinary public commenters will return <code>(#230) Permissions disallow message to this user</code>.
            </p>
            <div className="pt-2 text-[11px] text-zinc-400 space-y-1">
              <p><strong>To test comment replies before App Review:</strong></p>
              <ol className="list-decimal list-inside space-y-1 pl-1 text-zinc-300">
                <li>Go to <strong>App Roles ➔ Roles ➔ Instagram Testers</strong> in Meta Dashboard.</li>
                <li>Add your commenter account username.</li>
                <li>In that account&apos;s Instagram app: Settings ➔ Creator ➔ Apps & Websites ➔ Tester Invites ➔ Accept.</li>
              </ol>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800/80 space-y-2">
            <h3 className="font-semibold text-white">2. Meta App Review for Public SaaS Customers</h3>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              To allow unrelated public customers to sign up and automate their accounts, submit for Meta App Review with:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-1 text-zinc-300 text-[11px]">
              <li><code>instagram_business_manage_messages</code> (Advanced Access)</li>
              <li><code>instagram_business_manage_comments</code> (Advanced Access)</li>
              <li>Business Verification for your business portfolio</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
