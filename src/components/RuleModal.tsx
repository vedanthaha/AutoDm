'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, AlertTriangle } from 'lucide-react';
import { AutomationRule, ConnectedAccount } from '@/lib/types';
import { MediaPicker } from './MediaPicker';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  rule?: AutomationRule | null;
  accounts: ConnectedAccount[];
  activeAccountId: string;
  onSaved: () => void;
}

export function RuleModal({ isOpen, onClose, rule, accounts, activeAccountId, onSaved }: Props) {
  const [name, setName] = useState('');
  const [keywords, setKeywords] = useState('');
  const [template, setTemplate] = useState('Hey {{username}}! Here is the link you requested: https://');
  const [accountId, setAccountId] = useState(activeAccountId);
  const [isActive, setIsActive] = useState(true);
  const [matchType, setMatchType] = useState<'contains' | 'exact'>('contains');
  const [postId, setPostId] = useState<string | null>(null);
  const [postCaption, setPostCaption] = useState('All Posts & Reels');
  const [postThumbnailUrl, setPostThumbnailUrl] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (rule) {
      setName(rule.name);
      setKeywords(rule.trigger_keywords.join(', '));
      setTemplate(rule.reply_template);
      setAccountId(rule.account_id);
      setIsActive(rule.is_active);
      setMatchType(rule.match_type);
      setPostId(rule.post_id);
      setPostCaption(rule.post_caption || 'All Posts & Reels');
      setPostThumbnailUrl(rule.post_thumbnail_url);
    } else {
      setName('');
      setKeywords('link, guide, dm');
      setTemplate('Hey {{username}}! Here is the link you requested: https://example.com/starter');
      setAccountId(activeAccountId || accounts[0]?.id || '');
      setIsActive(true);
      setMatchType('contains');
      setPostId(null);
      setPostCaption('All Posts & Reels');
      setPostThumbnailUrl(undefined);
    }
    setError('');
  }, [rule, activeAccountId, isOpen, accounts]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const parsedKeywords = keywords
      .split(',')
      .map(k => k.trim())
      .filter(Boolean);

    if (parsedKeywords.length === 0) {
      setError('Please provide at least one trigger keyword.');
      setLoading(false);
      return;
    }

    const targetAccountId = accountId || accounts.find(a => a.id === activeAccountId)?.id || accounts[0]?.id;
    if (!targetAccountId) {
      setError('Please select a connected Instagram account first.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/automations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: rule?.id,
          account_id: targetAccountId,
          name: name.trim() || 'Untitled Automation',
          trigger_keywords: parsedKeywords,
          reply_template: template,
          is_active: isActive,
          match_type: matchType,
          post_id: postId,
          post_caption: postCaption,
          post_thumbnail_url: postThumbnailUrl,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save automation rule');
      }

      onSaved();
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function insertVariable(tag: string) {
    setTemplate(prev => prev + tag);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl p-6 text-zinc-100">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <h3 className="text-sm font-semibold tracking-tight text-white">
            {rule ? 'Edit Automation Rule' : 'Create Automation Rule'}
          </h3>
          <button onClick={onClose} className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-zinc-300 mb-1">Target Account</label>
              <select
                value={accountId}
                onChange={e => setAccountId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-zinc-600"
              >
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>@{a.username}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium text-zinc-300 mb-1">Rule Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Lead Magnet Dispatch"
                required
                className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-zinc-600"
              />
            </div>
          </div>

          {/* Visual Post / Reel Picker */}
          <div className="pt-2 border-t border-zinc-800/80">
            <MediaPicker
              accountId={accountId}
              selectedPostId={postId}
              onSelect={(selectedId, caption, thumb) => {
                setPostId(selectedId);
                setPostCaption(caption || 'All Posts & Reels');
                setPostThumbnailUrl(thumb);
              }}
            />
          </div>

          <div>
            <label className="block font-medium text-zinc-300 mb-1">
              Trigger Keywords (Comma-separated)
            </label>
            <input
              type="text"
              value={keywords}
              onChange={e => setKeywords(e.target.value)}
              placeholder="e.g. link, repo, guide, pdf"
              required
              className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-zinc-600 font-mono"
            />
            <p className="mt-1 text-[11px] text-zinc-500">
              When a user comments any of these words on the selected post, this automation triggers.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-medium text-zinc-300">Private Reply DM Message</label>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-zinc-500">Insert tag:</span>
                <button
                  type="button"
                  onClick={() => insertVariable(' {{username}}')}
                  className="px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-mono border border-zinc-700"
                >
                  {`{{username}}`}
                </button>
              </div>
            </div>
            <textarea
              rows={3}
              value={template}
              onChange={e => setTemplate(e.target.value)}
              placeholder="Hey {{username}}! Here is your link..."
              required
              className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-zinc-600 resize-none font-mono"
            />
            <div className="mt-1 p-2 rounded bg-zinc-950 border border-zinc-800/80 text-[11px] text-zinc-400">
              <span className="text-zinc-500 font-medium">Meta Restriction:</span> Private replies must be sent within 7 days. Only 1 private reply permitted per comment ID.
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block font-medium text-zinc-300 mb-1">Matching Precision</label>
              <select
                value={matchType}
                onChange={e => setMatchType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-zinc-600"
              >
                <option value="contains">Contains Keyword (Flexible)</option>
                <option value="exact">Exact Match (Strict)</option>
              </select>
            </div>
            <div className="flex items-end pb-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active_toggle"
                  checked={isActive}
                  onChange={e => setIsActive(e.target.checked)}
                  className="rounded bg-zinc-950 border-zinc-700 text-zinc-100 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="is_active_toggle" className="text-zinc-300 cursor-pointer">
                  Enable automation immediately
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-800 text-zinc-400 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{loading ? 'Saving...' : 'Save Automation'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
