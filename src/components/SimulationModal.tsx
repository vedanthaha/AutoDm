'use client';

import React, { useState } from 'react';
import { X, Send, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { ConnectedAccount } from '@/lib/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  accounts: ConnectedAccount[];
  activeAccountId: string;
  onSuccess?: () => void;
}

export function SimulationModal({ isOpen, onClose, accounts, activeAccountId, onSuccess }: Props) {
  const [commentText, setCommentText] = useState('Send me the link please!');
  const [username, setUsername] = useState('dev_tester');
  const [accountId, setAccountId] = useState(activeAccountId || accounts[0]?.id);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

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
          comment_text: commentText,
          author_username: username,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl p-6 text-zinc-100">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold tracking-tight text-white">Interactive Comment Simulator</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="mt-3 text-xs text-zinc-400 leading-relaxed">
          Test your keyword matching and private reply templates without having to post a real comment on Instagram.
        </p>

        <form onSubmit={handleSimulate} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Target Account</label>
            <select
              value={accountId}
              onChange={e => setAccountId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-zinc-600"
            >
              {accounts.map(a => (
                <option key={a.id} value={a.id}>@{a.username} ({a.name})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Commenter Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="e.g. johan_codes"
              required
              className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-zinc-600"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Simulated Comment Text</label>
            <textarea
              rows={2}
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="e.g. Can you send the link to the guide?"
              required
              className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-zinc-600 resize-none font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {loading ? <span className="animate-pulse">Processing Event...</span> : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Simulate Inbound Comment</span>
              </>
            )}
          </button>
        </form>

        {/* Result Preview */}
        {result && (
          <div className="mt-5 p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-300">Simulation Result:</span>
              {result.matched ? (
                <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Keyword Matched
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-zinc-400 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" /> No Keyword Matched
                </span>
              )}
            </div>

            {result.matched ? (
              <>
                <div className="text-[11px] text-zinc-400">
                  Matched Rule: <span className="text-zinc-200 font-medium">{result.matchedRule?.name}</span> (Trigger: <code className="text-emerald-300">"{result.matchedKeyword}"</code>)
                </div>
                <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800 font-mono text-[11px] text-zinc-300">
                  <div className="text-[10px] text-zinc-500 mb-1">Generated Private Reply:</div>
                  "{result.dispatch?.reply_text}"
                </div>
                <p className="text-[10px] text-emerald-500 font-mono">
                  ✓ Recorded in Activity Log with status: delivered
                </p>
              </>
            ) : (
              <p className="text-[11px] text-zinc-400">
                Comment ignored because no active automation rules for this account matched your text.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
