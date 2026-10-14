'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Zap,
  Trash2,
  Edit3,
  Sparkles,
  CheckCircle2,
  FileText,
  Copy,
  UserCheck
} from 'lucide-react';
import { AutomationRule, ConnectedAccount } from '@/lib/types';
import { RuleModal } from '@/components/RuleModal';
import { SimulationModal } from '@/components/SimulationModal';

export default function AutomationsPage() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSimModalOpen, setIsSimModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedAccountId]);

  async function loadData() {
    setLoading(true);
    try {
      const [accRes, rulesRes] = await Promise.all([
        fetch('/api/accounts').then(r => r.json()),
        fetch(`/api/automations${selectedAccountId ? `?account_id=${selectedAccountId}` : ''}`).then(r => r.json()),
      ]);

      if (accRes.accounts) {
        setAccounts(accRes.accounts);
        if (!selectedAccountId && accRes.accounts.length > 0) {
          setSelectedAccountId(accRes.accounts[0].id);
        }
      }
      if (rulesRes.rules) setRules(rulesRes.rules);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle(rule: AutomationRule) {
    try {
      await fetch('/api/automations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...rule, is_active: !rule.is_active }),
      });
      loadData();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDuplicate(ruleId: string) {
    try {
      await fetch('/api/automations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'duplicate', rule_id: ruleId }),
      });
      loadData();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(ruleId: string) {
    if (confirm('Delete this automation rule? This action cannot be undone.')) {
      await fetch(`/api/automations?id=${ruleId}`, { method: 'DELETE' });
      loadData();
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-charcoal">Automation Studio</h1>
          <p className="text-xs text-charcoal-muted mt-1">
            Configure comment keyword triggers, automated direct messages, and Follow to Unlock rules.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSimModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-surface hover:bg-surface-hover border border-border text-xs text-charcoal font-medium flex items-center gap-1.5 transition-colors shadow-subtle"
          >
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>Test Simulator</span>
          </button>
          <button
            onClick={() => {
              setEditingRule(null);
              setIsModalOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-lg bg-charcoal text-canvas dark:bg-[#ECECEC] dark:text-[#0A0A0B] hover:opacity-90 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-subtle"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Automation</span>
          </button>
        </div>
      </div>

      {/* Account Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedAccountId('')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            !selectedAccountId
              ? 'bg-charcoal text-canvas dark:bg-[#ECECEC] dark:text-[#0A0A0B] font-semibold shadow-subtle'
              : 'bg-surface text-charcoal-muted hover:text-charcoal border border-border'
          }`}
        >
          All Accounts ({rules.length})
        </button>
        {accounts.map(acc => (
          <button
            key={acc.id}
            onClick={() => setSelectedAccountId(acc.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              selectedAccountId === acc.id
                ? 'bg-charcoal text-canvas dark:bg-[#ECECEC] dark:text-[#0A0A0B] font-semibold shadow-subtle'
                : 'bg-surface text-charcoal-muted hover:text-charcoal border border-border'
            }`}
          >
            @{acc.username}
          </button>
        ))}
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {rules.length === 0 ? (
          <div className="col-span-1 md:col-span-2 p-12 rounded-2xl bg-surface border border-dashed border-border text-center space-y-3 shadow-subtle">
            <div className="w-10 h-10 rounded-full bg-surface-subdued border border-border flex items-center justify-center mx-auto text-charcoal-muted">
              <Zap className="w-5 h-5 text-charcoal" />
            </div>
            <div>
              <p className="text-sm font-semibold text-charcoal">No Automations Configured</p>
              <p className="text-xs text-charcoal-muted mt-1 max-w-sm mx-auto leading-relaxed">
                Create your first automation to send instant DMs and comment replies when users interact with your posts or Reels.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingRule(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-charcoal text-canvas dark:bg-[#ECECEC] dark:text-[#0A0A0B] hover:opacity-90 text-xs font-semibold transition-colors shadow-subtle"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Automation</span>
            </button>
          </div>
        ) : (
          rules.map(rule => {
            const ruleAccount = accounts.find(a => a.id === rule.account_id);
            const isModeA = rule.trigger_type === 'any_comment';

            return (
              <div
                key={rule.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between shadow-card bg-surface ${
                  rule.is_active
                    ? 'border-border hover:border-charcoal-muted'
                    : 'border-border opacity-75'
                }`}
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-charcoal">{rule.name}</span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                          isModeA
                            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
                            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                        }`}>
                          {isModeA ? 'MODE A: ANY COMMENT' : 'MODE B: KEYWORDS'}
                        </span>
                        {rule.follow_gate_enabled && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center gap-1 font-medium">
                            <UserCheck className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                            FOLLOW GATE
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {rule.post_thumbnail_url && (
                          <img
                            src={rule.post_thumbnail_url}
                            alt="Post preview"
                            className="w-4 h-4 rounded object-cover border border-border"
                          />
                        )}
                        <p className="text-[11px] text-charcoal-muted truncate max-w-xs">
                          @{ruleAccount?.username || 'account'} • Target: {rule.post_caption || 'All Posts & Reels'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggle(rule)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium transition-colors flex items-center gap-1.5 ${
                          rule.is_active
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-surface-subdued text-charcoal-muted border border-border'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${rule.is_active ? 'bg-emerald-500' : 'bg-charcoal-light'}`} />
                        {rule.is_active ? 'Active' : 'Paused'}
                      </button>
                    </div>
                  </div>

                  {/* Triggers & Exclusions */}
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-charcoal-muted block mb-1.5 font-semibold">
                      {isModeA ? 'Trigger: Every Top-Level Comment' : `Trigger Keywords (${rule.match_type || 'contains'}, ${rule.match_logic || 'any'})`}
                    </span>
                    {!isModeA ? (
                      <div className="flex flex-wrap gap-1.5">
                        {(rule.trigger_keywords || []).map(kw => (
                          <span
                            key={kw}
                            className="px-2 py-0.5 rounded bg-surface-subdued text-charcoal border border-border text-[11px] font-mono"
                          >
                            &ldquo;{kw}&rdquo;
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-charcoal font-mono bg-surface-subdued px-2.5 py-1.5 rounded-lg border border-border">
                        Dispatches for any incoming comment on target media
                      </p>
                    )}

                    {rule.exclude_keywords && rule.exclude_keywords.length > 0 && (
                      <div className="mt-2 text-[10px] font-mono text-red-600 dark:text-red-400 flex items-center gap-1">
                        <span>Exclusions:</span>
                        <span>{rule.exclude_keywords.join(', ')}</span>
                      </div>
                    )}
                  </div>

                  {/* Reply Message Preview */}
                  <div className="space-y-1.5 text-xs">
                    <div className="p-3 rounded-xl bg-surface-subdued border border-border font-mono text-[11px] text-charcoal">
                      <div className="text-[10px] text-accent mb-1 flex items-center gap-1 font-sans font-semibold">
                        <FileText className="w-3 h-3" />
                        <span>Private Reply DM:</span>
                      </div>
                      &ldquo;{rule.reply_template}&rdquo;
                    </div>

                    {rule.send_comment && rule.comment_reply_template && (
                      <div className="p-2.5 rounded-xl bg-surface-subdued border border-border font-mono text-[11px] text-charcoal">
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mb-1 flex items-center gap-1 font-sans font-semibold">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Public Reply to Comment:</span>
                        </div>
                        &ldquo;{rule.comment_reply_template}&rdquo;
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-4 mt-4 border-t border-border flex items-center justify-between text-xs">
                  <span className="text-[11px] text-charcoal-muted font-mono">
                    Triggered: <strong className="text-charcoal">{rule.total_triggered} times</strong>
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingRule(rule);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 rounded-md text-charcoal-muted hover:text-charcoal hover:bg-surface-hover transition-colors"
                      title="Edit rule"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDuplicate(rule.id)}
                      className="p-1.5 rounded-md text-charcoal-muted hover:text-charcoal hover:bg-surface-hover transition-colors"
                      title="Duplicate rule"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(rule.id)}
                      className="p-1.5 rounded-md text-charcoal-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      title="Delete rule"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modals */}
      <RuleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        rule={editingRule}
        accounts={accounts}
        activeAccountId={selectedAccountId || accounts[0]?.id || ''}
        onSaved={loadData}
      />
      <SimulationModal
        isOpen={isSimModalOpen}
        onClose={() => setIsSimModalOpen(false)}
        accounts={accounts}
        activeAccountId={selectedAccountId || accounts[0]?.id || ''}
        onSuccess={loadData}
      />
    </div>
  );
}
