import React from 'react';
import { ExecutionStatus } from '@/lib/types';
import { CheckCircle2, XCircle, Clock, MinusCircle, ArrowDownCircle, Target, Loader2 } from 'lucide-react';

interface Props {
  status: ExecutionStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: Props) {
  const isSm = size === 'sm';
  const pad = isSm ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  switch (status) {
    case 'delivered':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-md bg-[--success-bg] text-[--success-text] border border-[--success-border] ${pad}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] dark:bg-[#4ADE80]" />
          Delivered
        </span>
      );
    case 'failed':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-md bg-[--danger-bg] text-[--danger-text] border border-[--danger-border] ${pad}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] dark:bg-[#F87171]" />
          Failed
        </span>
      );
    case 'processing':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-md bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 ${pad}`}>
          <Loader2 className="w-3 h-3 animate-spin" />
          Processing
        </span>
      );
    case 'matched':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-md bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 ${pad}`}>
          <Target className="w-3 h-3" />
          Matched
        </span>
      );
    case 'received':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-md bg-surface-subdued text-charcoal-muted border border-border ${pad}`}>
          <ArrowDownCircle className="w-3 h-3" />
          Received
        </span>
      );
    case 'pending':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-md bg-[--warning-bg] text-[--warning-text] border border-[--warning-border] ${pad}`}>
          <Clock className="w-3 h-3 animate-pulse" />
          Pending
        </span>
      );
    case 'ignored':
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-md bg-surface-subdued text-charcoal-light border border-border ${pad}`}>
          <MinusCircle className="w-3 h-3" />
          Ignored
        </span>
      );
  }
}
