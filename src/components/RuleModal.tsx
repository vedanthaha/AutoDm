'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  AlertTriangle,
  MessageSquare,
  Lock,
  Filter,
  Info
} from 'lucide-react';
import {
  AutomationRule,
  ConnectedAccount,
  TriggerType,
  MatchType,
  MatchLogic,
  ActionType
} from '@/lib/types';
import { MediaPicker } from './MediaPicker';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  rule?: AutomationRule | null;
  accounts: ConnectedAccount[];
  activeAccountId: string;
  onSaved: () => void;
  defaultPostId?: string | null;
  defaultPostCaption?: string;
  defaultPostThumbnailUrl?: string;
}

export function RuleModal({
  isOpen,
  onClose,
  rule,
  accounts,
  activeAccountId,
  onSaved,
  defaultPostId,
  defaultPostCaption,
  defaultPostThumbnailUrl,
}: Props) {
  const [name, setName] = useState('');
  const [accountId, setAccountId] = useState(activeAccountId);

  // Trigger configuration
  const [triggerType, setTriggerType] = useState<TriggerType>('keywords');
  const [keywords, setKeywords] = useState('');
  const [excludeKeywords, setExcludeKeywords] = useState('');
  const [matchType, setMatchType] = useState<MatchType>('contains');
  const [matchLogic, setMatchLogic] = useState<MatchLogic>('any');

  // Media targeting
  const [postId, setPostId] = useState<string | null>(null);
  const [postCaption, setPostCaption] = useState('All Posts & Reels');
  const [postThumbnailUrl, setPostThumbnailUrl] = useState<string | undefined>();

  // Actions configuration
  const [sendDm, setSendDm] = useState(true);
  const [sendComment, setSendComment] = useState(true);
  const [template, setTemplate] = useState('Hey {{username}}! Here is the link you requested: https://');
  const [commentReplyTemplate, setCommentReplyTemplate] = useState('Sent to your DM! Check your requests 📩');

  // Follow Gate configuration
  const [followGateEnabled, setFollowGateEnabled] = useState(false);
  const [followPromptTemplate, setFollowPromptTemplate] = useState(
    'Hey {{username}}! Follow our account @{{account_username}} to unlock your link 🚀 Once followed, reply "done" here!'
  );
  const [followUnlockedTemplate, setFollowUnlockedTemplate] = useState(
    'You are in, {{username}}! Here is your unlocked link: https://example.com/starter'
  );

  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currentAccount = accounts.find(a => a.id === accountId) || accounts[0];

  useEffect(() => {
    if (rule) {
      setName(rule.name);
      setAccountId(rule.account_id);
      setTriggerType(rule.trigger_type || 'keywords');
      setKeywords(rule.trigger_keywords ? rule.trigger_keywords.join(', ') : '');
      setExcludeKeywords(rule.exclude_keywords ? rule.exclude_keywords.join(', ') : '');
      setMatchType(rule.match_type || 'contains');
      setMatchLogic(rule.match_logic || 'any');

      setSendDm(rule.send_dm !== undefined ? rule.send_dm : true);
      setSendComment(rule.send_comment !== undefined ? rule.send_comment : true);
      setTemplate(rule.reply_template || '');
      setCommentReplyTemplate(rule.comment_reply_template || 'Sent to your DM! Check your requests 📩');

      setFollowGateEnabled(Boolean(rule.follow_gate_enabled));
      setFollowPromptTemplate(
        rule.follow_prompt_template ||
          'Hey {{username}}! Follow our account @{{account_username}} to unlock your link 🚀 Once followed, reply "done" here!'
      );
      setFollowUnlockedTemplate(
        rule.follow_unlocked_template ||
          rule.reply_template ||
          'You are in, {{username}}! Here is your unlocked link: https://example.com/starter'
      );

      setPostId(rule.post_id);
      setPostCaption(rule.post_caption || 'All Posts & Reels');
      setPostThumbnailUrl(rule.post_thumbnail_url);
      setIsActive(rule.is_active);
    } else {
      setName('');
      setAccountId(activeAccountId || accounts[0]?.id || '');
      setTriggerType('keywords');
      setKeywords('link, guide, dm');
      setExcludeKeywords('');
      setMatchType('contains');
      setMatchLogic('any');

      setSendDm(true);
      setSendComment(true);
      setTemplate('Hey {{username}}! Here is the link you requested: https://example.com/starter');
      setCommentReplyTemplate('Sent to your DM! Check your requests 📩');

      setFollowGateEnabled(false);
      setFollowPromptTemplate(
        'Hey {{username}}! Follow our account @{{account_username}} to unlock your link 🚀 Once followed, reply "done" here!'
      );
      setFollowUnlockedTemplate('You are in, {{username}}! Here is your unlocked link: https://example.com/starter');

      setPostId(defaultPostId || null);
      setPostCaption(defaultPostCaption || (defaultPostId ? 'Selected Media' : 'All Posts & Reels'));
      setPostThumbnailUrl(defaultPostThumbnailUrl);
      setIsActive(true);
    }
    setError('');
  }, [rule, activeAccountId, defaultPostId, defaultPostCaption, defaultPostThumbnailUrl, isOpen, accounts]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!sendDm && !sendComment) {
      setError('Please select at least one action: Send DM or Public Comment Reply.');
      setLoading(false);
      return;
    }

    let parsedKeywords: string[] = [];
    if (triggerType === 'keywords') {
      parsedKeywords = keywords
        .split(',')
        .map(k => k.trim())
        .filter(Boolean);

      if (parsedKeywords.length === 0) {
        setError('Please provide at least one trigger keyword or switch to "Any Comment" mode.');
        setLoading(false);
        return;
      }
    }

    const parsedExcludes = excludeKeywords
      .split(',')
      .map(k => k.trim())
      .filter(Boolean);

    const targetAccountId = accountId || accounts.find(a => a.id === activeAccountId)?.id || accounts[0]?.id;
    if (!targetAccountId) {
      setError('Please select a connected Instagram account.');
      setLoading(false);
      return;
    }

    // Determine action_type
    let actionType: ActionType = 'both';
    if (sendDm && !sendComment) actionType = 'dm_only';
    else if (!sendDm && sendComment) actionType = 'comment_only';

    try {
      const res = await fetch('/api/automations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: rule?.id,
          account_id: targetAccountId,
          name: name.trim() || (triggerType === 'any_comment' ? 'Any Comment Automation' : `Keyword: ${parsedKeywords[0] || 'Trigger'}`),
          trigger_type: triggerType,
          trigger_keywords: parsedKeywords,
          exclude_keywords: parsedExcludes,
          match_type: matchType,
          match_logic: matchLogic,
          action_type: actionType,
          send_dm: sendDm,
          send_comment: sendComment,
          reply_template: template,
          comment_reply_template: commentReplyTemplate.trim() || 'Sent to your DM! Check your requests 📩',
          follow_gate_enabled: followGateEnabled,
          follow_prompt_template: followPromptTemplate,
          follow_unlocked_template: followUnlockedTemplate,
          is_active: isActive,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl bg-surface border border-border shadow-popover p-6 text-charcoal space-y-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div>
            <h3 className="text-base font-semibold tracking-tight text-charcoal flex items-center gap-2">
              {rule ? 'Edit Automation' : 'New Instagram Automation'}
            </h3>
            <p className="text-xs text-charcoal-muted mt-0.5">
              Configure comment triggers, private DM replies, public responses, and follow gates.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-charcoal-muted hover:text-charcoal hover:bg-surface-hover transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          {/* Target Account & Automation Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-charcoal-muted mb-1.5">Target Account</label>
              <select
                value={accountId}
                onChange={e => setAccountId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-surface-subdued border border-border text-charcoal focus:outline-none focus-ring font-medium shadow-subtle cursor-pointer"
              >
                {accounts.map(a => (
                  <option key={a.id} value={a.id} className="bg-surface text-charcoal">
                    @{a.username}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium text-charcoal-muted mb-1.5">Automation Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Lead Magnet / Starter Kit"
                required
                className="w-full px-3 py-2 rounded-lg bg-surface-subdued border border-border text-charcoal placeholder:text-charcoal-light focus:outline-none focus-ring shadow-subtle"
              />
            </div>
          </div>

          {/* Visual Post / Reel Picker */}
          <div className="pt-4 border-t border-border">
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

          {/* Trigger Mode Section */}
          <div className="pt-4 border-t border-border space-y-3.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-xs text-charcoal flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-charcoal-muted" />
                <span>1. Comment Trigger Mode</span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTriggerType('keywords')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  triggerType === 'keywords'
                    ? 'bg-surface-subdued border-charcoal text-charcoal shadow-subtle'
                    : 'bg-surface border-border text-charcoal-muted hover:border-charcoal-muted'
                }`}
              >
                <div className="font-semibold text-xs text-charcoal flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${triggerType === 'keywords' ? 'bg-accent' : 'bg-charcoal-light'}`} />
                  Specific Keywords
                </div>
                <p className="text-[11px] text-charcoal-muted mt-1 leading-relaxed">
                  Trigger when a comment matches specific words or phrases.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setTriggerType('any_comment')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  triggerType === 'any_comment'
                    ? 'bg-surface-subdued border-charcoal text-charcoal shadow-subtle'
                    : 'bg-surface border-border text-charcoal-muted hover:border-charcoal-muted'
                }`}
              >
                <div className="font-semibold text-xs text-charcoal flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${triggerType === 'any_comment' ? 'bg-accent' : 'bg-charcoal-light'}`} />
                  Any Comment
                </div>
                <p className="text-[11px] text-charcoal-muted mt-1 leading-relaxed">
                  Trigger on every eligible top-level comment on this media.
                </p>
              </button>
            </div>

            {/* Keyword Mode Inputs */}
            {triggerType === 'keywords' && (
              <div className="p-4 rounded-xl bg-surface-subdued border border-border space-y-3.5">
                <div>
                  <label className="block font-medium text-charcoal-muted mb-1">
                    Trigger Keywords / Phrases (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={keywords}
                    onChange={e => setKeywords(e.target.value)}
                    placeholder="e.g. link, price, guide, send me, details"
                    required={triggerType === 'keywords'}
                    className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-charcoal placeholder:text-charcoal-light focus:outline-none focus-ring font-mono text-xs shadow-subtle"
                  />
                  <p className="mt-1 text-[11px] text-charcoal-muted">
                    Matches case-insensitively against user comments.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block font-medium text-charcoal-muted mb-1">Matching Precision</label>
                    <select
                      value={matchType}
                      onChange={e => setMatchType(e.target.value as MatchType)}
                      className="w-full px-3 py-1.5 rounded-lg bg-surface border border-border text-charcoal focus:outline-none focus-ring shadow-subtle cursor-pointer"
                    >
                      <option value="contains" className="bg-surface text-charcoal">Contains (Substring match)</option>
                      <option value="whole_word" className="bg-surface text-charcoal">Whole Word Match (Avoids partial words)</option>
                      <option value="exact" className="bg-surface text-charcoal">Exact Match (Entire comment)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium text-charcoal-muted mb-1">Keyword Logic</label>
                    <select
                      value={matchLogic}
                      onChange={e => setMatchLogic(e.target.value as MatchLogic)}
                      className="w-full px-3 py-1.5 rounded-lg bg-surface border border-border text-charcoal focus:outline-none focus-ring shadow-subtle cursor-pointer"
                    >
                      <option value="any" className="bg-surface text-charcoal">Match ANY configured keyword</option>
                      <option value="all" className="bg-surface text-charcoal">Match ALL configured terms</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Optional Exclusion List */}
            <div>
              <label className="block font-medium text-charcoal-muted mb-1">
                Optional Exclusion Keywords (Unwanted words)
              </label>
              <input
                type="text"
                value={excludeKeywords}
                onChange={e => setExcludeKeywords(e.target.value)}
                placeholder="e.g. spam, scam, fake, hate, refund"
                className="w-full px-3 py-1.5 rounded-lg bg-surface-subdued border border-border text-charcoal placeholder:text-charcoal-light focus:outline-none focus-ring font-mono text-xs shadow-subtle"
              />
              <p className="mt-1 text-[11px] text-charcoal-muted">
                Comments containing any of these words will be safely ignored.
              </p>
            </div>
          </div>

          {/* Action Selection Section */}
          <div className="pt-4 border-t border-border space-y-3.5">
            <label className="font-semibold text-xs text-charcoal flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-charcoal-muted" />
              <span>2. Supported Actions</span>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-colors ${
                sendDm ? 'bg-surface-subdued border-charcoal' : 'bg-surface border-border hover:border-charcoal-muted'
              }`}>
                <input
                  type="checkbox"
                  checked={sendDm}
                  onChange={e => setSendDm(e.target.checked)}
                  className="rounded border-border text-accent focus:ring-0 mt-0.5 cursor-pointer"
                />
                <div>
                  <span className="font-semibold text-xs text-charcoal">Private Reply (DM)</span>
                  <p className="text-[11px] text-charcoal-muted mt-0.5 leading-relaxed">
                    Dispatches a direct message to the user&apos;s inbox with your link/content.
                  </p>
                </div>
              </label>

              <label className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-colors ${
                sendComment ? 'bg-surface-subdued border-charcoal' : 'bg-surface border-border hover:border-charcoal-muted'
              }`}>
                <input
                  type="checkbox"
                  checked={sendComment}
                  onChange={e => setSendComment(e.target.checked)}
                  className="rounded border-border text-accent focus:ring-0 mt-0.5 cursor-pointer"
                />
                <div>
                  <span className="font-semibold text-xs text-charcoal">Public Comment Reply</span>
                  <p className="text-[11px] text-charcoal-muted mt-0.5 leading-relaxed">
                    Replies directly under the comment on Instagram so the user checks their DM.
                  </p>
                </div>
              </label>
            </div>

            {/* DM Template */}
            {sendDm && (
              <div className="p-4 rounded-xl bg-surface-subdued border border-border space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-medium text-charcoal-muted">Private Reply DM Message</label>
                  <div className="flex items-center gap-1.5 text-[11px] text-charcoal-muted">
                    <span>Insert:</span>
                    <button
                      type="button"
                      onClick={() => setTemplate(prev => prev + ' {{username}}')}
                      className="px-2 py-0.5 rounded bg-surface hover:bg-surface-hover text-charcoal border border-border text-[10px] font-mono transition-colors"
                    >
                      {`{{username}}`}
                    </button>
                    <button
                      type="button"
                      onClick={() => setTemplate(prev => prev + ' {{name}}')}
                      className="px-2 py-0.5 rounded bg-surface hover:bg-surface-hover text-charcoal border border-border text-[10px] font-mono transition-colors"
                    >
                      {`{{name}}`}
                    </button>
                  </div>
                </div>
                <textarea
                  rows={3}
                  value={template}
                  onChange={e => setTemplate(e.target.value)}
                  placeholder="Hey {{username}}! Here is the link you requested: https://..."
                  required={sendDm}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-charcoal placeholder:text-charcoal-light focus:outline-none focus-ring resize-none font-mono text-xs shadow-subtle"
                />
                <div className="p-2 rounded-lg bg-surface border border-border text-[11px] text-charcoal-muted">
                  <span className="font-medium text-charcoal">Meta Policy:</span> Exactly 1 private reply permitted per comment ID. Must be dispatched within 7 days.
                </div>
              </div>
            )}

            {/* Public Comment Reply Template */}
            {sendComment && (
              <div className="p-4 rounded-xl bg-surface-subdued border border-border space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-medium text-charcoal-muted">Public Comment Reply Message</label>
                  <button
                    type="button"
                    onClick={() => setCommentReplyTemplate(prev => prev + ' @{{username}}')}
                    className="px-2 py-0.5 rounded bg-surface hover:bg-surface-hover text-charcoal text-[10px] font-mono border border-border transition-colors"
                  >
                    {`@{{username}}`}
                  </button>
                </div>
                <input
                  type="text"
                  value={commentReplyTemplate}
                  onChange={e => setCommentReplyTemplate(e.target.value)}
                  placeholder="Sent to your DM! Check your requests 📩"
                  required={sendComment}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-charcoal placeholder:text-charcoal-light focus:outline-none focus-ring font-mono text-xs shadow-subtle"
                />
              </div>
            )}
          </div>

          {/* Follow Gate ("Follow to Unlock") */}
          <div className="pt-4 border-t border-border space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-semibold text-xs text-charcoal flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                  <span>3. Follow Gate (Optional &ldquo;Follow to Unlock&rdquo;)</span>
                </label>
                <p className="text-[11px] text-charcoal-muted mt-0.5">
                  Require the user to follow @{currentAccount?.username || 'account'} before unlocking the content.
                </p>
              </div>
              <input
                type="checkbox"
                id="follow_gate_toggle"
                checked={followGateEnabled}
                onChange={e => setFollowGateEnabled(e.target.checked)}
                className="w-4 h-4 rounded border-border text-accent focus:ring-0 cursor-pointer"
              />
            </div>

            {followGateEnabled && (
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-3.5">
                <div className="flex items-start gap-2 text-[11px] text-amber-800 dark:text-amber-300">
                  <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                  <span>
                    When enabled, AutoDm evaluates follower relationship. If verified as following, content delivers instantly.
                    Otherwise, a polite follow prompt is sent. When the user confirms, the content unlocks without loops.
                  </span>
                </div>

                <div>
                  <label className="block font-medium text-amber-900 dark:text-amber-200 mb-1">
                    Follow Prompt Message (Sent to non-followers)
                  </label>
                  <textarea
                    rows={2}
                    value={followPromptTemplate}
                    onChange={e => setFollowPromptTemplate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-surface border border-amber-300 dark:border-amber-700 text-charcoal focus:outline-none focus-ring resize-none font-mono text-xs shadow-subtle"
                  />
                  <p className="mt-1 text-[10px] text-amber-700 dark:text-amber-400 font-mono">
                    Profile link: https://instagram.com/{currentAccount?.username || 'account'}
                  </p>
                </div>

                <div>
                  <label className="block font-medium text-amber-900 dark:text-amber-200 mb-1">
                    Unlocked Content Message (Sent after follow / confirmation)
                  </label>
                  <textarea
                    rows={2}
                    value={followUnlockedTemplate}
                    onChange={e => setFollowUnlockedTemplate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-surface border border-amber-300 dark:border-amber-700 text-charcoal focus:outline-none focus-ring resize-none font-mono text-xs shadow-subtle"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Active status & Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={e => setIsActive(e.target.checked)}
                className="rounded border-border text-accent focus:ring-0 cursor-pointer"
              />
              <span className="text-charcoal-muted font-medium text-xs">Enable automation immediately</span>
            </label>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-lg border border-border hover:bg-surface-hover text-charcoal-muted hover:text-charcoal text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-1.5 rounded-lg bg-charcoal text-canvas dark:bg-[#ECECEC] dark:text-[#0A0A0B] hover:opacity-90 text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-subtle"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{loading ? 'Saving...' : 'Save Automation'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
