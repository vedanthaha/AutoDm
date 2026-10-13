import Link from 'next/link';
import {
  Zap,
  MessageSquare,
  Shield,
  Instagram,
  ArrowRight,
  CheckCircle2,
  Clock,
  Lock,
  BarChart3,
  Sparkles,
} from 'lucide-react';

export const metadata = {
  title: 'AutoDm — Automate Instagram Comment-to-DM Replies',
  description:
    'AutoDm turns Instagram comments into instant DM conversations. Connect your Professional account, set keyword triggers, and let AutoDm handle the rest. Built on the official Instagram API.',
};

function NavBar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-fuchsia-500 to-violet-600 flex items-center justify-center text-white font-black text-xs tracking-tighter shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/40 transition-shadow">
            AD
          </div>
          <span className="font-bold text-base tracking-tight text-white">AutoDm</span>
        </Link>
        <div className="hidden sm:flex items-center gap-6 text-sm text-zinc-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          <a href="#security" className="hover:text-white transition-colors">Security</a>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-zinc-300 hover:text-white transition-colors font-medium"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 text-white text-sm font-semibold transition-all shadow-lg shadow-violet-600/25 hover:shadow-violet-500/40"
          >
            Get Started Free
          </Link>
        </div>
      </div>
    </nav>
  );
}

function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden">
      {/* Gradient orbs */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-fuchsia-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-40 right-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-4xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Built on the Official Instagram Graph API</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
          Turn Instagram comments into{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-violet-400 to-indigo-400">
            instant DM conversations
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Set keyword triggers on your posts and Reels. When someone comments, AutoDm sends them a
          personalized DM automatically — all through Instagram&apos;s official API.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/signup"
            className="group px-6 py-3 rounded-xl bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 text-white font-semibold text-base flex items-center gap-2.5 transition-all shadow-xl shadow-violet-600/20 hover:shadow-violet-500/40"
          >
            Start Automating
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-semibold text-base flex items-center gap-2 transition-colors"
          >
            <Instagram className="w-4 h-4" />
            Sign In
          </Link>
        </div>

        <div className="flex items-center justify-center gap-6 pt-6 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> No credit card required</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Works with Business &amp; Creator</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Official Meta API</span>
        </div>
      </div>
    </section>
  );
}

const features = [
  {
    icon: Zap,
    title: 'Keyword Triggers',
    description: 'Define keywords per post or across all content. AutoDm detects matching comments and fires instantly.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
  },
  {
    icon: MessageSquare,
    title: 'Personalized DMs',
    description: 'Send templated messages with dynamic variables like {{username}}. Every reply feels personal and relevant.',
    color: 'text-fuchsia-400',
    bg: 'bg-fuchsia-500/10',
  },
  {
    icon: Shield,
    title: 'Official API Integration',
    description: 'Built on Instagram Login for Business. No scraping, no workarounds — fully compliant with Meta policies.',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
  },
  {
    icon: Lock,
    title: 'Encrypted Token Vault',
    description: 'Access tokens are encrypted at rest with AES-256-GCM. We never store plaintext credentials.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Activity Feed',
    description: 'See every comment match, DM delivery, and error in a live audit log. Full transparency over automation.',
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
  },
  {
    icon: Clock,
    title: 'Idempotent Processing',
    description: 'Database-level deduplication ensures every comment is processed exactly once, even under retry conditions.',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
  },
];

function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Everything you need to automate engagement
          </h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            From trigger configuration to delivery tracking — AutoDm handles the entire pipeline.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 hover:border-zinc-700/80 transition-colors group"
              >
                <div className={`w-10 h-10 rounded-xl ${f.bg} flex items-center justify-center mb-4`}>
                  <Icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{f.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const steps = [
  {
    step: '01',
    title: 'Connect Instagram',
    description: 'Click "Connect Instagram" and authorize through Instagram\'s official OAuth flow. We request only the permissions we need.',
  },
  {
    step: '02',
    title: 'Create Automations',
    description: 'Select a post or Reel, define trigger keywords, and write a DM template. Use variables like {{username}} for personalization.',
  },
  {
    step: '03',
    title: 'Activate & Monitor',
    description: 'Toggle your automation on. AutoDm listens for matching comments via webhooks and sends DMs automatically. Track results live.',
  },
];

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 px-6 bg-zinc-900/30">
      <div className="max-w-4xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Up and running in three steps
          </h2>
          <p className="text-zinc-400 text-lg">
            No complex setup. Connect, configure, and go.
          </p>
        </div>

        <div className="space-y-8">
          {steps.map((s) => (
            <div
              key={s.step}
              className="flex items-start gap-6 p-6 rounded-2xl bg-zinc-950 border border-zinc-800/60"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-600/20 to-violet-600/20 border border-violet-500/20 flex items-center justify-center text-violet-400 font-bold text-sm font-mono shrink-0">
                {s.step}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">{s.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SecuritySection() {
  return (
    <section id="security" className="py-24 px-6">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
          Built with security in mind
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="p-5 rounded-xl bg-zinc-900/50 border border-zinc-800/80">
            <Lock className="w-5 h-5 text-emerald-400 mb-3" />
            <h3 className="text-sm font-semibold text-white mb-1">AES-256-GCM Encryption</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              All Instagram access tokens are encrypted at rest. Plaintext tokens never touch the database.
            </p>
          </div>
          <div className="p-5 rounded-xl bg-zinc-900/50 border border-zinc-800/80">
            <Shield className="w-5 h-5 text-violet-400 mb-3" />
            <h3 className="text-sm font-semibold text-white mb-1">HMAC Signature Verification</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Every webhook payload is validated with timing-safe HMAC-SHA256 comparison before processing.
            </p>
          </div>
          <div className="p-5 rounded-xl bg-zinc-900/50 border border-zinc-800/80">
            <CheckCircle2 className="w-5 h-5 text-sky-400 mb-3" />
            <h3 className="text-sm font-semibold text-white mb-1">Row-Level Security</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Multi-tenant data isolation via Supabase RLS. Each user can only access their own accounts and data.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <div className="p-12 rounded-3xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800/80 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-fuchsia-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Ready to automate your Instagram engagement?
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto">
              Connect your Professional Instagram account and create your first automation in minutes.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 text-white font-semibold transition-all shadow-xl shadow-violet-600/20 hover:shadow-violet-500/40"
            >
              Create Free Account
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-zinc-800/60 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-fuchsia-500 to-violet-600 flex items-center justify-center text-white font-black text-[10px] tracking-tighter">
                AD
              </div>
              <span className="font-bold text-sm text-white">AutoDm</span>
            </div>
            <p className="text-xs text-zinc-500 max-w-xs">
              Comment-to-DM automation for Instagram Professional accounts. Built on the official Meta Instagram Graph API.
            </p>
          </div>

          <div className="flex gap-12">
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Product</h4>
              <div className="flex flex-col gap-2 text-xs text-zinc-500">
                <a href="#features" className="hover:text-zinc-300 transition-colors">Features</a>
                <a href="#how-it-works" className="hover:text-zinc-300 transition-colors">How It Works</a>
                <a href="#security" className="hover:text-zinc-300 transition-colors">Security</a>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Legal</h4>
              <div className="flex flex-col gap-2 text-xs text-zinc-500">
                <Link href="/privacy" className="hover:text-zinc-300 transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="hover:text-zinc-300 transition-colors">Terms of Service</Link>
                <Link href="/data-deletion" className="hover:text-zinc-300 transition-colors">Data Deletion</Link>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Account</h4>
              <div className="flex flex-col gap-2 text-xs text-zinc-500">
                <Link href="/login" className="hover:text-zinc-300 transition-colors">Sign In</Link>
                <Link href="/signup" className="hover:text-zinc-300 transition-colors">Create Account</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-600">
          <p>&copy; {new Date().getFullYear()} AutoDm. All rights reserved.</p>
          <p>
            Not affiliated with Meta Platforms, Inc. Instagram is a trademark of Meta Platforms, Inc.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
      <NavBar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <SecuritySection />
      <CTASection />
      <Footer />
    </div>
  );
}
