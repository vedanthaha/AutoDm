import React from 'react';
import { ExecutionStatus } from '@/lib/types';
import { CheckCircle2, XCircle, Clock, MinusCircle } from 'lucide-react';

interface Props {
  status: ExecutionStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: Props) {
  const isSm = size === 'sm';

  switch (status) {
    case 'delivered':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-md bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 ${isSm ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'}`}>
          <CheckCircle2 className="w-3.5 h-3.5" />
          Delivered
        </span>
      );
    case 'failed':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-md bg-rose-950/40 text-rose-400 border border-rose-800/40 ${isSm ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'}`}>
          <XCircle className="w-3.5 h-3.5" />
          Failed
        </span>
      );
    case 'pending':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-md bg-amber-950/40 text-amber-400 border border-amber-800/40 ${isSm ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'}`}>
          <Clock className="w-3.5 h-3.5 animate-pulse" />
          Pending
        </span>
      );
    case 'ignored':
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-md bg-zinc-900 text-zinc-400 border border-zinc-800 ${isSm ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'}`}>
          <MinusCircle className="w-3.5 h-3.5" />
          Ignored
        </span>
      );
  }
}
