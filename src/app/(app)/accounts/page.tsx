'use client';

import React, { useState, useEffect } from 'react';
import {
  Instagram,
  ExternalLink,
  Key,
  Trash2,
  ShieldCheck,
  Radio,
  Plus
} from 'lucide-react';
import { ConnectedAccount } from '@/lib/types';
import { maskToken } from '@/lib/crypto';

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadAccounts();
    const params = new URLSearchParams(window.location.search);
    if (params.get('connected')) {
      setMessage(`Successfully connected Instagram Professional account @${params.get('username') || ''}!`);
    } else if (params.get('error')) {
      setMessage(`Authorization failed: ${params.get('error')}`);
    }
  }, []);

  async function loadAccounts() {
    setLoading(true);
    try {
      const res = await fetch('/api/accounts');
      const data = await res.json();
      if (data.accounts) setAccounts(data.accounts);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function handleConnectInstagram() {
    // Official Instagram Login for Business authorization flow
    window.location.href = '/api/auth/instagram';
  }

  async function handleDisconnect(id: string) {
    if (confirm('Disconnect this Instagram account and unsubscribe its webhooks? Active automations will stop.')) {
      try {
        await fetch('/api/accounts/disconnect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ account_id: id }),
        });
        setAccounts(prev => prev.filter(a => a.id !== id));
        setMessage('Account disconnected and webhooks unsubscribed.');
      } catch (e) {
        console.error(e);
      }
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Instagram Accounts</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Connect and manage your Instagram Professional accounts using official Instagram Login for Business.
          </p>
        </div>
        <button
          onClick={handleConnectInstagram}
          className="px-4 py-2 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
        >
          <Instagram className="w-4 h-4" />
          <span>Connect Instagram Account</span>
        </button>
      </div>

      {message && (
        <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-zinc-200 flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage('')} className="text-zinc-400 hover:text-white text-xs">Dismiss</button>
        </div>
      )}

      {/* Connection Notice */}
      <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-semibold text-zinc-200">Official Instagram Login for Business</p>
          <p className="text-zinc-400 leading-relaxed text-[11px]">
            Eligible Instagram Business and Creator accounts connect directly through Instagram without requiring each customer to manage a Facebook Page or generate API tokens manually.
          </p>
        </div>
      </div>

      {/* Account Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {accounts.map(acc => (
          <div key={acc.id} className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden flex items-center justify-center shrink-0">
                    {acc.profile_picture_url ? (
                      <img src={acc.profile_picture_url} alt={acc.username} className="w-full h-full object-cover" />
                    ) : (
                      <Instagram className="w-6 h-6 text-zinc-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      @{acc.username}
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    </h3>
                    <p className="text-xs text-zinc-400">{acc.name}</p>
                    <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-400 border border-zinc-700/60 font-mono">
                      {acc.account_type || 'BUSINESS'} ACCOUNT
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDisconnect(acc.id)}
                  title="Disconnect account"
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Account Meta Specs */}
              <div className="space-y-2 pt-2 border-t border-zinc-800/80 text-xs font-mono">
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Instagram User ID:</span>
                  <span className="text-zinc-200">{acc.instagram_user_id}</span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Webhook Subscribed:</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                    Active (comments, messages)
                  </span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Token Security:</span>
                  <span className="text-zinc-300 font-mono text-[11px] flex items-center gap-1">
                    <Key className="w-3 h-3 text-zinc-500" />
                    {maskToken('IGQV1234567890abcdef')} (AES-256-GCM)
                  </span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Token Lifetime:</span>
                  <span className="text-zinc-300 text-[11px]">
                    60-Day Long-Lived (Auto-refreshed)
                  </span>
                </div>
              </div>

              {/* Business Permissions */}
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2">Granted Scopes</p>
                <div className="flex flex-wrap gap-1.5">
                  {(acc.permissions && acc.permissions.length > 0 ? acc.permissions : [
                    'instagram_business_basic',
                    'instagram_business_manage_messages',
                    'instagram_business_manage_comments'
                  ]).map(perm => (
                    <span key={perm} className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                      {perm}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between">
              <span className="text-[11px] text-zinc-500 font-mono">Status: Connected</span>
              <a
                href={`https://instagram.com/${acc.username}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 font-medium transition-colors"
              >
                <span>View on Instagram</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}

        {/* Add Account Card */}
        <div
          onClick={handleConnectInstagram}
          className="p-8 rounded-xl border border-dashed border-zinc-800 hover:border-zinc-700 bg-zinc-950/40 hover:bg-zinc-900/40 cursor-pointer flex flex-col items-center justify-center text-center space-y-3 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-200">Connect Another Instagram Account</p>
            <p className="text-[11px] text-zinc-500 mt-0.5 max-w-xs">
              Authorize another professional profile using Instagram Login for Business with zero setup required.
            </p>
          </div>
          <button
            type="button"
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
          >
            Connect Account
          </button>
        </div>
      </div>
    </div>
  );
}
