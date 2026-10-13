'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Instagram,
  Zap,
  ListTree,
  Settings,
  Radio
} from 'lucide-react';
import { AccountSwitcher } from './AccountSwitcher';
import { ConnectedAccount } from '@/lib/types';
import { ModeBadge } from './ModeBadge';

interface Props {
  accounts: ConnectedAccount[];
  activeAccountId: string;
  onSelectAccount: (id: string) => void;
  isLive: boolean;
}

export function Sidebar({ accounts, activeAccountId, onSelectAccount, isLive }: Props) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Accounts', href: '/accounts', icon: Instagram },
    { label: 'Automations', href: '/automations', icon: Zap },
    { label: 'Activity Log', href: '/activity', icon: ListTree },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-zinc-800/80 bg-zinc-950 flex flex-col h-screen shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-zinc-100 flex items-center justify-center text-zinc-950 font-bold text-xs tracking-tighter">
            AD
          </div>
          <span className="font-semibold text-sm tracking-tight text-zinc-100">AutoDm</span>
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60">
            v1.0
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-zinc-500 font-mono">
          <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
          <span>v26.0</span>
        </div>
      </div>

      {/* Account Switcher */}
      <div className="p-3 border-b border-zinc-800/80">
        <AccountSwitcher
          accounts={accounts}
          activeAccountId={activeAccountId}
          onSelect={onSelectAccount}
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-2 py-1 text-[10px] font-semibold tracking-wider uppercase text-zinc-500 font-mono">
          Platform
        </div>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-zinc-800/80 text-zinc-100 shadow-sm border border-zinc-700/50'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-zinc-100' : 'text-zinc-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Mode & Tier Footer */}
      <div className="p-3 border-t border-zinc-800/80 space-y-2 bg-zinc-950/60">
        <div className="flex items-center justify-between">
          <ModeBadge isLive={isLive} />
        </div>
        <div className="px-1 py-0.5 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
          <span>Cost Target:</span>
          <span className="text-zinc-300 font-medium">₹0/mo (Free Tier)</span>
        </div>
      </div>
    </aside>
  );
}
