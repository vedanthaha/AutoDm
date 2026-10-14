'use client';

import React, { useState, useEffect } from 'react';
import {
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  Instagram,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Radio
} from 'lucide-react';
import Link from 'next/link';
import { ConnectedAccount, AutomationRule, CommentDispatch } from '@/lib/types';
import { StatusBadge } from '@/components/StatusBadge';
import { RuleModal } from '@/components/RuleModal';
import { SimulationModal } from '@/components/SimulationModal';
import { motion } from 'framer-motion';
import {
  MotionPage,
  MotionStagger,
  MotionItem,
  MotionCard,
  MotionButton,
  AnimatedCounter,
  staggerContainer,
  staggerItem,
  fadeInUp,
} from '@/components/Motion';

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
    <MotionPage className="max-w-6xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-charcoal">System Overview</h1>
          <p className="text-xs text-charcoal-muted mt-1">
            Real-time status of your connected Instagram Professional accounts and comment-to-DM automations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <MotionButton
            onClick={() => setIsSimModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-surface hover:bg-surface-hover border border-border text-xs text-charcoal-muted font-medium flex items-center gap-1.5 shadow-subtle transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Test Inbound Comment</span>
          </MotionButton>
          <MotionButton
            onClick={() => setIsRuleModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-charcoal hover:bg-charcoal/90 text-canvas text-xs font-medium flex items-center gap-1.5 shadow-subtle transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Automation</span>
          </MotionButton>
        </div>
      </div>

      {/* KPI Cards */}
      <MotionStagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MotionCard className="p-5 rounded-xl bg-surface border border-border shadow-subtle hover:shadow-card transition-shadow">
          <div className="flex items-center justify-between text-charcoal-muted mb-3">
            <span className="text-xs font-medium tracking-tight">Connected Accounts</span>
            <Instagram className="w-4 h-4 text-charcoal-light" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-charcoal font-sans">
            <AnimatedCounter value={accounts.length} />
          </div>
          <p className="text-[11px] text-charcoal-muted mt-1 font-normal">Active Instagram Business profiles</p>
        </MotionCard>

        <MotionCard className="p-5 rounded-xl bg-surface border border-border shadow-subtle hover:shadow-card transition-shadow">
          <div className="flex items-center justify-between text-charcoal-muted mb-3">
            <span className="text-xs font-medium tracking-tight">Active Automations</span>
            <Zap className="w-4 h-4 text-charcoal-light" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-charcoal font-sans">
            <AnimatedCounter value={activeRulesCount} /> <span className="text-xs text-charcoal-muted font-normal">/ {rules.length} total</span>
          </div>
          <p className="text-[11px] text-charcoal-muted mt-1 font-normal">{rules.length - activeRulesCount} paused automations</p>
        </MotionCard>

        <MotionCard className="p-5 rounded-xl bg-surface border border-border shadow-subtle hover:shadow-card transition-shadow">
          <div className="flex items-center justify-between text-charcoal-muted mb-3">
            <span className="text-xs font-medium tracking-tight">DMs Delivered</span>
            <CheckCircle2 className="w-4 h-4 text-[--success-text]" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-[--success-text] font-sans">
            <AnimatedCounter value={deliveredDispatchesCount} />
          </div>
          <p className="text-[11px] text-charcoal-muted mt-1 font-normal">Direct private replies confirmed</p>
        </MotionCard>

        <MotionCard className="p-5 rounded-xl bg-surface border border-border shadow-subtle hover:shadow-card transition-shadow">
          <div className="flex items-center justify-between text-charcoal-muted mb-3">
            <span className="text-xs font-medium tracking-tight">Delivery Alerts</span>
            <AlertTriangle className={`w-4 h-4 ${failedDispatchesCount > 0 ? 'text-[--danger-text]' : 'text-charcoal-light'}`} />
          </div>
          <div className={`text-2xl font-bold tracking-tight font-sans ${failedDispatchesCount > 0 ? 'text-[--danger-text]' : 'text-charcoal'}`}>
            <AnimatedCounter value={failedDispatchesCount} />
          </div>
          <p className="text-[11px] text-charcoal-muted mt-1 font-normal">
            {failedDispatchesCount > 0 ? 'Review failed dispatches in audit log' : 'Zero unhandled exceptions'}
          </p>
        </MotionCard>
      </MotionStagger>

      {/* Account Status Section */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="space-y-3"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-charcoal tracking-tight">Connected Instagram Accounts</h2>
          <Link href="/accounts" className="text-xs text-charcoal-muted hover:text-charcoal flex items-center gap-1 font-medium transition-colors">
            Manage Accounts <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accounts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="col-span-1 md:col-span-2 p-8 rounded-xl bg-surface border border-dashed border-border text-center space-y-3"
            >
              <div className="w-10 h-10 rounded-full bg-surface-subdued border border-border mx-auto flex items-center justify-center text-charcoal-muted">
                <Instagram className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-charcoal">No Instagram accounts connected yet</p>
                <p className="text-[11px] text-charcoal-muted max-w-sm mx-auto mt-0.5">
                  Connect your Instagram Professional or Creator account via Instagram Login for Business to start automating replies.
                </p>
              </div>
              <Link
                href="/accounts"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 mt-2 rounded-lg bg-charcoal hover:bg-charcoal/90 text-canvas text-xs font-medium transition-colors shadow-sm"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>Connect Account</span>
              </Link>
            </motion.div>
          ) : (
            accounts.map((acc, idx) => (
              <motion.div
                key={acc.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.08 }}
                whileHover={{ y: -1 }}
                className="p-4 rounded-xl bg-surface border border-border shadow-subtle hover:shadow-card transition-all flex items-start justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-subdued border border-border overflow-hidden flex items-center justify-center shrink-0">
                    {acc.profile_picture_url ? (
                      <img src={acc.profile_picture_url} alt={acc.username} className="w-full h-full object-cover" />
                    ) : (
                      <Instagram className="w-5 h-5 text-charcoal-muted" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-charcoal">@{acc.username}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-[--success-bg] text-[--success-text] border border-[--success-border] font-medium">
                        Active
                      </span>
                    </div>
                    <p className="text-xs text-charcoal-muted mt-0.5">{acc.name || 'Instagram Professional'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Link
                        href={`/accounts/${acc.id}`}
                        className="text-[11px] font-medium text-accent hover:text-accent-hover flex items-center gap-1"
                      >
                        Open Media Gallery <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="inline-flex items-center gap-1 text-[11px] text-charcoal-muted bg-surface-subdued px-2 py-1 rounded-md border border-border">
                    <ShieldCheck className="w-3.5 h-3.5 text-[--success-text]" />
                    <span>{acc.permissions?.length || 3}/3 Scopes</span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      {/* Recent Dispatches Feed */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="space-y-3"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-charcoal tracking-tight">Recent Activity & Delivery Results</h2>
          <Link href="/activity" className="text-xs text-charcoal-muted hover:text-charcoal flex items-center gap-1 font-medium transition-colors">
            Full Audit Log <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-subtle">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-subdued border-b border-border text-charcoal-muted font-medium text-[11px]">
                <tr>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Commenter</th>
                  <th className="py-2.5 px-4">Comment Text</th>
                  <th className="py-2.5 px-4">Matched Trigger</th>
                  <th className="py-2.5 px-4">Delivered Reply</th>
                  <th className="py-2.5 px-4 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {dispatches.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-charcoal-muted text-xs">
                      No automated comment replies dispatched yet.
                    </td>
                  </tr>
                ) : (
                  dispatches.slice(0, 5).map((disp, idx) => (
                    <motion.tr
                      key={disp.comment_id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      className="hover:bg-surface-hover transition-colors"
                    >
                      <td className="py-3 px-4">
                        <StatusBadge status={disp.status} size="sm" />
                      </td>
                      <td className="py-3 px-4 font-medium text-charcoal">
                        @{disp.author_username}
                      </td>
                      <td className="py-3 px-4 text-charcoal-muted max-w-xs truncate">
                        &quot;{disp.comment_text}&quot;
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-accent font-medium">
                        {disp.keyword_matched ? `"${disp.keyword_matched}"` : <span className="text-charcoal-light">—</span>}
                      </td>
                      <td className="py-3 px-4 text-charcoal-muted max-w-xs truncate text-[11px]">
                        {disp.reply_text ? disp.reply_text : <span className="text-charcoal-light">—</span>}
                      </td>
                      <td className="py-3 px-4 text-right text-charcoal-muted font-mono text-[11px]">
                        {new Date(disp.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

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
    </MotionPage>
  );
}
