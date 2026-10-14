'use client';

import React, { useState, useEffect } from 'react';
import { InstagramMedia } from '@/lib/types';
import { Video, Image as ImageIcon, Check, Layers } from 'lucide-react';

interface Props {
  accountId: string;
  selectedPostId: string | null;
  onSelect: (postId: string | null, caption?: string, thumbnailUrl?: string) => void;
}

export function MediaPicker({ accountId, selectedPostId, onSelect }: Props) {
  const [media, setMedia] = useState<InstagramMedia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/media?account_id=${accountId}&limit=40`)
      .then(r => r.json())
      .then(d => {
        if (d.media) setMedia(d.media);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [accountId]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-medium text-charcoal-muted">
          Target Post or Reel
        </label>
        <span className="text-[11px] text-charcoal-muted">
          {selectedPostId ? 'Specific media selected' : 'Applies to all posts & reels'}
        </span>
      </div>

      {/* "All Posts" Option Button */}
      <button
        type="button"
        onClick={() => onSelect(null, 'All Posts & Reels', undefined)}
        className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between transition-colors ${
          !selectedPostId
            ? 'bg-surface-subdued border-charcoal text-charcoal shadow-subtle'
            : 'bg-surface border-border text-charcoal-muted hover:text-charcoal hover:bg-surface-hover'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-surface-subdued border border-border flex items-center justify-center text-charcoal">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="text-xs font-medium text-charcoal">All Posts &amp; Reels (Global Automation)</p>
            <p className="text-[11px] text-charcoal-muted">Triggers on comments across all current and future posts</p>
          </div>
        </div>
        {!selectedPostId && (
          <span className="w-5 h-5 rounded-full bg-charcoal text-canvas dark:bg-[#ECECEC] dark:text-[#0A0A0B] flex items-center justify-center">
            <Check className="w-3 h-3 stroke-[2.5]" />
          </span>
        )}
      </button>

      {/* Visual Media Grid */}
      <div className="space-y-1.5">
        <p className="text-[11px] font-medium text-charcoal-muted">
          Or target a specific post or Reel:
        </p>

        {loading ? (
          <div className="py-8 text-center text-xs text-charcoal-muted animate-pulse bg-surface-subdued rounded-lg border border-border">
            Loading Instagram media library...
          </div>
        ) : media.length === 0 ? (
          <div className="py-8 text-center text-xs text-charcoal-muted border border-dashed border-border rounded-lg bg-surface-subdued">
            No published posts or Reels found for this account.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto p-1.5 border border-border rounded-lg bg-surface-subdued">
            {media.map(item => {
              const isSelected = selectedPostId === item.id;
              const imgUrl = item.thumbnail_url || item.media_url;

              return (
                <div
                  key={item.id}
                  onClick={() => onSelect(item.id, item.caption?.slice(0, 50), imgUrl)}
                  className={`group relative rounded-lg border overflow-hidden cursor-pointer transition-all aspect-square flex flex-col justify-end p-2 ${
                    isSelected
                      ? 'border-accent ring-2 ring-accent/20 bg-surface'
                      : 'border-border bg-surface hover:border-charcoal-muted'
                  }`}
                >
                  {imgUrl ? (
                    <img
                      src={imgUrl}
                      alt={item.caption || 'Instagram Post'}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-surface-subdued flex items-center justify-center text-xs text-charcoal-muted">
                      No Preview
                    </div>
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Media Type Icon & Selection Check */}
                  <div className="relative z-10 flex items-center justify-between w-full">
                    <span className="p-1 rounded bg-black/50 text-white backdrop-blur-xs">
                      {item.media_type === 'VIDEO' ? (
                        <Video className="w-3 h-3 text-white" />
                      ) : (
                        <ImageIcon className="w-3 h-3 text-white" />
                      )}
                    </span>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center shadow-sm">
                        <Check className="w-3 h-3 stroke-[2.5]" />
                      </span>
                    )}
                  </div>

                  {/* Caption snippet */}
                  <p className="relative z-10 text-[10px] text-white/90 line-clamp-1 mt-1 font-normal">
                    {item.caption || 'Untitled Media'}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
