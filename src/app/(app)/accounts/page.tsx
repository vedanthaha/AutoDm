'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Instagram,
  CheckCircle2,
  Trash2,
  Plus,
  ArrowRight,
  ExternalLink,
  Image as ImageIcon
} from 'lucide-react';
import { ConnectedAccount, AutomationRule } from '@/lib/types';

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    loadData();
    const params = new URLSearchParams(window.location.search);
    if (params.get('connected') === 'true') {
      setMessage('Instagram profile connected successfully.');
    } else if (params.get('error')) {
      setMessage(`Authentication error: ${params.get('error')}`);
    }
  }, []);

  async function loadData() {
    try {
      const [accRes, rulesRes] = await Promise.all([
        fetch('/api/accounts').then(r => r.json()),
        fetch('/api/automations').then(r => r.json()),
      ]);
      if (accRes.accounts) setAccounts(accRes.accounts);
      if (rulesRes.rules) setRules(rulesRes.rules);
    } catch (e) {
      console.error(e);
    }
  }

  function handleConnectInstagram() {
    window.location.href = '/api/auth/instagram';
  }

  async function handleDisconnect(id: string) {
    if (confirm('Disconnect this Instagram account? Active automations on this profile will stop.')) {
      try {
        await fetch('/api/accounts/disconnect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ account_id: id }),
        });
        setAccounts(prev => prev.filter(a => a.id !== id));
        setMessage('Account disconnected successfully.');
      } catch (e) {
        console.error(e);
      }
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-charcoal">Connected Accounts</h1>
          <p className="text-xs text-charcoal-muted mt-1">
            Connect and manage your Instagram Professional profiles with official Meta authentication.
          </p>
        </div>
        <button
          onClick={handleConnectInstagram}
          className="px-4 py-2 rounded-lg bg-charcoal text-canvas dark:bg-[#ECECEC] dark:text-[#0A0A0B] hover:opacity-90 text-xs font-semibold flex items-center gap-2 transition-colors shadow-subtle"
        >
          <Instagram className="w-3.5 h-3.5" />
          <span>Connect Instagram Account</span>
        </button>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-surface border border-border text-xs text-charcoal flex items-center justify-between shadow-subtle">
          <span className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            {message}
          </span>
          <button onClick={() => setMessage('')} className="text-charcoal-muted hover:text-charcoal text-xs font-medium">
            Dismiss
          </button>
        </div>
      )}

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {accounts.map(acc => {
          const accRules = rules.filter(r => r.account_id === acc.id);
          const activeCount = accRules.filter(r => r.is_active).length;

          return (
            <div
              key={acc.id}
              className="p-6 rounded-2xl bg-surface border border-border space-y-5 flex flex-col justify-between shadow-card hover:border-charcoal-muted transition-all"
            >
              <div className="space-y-4">
                {/* Account Profile Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-surface-subdued border border-border overflow-hidden flex items-center justify-center shrink-0">
                      {acc.profile_picture_url ? (
                        <img src={acc.profile_picture_url} alt={acc.username} className="w-full h-full object-cover" />
                      ) : (
                        <Instagram className="w-6 h-6 text-charcoal-muted" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-charcoal flex items-center gap-1.5">
                        @{acc.username}
                        <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active & Connected" />
                      </h3>
                      <p className="text-xs text-charcoal-muted mt-0.5">{acc.name || 'Instagram Profile'}</p>
                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] bg-surface-subdued text-charcoal-muted border border-border font-mono">
                        {acc.account_type || 'BUSINESS'} PROFILE
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDisconnect(acc.id)}
                    title="Disconnect account"
                    className="p-1.5 rounded-lg text-charcoal-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Account Specs Overview */}
                <div className="grid grid-cols-2 gap-3 py-3 border-y border-border text-xs">
                  <div>
                    <span className="text-[10px] text-charcoal-light uppercase font-mono block">Automations</span>
                    <span className="text-sm font-semibold text-charcoal">{accRules.length} Rules</span>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block font-medium">({activeCount} active)</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-charcoal-light uppercase font-mono block">Status</span>
                    <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Connected
                    </span>
                    <span className="text-[11px] text-charcoal-muted block">Webhooks active</span>
                  </div>
                </div>

                {/* Instagram Handle External Link */}
                <div className="flex items-center justify-between text-xs text-charcoal-muted">
                  <span>Instagram ID: <code className="font-mono text-charcoal">{acc.instagram_user_id}</code></span>
                  <a
                    href={`https://instagram.com/${acc.username}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-charcoal-muted hover:text-charcoal flex items-center gap-1 font-medium transition-colors"
                  >
                    <span>View Profile</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Action Button: Opens Media Gallery */}
              <div className="pt-2">
                <Link
                  href={`/accounts/${acc.id}`}
                  className="w-full py-2.5 px-4 rounded-xl bg-charcoal text-canvas dark:bg-[#ECECEC] dark:text-[#0A0A0B] hover:opacity-90 text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-subtle"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Open Media Gallery &amp; Automations</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}

        {/* Connect Another Account Card */}
        <div
          onClick={handleConnectInstagram}
          className="p-8 rounded-2xl border border-dashed border-border hover:border-charcoal-muted bg-surface/80 hover:bg-surface cursor-pointer flex flex-col items-center justify-center text-center space-y-3 transition-all min-h-[260px] shadow-subtle"
        >
          <div className="w-10 h-10 rounded-full bg-surface-subdued border border-border flex items-center justify-center text-charcoal-muted">
            <Plus className="w-5 h-5 text-charcoal" />
          </div>
          <div>
            <p className="text-xs font-semibold text-charcoal">Connect Another Profile</p>
            <p className="text-[11px] text-charcoal-muted mt-1 max-w-xs leading-relaxed">
              Authorize an additional Instagram Business or Creator account using official Instagram Login.
            </p>
          </div>
          <button
            type="button"
            className="px-3.5 py-1.5 rounded-lg bg-surface-subdued hover:bg-surface-hover text-charcoal border border-border text-xs font-semibold transition-colors shadow-subtle"
          >
            Connect Profile
          </button>
        </div>
      </div>
    </div>
  );
}
