'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { ConnectedAccount } from '@/lib/types';
import { SimulationModal } from './SimulationModal';
import { ThemeProvider, ThemeToggle } from './ThemeProvider';
import { Sparkles, ExternalLink } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface Props {
  children: React.ReactNode;
  initialAccounts?: ConnectedAccount[];
  isLiveConfigured?: boolean;
}

export function AppShell({ children, initialAccounts = [] }: Props) {
  const [accounts, setAccounts] = useState<ConnectedAccount[]>(initialAccounts);
  const [activeAccountId, setActiveAccountId] = useState<string>(initialAccounts[0]?.id || '');
  const [isSimulationOpen, setIsSimulationOpen] = useState(false);

  useEffect(() => {
    fetch('/api/accounts')
      .then(res => res.json())
      .then(data => {
        if (data.accounts) {
          setAccounts(data.accounts);
          if (data.accounts.length > 0) {
            if (!activeAccountId || !data.accounts.find((a: ConnectedAccount) => a.id === activeAccountId)) {
              setActiveAccountId(data.accounts[0].id);
            }
          } else {
            setActiveAccountId('');
          }
        }
      })
      .catch(() => {});
  }, []);

  const activeAccount = accounts.find(a => a.id === activeAccountId) || accounts[0];

  return (
    <div className="flex h-screen overflow-hidden bg-canvas text-charcoal antialiased font-sans">
        {/* Compact Restrained Sidebar */}
        <Sidebar
          accounts={accounts}
          activeAccountId={activeAccountId}
          onSelectAccount={setActiveAccountId}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Restrained Top Navigation Bar */}
          <header className="h-13 border-b border-border px-6 flex items-center justify-between bg-surface shrink-0">
            <div className="flex items-center gap-2.5 text-xs text-charcoal-muted">
              <span className="font-medium text-charcoal">Active Profile:</span>
              {activeAccount ? (
                <div className="flex items-center gap-1.5 font-mono">
                  <span className="px-2 py-0.5 rounded-md bg-surface-subdued border border-border text-charcoal font-medium text-[11px]">
                    @{activeAccount.username}
                  </span>
                  <span className="text-charcoal-light">/</span>
                  <span className="text-[11px] text-charcoal-muted font-sans">{activeAccount.name || 'Professional Profile'}</span>
                </div>
              ) : (
                <span className="text-[11px] text-charcoal-light font-mono">No profile selected</span>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <ThemeToggle />
              <button
                onClick={() => setIsSimulationOpen(true)}
                className="px-2.5 py-1.5 rounded-md text-xs font-medium text-charcoal-muted hover:text-charcoal hover:bg-surface-hover transition-colors flex items-center gap-1.5"
                title="Test comment matching simulator"
              >
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                <span>Test Simulator</span>
              </button>

              <Link
                href="/settings"
                className="px-2.5 py-1.5 rounded-md text-xs font-medium text-charcoal-muted hover:text-charcoal hover:bg-surface-hover transition-colors"
              >
                System Settings
              </Link>
            </div>
          </header>

          {/* Scrollable Page Body */}
          <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-canvas">
            {children}
          </main>
        </div>

        {/* Simulation Modal */}
        <SimulationModal
          isOpen={isSimulationOpen}
          onClose={() => setIsSimulationOpen(false)}
          accounts={accounts}
          activeAccountId={activeAccountId}
          onSuccess={() => {
            window.dispatchEvent(new Event('dispatch_updated'));
          }}
        />
      </div>
  );
}
