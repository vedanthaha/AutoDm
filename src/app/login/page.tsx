'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';
import { ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { ThemeProvider, ThemeToggle } from '@/components/ThemeProvider';
import { MotionButton, fadeInUp } from '@/components/Motion';

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
    <div className="min-h-screen bg-canvas flex flex-col justify-center items-center p-6 text-charcoal antialiased font-sans relative">
        {/* Theme toggle in corner */}
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-full max-w-sm space-y-6"
        >
          {/* Brand */}
          <div className="text-center space-y-2">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Link href="/" className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-charcoal text-canvas font-bold text-sm tracking-tight shadow-2xs">
                AD
              </Link>
            </motion.div>
            <h1 className="text-xl font-semibold tracking-tight text-charcoal">Sign in to AutoDm</h1>
            <p className="text-xs text-charcoal-muted">
              Automate Instagram comments and private replies
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-xl bg-[--danger-bg] border border-[--danger-border] text-[--danger-text] text-xs flex items-center gap-2.5"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Card Form */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="p-6 rounded-2xl bg-surface border border-border shadow-card space-y-4"
          >
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-charcoal mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required={isSupabaseConfigured}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-xs text-charcoal placeholder:text-charcoal-light focus:outline-none focus:border-accent shadow-2xs no-transition"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-charcoal">Password</label>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required={isSupabaseConfigured}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-xs text-charcoal placeholder:text-charcoal-light focus:outline-none focus:border-accent shadow-2xs no-transition"
                />
              </div>

              <MotionButton
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg bg-charcoal hover:bg-charcoal/90 text-canvas text-xs font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
              >
                {loading ? <span>Signing In...</span> : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </MotionButton>
            </form>

            {/* Demo Fast-Track Button */}
            {!isSupabaseConfigured && (
              <div className="pt-3 border-t border-border">
                <MotionButton
                  type="button"
                  onClick={handleDemoAccess}
                  className="w-full py-2 px-3 rounded-lg bg-surface-subdued hover:bg-surface-hover border border-border text-xs text-charcoal font-medium flex items-center justify-center gap-2 transition-colors shadow-2xs"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>Enter Interactive Demo Mode</span>
                </MotionButton>
              </div>
            )}
          </motion.div>

          <p className="text-center text-xs text-charcoal-muted">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-charcoal hover:underline font-medium">
              Create an account
            </Link>
          </p>
        </motion.div>
      </div>
  );
}
