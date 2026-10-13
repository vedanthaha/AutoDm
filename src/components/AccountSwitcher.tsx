'use client';

import React, { useState } from 'react';
import { ConnectedAccount } from '@/lib/types';
import { ChevronDown, Check, Instagram } from 'lucide-react';

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
        className="w-full flex items-center justify-between p-2 rounded-lg bg-zinc-900/80 hover:bg-zinc-800/80 border border-zinc-800 transition-colors text-left group"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-zinc-300 font-semibold text-xs shrink-0 overflow-hidden">
            {activeAccount?.profile_picture_url ? (
              <img src={activeAccount.profile_picture_url} alt={activeAccount.username} className="w-full h-full object-cover" />
            ) : (
              <Instagram className="w-3.5 h-3.5" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-zinc-100 truncate">@{activeAccount?.username || 'No Account'}</p>
            <p className="text-[10px] text-zinc-500 truncate">{activeAccount?.name || 'Instagram Business'}</p>
          </div>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-200 transition-transform ml-1.5 shrink-0" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-lg bg-zinc-900 border border-zinc-800 shadow-xl overflow-hidden py-1">
            <div className="px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase text-zinc-500">
              Connected Accounts
            </div>
            {accounts.map(account => {
              const isSelected = account.id === activeAccountId;
              return (
                <button
                  key={account.id}
                  onClick={() => {
                    onSelect(account.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 text-left hover:bg-zinc-800/70 transition-colors ${isSelected ? 'bg-zinc-800/40 text-white' : 'text-zinc-300'}`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] shrink-0 overflow-hidden">
                      {account.profile_picture_url ? (
                        <img src={account.profile_picture_url} alt={account.username} className="w-full h-full object-cover" />
                      ) : (
                        <Instagram className="w-3 h-3 text-zinc-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">@{account.username}</p>
                      <p className="text-[10px] text-zinc-500 truncate">{account.name}</p>
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-zinc-200 ml-2 shrink-0" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
