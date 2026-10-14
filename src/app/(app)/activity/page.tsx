'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  RefreshCw,
  CheckCircle2,
  X,
  MessageSquare,
  ShieldCheck,
  UserCheck,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { CommentDispatch, ConnectedAccount, AutomationRule } from '@/lib/types';
import { StatusBadge } from '@/components/StatusBadge';

export default function ActivityLogPage() {
  const [dispatches, setDispatches] = useState<CommentDispatch[]>([]);
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [rules, setRules] = useState<AutomationRule[]>([]);

  // Filter States
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all');
  const [selectedRuleId, setSelectedRuleId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedActionType, setSelectedActionType] = useState<string>('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Dispatch for Detailed Inspection Drawer
  const [selectedDispatch, setSelectedDispatch] = useState<CommentDispatch | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('dispatch_updated', handleUpdate);
    return () => window.removeEventListener('dispatch_updated', handleUpdate);
  }, [selectedAccountId, selectedRuleId, selectedStatus]);

  async function loadData() {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({ limit: '100' });
      if (selectedAccountId !== 'all') queryParams.set('account_id', selectedAccountId);
      if (selectedRuleId !== 'all') queryParams.set('rule_id', selectedRuleId);
      if (selectedStatus !== 'all') queryParams.set('status', selectedStatus);

      const [dispRes, accRes, rulesRes] = await Promise.all([
        fetch(`/api/dispatches?${queryParams.toString()}`).then(r => r.json()),
        fetch('/api/accounts').then(r => r.json()),
        fetch('/api/automations').then(r => r.json()),
      ]);

      if (dispRes.dispatches) setDispatches(dispRes.dispatches);
      if (accRes.accounts) setAccounts(accRes.accounts);
      if (rulesRes.rules) setRules(rulesRes.rules);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // Filter logic
  const filteredDispatches = useMemo(() => {
    const now = Date.now();
    return dispatches.filter(disp => {
      if (selectedAccountId !== 'all' && disp.account_id !== selectedAccountId) {
        return false;
      }

      if (selectedRuleId !== 'all' && disp.rule_id !== selectedRuleId) {
        return false;
      }

      if (selectedStatus !== 'all' && disp.status !== selectedStatus) {
        return false;
      }

      if (selectedActionType !== 'all') {
        if (selectedActionType === 'dm_only' && disp.action_type !== 'dm_only') return false;
        if (selectedActionType === 'comment_only' && disp.action_type !== 'comment_only') return false;
        if (selectedActionType === 'both' && disp.action_type !== 'both') return false;
      }

      if (selectedTimeRange !== 'all') {
        const itemTime = new Date(disp.created_at).getTime();
        const diffHours = (now - itemTime) / (1000 * 60 * 60);
        if (selectedTimeRange === 'today' && diffHours > 24) return false;
        if (selectedTimeRange === '7d' && diffHours > 24 * 7) return false;
        if (selectedTimeRange === '30d' && diffHours > 24 * 30) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchAuthor = (disp.author_username || '').toLowerCase().includes(q);
        const matchText = (disp.comment_text || '').toLowerCase().includes(q);
        const matchKeyword = (disp.keyword_matched || '').toLowerCase().includes(q);
        const matchRule = (disp.rule_name || '').toLowerCase().includes(q);
        const matchMedia = (disp.media_id || '').toLowerCase().includes(q);
        const matchTrace = (disp.fb_trace_id || '').toLowerCase().includes(q);
        const matchMessageId = (disp.meta_message_id || '').toLowerCase().includes(q);

        if (!matchAuthor && !matchText && !matchKeyword && !matchRule && !matchMedia && !matchTrace && !matchMessageId) {
          return false;
        }
      }

      return true;
    });
  }, [dispatches, selectedAccountId, selectedRuleId, selectedStatus, selectedActionType, selectedTimeRange, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-charcoal">Activity Log &amp; Audit Trail</h1>
          <p className="text-xs text-charcoal-muted mt-1">
            Complete lifecycle verification of inbound comment webhooks, keyword triggers, Meta API deliveries, and Follow Gate evaluations.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="px-3 py-1.5 rounded-lg bg-surface hover:bg-surface-hover border border-border text-xs text-charcoal font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-subtle"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* Multi-Dimensional Filter Toolbar */}
      <div className="p-3.5 rounded-2xl bg-surface border border-border space-y-3 shadow-subtle">
        {/* Top Row: Search & Status Quick Pills */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-charcoal-light absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by username, comment, keyword, rule, media ID, or Meta trace ID..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-surface-subdued border border-border text-xs text-charcoal focus:outline-none focus-ring placeholder:text-charcoal-light"
            />
          </div>

          {/* Quick Status Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 text-xs">
            {[
              { id: 'all', label: 'All Events' },
              { id: 'delivered', label: 'Delivered' },
              { id: 'failed', label: 'Failed' },
              { id: 'pending', label: 'Pending' },
              { id: 'processing', label: 'Processing' },
              { id: 'ignored', label: 'Ignored' },
            ].map(st => (
              <button
                key={st.id}
                onClick={() => setSelectedStatus(st.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors shrink-0 ${
                  selectedStatus === st.id
                    ? 'bg-charcoal text-canvas dark:bg-[#ECECEC] dark:text-[#0A0A0B] font-semibold shadow-subtle'
                    : 'bg-surface-subdued text-charcoal-muted hover:text-charcoal border border-border'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Row: Detailed Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border text-xs">
          {/* Account Filter */}
          <div className="flex items-center gap-1.5 bg-surface-subdued px-2.5 py-1 rounded-lg border border-border">
            <span className="text-[10px] uppercase font-mono text-charcoal-muted font-semibold">Account:</span>
            <select
              value={selectedAccountId}
              onChange={e => setSelectedAccountId(e.target.value)}
              className="bg-transparent text-charcoal text-xs font-medium focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-surface text-charcoal">All Accounts</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id} className="bg-surface text-charcoal">@{acc.username}</option>
              ))}
            </select>
          </div>

          {/* Rule Filter */}
          <div className="flex items-center gap-1.5 bg-surface-subdued px-2.5 py-1 rounded-lg border border-border">
            <span className="text-[10px] uppercase font-mono text-charcoal-muted font-semibold">Rule:</span>
            <select
              value={selectedRuleId}
              onChange={e => setSelectedRuleId(e.target.value)}
              className="bg-transparent text-charcoal text-xs font-medium focus:outline-none max-w-[160px] truncate cursor-pointer"
            >
              <option value="all" className="bg-surface text-charcoal">All Automations</option>
              {rules.map(r => (
                <option key={r.id} value={r.id} className="bg-surface text-charcoal">{r.name}</option>
              ))}
            </select>
          </div>

          {/* Action Type Filter */}
          <div className="flex items-center gap-1.5 bg-surface-subdued px-2.5 py-1 rounded-lg border border-border">
            <span className="text-[10px] uppercase font-mono text-charcoal-muted font-semibold">Action:</span>
            <select
              value={selectedActionType}
              onChange={e => setSelectedActionType(e.target.value)}
              className="bg-transparent text-charcoal text-xs font-medium focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-surface text-charcoal">All Actions</option>
              <option value="dm_only" className="bg-surface text-charcoal">DM Only</option>
              <option value="comment_only" className="bg-surface text-charcoal">Comment Reply Only</option>
              <option value="both" className="bg-surface text-charcoal">DM + Comment Reply</option>
            </select>
          </div>

          {/* Time Filter */}
          <div className="flex items-center gap-1.5 bg-surface-subdued px-2.5 py-1 rounded-lg border border-border">
            <Calendar className="w-3 h-3 text-charcoal-muted" />
            <select
              value={selectedTimeRange}
              onChange={e => setSelectedTimeRange(e.target.value)}
              className="bg-transparent text-charcoal text-xs font-medium focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-surface text-charcoal">All Time</option>
              <option value="today" className="bg-surface text-charcoal">Last 24 Hours</option>
              <option value="7d" className="bg-surface text-charcoal">Last 7 Days</option>
              <option value="30d" className="bg-surface text-charcoal">Last 30 Days</option>
            </select>
          </div>

          {(selectedAccountId !== 'all' || selectedRuleId !== 'all' || selectedStatus !== 'all' || selectedActionType !== 'all' || selectedTimeRange !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedAccountId('all');
                setSelectedRuleId('all');
                setSelectedStatus('all');
                setSelectedActionType('all');
                setSelectedTimeRange('all');
                setSearchQuery('');
              }}
              className="text-charcoal-muted hover:text-charcoal text-[11px] font-mono px-2 py-1 rounded hover:bg-surface-hover"
            >
              Reset Filters
            </button>
          )}

          <div className="ml-auto text-[11px] font-mono text-charcoal-light">
            {filteredDispatches.length} events recorded
          </div>
        </div>
      </div>

      {/* Dispatches Table */}
      <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-subdued border-b border-border text-charcoal-muted font-mono uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Comment Author</th>
                <th className="py-3 px-4">Comment Content</th>
                <th className="py-3 px-4">Trigger &amp; Keyword</th>
                <th className="py-3 px-4">Actions &amp; Delivery</th>
                <th className="py-3 px-4">Meta Trace / Message ID</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-mono">
              {filteredDispatches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-charcoal-muted font-mono text-xs">
                    No matching activity records found.
                  </td>
                </tr>
              ) : (
                filteredDispatches.map(disp => {
                  const account = accounts.find(a => a.id === disp.account_id);

                  return (
                    <tr
                      key={disp.comment_id}
                      onClick={() => setSelectedDispatch(disp)}
                      className="hover:bg-surface-hover transition-colors cursor-pointer group"
                    >
                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <StatusBadge status={disp.status} size="sm" />
                      </td>

                      {/* Author */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-semibold text-charcoal">
                          @{disp.author_username}
                        </div>
                        {account && (
                          <div className="text-[10px] text-charcoal-light font-mono">
                            to @{account.username}
                          </div>
                        )}
                      </td>

                      {/* Comment text */}
                      <td className="py-3 px-4 text-charcoal max-w-xs truncate font-sans">
                        &ldquo;{disp.comment_text}&rdquo;
                      </td>

                      {/* Trigger matched */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {disp.trigger_type === 'any_comment' ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                              ANY COMMENT
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-semibold">
                              {disp.keyword_matched ? `"${disp.keyword_matched}"` : 'KEYWORD'}
                            </span>
                          )}
                        </div>
                        {disp.rule_name && (
                          <div className="text-[10px] text-charcoal-muted truncate max-w-[130px] mt-0.5">
                            {disp.rule_name}
                          </div>
                        )}
                      </td>

                      {/* Actions & Follow Gate */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {disp.private_reply_status && (
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono ${
                              disp.private_reply_status === 'delivered'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                : disp.private_reply_status === 'failed'
                                ? 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-800'
                                : 'bg-surface-subdued text-charcoal-muted border border-border'
                            }`}>
                              DM: {disp.private_reply_status}
                            </span>
                          )}
                          {disp.public_reply_status && (
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono ${
                              disp.public_reply_status === 'delivered'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                : disp.public_reply_status === 'failed'
                                ? 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-800'
                                : 'bg-surface-subdued text-charcoal-muted border border-border'
                            }`}>
                              REPLY: {disp.public_reply_status}
                            </span>
                          )}
                          {disp.follow_gate_status && disp.follow_gate_status !== 'skipped' && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center gap-0.5 font-medium">
                              <UserCheck className="w-2.5 h-2.5" />
                              {disp.follow_gate_status}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Meta Trace / Message ID */}
                      <td className="py-3 px-4 text-charcoal-muted text-[10px] truncate max-w-[150px]">
                        {disp.meta_message_id ? (
                          <span className="text-charcoal">{disp.meta_message_id}</span>
                        ) : disp.error_message ? (
                          <span className="text-red-600 dark:text-red-400 truncate block" title={disp.error_message}>
                            Err #{disp.error_code}: {disp.error_message}
                          </span>
                        ) : (
                          '—'
                        )}
                        {disp.fb_trace_id && (
                          <div className="text-charcoal-light truncate text-[9px]">
                            trace: {disp.fb_trace_id}
                          </div>
                        )}
                      </td>

                      {/* Timestamp */}
                      <td className="py-3 px-4 text-right text-charcoal-muted text-[11px] whitespace-nowrap">
                        {new Date(disp.created_at).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DETAILED AUDIT INSPECTION MODAL */}
      {/* ========================================================================= */}
      {selectedDispatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full max-w-xl max-h-[90vh] rounded-2xl bg-surface border border-border text-charcoal flex flex-col overflow-hidden shadow-popover animate-in zoom-in-95 duration-150"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 px-6 border-b border-border flex items-center justify-between bg-surface-subdued shrink-0">
              <div className="flex items-center gap-2.5">
                <StatusBadge status={selectedDispatch.status} />
                <span className="text-xs font-mono text-charcoal-muted">
                  Event: {selectedDispatch.comment_id}
                </span>
              </div>
              <button
                onClick={() => setSelectedDispatch(null)}
                className="p-1 rounded-md text-charcoal-muted hover:text-charcoal hover:bg-surface-hover transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs font-mono">
              {/* Event Lifecycle Summary */}
              <div className="p-3.5 rounded-xl bg-surface-subdued border border-border space-y-2">
                <span className="text-[10px] uppercase font-mono text-charcoal-muted font-bold tracking-wider">
                  Traceable Event Lifecycle
                </span>
                <div className="grid grid-cols-2 gap-2 text-charcoal">
                  <div>
                    <span className="text-charcoal-light block text-[10px]">Author:</span>
                    <strong className="text-charcoal">@{selectedDispatch.author_username}</strong>
                    {selectedDispatch.author_id && <span className="text-[10px] text-charcoal-light block">ID: {selectedDispatch.author_id}</span>}
                  </div>
                  <div>
                    <span className="text-charcoal-light block text-[10px]">Target Media ID:</span>
                    <span className="text-charcoal truncate block">{selectedDispatch.media_id || 'All Posts'}</span>
                  </div>
                  <div>
                    <span className="text-charcoal-light block text-[10px]">Rule Trigger:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{selectedDispatch.rule_name || 'Automation'}</span>
                    <span className="text-[10px] text-charcoal-muted block">
                      {selectedDispatch.trigger_type === 'any_comment' ? 'Mode A (Any Comment)' : `Mode B (Keyword: "${selectedDispatch.keyword_matched || ''}")`}
                    </span>
                  </div>
                  <div>
                    <span className="text-charcoal-light block text-[10px]">Action Type:</span>
                    <span className="text-charcoal uppercase font-semibold">{selectedDispatch.action_type || 'DM'}</span>
                  </div>
                </div>
              </div>

              {/* Inbound Comment */}
              <div>
                <span className="text-charcoal-muted font-medium block mb-1">Inbound Comment Text:</span>
                <div className="p-3 rounded-xl bg-surface-subdued border border-border text-charcoal font-sans leading-relaxed text-xs">
                  &ldquo;{selectedDispatch.comment_text}&rdquo;
                </div>
              </div>

              {/* Delivered Private Reply DM */}
              {selectedDispatch.reply_text && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-accent font-semibold flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5" />
                      Dispatched Private Reply DM:
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                      Status: {selectedDispatch.private_reply_status || 'delivered'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-accent-muted border border-accent-border text-charcoal font-sans text-xs leading-relaxed">
                    {selectedDispatch.reply_text}
                  </div>
                </div>
              )}

              {/* Public Comment Reply */}
              {selectedDispatch.comment_reply_text && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Dispatched Public Comment Reply:
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                      Status: {selectedDispatch.public_reply_status || 'delivered'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-sans text-xs leading-relaxed">
                    {selectedDispatch.comment_reply_text}
                  </div>
                </div>
              )}

              {/* Follow Gate Evaluation */}
              {selectedDispatch.follow_gate_status && selectedDispatch.follow_gate_status !== 'skipped' && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-400 font-semibold">
                    <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>Follow to Unlock Evaluation</span>
                  </div>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300">
                    Result: <strong className="uppercase font-mono">{selectedDispatch.follow_gate_status}</strong>
                  </p>
                </div>
              )}

              {/* Meta API Diagnostics & Error */}
              {selectedDispatch.error_message && (
                <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 space-y-1 text-red-700 dark:text-red-400">
                  <div className="flex items-center gap-1.5 font-bold text-red-800 dark:text-red-300">
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <span>Meta Graph API Diagnostics</span>
                  </div>
                  <div className="text-[11px] space-y-0.5 text-red-700 dark:text-red-400 font-mono pt-1">
                    <div>Error Code: #{selectedDispatch.error_code}</div>
                    <div>Message: {selectedDispatch.error_message}</div>
                    {selectedDispatch.fb_trace_id && (
                      <div>Request Trace ID: {selectedDispatch.fb_trace_id}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Technical Audit Identifiers */}
              <div className="p-3 rounded-xl bg-surface-subdued border border-border text-[11px] grid grid-cols-2 gap-2 text-charcoal-muted">
                <div>
                  <span className="text-charcoal-light block text-[10px]">Meta Message ID:</span>
                  <span className="text-charcoal truncate block">{selectedDispatch.meta_message_id || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-charcoal-light block text-[10px]">Retry Count:</span>
                  <span className="text-charcoal">{selectedDispatch.retry_count} attempts</span>
                </div>
                <div>
                  <span className="text-charcoal-light block text-[10px]">Processed At:</span>
                  <span className="text-charcoal">{new Date(selectedDispatch.created_at).toISOString()}</span>
                </div>
                <div>
                  <span className="text-charcoal-light block text-[10px]">Trace ID:</span>
                  <span className="text-charcoal truncate block">{selectedDispatch.fb_trace_id || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 px-6 border-t border-border flex items-center justify-between bg-surface-subdued shrink-0">
              <span className="text-[11px] text-charcoal-muted font-mono">
                Immutable audit record • Meta compliance verified
              </span>
              <button
                onClick={() => setSelectedDispatch(null)}
                className="px-4 py-1.5 rounded-lg bg-surface hover:bg-surface-hover border border-border text-charcoal text-xs font-semibold transition-colors shadow-subtle"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
