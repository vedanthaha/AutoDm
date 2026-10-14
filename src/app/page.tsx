'use client';

import Link from 'next/link';
import {
  Zap,
  MessageSquare,
  Shield,
  Instagram,
  ArrowRight,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  UserCheck,
  ListTree,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ThemeProvider, ThemeToggle } from '@/components/ThemeProvider';
import {
  MotionPage,
  MotionStagger,
  MotionItem,
  MotionCard,
  MotionButton,
  fadeInUp,
  fadeIn,
  scaleIn,
  staggerContainer,
  staggerItem,
} from '@/components/Motion';

function NavBar() {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-border"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-14">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-md bg-charcoal flex items-center justify-center text-canvas font-semibold text-xs tracking-tight shadow-xs">
            AD
          </div>
          <span className="font-semibold text-sm tracking-tight text-charcoal">AutoDm</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-6 text-xs font-medium text-charcoal-muted">
          <a href="#features" className="hover:text-charcoal transition-colors">Features</a>
          <a href="#follow-gate" className="hover:text-charcoal transition-colors">Follow Gate</a>
          <a href="#architecture" className="hover:text-charcoal transition-colors">Architecture</a>
          <a href="#faq" className="hover:text-charcoal transition-colors">FAQ</a>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/login"
            className="text-xs text-charcoal-muted hover:text-charcoal transition-colors font-medium px-2 py-1.5"
          >
            Sign In
          </Link>
          <Link
            href="/dashboard"
            className="px-3.5 py-1.5 rounded-lg bg-charcoal hover:bg-charcoal/90 text-canvas text-xs font-medium transition-colors shadow-xs"
          >
            Open Dashboard
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}

function HeroSection() {
  return (
    <section className="pt-28 pb-16 md:pt-36 md:pb-24 px-6 max-w-5xl mx-auto text-center space-y-6">
      {/* Pill Badge */}
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border text-[11px] font-mono text-charcoal-muted shadow-xs"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] pulse-dot" />
        <span>Official Meta Graph API • Instagram Login for Business</span>
      </motion.div>

      {/* Main Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-[-0.03em] text-charcoal leading-[1.08] max-w-3xl mx-auto"
      >
        Turn Instagram comments into{' '}
        <span className="gradient-text">instant conversations.</span>
      </motion.h1>

      {/* Subheading */}
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.45 }}
        className="text-base sm:text-lg text-charcoal-muted max-w-2xl mx-auto leading-relaxed font-normal"
      >
        Automate comment replies, private DMs, and Follow Gates across your posts and Reels. Built on official Meta APIs with atomic deduplication and real-time delivery logs.
      </motion.p>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.55 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3"
      >
        <MotionButton
          className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-charcoal hover:bg-charcoal/90 text-canvas text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-xs glow-accent"
          onClick={() => window.location.href = '/accounts'}
        >
          <span>Connect Instagram Account</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </MotionButton>
        <MotionButton
          className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-surface hover:bg-surface-hover border border-border text-charcoal text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
          onClick={() => window.location.href = '/dashboard'}
        >
          <Instagram className="w-3.5 h-3.5 text-charcoal-muted" />
          <span>Explore Live Studio</span>
        </MotionButton>
      </motion.div>

      {/* Trust Details */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="flex flex-wrap items-center justify-center gap-6 pt-4 text-[11px] text-charcoal-muted"
      >
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" /> No Facebook Page required
        </span>
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" /> Business &amp; Creator Profiles
        </span>
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" /> AES-256 encrypted tokens
        </span>
      </motion.div>
    </section>
  );
}

function ProductShowcase() {
  return (
    <section className="px-6 pb-20 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        viewport={{ once: true, margin: '-50px' }}
        className="rounded-2xl border border-border bg-surface shadow-popover overflow-hidden"
      >
        {/* Mock Window Top Bar */}
        <div className="px-4 py-3 border-b border-border bg-surface-subdued flex items-center justify-between text-xs text-charcoal-muted">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-border" />
              <span className="w-2.5 h-2.5 rounded-full bg-border" />
              <span className="w-2.5 h-2.5 rounded-full bg-border" />
            </div>
            <span className="text-[11px] font-mono text-charcoal-light ml-2">autodm.app / studio / @automation.normie</span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[--success-bg] text-[--success-text] border border-[--success-border]">
            Webhooks Subscribed
          </span>
        </div>

        {/* Studio Inner Interface Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border p-0 text-left">
          {/* Column 1: Targeted Media Item */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="p-6 space-y-4 bg-surface-subdued"
          >
            <div className="text-[10px] font-mono uppercase tracking-wider text-charcoal-light font-semibold">
              1. Selected Reel / Post
            </div>
            <div className="rounded-xl border border-border bg-surface p-3 space-y-3 shadow-2xs">
              <div className="aspect-square rounded-lg bg-surface-subdued overflow-hidden relative flex items-center justify-center text-charcoal-muted">
                <div className="text-center p-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-surface border border-border text-charcoal font-medium shadow-2xs">
                    REELS VIDEO
                  </span>
                  <p className="text-xs text-charcoal font-medium mt-3">
                    &ldquo;Comment LINK to unlock our complete automation playbook 🚀&rdquo;
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-charcoal-muted">
                <span>Status: <strong className="text-[--success-text]">Active</strong></span>
                <span>Oct 14, 2026</span>
              </div>
            </div>
          </motion.div>

          {/* Column 2: Inbound Event & Matching Rule */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            viewport={{ once: true }}
            className="p-6 space-y-4"
          >
            <div className="text-[10px] font-mono uppercase tracking-wider text-charcoal-light font-semibold">
              2. Inbound Comment &amp; Trigger
            </div>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl border border-border bg-canvas space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-charcoal">@alex_creator</span>
                  <span className="text-charcoal-light font-mono">Top-level comment</span>
                </div>
                <p className="text-charcoal font-medium bg-surface p-2 rounded-lg border border-border">
                  &ldquo;Please send me the link! Love this breakdown.&rdquo;
                </p>
              </div>

              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                viewport={{ once: true }}
                className="p-3 rounded-xl border border-[--success-border] bg-[--success-bg] space-y-1"
              >
                <div className="flex items-center gap-1.5 text-[--success-text] font-semibold text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mode B: Keyword Matched</span>
                </div>
                <p className="text-[11px] text-[--success-text] font-mono">
                  Matched &ldquo;link&rdquo; (whole word boundary)
                </p>
              </motion.div>

              <div className="p-2.5 rounded-lg border border-border bg-surface text-[11px] text-charcoal-muted flex items-center justify-between">
                <span>Follower Check:</span>
                <span className="font-semibold text-charcoal font-mono">FOLLOWS (Verified)</span>
              </div>
            </div>
          </motion.div>

          {/* Column 3: Instant Verified Delivery */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            viewport={{ once: true }}
            className="p-6 space-y-4 bg-surface"
          >
            <div className="text-[10px] font-mono uppercase tracking-wider text-charcoal-light font-semibold">
              3. Meta API Dispatches
            </div>
            <div className="space-y-3 text-xs">
              {/* Private DM Bubble */}
              <div className="p-3.5 rounded-xl border border-border bg-canvas space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-charcoal flex items-center gap-1">
                    <MessageSquare className="w-3 h-3 text-accent" />
                    Private Reply DM
                  </span>
                  <span className="text-[--success-text] font-mono text-[10px] font-medium">Delivered</span>
                </div>
                <div className="p-2.5 rounded-lg bg-surface border border-border text-charcoal leading-relaxed">
                  Hey @alex_creator! Here is the link you requested: <span className="text-accent underline font-medium">https://autodm.app/starter</span>
                </div>
                <div className="text-[10px] font-mono text-charcoal-light">
                  mid: 17841435016232737_992
                </div>
              </div>

              {/* Public Comment Reply */}
              <div className="p-3 rounded-xl border border-border bg-surface space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-medium text-charcoal-muted">Public Reply to Comment:</span>
                  <span className="text-[--success-text] font-mono text-[10px]">Published</span>
                </div>
                <p className="text-[11px] text-charcoal italic">
                  &ldquo;Sent to your DM! Check your requests 📩&rdquo;
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

function FeaturesSection() {
  const items = [
    {
      title: 'Flexible Trigger Engine',
      description: 'Choose Mode A to trigger on every top-level comment with exclusion filters, or Mode B for multi-keyword matching with whole-word unicode precision.',
      badge: 'Mode A & Mode B',
      icon: Zap,
    },
    {
      title: 'Follow Gate with Fallback',
      description: 'Optionally prompt commenters to follow your profile before unlocking high-value links. Uses genuine Meta follower checking with self-confirmation fallback.',
      badge: 'Follow to Unlock',
      icon: UserCheck,
    },
    {
      title: 'Complete Media Gallery',
      description: 'Cursor-based pagination across your entire catalog of published Posts, Reels, and Carousels. Never truncated at arbitrary limits.',
      badge: 'Full Catalog',
      icon: Layers,
    },
    {
      title: 'Traceable Audit Trail',
      description: 'Every webhook event is tracked from ingestion to delivery. Includes Meta message IDs, execution statuses, and sanitized error diagnostics.',
      badge: 'Zero Silent Failures',
      icon: ListTree,
    },
  ];

  return (
    <section id="features" className="py-20 px-6 max-w-5xl mx-auto border-t border-border">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="text-center max-w-2xl mx-auto space-y-3 mb-14"
      >
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-[-0.025em] text-charcoal">
          Engineered for restraint and reliability.
        </h2>
        <p className="text-sm text-charcoal-muted leading-relaxed">
          No simulations or fragile scraping. AutoDm strictly adheres to Meta Graph API compliance guidelines.
        </p>
      </motion.div>

      <MotionStagger className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <MotionCard
              key={idx}
              className="p-6 rounded-2xl border border-border bg-surface space-y-3 shadow-2xs hover:border-border-strong hover:shadow-card transition-all group cursor-default"
            >
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-surface-subdued border border-border text-charcoal-muted">
                  {item.badge}
                </span>
                <div className="w-8 h-8 rounded-lg bg-accent-muted flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                  <Icon className="w-4 h-4 text-accent" />
                </div>
              </div>
              <h3 className="text-base font-semibold text-charcoal tracking-tight">{item.title}</h3>
              <p className="text-xs text-charcoal-muted leading-relaxed font-normal">{item.description}</p>
            </MotionCard>
          );
        })}
      </MotionStagger>
    </section>
  );
}

function FAQSection() {
  const faqs = [
    {
      q: 'Does AutoDm require a Facebook Page to connect?',
      a: 'No. AutoDm uses official Instagram Login for Business. You connect directly with your Instagram Business or Creator account without managing Facebook Pages or manually creating developer apps.',
    },
    {
      q: 'How does Meta enforce the one-private-reply rule?',
      a: 'Meta Graph API strictly permits exactly one private reply per top-level comment ID within 7 days. AutoDm automatically deduplicates every event at the database level to ensure duplicate attempts are never sent.',
    },
    {
      q: 'How does the Follow Gate verify followers?',
      a: 'When an eligible Instagram-scoped user ID is available, AutoDm checks follower status via the official Graph API. If permissions are restricted or the status is UNKNOWN, AutoDm provides a polite self-confirmation fallback.',
    },
    {
      q: 'Can I send both a private DM and a public comment reply?',
      a: 'Yes. AutoDm supports DM only, comment reply only, or both operations simultaneously. You can customize templates with dynamic variables like {{username}} and {{account_username}}.',
    },
  ];

  return (
    <section id="faq" className="py-20 px-6 max-w-4xl mx-auto border-t border-border">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        viewport={{ once: true }}
        className="text-center space-y-2 mb-12"
      >
        <h2 className="text-2xl font-semibold tracking-[-0.02em] text-charcoal">Frequently Asked Questions</h2>
        <p className="text-xs text-charcoal-muted">Technical details on Meta Graph API compliance and workflow limitations.</p>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="divide-y divide-border border-y border-border"
      >
        {faqs.map((f, i) => (
          <motion.div
            key={i}
            variants={staggerItem}
            className="py-5 space-y-1.5 text-left"
          >
            <h3 className="text-sm font-semibold text-charcoal">{f.q}</h3>
            <p className="text-xs text-charcoal-muted leading-relaxed">{f.a}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-surface py-12 px-6 text-xs text-charcoal-muted">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded bg-charcoal flex items-center justify-center text-canvas font-semibold text-[10px]">
            AD
          </div>
          <span className="font-medium text-charcoal">AutoDm</span>
          <span className="text-charcoal-light font-mono text-[11px]">v1.0 • Meta Graph API v26.0</span>
        </div>

        <div className="flex items-center gap-6 font-medium">
          <Link href="/privacy" className="hover:text-charcoal transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-charcoal transition-colors">Terms of Service</Link>
          <Link href="/data-deletion" className="hover:text-charcoal transition-colors">Data Deletion</Link>
          <Link href="/login" className="hover:text-charcoal transition-colors">Sign In</Link>
        </div>

        <div className="text-[11px] text-charcoal-light font-mono">
          &copy; {new Date().getFullYear()} AutoDm Platform.
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas text-charcoal antialiased">
      <NavBar />
      <HeroSection />
      <ProductShowcase />
      <FeaturesSection />
      <FAQSection />
      <Footer />
    </div>
  );
}
