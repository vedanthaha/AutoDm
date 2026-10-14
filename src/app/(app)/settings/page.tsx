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
      <div className="pb-6 border-b border-border">
        <h1 className="text-xl font-semibold tracking-tight text-charcoal">System Settings &amp; Meta Readiness</h1>
        <p className="text-xs text-charcoal-muted mt-1">
          Multi-tenant platform architecture, webhook specifications, and Meta App Review compliance.
        </p>
      </div>

      {/* Production Webhook Configuration */}
      <div className="p-6 rounded-xl bg-surface border border-border shadow-subtle space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-charcoal tracking-tight flex items-center gap-2">
              <span>Application-Level Webhook Configuration</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                Active Route
              </span>
            </h2>
            <p className="text-xs text-charcoal-muted mt-0.5">
              Enter these values into your Meta App Dashboard under <strong>Webhooks &rarr; Instagram</strong>.
            </p>
          </div>
        </div>

        <div className="space-y-4 pt-2 text-xs">
          <div>
            <label className="block text-charcoal-muted font-medium text-xs mb-1.5">Callback URL (Vercel Production)</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={`https://<your-vercel-domain>.vercel.app${webhookPath}`}
                className="flex-1 px-3 py-2 rounded-lg bg-surface-subdued border border-border font-mono text-charcoal text-xs select-all shadow-subtle focus-ring"
              />
              <button
                onClick={() => copyToClipboard(`https://<your-vercel-domain>.vercel.app${webhookPath}`, 'cb')}
                className="px-3.5 py-2 rounded-lg bg-surface hover:bg-surface-hover border border-border text-charcoal flex items-center gap-1.5 transition-colors font-medium text-xs shadow-subtle"
              >
                {copiedField === 'cb' ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-charcoal-muted" />}
                <span>{copiedField === 'cb' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-charcoal-muted font-medium text-xs mb-1.5">Verify Token (hub.verify_token)</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={verifyToken}
                className="flex-1 px-3 py-2 rounded-lg bg-surface-subdued border border-border font-mono text-charcoal text-xs select-all shadow-subtle focus-ring"
              />
              <button
                onClick={() => copyToClipboard(verifyToken, 'vt')}
                className="px-3.5 py-2 rounded-lg bg-surface hover:bg-surface-hover border border-border text-charcoal flex items-center gap-1.5 transition-colors font-medium text-xs shadow-subtle"
              >
                {copiedField === 'vt' ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-charcoal-muted" />}
                <span>{copiedField === 'vt' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-1">
            <div>
              <label className="block text-charcoal-muted text-[11px] mb-1 font-medium">Subscribed Webhook Fields</label>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded bg-surface-subdued border border-border font-mono text-emerald-600 dark:text-emerald-400 text-xs">
                  comments
                </span>
                <span className="px-2 py-0.5 rounded bg-surface-subdued border border-border font-mono text-emerald-600 dark:text-emerald-400 text-xs">
                  messages
                </span>
              </div>
            </div>
            <div>
              <label className="block text-charcoal-muted text-[11px] mb-1 font-medium">Per-Account Auto-Subscription</label>
              <span className="text-[11px] font-mono text-charcoal flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                POST /{'{user_id}'}/subscribed_apps
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Meta App Compliance & Legal Callbacks */}
      <div className="p-6 rounded-xl bg-surface border border-border shadow-subtle space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-charcoal tracking-tight flex items-center gap-2">
            <span>Meta App Review &amp; Compliance Endpoints</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              Required for Meta Live Mode
            </span>
          </h2>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Configure these in Meta Dashboard under <strong>App Settings &rarr; Basic</strong> and <strong>Instagram Basic Display / Login</strong>.
          </p>
        </div>

        <div className="space-y-4 pt-2 text-xs">
          <div>
            <label className="block text-charcoal-muted font-medium text-xs mb-1.5">Data Deletion Request Callback URL</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={`https://<your-vercel-domain>.vercel.app${dataDeletionPath}`}
                className="flex-1 px-3 py-2 rounded-lg bg-surface-subdued border border-border font-mono text-charcoal text-xs select-all shadow-subtle focus-ring"
              />
              <button
                onClick={() => copyToClipboard(`https://<your-vercel-domain>.vercel.app${dataDeletionPath}`, 'dd')}
                className="px-3.5 py-2 rounded-lg bg-surface hover:bg-surface-hover border border-border text-charcoal flex items-center gap-1.5 transition-colors font-medium text-xs shadow-subtle"
              >
                {copiedField === 'dd' ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-charcoal-muted" />}
                <span>{copiedField === 'dd' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-charcoal-muted font-medium text-xs mb-1.5">Deauthorization Callback URL</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={`https://<your-vercel-domain>.vercel.app${deauthPath}`}
                className="flex-1 px-3 py-2 rounded-lg bg-surface-subdued border border-border font-mono text-charcoal text-xs select-all shadow-subtle focus-ring"
              />
              <button
                onClick={() => copyToClipboard(`https://<your-vercel-domain>.vercel.app${deauthPath}`, 'da')}
                className="px-3.5 py-2 rounded-lg bg-surface hover:bg-surface-hover border border-border text-charcoal flex items-center gap-1.5 transition-colors font-medium text-xs shadow-subtle"
              >
                {copiedField === 'da' ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-charcoal-muted" />}
                <span>{copiedField === 'da' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-lg bg-surface-subdued border border-border">
              <p className="font-semibold text-charcoal text-xs mb-1">Privacy Policy URL</p>
              <p className="font-mono text-[11px] text-charcoal-muted break-all">https://&lt;domain&gt;/privacy</p>
            </div>
            <div className="p-3.5 rounded-lg bg-surface-subdued border border-border">
              <p className="font-semibold text-charcoal text-xs mb-1">Terms of Service URL</p>
              <p className="font-mono text-[11px] text-charcoal-muted break-all">https://&lt;domain&gt;/terms</p>
            </div>
            <div className="p-3.5 rounded-lg bg-surface-subdued border border-border">
              <p className="font-semibold text-charcoal text-xs mb-1">User Data Deletion Page</p>
              <p className="font-mono text-[11px] text-charcoal-muted break-all">https://&lt;domain&gt;/data-deletion</p>
            </div>
          </div>
        </div>
      </div>

      {/* Integration Readiness Checklist */}
      <div className="p-6 rounded-xl bg-surface border border-border shadow-subtle space-y-4">
        <h2 className="text-sm font-semibold text-charcoal tracking-tight">Integration Readiness Checklist</h2>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3.5 rounded-lg bg-surface-subdued border border-border">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <p className="font-medium text-charcoal">Meta Graph API Version</p>
                <p className="text-[11px] text-charcoal-muted font-mono">v26.0 (Verified active Meta Graph release)</p>
              </div>
            </div>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 text-xs font-medium">Ready</span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-lg bg-surface-subdued border border-border">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <p className="font-medium text-charcoal">Instagram Login for Business Flow</p>
                <p className="text-[11px] text-charcoal-muted font-mono">instagram.com/oauth/authorize &rarr; graph.instagram.com</p>
              </div>
            </div>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 text-xs font-medium">Standardized</span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-lg bg-surface-subdued border border-border">
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <p className="font-medium text-charcoal">Multi-Tenant Isolation Architecture</p>
                <p className="text-[11px] text-charcoal-muted font-mono">Supabase Row Level Security (RLS) enforces auth.uid() = user_id</p>
              </div>
            </div>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 text-xs font-medium">Enforced</span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-lg bg-surface-subdued border border-border">
            <div className="flex items-center gap-3">
              <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <p className="font-medium text-charcoal">OAuth Token Encryption at Rest</p>
                <p className="text-[11px] text-charcoal-muted font-mono">AES-256-GCM authenticated encryption on Long-Lived User Tokens (60-day)</p>
              </div>
            </div>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 text-xs font-medium">Active</span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-lg bg-surface-subdued border border-border">
            <div className="flex items-center gap-3">
              <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <p className="font-medium text-charcoal">PostgreSQL Durable Idempotency Ledger</p>
                <p className="text-[11px] text-charcoal-muted font-mono">comment_id PRIMARY KEY constraint strictly prevents duplicate replies</p>
              </div>
            </div>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 text-xs font-medium">Configured</span>
          </div>
        </div>
      </div>

      {/* Meta Developer Dashboard Guidance */}
      <div className="p-6 rounded-xl bg-surface border border-border shadow-subtle space-y-4">
        <h2 className="text-sm font-semibold text-charcoal tracking-tight flex items-center gap-2">
          <Layers className="w-4 h-4 text-charcoal-muted" />
          <span>Meta Developer Dashboard Testing Guidelines</span>
        </h2>

        <div className="space-y-4 text-xs text-charcoal-muted">
          <div className="p-4 rounded-lg bg-surface-subdued border border-border space-y-2">
            <h3 className="font-medium text-charcoal flex items-center justify-between">
              <span>1. Development Mode vs Live Mode Testing</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-800">Notice</span>
            </h3>
            <p className="text-charcoal-muted leading-relaxed text-xs">
              While your Meta App is in <strong>Development Mode</strong>, private replies can only be sent to users who have an assigned <strong>App Role</strong> (Admins, Developers, or Instagram Testers). Attempting to DM ordinary public commenters will return <code className="text-charcoal bg-surface px-1 py-0.5 rounded border border-border">(#230) Permissions disallow message to this user</code>.
            </p>
            <div className="pt-2 text-xs text-charcoal-muted space-y-1">
              <p className="font-medium text-charcoal">To test comment replies before App Review:</p>
              <ol className="list-decimal list-inside space-y-1 pl-1 text-charcoal-muted">
                <li>Go to <strong>App Roles &rarr; Roles &rarr; Instagram Testers</strong> in Meta Dashboard.</li>
                <li>Add your commenter account username.</li>
                <li>In that account&apos;s Instagram app: Settings &rarr; Creator &rarr; Apps &amp; Websites &rarr; Tester Invites &rarr; Accept.</li>
              </ol>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-surface-subdued border border-border space-y-2">
            <h3 className="font-medium text-charcoal">2. Meta App Review for Public SaaS Customers</h3>
            <p className="text-charcoal-muted text-xs leading-relaxed">
              To allow unrelated public customers to sign up and automate their accounts, submit for Meta App Review with:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-1 text-charcoal-muted text-xs">
              <li><code className="text-charcoal bg-surface px-1 py-0.5 rounded border border-border">instagram_business_manage_messages</code> (Advanced Access)</li>
              <li><code className="text-charcoal bg-surface px-1 py-0.5 rounded border border-border">instagram_business_manage_comments</code> (Advanced Access)</li>
              <li>Business Verification for your business portfolio</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
