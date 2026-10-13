'use client';

import React, { useState, useEffect } from 'react';
import {
  Filter,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  MinusCircle,
  Code
} from 'lucide-react';
import { CommentDispatch, ConnectedAccount, ExecutionStatus } from '@/lib/types';
import { StatusBadge } from '@/components/StatusBadge';

export default function ActivityLogPage() {
  const [dispatches, setDispatches] = useState<CommentDispatch[]>([]);
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDispatch, setSelectedDispatch] = useState<CommentDispatch | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('dispatch_updated', handleUpdate);
    return () => window.removeEventListener('dispatch_updated', handleUpdate);
  }, [selectedAccount]);

  async function loadData() {
    setLoading(true);
    try {
      const [accRes, dispRes] = await Promise.all([
        fetch('/api/accounts').then(r => r.json()),
        fetch(`/api/dispatches${selectedAccount ? `?account_id=${selectedAccount}` : ''}`).then(r => r.json()),
      ]);

      if (accRes.accounts) setAccounts(accRes.accounts);
      if (dispRes.dispatches) setDispatches(dispRes.dispatches);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // Filter logic
  const filteredDispatches = dispatches.filter(disp => {
    if (selectedStatus !== 'all' && disp.status !== selectedStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchAuthor = disp.author_username.toLowerCase().includes(q);
      const matchText = disp.comment_text.toLowerCase().includes(q);
      const matchKeyword = disp.keyword_matched?.toLowerCase().includes(q);
      if (!matchAuthor && !matchText && !matchKeyword) return false;
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Activity Log & Audit Trail</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Complete verification history of all inbound comment webhooks, keyword matches, and Meta API deliveries.
          </p>
        </div>
        <button
          onClick={loadData}
          className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 font-medium flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by username, comment text, or keyword..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'All Events' },
            { id: 'delivered', label: 'Delivered' },
            { id: 'failed', label: 'Failed' },
            { id: 'pending', label: 'Pending' },
            { id: 'ignored', label: 'Ignored' },
          ].map(st => (
            <button
              key={st.id}
              onClick={() => setSelectedStatus(st.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                selectedStatus === st.id
                  ? 'bg-zinc-100 text-zinc-950 font-semibold'
                  : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dispatches Table */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400 font-mono uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Comment Author</th>
                <th className="py-3 px-4">Comment Text</th>
                <th className="py-3 px-4">Trigger Matched</th>
                <th className="py-3 px-4">Delivered Message</th>
                <th className="py-3 px-4">Meta Trace / IDs</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredDispatches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-500 font-mono text-xs">
                    No matching activity records found.
                  </td>
                </tr>
              ) : (
                filteredDispatches.map(disp => (
                  <tr
                    key={disp.comment_id}
                    onClick={() => setSelectedDispatch(disp)}
                    className="hover:bg-zinc-800/40 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4">
                      <StatusBadge status={disp.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 font-semibold text-zinc-200 font-mono">
                      @{disp.author_username}
                    </td>
                    <td className="py-3 px-4 text-zinc-300 max-w-xs truncate">
                      "{disp.comment_text}"
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-emerald-400">
                      {disp.keyword_matched ? `"${disp.keyword_matched}"` : <span className="text-zinc-600">—</span>}
                    </td>
                    <td className="py-3 px-4 text-zinc-400 max-w-xs truncate font-mono text-[11px]">
                      {disp.reply_text ? disp.reply_text : <span className="text-zinc-600">—</span>}
                    </td>
                    <td className="py-3 px-4 font-mono text-[10px] text-zinc-500 truncate max-w-[140px]">
                      {disp.meta_message_id || (disp.error_code ? `Err: #${disp.error_code}` : '—')}
                    </td>
                    <td className="py-3 px-4 text-right text-zinc-500 font-mono text-[11px]">
                      {new Date(disp.created_at).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal / Drawer */}
      {selectedDispatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl bg-zinc-900 border border-zinc-800 p-6 text-zinc-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <StatusBadge status={selectedDispatch.status} />
                <span className="text-xs font-mono text-zinc-400">ID: {selectedDispatch.comment_id}</span>
              </div>
              <button
                onClick={() => setSelectedDispatch(null)}
                className="text-zinc-400 hover:text-white text-xs px-2 py-1 rounded bg-zinc-800"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-zinc-500 font-medium block">Author:</span>
                <span className="text-zinc-200 font-semibold">@{selectedDispatch.author_username}</span>
              </div>
              <div>
                <span className="text-zinc-500 font-medium block">Original Comment:</span>
                <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-300 font-mono mt-1">
                  "{selectedDispatch.comment_text}"
                </div>
              </div>

              {selectedDispatch.reply_text && (
                <div>
                  <span className="text-zinc-500 font-medium block">Delivered Private Reply:</span>
                  <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800 text-emerald-300 font-mono mt-1">
                    "{selectedDispatch.reply_text}"
                  </div>
                </div>
              )}

              {selectedDispatch.error_message && (
                <div>
                  <span className="text-rose-400 font-medium block">Meta API Error Diagnostics:</span>
                  <div className="p-2.5 rounded bg-rose-950/40 border border-rose-800/60 text-rose-300 font-mono text-[11px] mt-1 space-y-1">
                    <div>Error Code: #{selectedDispatch.error_code}</div>
                    <div>Message: {selectedDispatch.error_message}</div>
                    {selectedDispatch.fb_trace_id && <div>Trace ID: {selectedDispatch.fb_trace_id}</div>}
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-zinc-800 grid grid-cols-2 gap-2 text-[11px] font-mono text-zinc-400">
                <div>Meta Message ID: {selectedDispatch.meta_message_id || 'N/A'}</div>
                <div>Retries: {selectedDispatch.retry_count}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
