'use client';

import React, { useState, useEffect } from 'react';
import {
  Zap,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  Instagram,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { ConnectedAccount, AutomationRule, CommentDispatch } from '@/lib/types';
import { StatusBadge } from '@/components/StatusBadge';
import { RuleModal } from '@/components/RuleModal';
import { SimulationModal } from '@/components/SimulationModal';

export default function OverviewPage() {
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [dispatches, setDispatches] = useState<CommentDispatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [isSimModalOpen, setIsSimModalOpen] = useState(false);

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('dispatch_updated', handleUpdate);
    return () => window.removeEventListener('dispatch_updated', handleUpdate);
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [accRes, rulesRes, dispRes] = await Promise.all([
        fetch('/api/accounts').then(r => r.json()),
        fetch('/api/automations').then(r => r.json()),
        fetch('/api/dispatches', { cache: 'no-store' }).then(r => r.json()).catch(() => ({ dispatches: [] })),
      ]);

      if (accRes.accounts) setAccounts(accRes.accounts);
      if (rulesRes.rules) setRules(rulesRes.rules);
      if (dispRes.dispatches) setDispatches(dispRes.dispatches);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const activeRulesCount = rules.filter(r => r.is_active).length;
  const deliveredDispatchesCount = dispatches.filter(d => d.status === 'delivered').length;
  const failedDispatchesCount = dispatches.filter(d => d.status === 'failed').length;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">System Overview</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time status of your connected Instagram Professional accounts and comment-to-DM automations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSimModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-200 font-medium flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Test Comment</span>
          </button>
          <button
            onClick={() => setIsRuleModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Automation</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider font-mono">Accounts</span>
            <Instagram className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {accounts.length}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Connected Instagram accounts</p>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider font-mono">Active Rules</span>
            <Zap className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {activeRulesCount} <span className="text-xs text-zinc-500 font-normal">/ {rules.length} Total</span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">{rules.length - activeRulesCount} paused rules</p>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider font-mono">DMs Delivered</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            {deliveredDispatchesCount}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Confirmed delivery responses</p>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider font-mono">Delivery Alerts</span>
            <AlertTriangle className={`w-4 h-4 ${failedDispatchesCount > 0 ? 'text-rose-400' : 'text-zinc-500'}`} />
          </div>
          <div className={`text-2xl font-bold font-mono ${failedDispatchesCount > 0 ? 'text-rose-400' : 'text-zinc-200'}`}>
            {failedDispatchesCount}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">
            {failedDispatchesCount > 0 ? 'Review error diagnostic below' : 'Zero unhandled exceptions'}
          </p>
        </div>
      </div>

      {/* Account Status Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-200 tracking-tight">Connected Instagram Accounts</h2>
          <Link href="/accounts" className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 font-medium">
            Manage Accounts <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accounts.map(acc => (
            <div key={acc.id} className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden flex items-center justify-center shrink-0">
                  {acc.profile_picture_url ? (
                    <img src={acc.profile_picture_url} alt={acc.username} className="w-full h-full object-cover" />
                  ) : (
                    <Instagram className="w-5 h-5 text-zinc-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">@{acc.username}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 font-mono">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">{acc.name}</p>
                  <p className="text-[10px] text-zinc-500 mt-1 font-mono">
                    Type: {acc.account_type || 'BUSINESS'} • IG ID: {acc.instagram_user_id}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="inline-flex items-center gap-1 text-[11px] text-zinc-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{acc.permissions?.length || 3}/3 Scopes</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Dispatches Feed */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-200 tracking-tight">Recent Activity & Delivery Results</h2>
          <Link href="/activity" className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 font-medium">
            Full Audit Log <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400 font-mono uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Commenter</th>
                  <th className="py-2.5 px-4">Comment Text</th>
                  <th className="py-2.5 px-4">Matched Trigger</th>
                  <th className="py-2.5 px-4">Delivered Reply</th>
                  <th className="py-2.5 px-4 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {dispatches.slice(0, 5).map(disp => (
                  <tr key={disp.comment_id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <StatusBadge status={disp.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 font-medium text-zinc-200">
                      @{disp.author_username}
                    </td>
                    <td className="py-3 px-4 text-zinc-300 max-w-xs truncate">
                      &quot;{disp.comment_text}&quot;
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-emerald-400">
                      {disp.keyword_matched ? `"${disp.keyword_matched}"` : <span className="text-zinc-600">—</span>}
                    </td>
                    <td className="py-3 px-4 text-zinc-400 max-w-xs truncate font-mono text-[11px]">
                      {disp.reply_text ? disp.reply_text : <span className="text-zinc-600">—</span>}
                    </td>
                    <td className="py-3 px-4 text-right text-zinc-500 font-mono text-[11px]">
                      {new Date(disp.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      <RuleModal
        isOpen={isRuleModalOpen}
        onClose={() => setIsRuleModalOpen(false)}
        accounts={accounts}
        activeAccountId={accounts[0]?.id || ''}
        onSaved={loadData}
      />
      <SimulationModal
        isOpen={isSimModalOpen}
        onClose={() => setIsSimModalOpen(false)}
        accounts={accounts}
        activeAccountId={accounts[0]?.id || ''}
        onSuccess={loadData}
      />
    </div>
  );
}
