import React from 'react';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

interface Props {
  isLive: boolean;
  className?: string;
}

export function ModeBadge({ isLive, className = '' }: Props) {
  if (isLive) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-950/50 text-emerald-300 border border-emerald-800/50 ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>LIVE MODE (Meta v26.0 & Supabase)</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-900 text-zinc-300 border border-zinc-700/60 shadow-sm ${className}`} title="Running with local fixtures without transmitting data to Meta">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
      <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
      <span>DEMO MODE (Simulated)</span>
    </div>
  );
}
