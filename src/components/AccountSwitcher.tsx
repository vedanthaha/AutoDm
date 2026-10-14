'use client';

import React, { useState } from 'react';
import { ConnectedAccount } from '@/lib/types';
import { ChevronDown, Check, Instagram, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface Props {
  accounts: ConnectedAccount[];
  activeAccountId: string;
  onSelect: (accountId: string) => void;
}

export function AccountSwitcher({ accounts, activeAccountId, onSelect }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const activeAccount = accounts.find(a => a.id === activeAccountId) || accounts[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-2 rounded-lg bg-surface-subdued hover:bg-surface-hover border border-border transition-colors text-left group"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-full bg-surface border border-border flex items-center justify-center text-charcoal font-medium text-xs shrink-0 overflow-hidden shadow-2xs">
            {activeAccount?.profile_picture_url ? (
              <img src={activeAccount.profile_picture_url} alt={activeAccount.username} className="w-full h-full object-cover" />
            ) : (
              <Instagram className="w-3.5 h-3.5 text-charcoal-muted" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-charcoal truncate leading-tight">
              @{activeAccount?.username || 'No Account'}
            </p>
            <p className="text-[10px] text-charcoal-muted truncate leading-tight mt-0.5">
              {activeAccount?.name || 'Instagram Business'}
            </p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-3.5 h-3.5 text-charcoal-light group-hover:text-charcoal ml-1.5 shrink-0" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.97 }}
              transition={{ duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="absolute top-full left-0 right-0 mt-1.5 z-50 rounded-xl bg-surface border border-border shadow-popover overflow-hidden py-1 divide-y divide-border-subtle"
            >
              <div className="px-3 py-1.5 text-[10px] font-semibold tracking-wider uppercase text-charcoal-light">
                Connected Profiles
              </div>

              <div className="max-h-56 overflow-y-auto p-1">
                {accounts.length === 0 ? (
                  <div className="px-3 py-3 text-center text-xs text-charcoal-muted">
                    No accounts connected
                  </div>
                ) : (
                  accounts.map(account => {
                    const isSelected = account.id === activeAccountId;
                    return (
                      <button
                        key={account.id}
                        onClick={() => {
                          onSelect(account.id);
                          setIsOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                          isSelected ? 'bg-surface-subdued text-charcoal font-medium' : 'text-charcoal-muted hover:bg-surface-hover hover:text-charcoal'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-full bg-surface-subdued border border-border flex items-center justify-center text-[10px] shrink-0 overflow-hidden">
                            {account.profile_picture_url ? (
                              <img src={account.profile_picture_url} alt={account.username} className="w-full h-full object-cover" />
                            ) : (
                              <Instagram className="w-3 h-3 text-charcoal-muted" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs truncate">@{account.username}</p>
                            <p className="text-[10px] text-charcoal-light truncate">{account.name}</p>
                          </div>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-accent ml-2 shrink-0" />}
                      </button>
                    );
                  })
                )}
              </div>

              {activeAccount && (
                <div className="p-1.5 bg-surface-subdued">
                  <Link
                    href={`/accounts/${activeAccount.id}`}
                    onClick={() => setIsOpen(false)}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-accent hover:bg-accent-muted transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5" />
                      Open Media Gallery
                    </span>
                    <span>&rarr;</span>
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
