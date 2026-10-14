import React from 'react';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

interface Props {
  isLive: boolean;
  className?: string;
}

export function ModeBadge({ isLive, className = '' }: Props) {
  if (isLive) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-[--success-bg] text-[--success-text] border border-[--success-border] ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] dark:bg-[#4ADE80] animate-ping" />
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>Live Mode</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-surface-subdued text-charcoal-muted border border-border ${className}`} title="Running with local fixtures without transmitting data to Meta">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
      <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
      <span>Demo Mode</span>
    </div>
  );
}
