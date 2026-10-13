'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { ConnectedAccount } from '@/lib/types';
import { SimulationModal } from './SimulationModal';
import { Sparkles, ExternalLink, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface Props {
  children: React.ReactNode;
  initialAccounts?: ConnectedAccount[];
  isLiveConfigured?: boolean;
}

export function AppShell({ children, initialAccounts = [], isLiveConfigured = false }: Props) {
  const [accounts, setAccounts] = useState<ConnectedAccount[]>(initialAccounts);
  const [activeAccountId, setActiveAccountId] = useState<string>(initialAccounts[0]?.id || '');
  const [isSimulationOpen, setIsSimulationOpen] = useState(false);

  useEffect(() => {
    // Refresh accounts from API
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
    <div className="flex h-screen overflow-hidden bg-zinc-950 text-zinc-100 antialiased font-sans">
      {/* Editorial Sidebar */}
      <Sidebar
        accounts={accounts}
        activeAccountId={activeAccountId}
        onSelectAccount={setActiveAccountId}
        isLive={isLiveConfigured}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Minimal Bar */}
        <header className="h-14 border-b border-zinc-800/80 px-6 flex items-center justify-between bg-zinc-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-400 font-medium">Active Account:</span>
            <span className="px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-200">
              {activeAccount?.username ? `@${activeAccount.username}` : 'No account connected'}
            </span>
            {activeAccount && (
              <>
                <span className="text-zinc-600">/</span>
                <span className="text-xs text-zinc-500">{activeAccount.name || 'Instagram'}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSimulationOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-200 font-medium flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulate Comment</span>
            </button>
            <Link
              href="/settings"
              className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <span>Setup Status</span>
            </Link>
          </div>
        </header>

        {/* Global Dev Mode Banner when not in Live mode */}
        {!isLiveConfigured && (
          <div className="bg-amber-950/30 border-b border-amber-800/40 px-6 py-2 flex items-center justify-between text-xs text-amber-300">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Demo Mode Active:</strong> Running with local fixtures. Real Meta webhooks require configuring environment variables in <code className="bg-amber-950 px-1 py-0.5 rounded font-mono text-[11px]">.env.local</code>.
              </span>
            </div>
            <Link href="/settings" className="underline hover:text-amber-100 flex items-center gap-1 shrink-0 font-medium">
              View Guide <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        )}

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>

      {/* Global Comment Simulator */}
      <SimulationModal
        isOpen={isSimulationOpen}
        onClose={() => setIsSimulationOpen(false)}
        accounts={accounts}
        activeAccountId={activeAccountId}
        onSuccess={() => {
          // Trigger custom event or refresh
          window.dispatchEvent(new Event('dispatch_updated'));
        }}
      />
    </div>
  );
}
