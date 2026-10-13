'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Zap,
  Trash2,
  Edit3,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  FileText
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

  async function handleDelete(ruleId: string) {
    if (confirm('Delete this automation rule?')) {
      await fetch(`/api/automations?id=${ruleId}`, { method: 'DELETE' });
      loadData();
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Automation Builder</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Configure comment keyword triggers and automated private replies across your Instagram accounts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSimModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-200 font-medium flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Test Keywords</span>
          </button>
          <button
            onClick={() => {
              setEditingRule(null);
              setIsModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Automation</span>
          </button>
        </div>
      </div>

      {/* Meta API Restriction Disclaimer */}
      <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-start gap-3">
        <HelpCircle className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-semibold text-zinc-200">Meta Private Reply Constraints (Enforced at API Level)</p>
          <ul className="text-zinc-400 list-disc list-inside space-y-0.5 text-[11px]">
            <li>Private replies must be dispatched within <strong>7 days</strong> of comment creation.</li>
            <li>Meta strictly allows <strong>exactly 1 private reply per comment ID</strong> (duplicate attempts return Error 100).</li>
            <li>Normal conversational messaging requires the user to respond, opening a 24-hour customer care window.</li>
          </ul>
        </div>
      </div>

      {/* Account Filter Pills */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setSelectedAccountId('')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            !selectedAccountId
              ? 'bg-zinc-100 text-zinc-950 font-semibold'
              : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
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
                ? 'bg-zinc-100 text-zinc-950 font-semibold'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            @{acc.username}
          </button>
        ))}
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rules.length === 0 ? (
          <div className="col-span-1 md:col-span-2 p-10 rounded-xl bg-zinc-900/40 border border-dashed border-zinc-800 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
              <Zap className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-200">No Automations Configured</p>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                Create your first keyword trigger to automatically send instant private direct messages when users comment on your posts or Reels.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingRule(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Automation</span>
            </button>
          </div>
        ) : (
          rules.map(rule => {
          const ruleAccount = accounts.find(a => a.id === rule.account_id);

          return (
            <div
              key={rule.id}
              className={`p-5 rounded-xl border transition-colors flex flex-col justify-between ${
                rule.is_active
                  ? 'bg-zinc-900/70 border-zinc-800'
                  : 'bg-zinc-950 border-zinc-800/50 opacity-70'
              }`}
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white tracking-tight">{rule.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60">
                        @{ruleAccount?.username || 'account'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {rule.post_thumbnail_url && (
                        <img
                          src={rule.post_thumbnail_url}
                          alt="Post preview"
                          className="w-4 h-4 rounded object-cover border border-zinc-700"
                        />
                      )}
                      <p className="text-[11px] text-zinc-500 font-mono truncate max-w-xs">
                        Target: {rule.post_caption || 'All Posts & Reels'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggle(rule)}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase transition-colors ${
                        rule.is_active
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 hover:bg-emerald-900/50'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700'
                      }`}
                    >
                      {rule.is_active ? 'Active' : 'Paused'}
                    </button>
                  </div>
                </div>

                {/* Keywords */}
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 block mb-1.5">
                    Trigger Keywords ({rule.match_type})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {rule.trigger_keywords.map(kw => (
                      <span
                        key={kw}
                        className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-700/60 text-[11px] font-mono"
                      >
                        "{kw}"
                      </span>
                    ))}
                  </div>
                </div>

                {/* Reply Message Preview */}
                <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 font-mono text-[11px] text-zinc-300">
                  <div className="text-[10px] text-zinc-500 mb-1 flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    <span>Private Reply Preview:</span>
                  </div>
                  "{rule.reply_template}"
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-4 mt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                <span className="text-[11px] text-zinc-500 font-mono">
                  Triggered: <strong className="text-zinc-300">{rule.total_triggered} times</strong>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingRule(rule);
                      setIsModalOpen(true);
                    }}
                    className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                    title="Edit rule"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(rule.id)}
                    className="p-1 rounded text-zinc-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                    title="Delete rule"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        }))}
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
