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
  ChevronRight
} from 'lucide-react';
import { AccountSwitcher } from './AccountSwitcher';
import { ConnectedAccount } from '@/lib/types';
import { motion } from 'framer-motion';

interface Props {
  accounts: ConnectedAccount[];
  activeAccountId: string;
  onSelectAccount: (id: string) => void;
  isLive?: boolean;
}

export function Sidebar({ accounts, activeAccountId, onSelectAccount }: Props) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Accounts & Media', href: '/accounts', icon: Instagram },
    { label: 'Automations', href: '/automations', icon: Zap },
    { label: 'Activity Log', href: '/activity', icon: ListTree },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <motion.aside
      initial={{ x: -10, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="w-60 border-r border-border bg-surface flex flex-col h-screen shrink-0 select-none"
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-charcoal flex items-center justify-center text-canvas font-semibold text-xs tracking-tight shadow-xs">
            AD
          </div>
          <div>
            <span className="font-semibold text-sm tracking-tight text-charcoal block leading-none">AutoDm</span>
            <span className="text-[10px] text-charcoal-muted mt-0.5 block font-medium">Instagram Studio</span>
          </div>
        </Link>
      </div>

      {/* Account Switcher */}
      <div className="p-3 border-b border-border">
        <AccountSwitcher
          accounts={accounts}
          activeAccountId={activeAccountId}
          onSelect={onSelectAccount}
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <div className="px-2.5 py-1.5 text-[10px] font-semibold tracking-wider uppercase text-charcoal-light">
          Workspace
        </div>
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));

          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.04 }}
            >
              <Link
                href={item.href}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-surface-subdued text-charcoal font-semibold shadow-subtle'
                    : 'text-charcoal-muted hover:text-charcoal hover:bg-surface-hover'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-accent' : 'text-charcoal-light'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-charcoal-light" />
                  </motion.div>
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Clean Footer */}
      <div className="p-3 border-t border-border bg-surface-subdued flex items-center justify-between text-[11px] text-charcoal-muted">
        <span className="font-medium">Meta Verified Graph API</span>
        <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] pulse-dot" title="API Connected" />
      </div>
    </motion.aside>
  );
}
