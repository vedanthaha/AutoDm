'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';
import { ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { ThemeProvider, ThemeToggle } from '@/components/ThemeProvider';
import { MotionButton } from '@/components/Motion';

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
            <h1 className="text-xl font-semibold tracking-tight text-charcoal">Create your AutoDm account</h1>
            <p className="text-xs text-charcoal-muted">
              Start automating Instagram comment replies in under 2 minutes
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

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="p-6 rounded-2xl bg-surface border border-border shadow-card space-y-4"
          >
            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-3 py-2"
              >
                <CheckCircle2 className="w-8 h-8 text-[--success-text] mx-auto" />
                <h3 className="text-sm font-semibold text-charcoal">Confirmation Email Sent</h3>
                <p className="text-xs text-charcoal-muted leading-relaxed">
                  Check your inbox at <strong className="text-charcoal">{email}</strong> to verify your account and get started.
                </p>
                <Link
                  href="/login"
                  className="inline-block mt-2 px-4 py-2 rounded-lg bg-charcoal text-canvas text-xs font-medium"
                >
                  Back to Login
                </Link>
              </motion.div>
            ) : (
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-charcoal mb-1.5">Work Email</label>
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
                  <label className="block text-xs font-medium text-charcoal mb-1.5">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    required={isSupabaseConfigured}
                    minLength={8}
                    className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-xs text-charcoal placeholder:text-charcoal-light focus:outline-none focus:border-accent shadow-2xs no-transition"
                  />
                </div>

                <MotionButton
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-lg bg-charcoal hover:bg-charcoal/90 text-canvas text-xs font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
                >
                  {loading ? <span>Creating Account...</span> : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </MotionButton>
              </form>
            )}
          </motion.div>

          <p className="text-center text-xs text-charcoal-muted">
            Already have an account?{' '}
            <Link href="/login" className="text-charcoal hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
  );
}
