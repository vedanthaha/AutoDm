-- ==============================================================================
-- AutoDm: Supabase PostgreSQL Schema & Security Migration
-- Version: 20261013000001
-- Scope: Multi-Tenant Instagram Login for Business Base Schema
-- ==============================================================================

-- 1. Connected Instagram Professional Accounts (Tenant-isolated)
CREATE TABLE IF NOT EXISTS connected_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  instagram_user_id TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL,
  name TEXT,
  profile_picture_url TEXT,
  account_type TEXT DEFAULT 'BUSINESS' CHECK (account_type IN ('BUSINESS', 'CREATOR')),
  encrypted_access_token TEXT NOT NULL, -- AES-256-GCM encrypted long-lived token
  token_expires_at TIMESTAMPTZ,
  webhook_subscribed BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  permissions TEXT[] DEFAULT ARRAY['instagram_business_basic', 'instagram_business_manage_messages', 'instagram_business_manage_comments']::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Automation Rules (Keyword -> Private Reply Trigger)
CREATE TABLE IF NOT EXISTS automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES connected_accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  trigger_keywords TEXT[] NOT NULL,
  reply_template TEXT NOT NULL,
  post_id TEXT, -- NULL denotes All Posts & Reels
  post_caption TEXT,
  post_thumbnail_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  match_type TEXT DEFAULT 'contains' CHECK (match_type IN ('contains', 'exact')),
  total_triggered INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Idempotent Inbound Events & Dispatches
-- The PRIMARY KEY on comment_id enforces atomic deduplication at the database level.
CREATE TABLE IF NOT EXISTS comment_dispatches (
  comment_id TEXT PRIMARY KEY,
  account_id UUID REFERENCES connected_accounts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  author_username TEXT NOT NULL,
  author_id TEXT,
  media_id TEXT,
  comment_text TEXT,
  keyword_matched TEXT,
  reply_text TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'delivered', 'failed', 'ignored')),
  meta_message_id TEXT,
  meta_recipient_id TEXT,
  error_code INTEGER,
  error_message TEXT,
  fb_trace_id TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Indexes for Query Performance & Lookups
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON connected_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_ig_user_id ON connected_accounts(instagram_user_id);
CREATE INDEX IF NOT EXISTS idx_rules_user_id ON automation_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_rules_account_id ON automation_rules(account_id);
CREATE INDEX IF NOT EXISTS idx_rules_is_active ON automation_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_dispatches_user_id ON comment_dispatches(user_id);
CREATE INDEX IF NOT EXISTS idx_dispatches_account_id ON comment_dispatches(account_id);
CREATE INDEX IF NOT EXISTS idx_dispatches_status ON comment_dispatches(status);
CREATE INDEX IF NOT EXISTS idx_dispatches_created_at ON comment_dispatches(created_at DESC);

-- 5. Row Level Security (RLS)
ALTER TABLE connected_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_dispatches ENABLE ROW LEVEL SECURITY;

-- Connected Accounts Policies
DROP POLICY IF EXISTS "Users can manage their own connected accounts" ON connected_accounts;
CREATE POLICY "Users can manage their own connected accounts"
  ON connected_accounts
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Automation Rules Policies
DROP POLICY IF EXISTS "Users can manage automation rules for their accounts" ON automation_rules;
CREATE POLICY "Users can manage automation rules for their accounts"
  ON automation_rules
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Comment Dispatches Policies
DROP POLICY IF EXISTS "Users can read dispatches for their accounts" ON comment_dispatches;
CREATE POLICY "Users can read dispatches for their accounts"
  ON comment_dispatches
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
