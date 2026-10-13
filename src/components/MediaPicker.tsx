'use client';

import React, { useState, useEffect } from 'react';
import { InstagramMedia } from '@/lib/types';
import { Video, Image as ImageIcon, Check, Layers, ExternalLink } from 'lucide-react';

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
    fetch(`/api/media?account_id=${accountId}`)
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
        <label className="block text-xs font-medium text-zinc-300">
          Target Post or Reel
        </label>
        <span className="text-[11px] text-zinc-500 font-mono">
          {selectedPostId ? 'Specific Content Selected' : 'Applies to All Posts & Reels'}
        </span>
      </div>

      {/* "All Posts" Option Button */}
      <button
        type="button"
        onClick={() => onSelect(null, 'All Posts & Reels', undefined)}
        className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between transition-colors ${
          !selectedPostId
            ? 'bg-zinc-800/90 border-zinc-600 text-white'
            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <Layers className="w-4 h-4 text-emerald-400" />
          <div>
            <p className="text-xs font-semibold">All Posts & Reels (Global Rule)</p>
            <p className="text-[10px] text-zinc-500">Triggers on any comment across your entire account</p>
          </div>
        </div>
        {!selectedPostId && <Check className="w-4 h-4 text-emerald-400" />}
      </button>

      {/* Visual Media Grid */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
          Or select a specific Post / Reel:
        </p>

        {loading ? (
          <div className="py-6 text-center text-xs text-zinc-500 font-mono animate-pulse">
            Loading your Instagram media gallery...
          </div>
        ) : media.length === 0 ? (
          <div className="py-6 text-center text-xs text-zinc-500 font-mono border border-dashed border-zinc-800 rounded-lg bg-zinc-950/40">
            No published posts or Reels found on this account yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto p-1 border border-zinc-800/80 rounded-lg bg-zinc-950/60">
            {media.map(item => {
              const isSelected = selectedPostId === item.id;
              const imgUrl = item.thumbnail_url || item.media_url;

              return (
                <div
                  key={item.id}
                  onClick={() => onSelect(item.id, item.caption?.slice(0, 50), imgUrl)}
                  className={`group relative rounded-lg border overflow-hidden cursor-pointer transition-all aspect-square flex flex-col justify-end p-2 ${
                    isSelected
                      ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                      : 'border-zinc-800 hover:border-zinc-600'
                  }`}
                >
                  {imgUrl ? (
                    <img
                      src={imgUrl}
                      alt={item.caption || 'Instagram Post'}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center text-zinc-600">
                      No Preview
                    </div>
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                  {/* Media Type Icon & Selection Check */}
                  <div className="relative z-10 flex items-center justify-between w-full">
                    <span className="p-1 rounded bg-black/60 text-white backdrop-blur-xs">
                      {item.media_type === 'VIDEO' ? (
                        <Video className="w-3 h-3 text-amber-400" />
                      ) : (
                        <ImageIcon className="w-3 h-3 text-zinc-300" />
                      )}
                    </span>
                    {isSelected && (
                      <span className="p-1 rounded-full bg-emerald-500 text-zinc-950">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  {/* Caption snippet */}
                  <p className="relative z-10 text-[9px] text-zinc-300 line-clamp-1 mt-1 font-sans">
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
