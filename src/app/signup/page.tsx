'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';
import { ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!isSupabaseConfigured) {
      router.push('/dashboard');
      return;
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        setSuccess(true);
      }
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center p-6 text-zinc-100 antialiased font-sans">
      <div className="w-full max-w-sm space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-100 text-zinc-950 font-black text-sm tracking-tighter">
            AD
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">Create your AutoDm account</h1>
          <p className="text-xs text-zinc-400">
            Start automating Instagram comment replies in under 2 minutes
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-center space-y-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <h3 className="text-sm font-bold text-white">Confirmation Email Sent</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Check your inbox at <strong className="text-zinc-200">{email}</strong> to verify your account and get started.
            </p>
            <Link
              href="/login"
              className="inline-block mt-2 px-4 py-2 rounded-lg bg-zinc-100 text-zinc-950 text-xs font-semibold"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Work Email</label>
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
              <label className="block text-xs font-medium text-zinc-300 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                required={isSupabaseConfigured}
                minLength={8}
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-zinc-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
            >
              {loading ? <span>Creating Account...</span> : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        )}

        <p className="text-center text-xs text-zinc-500">
          Already have an account?{' '}
          <Link href="/login" className="text-zinc-300 hover:text-white underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
