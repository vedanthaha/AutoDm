'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  RefreshCw,
  Search,
  Plus,
  Zap,
  Video,
  Image as ImageIcon,
  Layers,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Copy,
  Trash2,
  Edit3,
  X,
  MessageSquare,
  ShieldCheck,
  UserCheck,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import {
  InstagramMedia,
  AutomationRule,
  CommentDispatch,
  ConnectedAccount,
  MediaPaging
} from '@/lib/types';
import { RuleModal } from '@/components/RuleModal';

export default function AccountMediaGalleryPage() {
  const params = useParams();
  const router = useRouter();
  const accountId = params?.id as string;

  // Account & Media State
  const [account, setAccount] = useState<ConnectedAccount | null>(null);
  const [allAccounts, setAllAccounts] = useState<ConnectedAccount[]>([]);
  const [mediaList, setMediaList] = useState<InstagramMedia[]>([]);
  const [paging, setPaging] = useState<MediaPaging>({ has_next: false });
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [dispatches, setDispatches] = useState<CommentDispatch[]>([]);

  // Loading & Error States
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Detail Modal / Panel State
  const [selectedPost, setSelectedPost] = useState<InstagramMedia | null>(null);
  const [postDispatches, setPostDispatches] = useState<CommentDispatch[]>([]);
  const [loadingPostDispatches, setLoadingPostDispatches] = useState(false);

  // Rule Modal State
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);

  useEffect(() => {
    if (accountId) {
      loadInitialData();
    }
  }, [accountId]);

  useEffect(() => {
    if (selectedPost) {
      loadDispatchesForPost(selectedPost.id);
    } else {
      setPostDispatches([]);
    }
  }, [selectedPost]);

  async function loadInitialData() {
    setLoadingInitial(true);
    setApiError(null);
    try {
      const [accRes, rulesRes, dispRes] = await Promise.all([
        fetch('/api/accounts').then(r => r.json()),
        fetch(`/api/automations?account_id=${accountId}`).then(r => r.json()),
        fetch(`/api/dispatches?account_id=${accountId}&limit=100`).then(r => r.json()).catch(() => ({ dispatches: [] })),
      ]);

      if (accRes.accounts) {
        setAllAccounts(accRes.accounts);
        const current = accRes.accounts.find((a: ConnectedAccount) => a.id === accountId);
        if (current) setAccount(current);
      }
      if (rulesRes.rules) setRules(rulesRes.rules);
      if (dispRes.dispatches) setDispatches(dispRes.dispatches);

      await loadMediaBatch();
    } catch (err) {
      console.error('[Gallery] Failed to load account data:', err);
      setApiError((err as Error).message);
    } finally {
      setLoadingInitial(false);
    }
  }

  async function loadMediaBatch(cursor?: string, isRefresh = false) {
    try {
      const queryParams = new URLSearchParams({
        account_id: accountId,
        limit: '24',
      });
      if (cursor) queryParams.set('after', cursor);
      if (isRefresh) queryParams.set('refresh', 'true');

      const res = await fetch(`/api/media?${queryParams.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        setApiError(data.error || 'Failed to retrieve media library from Instagram');
        return;
      }

      if (Array.isArray(data.media)) {
        if (cursor && !isRefresh) {
          setMediaList(prev => [...prev, ...data.media]);
        } else {
          setMediaList(data.media);
        }
      }

      setPaging(data.paging || { has_next: false });
    } catch (err) {
      console.error('[Gallery] Media fetch exception:', err);
      setApiError((err as Error).message);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    setApiError(null);
    try {
      await Promise.all([
        loadMediaBatch(undefined, true),
        fetch(`/api/automations?account_id=${accountId}`)
          .then(r => r.json())
          .then(d => { if (d.rules) setRules(d.rules); }),
        fetch(`/api/dispatches?account_id=${accountId}&limit=100`)
          .then(r => r.json())
          .then(d => { if (d.dispatches) setDispatches(d.dispatches); }),
      ]);
      if (selectedPost) {
        await loadDispatchesForPost(selectedPost.id);
      }
    } finally {
      setRefreshing(false);
    }
  }

  async function handleLoadMore() {
    if (!paging.has_next || !paging.cursors?.after || loadingMore) return;
    setLoadingMore(true);
    try {
      await loadMediaBatch(paging.cursors.after);
    } finally {
      setLoadingMore(false);
    }
  }

  async function loadDispatchesForPost(postId: string) {
    setLoadingPostDispatches(true);
    try {
      const res = await fetch(`/api/dispatches?media_id=${postId}&limit=15`);
      const data = await res.json();
      if (data.dispatches) {
        setPostDispatches(data.dispatches);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPostDispatches(false);
    }
  }

  async function handleToggleRule(rule: AutomationRule) {
    try {
      const res = await fetch('/api/automations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...rule, is_active: !rule.is_active }),
      });
      if (res.ok) {
        const updated = await fetch(`/api/automations?account_id=${accountId}`).then(r => r.json());
        if (updated.rules) setRules(updated.rules);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDuplicateRule(ruleId: string) {
    try {
      const res = await fetch('/api/automations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'duplicate', rule_id: ruleId }),
      });
      if (res.ok) {
        const updated = await fetch(`/api/automations?account_id=${accountId}`).then(r => r.json());
        if (updated.rules) setRules(updated.rules);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteRule(ruleId: string) {
    if (!confirm('Delete this automation rule? This action cannot be undone.')) {
      return;
    }
    try {
      const res = await fetch(`/api/automations?id=${ruleId}`, { method: 'DELETE' });
      if (res.ok) {
        const updated = await fetch(`/api/automations?account_id=${accountId}`).then(r => r.json());
        if (updated.rules) setRules(updated.rules);
      }
    } catch (err) {
      console.error(err);
    }
  }

  const mediaMetaMap = useMemo(() => {
    const map = new Map<string, {
      rules: AutomationRule[];
      status: 'Active' | 'Paused' | 'No automation' | 'Needs attention';
      lastDispatch?: CommentDispatch;
    }>();

    for (const item of mediaList) {
      const attachedRules = rules.filter(r => r.post_id === item.id);
      const latestDisp = dispatches.find(d => d.media_id === item.id);

      let status: 'Active' | 'Paused' | 'No automation' | 'Needs attention' = 'No automation';

      if (attachedRules.length > 0) {
        if (latestDisp && latestDisp.status === 'failed') {
          status = 'Needs attention';
        } else if (attachedRules.some(r => r.is_active)) {
          status = 'Active';
        } else {
          status = 'Paused';
        }
      }

      map.set(item.id, {
        rules: attachedRules,
        status,
        lastDispatch: latestDisp,
      });
    }

    return map;
  }, [mediaList, rules, dispatches]);

  const filteredMedia = useMemo(() => {
    return mediaList.filter(item => {
      if (selectedType !== 'all') {
        if (selectedType === 'REELS' && !(item.media_product_type === 'REELS' || item.media_type === 'VIDEO')) {
          return false;
        }
        if (selectedType === 'IMAGE' && item.media_type !== 'IMAGE') {
          return false;
        }
        if (selectedType === 'CAROUSEL_ALBUM' && item.media_type !== 'CAROUSEL_ALBUM') {
          return false;
        }
      }

      if (selectedStatus !== 'all') {
        const meta = mediaMetaMap.get(item.id);
        const st = meta ? meta.status.toLowerCase().replace(' ', '_') : 'no_automation';
        if (selectedStatus === 'active' && st !== 'active') return false;
        if (selectedStatus === 'paused' && st !== 'paused') return false;
        if (selectedStatus === 'none' && st !== 'no_automation') return false;
        if (selectedStatus === 'attention' && st !== 'needs_attention') return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const caption = (item.caption || '').toLowerCase();
        if (!caption.includes(q) && !item.id.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [mediaList, selectedType, selectedStatus, searchQuery, mediaMetaMap]);

  const selectedPostRules = useMemo(() => {
    if (!selectedPost) return [];
    return rules.filter(r => r.post_id === selectedPost.id);
  }, [selectedPost, rules]);

  const globalRules = useMemo(() => {
    return rules.filter(r => r.post_id === null);
  }, [rules]);

  function formatDate(isoString?: string) {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return '';
    }
  }

  function formatTimeAgo(isoString?: string) {
    if (!isoString) return '';
    try {
      const ms = Date.now() - new Date(isoString).getTime();
      const mins = Math.floor(ms / (1000 * 60));
      if (mins < 1) return 'just now';
      if (mins < 60) return `${mins}m ago`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs}h ago`;
      const days = Math.floor(hrs / 24);
      return `${days}d ago`;
    } catch {
      return '';
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Profile Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Link
            href="/accounts"
            className="p-1.5 rounded-lg bg-surface hover:bg-surface-subdued text-charcoal-muted hover:text-charcoal transition-colors border border-border shadow-2xs"
            title="Back to all profiles"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-charcoal-muted">Profiles</span>
              <span className="text-charcoal-light">/</span>
              <h1 className="text-base font-bold tracking-tight text-charcoal flex items-center gap-1.5">
                @{account?.username || 'instagram'}
                <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
              </h1>
            </div>
            <p className="text-xs text-charcoal-muted mt-0.5">
              Select any post or Reel to configure comment triggers, private replies, and Follow Gates.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {allAccounts.length > 1 && (
            <select
              value={accountId}
              onChange={e => router.push(`/accounts/${e.target.value}`)}
              className="px-2.5 py-1.5 rounded-lg bg-surface border border-border text-xs font-medium text-charcoal focus:outline-none shadow-2xs"
            >
              {allAccounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  @{acc.username}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-3 py-1.5 rounded-lg bg-surface hover:bg-surface-subdued border border-border text-xs text-charcoal-muted font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => {
              setEditingRule(null);
              setIsRuleModalOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-lg bg-[#191919] hover:bg-[#2E2E2E] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Automation</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {apiError && (
        <div className="p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C] text-xs flex items-start justify-between gap-3 shadow-2xs">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[#991B1B]">Media Retrieval Notice</p>
              <p className="text-[#B91C1C] mt-0.5">{apiError}</p>
            </div>
          </div>
          <button onClick={() => setApiError(null)} className="text-xs text-[#991B1B] hover:underline font-medium">
            Dismiss
          </button>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="p-3 rounded-xl bg-surface border border-border shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-charcoal-light absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by caption text or post ID..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-surface-subdued border border-border text-xs text-charcoal focus:outline-none focus:border-border placeholder:text-charcoal-light"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Format Filter */}
          <div className="flex items-center gap-0.5 bg-surface-subdued p-0.5 rounded-lg border border-border text-xs">
            {[
              { id: 'all', label: 'All Media' },
              { id: 'REELS', label: 'Reels' },
              { id: 'IMAGE', label: 'Photos' },
              { id: 'CAROUSEL_ALBUM', label: 'Carousels' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedType(t.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  selectedType === t.id
                    ? 'bg-surface text-charcoal font-semibold shadow-2xs'
                    : 'text-charcoal-muted hover:text-charcoal'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-0.5 bg-surface-subdued p-0.5 rounded-lg border border-border text-xs">
            {[
              { id: 'all', label: 'All Status' },
              { id: 'active', label: 'Active' },
              { id: 'paused', label: 'Paused' },
              { id: 'none', label: 'No Automation' },
              { id: 'attention', label: 'Needs Attention' },
            ].map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedStatus(s.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  selectedStatus === s.id
                    ? 'bg-surface text-charcoal font-semibold shadow-2xs'
                    : 'text-charcoal-muted hover:text-charcoal'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Media Grid */}
      {loadingInitial ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="rounded-xl border border-border bg-surface p-3 space-y-3 animate-pulse shadow-2xs">
              <div className="aspect-square rounded-lg bg-surface-subdued" />
              <div className="h-4 bg-surface-subdued rounded w-3/4" />
              <div className="h-3 bg-surface-subdued rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-surface space-y-3 shadow-2xs">
          <ImageIcon className="w-8 h-8 text-charcoal-light mx-auto" />
          <h3 className="text-sm font-semibold text-charcoal">No media found matching current filters</h3>
          <p className="text-xs text-charcoal-muted max-w-sm mx-auto">
            Try adjusting your search query, selecting &ldquo;All Media&rdquo;, or refresh the feed from Instagram.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedType('all');
              setSelectedStatus('all');
            }}
            className="px-3.5 py-1.5 rounded-lg bg-surface-subdued hover:bg-surface-subdued border border-border text-xs text-charcoal font-medium transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {filteredMedia.map(item => {
            const meta = mediaMetaMap.get(item.id);
            const status = meta?.status || 'No automation';
            const ruleCount = meta?.rules.length || 0;
            const imgUrl = item.thumbnail_url || item.media_url;
            const isReel = item.media_product_type === 'REELS' || item.media_type === 'VIDEO';

            return (
              <div
                key={item.id}
                onClick={() => setSelectedPost(item)}
                className={`group rounded-xl border bg-surface overflow-hidden cursor-pointer transition-all duration-150 flex flex-col justify-between shadow-2xs hover:shadow-card ${
                  selectedPost?.id === item.id
                    ? 'border-[#A33B56] ring-2 ring-[#A33B56]/15'
                    : 'border-border hover:border-border'
                }`}
              >
                {/* Media Image / Thumbnail */}
                <div className="relative aspect-square bg-surface-subdued overflow-hidden">
                  {imgUrl ? (
                    <img
                      src={imgUrl}
                      alt={item.caption || 'Instagram Post'}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-200"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-charcoal-light space-y-1">
                      <ImageIcon className="w-6 h-6" />
                      <span className="text-[10px] font-mono">No Preview</span>
                    </div>
                  )}

                  {/* Gradient Overlay for badges legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

                  {/* Type Badge Top Left */}
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-black/60 backdrop-blur-xs text-white border border-white/10 flex items-center gap-1">
                      {isReel ? (
                        <>
                          <Video className="w-3 h-3 text-amber-300" />
                          <span>REEL</span>
                        </>
                      ) : item.media_type === 'CAROUSEL_ALBUM' ? (
                        <>
                          <Layers className="w-3 h-3 text-cyan-300" />
                          <span>ALBUM</span>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-3 h-3 text-white" />
                          <span>POST</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Date Badge Top Right */}
                  {item.timestamp && (
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-black/60 backdrop-blur-xs text-white/90 border border-white/10">
                        {formatDate(item.timestamp)}
                      </span>
                    </div>
                  )}

                  {/* Hover Prompt */}
                  <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-3 py-1.5 rounded-lg bg-surface text-charcoal text-xs font-semibold flex items-center gap-1.5 shadow-md">
                      <Zap className="w-3.5 h-3.5 text-charcoal fill-[#191919]" />
                      <span>Configure Rules</span>
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-3.5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    {/* Status & Count Badges */}
                    <div className="flex items-center justify-between gap-2">
                      {status === 'Active' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0] flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                          Active
                        </span>
                      )}
                      {status === 'Paused' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A] flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
                          Paused
                        </span>
                      )}
                      {status === 'Needs attention' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA] flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-[#DC2626]" />
                          Needs attention
                        </span>
                      )}
                      {status === 'No automation' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F5F5F4] text-[#78716C] border border-border">
                          No automation
                        </span>
                      )}

                      <span className="text-[11px] text-charcoal-muted font-medium">
                        {ruleCount} {ruleCount === 1 ? 'rule' : 'rules'}
                      </span>
                    </div>

                    {/* Caption Preview */}
                    <p className="text-xs text-charcoal line-clamp-2 leading-relaxed">
                      {item.caption || <span className="italic text-charcoal-light">No caption provided</span>}
                    </p>
                  </div>

                  {/* Card Footer: Recent execution status */}
                  <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-charcoal-muted">
                    {meta?.lastDispatch ? (
                      <span className="flex items-center gap-1 truncate font-mono text-[10px]">
                        {meta.lastDispatch.status === 'delivered' ? (
                          <CheckCircle2 className="w-3 h-3 text-[#16A34A] shrink-0" />
                        ) : meta.lastDispatch.status === 'failed' ? (
                          <AlertTriangle className="w-3 h-3 text-[#DC2626] shrink-0" />
                        ) : (
                          <Clock className="w-3 h-3 text-[#D97706] shrink-0" />
                        )}
                        <span className="truncate">
                          {meta.lastDispatch.status} ({formatTimeAgo(meta.lastDispatch.created_at)})
                        </span>
                      </span>
                    ) : (
                      <span className="text-charcoal-light font-mono text-[10px]">No events</span>
                    )}

                    <ChevronRight className="w-3.5 h-3.5 text-charcoal-light group-hover:text-charcoal transition-colors" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Load More Control */}
      <div className="pt-4 flex flex-col items-center justify-center space-y-2">
        {paging.has_next ? (
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-5 py-2 rounded-lg bg-surface hover:bg-surface-subdued border border-border text-xs text-charcoal font-medium flex items-center gap-2 transition-colors disabled:opacity-50 shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingMore ? 'animate-spin' : ''}`} />
            <span>{loadingMore ? 'Retrieving next page...' : 'Load More Media'}</span>
          </button>
        ) : (
          mediaList.length > 0 && (
            <p className="text-xs text-charcoal-light font-mono text-center">
              ✓ All {mediaList.length} media items retrieved from Meta Graph API
            </p>
          )
        )}
      </div>

      {/* ========================================================================= */}
      {/* POST AUTOMATION STUDIO (Drawer / Modal) */}
      {/* ========================================================================= */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="w-full max-w-4xl max-h-[90vh] rounded-2xl bg-surface border border-border flex flex-col overflow-hidden shadow-popover animate-in zoom-in-95 duration-150"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 px-6 border-b border-border flex items-center justify-between bg-surface-subdued shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface-subdued border border-border overflow-hidden shrink-0">
                  {(selectedPost.thumbnail_url || selectedPost.media_url) ? (
                    <img
                      src={selectedPost.thumbnail_url || selectedPost.media_url}
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-charcoal-light">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-charcoal flex items-center gap-2">
                    Post Automation Studio
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-surface-subdued border border-border text-charcoal-muted">
                      ID: {selectedPost.id}
                    </span>
                  </h2>
                  <p className="text-xs text-charcoal-muted mt-0.5">
                    Profile @{account?.username} • Published {formatDate(selectedPost.timestamp)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={selectedPost.permalink}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1.5 rounded-lg bg-surface hover:bg-surface-subdued border border-border text-xs text-charcoal-muted font-medium flex items-center gap-1 transition-colors shadow-2xs"
                >
                  <span>Open on Instagram</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="p-1.5 rounded-lg text-charcoal-muted hover:text-charcoal hover:bg-surface-subdued transition-colors"
                  title="Close panel"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Media Preview Box */}
              <div className="p-4 rounded-xl bg-surface-subdued border border-border flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-32 aspect-square rounded-lg bg-surface-subdued overflow-hidden shrink-0 border border-border">
                  {(selectedPost.thumbnail_url || selectedPost.media_url) ? (
                    <img
                      src={selectedPost.thumbnail_url || selectedPost.media_url}
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-charcoal-light">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-charcoal-muted">
                    <span>Format: {selectedPost.media_product_type || selectedPost.media_type}</span>
                    <span>{selectedPost.comments_count !== undefined ? `${selectedPost.comments_count} comments` : ''}</span>
                  </div>
                  <p className="text-xs text-charcoal leading-relaxed font-sans whitespace-pre-wrap max-h-24 overflow-y-auto">
                    {selectedPost.caption || <span className="italic text-charcoal-light">No caption attached to this post.</span>}
                  </p>
                </div>
              </div>

              {/* Action Toolbar for Post */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal font-mono">
                    Automations Configured for this Media ({selectedPostRules.length})
                  </h3>
                  <p className="text-[11px] text-charcoal-muted">
                    Rules trigger exclusively when someone comments on this specific post or Reel.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingRule(null);
                    setIsRuleModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#191919] hover:bg-[#2E2E2E] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Attach Automation</span>
                </button>
              </div>

              {/* Attached Rules List */}
              {selectedPostRules.length === 0 ? (
                <div className="p-8 text-center rounded-xl border border-dashed border-border bg-surface-subdued space-y-2">
                  <Zap className="w-6 h-6 text-charcoal-light mx-auto" />
                  <p className="text-xs font-semibold text-charcoal">No direct automations attached to this media</p>
                  <p className="text-[11px] text-charcoal-muted max-w-sm mx-auto">
                    Create a targeted automation so anyone who comments with specific keywords (or any comment) gets an instant DM and comment reply.
                  </p>
                  <button
                    onClick={() => {
                      setEditingRule(null);
                      setIsRuleModalOpen(true);
                    }}
                    className="mt-2 px-3 py-1.5 rounded-lg bg-surface hover:bg-surface-subdued border border-border text-charcoal text-xs font-semibold transition-colors shadow-2xs"
                  >
                    + Create First Automation
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedPostRules.map(rule => (
                    <div
                      key={rule.id}
                      className="p-4 rounded-xl border border-border bg-surface space-y-4 shadow-2xs"
                    >
                      {/* Rule Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-charcoal">{rule.name}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                              rule.trigger_type === 'any_comment'
                                ? 'bg-[#EEF2FF] text-[#4338CA] border border-[#C7D2FE]'
                                : 'bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]'
                            }`}>
                              {rule.trigger_type === 'any_comment' ? 'MODE A: ANY COMMENT' : 'MODE B: KEYWORDS'}
                            </span>
                            {rule.follow_gate_enabled && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A] flex items-center gap-1 font-medium">
                                <UserCheck className="w-3 h-3 text-[#D97706]" />
                                FOLLOW GATE
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-charcoal-muted">
                            {rule.trigger_type === 'any_comment' ? (
                              <span>Triggers on <strong>every top-level comment</strong> on this post</span>
                            ) : (
                              <span>
                                Matches keywords: <code className="text-charcoal font-mono bg-surface-subdued px-1 py-0.5 rounded border border-border">{(rule.trigger_keywords || []).join(', ')}</code> ({rule.match_type}, {rule.match_logic} match)
                              </span>
                            )}
                          </p>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleRule(rule)}
                            className={`px-2.5 py-1 rounded-full text-xs font-medium font-mono transition-colors flex items-center gap-1.5 ${
                              rule.is_active
                                ? 'bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]'
                                : 'bg-[#F5F5F4] text-[#78716C] border border-border'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${rule.is_active ? 'bg-[#16A34A]' : 'bg-[#A8A29E]'}`} />
                            {rule.is_active ? 'Active' : 'Paused'}
                          </button>

                          <button
                            onClick={() => {
                              setEditingRule(rule);
                              setIsRuleModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-charcoal-muted hover:text-charcoal hover:bg-surface-subdued transition-colors"
                            title="Edit rule"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDuplicateRule(rule.id)}
                            className="p-1.5 rounded-lg text-charcoal-muted hover:text-charcoal hover:bg-surface-subdued transition-colors"
                            title="Duplicate rule"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteRule(rule.id)}
                            className="p-1.5 rounded-lg text-charcoal-light hover:text-[#B91C1C] hover:bg-[#FEF2F2] transition-colors"
                            title="Delete rule"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Rule Config Detail Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-border text-xs">
                        <div className="p-3 rounded-lg bg-surface-subdued border border-border space-y-1">
                          <span className="text-[10px] uppercase font-mono text-charcoal-muted font-semibold flex items-center gap-1">
                            <MessageSquare className="w-3 h-3 text-[#A33B56]" />
                            Private Reply DM Template:
                          </span>
                          <p className="text-charcoal text-xs font-mono bg-surface p-2 rounded border border-border">
                            {rule.reply_template}
                          </p>
                        </div>

                        <div className="p-3 rounded-lg bg-surface-subdued border border-border space-y-1">
                          <span className="text-[10px] uppercase font-mono text-charcoal-muted font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-[#16A34A]" />
                            Public Comment Reply Template:
                          </span>
                          <p className="text-charcoal text-xs font-mono bg-surface p-2 rounded border border-border">
                            {rule.send_comment ? (rule.comment_reply_template || 'None') : '(Disabled)'}
                          </p>
                        </div>
                      </div>

                      {rule.follow_gate_enabled && (
                        <div className="p-3 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] text-xs space-y-1">
                          <span className="text-[10px] uppercase font-mono text-[#B45309] font-semibold flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            Follow to Unlock Active
                          </span>
                          <p className="text-[#92400E] text-[11px] leading-relaxed">
                            Prompt: {rule.follow_prompt_template}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Global Rules Section (Informational) */}
              {globalRules.length > 0 && (
                <div className="p-4 rounded-xl bg-surface-subdued border border-border space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#A33B56]" />
                    <span className="text-xs font-semibold text-charcoal">
                      Global Account Rules ({globalRules.length})
                    </span>
                  </div>
                  <p className="text-[11px] text-charcoal-muted leading-relaxed">
                    You also have account-wide global automations configured. If a comment does not match any post-specific rule above, it will evaluate against your global triggers.
                  </p>
                </div>
              )}

              {/* Recent Activity for this Post */}
              <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal font-mono">
                    Recent Activity for this Media
                  </h3>
                  <Link
                    href={`/activity`}
                    className="text-xs text-charcoal-muted hover:text-charcoal flex items-center gap-1 font-medium"
                  >
                    <span>Full Activity Log</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>

                {loadingPostDispatches ? (
                  <div className="py-6 text-center text-xs text-charcoal-muted font-mono animate-pulse">
                    Loading execution events for this post...
                  </div>
                ) : postDispatches.length === 0 ? (
                  <div className="p-6 text-center rounded-xl border border-border bg-surface-subdued text-xs text-charcoal-muted font-mono">
                    No comment webhook events recorded for this post yet.
                  </div>
                ) : (
                  <div className="rounded-xl border border-border bg-surface overflow-hidden text-xs shadow-2xs">
                    <table className="w-full text-left">
                      <thead className="bg-surface-subdued border-b border-border text-[10px] font-mono text-charcoal-muted uppercase">
                        <tr>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3">Commenter</th>
                          <th className="py-2.5 px-3">Comment</th>
                          <th className="py-2.5 px-3">Matched</th>
                          <th className="py-2.5 px-3">Follow Gate</th>
                          <th className="py-2.5 px-3 text-right">Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F2F2EF] font-mono">
                        {postDispatches.map(disp => (
                          <tr key={disp.comment_id} className="hover:bg-surface-subdued">
                            <td className="py-2.5 px-3">
                              {disp.status === 'delivered' ? (
                                <span className="text-[#15803D] flex items-center gap-1 font-medium">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" /> Delivered
                                </span>
                              ) : disp.status === 'failed' ? (
                                <span className="text-[#B91C1C] flex items-center gap-1 font-medium" title={disp.error_message}>
                                  <AlertTriangle className="w-3 h-3" /> Failed
                                </span>
                              ) : (
                                <span className="text-charcoal-muted">{disp.status}</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-charcoal font-medium">@{disp.author_username}</td>
                            <td className="py-2.5 px-3 text-charcoal-muted font-sans max-w-xs truncate">{disp.comment_text}</td>
                            <td className="py-2.5 px-3 text-charcoal">
                              {disp.keyword_matched || (disp.trigger_type === 'any_comment' ? 'Any Comment' : '—')}
                            </td>
                            <td className="py-2.5 px-3 text-charcoal-muted">
                              {disp.follow_gate_status || 'skipped'}
                            </td>
                            <td className="py-2.5 px-3 text-right text-charcoal-light">
                              {formatTimeAgo(disp.created_at)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 px-6 border-t border-border flex items-center justify-between bg-surface-subdued shrink-0">
              <span className="text-xs text-charcoal-muted font-mono">
                Instant synchronization with live webhooks
              </span>
              <button
                onClick={() => setSelectedPost(null)}
                className="px-4 py-2 rounded-lg bg-surface hover:bg-surface-subdued border border-border text-charcoal text-xs font-semibold transition-colors shadow-2xs"
              >
                Close Studio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rule Creator / Editor Modal */}
      <RuleModal
        isOpen={isRuleModalOpen}
        onClose={() => {
          setIsRuleModalOpen(false);
          setEditingRule(null);
        }}
        rule={editingRule}
        accounts={account ? [account] : []}
        activeAccountId={accountId}
        defaultPostId={selectedPost ? selectedPost.id : null}
        defaultPostCaption={selectedPost ? (selectedPost.caption || 'Selected Media') : 'All Posts & Reels'}
        defaultPostThumbnailUrl={selectedPost ? (selectedPost.thumbnail_url || selectedPost.media_url) : undefined}
        onSaved={async () => {
          setIsRuleModalOpen(false);
          setEditingRule(null);
          const updated = await fetch(`/api/automations?account_id=${accountId}`).then(r => r.json());
          if (updated.rules) setRules(updated.rules);
        }}
      />
    </div>
  );
}
