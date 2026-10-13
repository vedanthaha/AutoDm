'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';
import { Instagram, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!isSupabaseConfigured) {
      // In Demo Mode, allow instant login
      router.push('/dashboard');
      return;
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }
    }

    router.push('/dashboard');
  }

  function handleDemoAccess() {
    router.push('/dashboard');
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center p-6 text-zinc-100 antialiased font-sans">
      <div className="w-full max-w-sm space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-100 text-zinc-950 font-black text-sm tracking-tighter">
            AD
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">Sign in to AutoDm</h1>
          <p className="text-xs text-zinc-400">
            Automate Instagram comments and DMs for your brand
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@company.com"
              required={isSupabaseConfigured}
              className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-zinc-600"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-zinc-300">Password</label>
            </div>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required={isSupabaseConfigured}
              className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-zinc-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
          >
            {loading ? <span>Signing In...</span> : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast-Track Button */}
        {!isSupabaseConfigured && (
          <div className="pt-2 border-t border-zinc-800/80">
            <button
              type="button"
              onClick={handleDemoAccess}
              className="w-full py-2 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Enter Interactive Demo Mode</span>
            </button>
          </div>
        )}

        <p className="text-center text-xs text-zinc-500">
          Don't have an account?{' '}
          <Link href="/signup" className="text-zinc-300 hover:text-white underline font-medium">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
