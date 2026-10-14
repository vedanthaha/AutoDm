'use client';

import React, { useState } from 'react';
import { X, Sparkles, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { ConnectedAccount, AutomationRule, CommentDispatch } from '@/lib/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  accounts: ConnectedAccount[];
  activeAccountId: string;
  onSuccess?: () => void;
}

interface SimulationResult {
  matched?: boolean;
  matchedRule?: AutomationRule;
  matchedKeyword?: string;
  dispatch?: CommentDispatch;
  error?: string;
}

export function SimulationModal({
  isOpen,
  onClose,
  accounts,
  activeAccountId,
  onSuccess,
}: Props) {
  const [accountId, setAccountId] = useState(activeAccountId || accounts[0]?.id || '');
  const [username, setUsername] = useState('demo_follower');
  const [commentText, setCommentText] = useState('link');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);

  if (!isOpen) return null;

  async function handleSimulate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_id: accountId,
          username,
          comment_text: commentText,
        }),
      });
      const data = await res.json();
      setResult(data);
      if (onSuccess) onSuccess();
    } catch (err) {
      setResult({ error: (err as Error).message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-2xl bg-surface border border-border shadow-popover p-6 text-charcoal">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-semibold tracking-tight text-charcoal">Test Inbound Comment Simulator</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-charcoal-muted hover:text-charcoal hover:bg-surface-hover transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="mt-3 text-xs text-charcoal-muted leading-relaxed">
          Safely test keyword matching and message templates without needing to post a live comment on Instagram.
        </p>

        <form onSubmit={handleSimulate} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-charcoal-muted mb-1">Target Account</label>
            <select
              value={accountId}
              onChange={e => setAccountId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-surface-subdued border border-border text-charcoal focus:outline-none focus-ring shadow-subtle font-medium cursor-pointer"
            >
              {accounts.map(a => (
                <option key={a.id} value={a.id} className="bg-surface text-charcoal">@{a.username} ({a.name})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-charcoal-muted mb-1">Commenter Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="e.g. johan_codes"
              required
              className="w-full px-3 py-2 text-xs rounded-lg bg-surface-subdued border border-border text-charcoal placeholder:text-charcoal-light focus:outline-none focus-ring shadow-subtle"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-charcoal-muted mb-1">Simulated Comment Text</label>
            <textarea
              rows={2}
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="e.g. Can you send the link to the guide?"
              required
              className="w-full px-3 py-2 text-xs rounded-lg bg-surface-subdued border border-border text-charcoal placeholder:text-charcoal-light focus:outline-none focus-ring resize-none font-mono shadow-subtle"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg bg-charcoal text-canvas dark:bg-[#ECECEC] dark:text-[#0A0A0B] hover:opacity-90 text-xs font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-subtle"
          >
            {loading ? <span className="animate-pulse">Processing Simulation...</span> : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Simulate Inbound Comment</span>
              </>
            )}
          </button>
        </form>

        {/* Result Preview */}
        {result && (
          <div className="mt-5 p-4 rounded-xl bg-surface-subdued border border-border text-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-charcoal">Simulation Result:</span>
              {result.matched ? (
                <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Keyword Matched
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-charcoal-muted font-medium">
                  <AlertCircle className="w-3.5 h-3.5" /> No Keyword Matched
                </span>
              )}
            </div>

            {result.matched ? (
              <>
                <div className="text-[11px] text-charcoal-muted">
                  Matched Rule: <span className="text-charcoal font-medium">{result.matchedRule?.name}</span> (Trigger: <code className="text-accent font-mono">"{result.matchedKeyword}"</code>)
                </div>
                <div className="p-3 rounded-lg bg-surface border border-border font-mono text-[11px] text-charcoal shadow-subtle">
                  <div className="text-[10px] text-charcoal-muted mb-1 font-sans">Generated Private Reply DM:</div>
                  "{result.dispatch?.reply_text}"
                </div>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  ✓ Recorded in Activity Log with status: delivered
                </p>
              </>
            ) : (
              <p className="text-[11px] text-charcoal-muted">
                Comment ignored because no active automation rules for this account matched your text.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
