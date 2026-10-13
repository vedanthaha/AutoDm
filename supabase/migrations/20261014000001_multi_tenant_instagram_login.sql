-- ==============================================================================
-- AutoDm: Multi-Tenant Instagram Login for Business Migration & Upgrades
-- Version: 20261014000001
-- Scope: Schema hardening, idempotent alterations, trigger RPC, and strict RLS
-- ==============================================================================

-- 1. Ensure Connected Accounts Table & Columns
CREATE TABLE IF NOT EXISTS connected_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  instagram_user_id TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL,
  name TEXT,
  profile_picture_url TEXT,
  account_type TEXT DEFAULT 'BUSINESS' CHECK (account_type IN ('BUSINESS', 'CREATOR')),
  encrypted_access_token TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ,
  webhook_subscribed BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  permissions TEXT[] DEFAULT ARRAY['instagram_business_basic', 'instagram_business_manage_messages', 'instagram_business_manage_comments']::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Idempotent column migrations for existing instances
ALTER TABLE connected_accounts ADD COLUMN IF NOT EXISTS account_type TEXT DEFAULT 'BUSINESS';
ALTER TABLE connected_accounts ADD COLUMN IF NOT EXISTS webhook_subscribed BOOLEAN DEFAULT FALSE;
ALTER TABLE connected_accounts DROP COLUMN IF EXISTS facebook_page_id;
ALTER TABLE connected_accounts DROP COLUMN IF EXISTS facebook_page_name;

-- 2. Ensure Automation Rules Table & Columns
CREATE TABLE IF NOT EXISTS automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES connected_accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  trigger_keywords TEXT[] NOT NULL,
  reply_template TEXT NOT NULL,
  post_id TEXT,
  post_caption TEXT,
  post_thumbnail_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  match_type TEXT DEFAULT 'contains' CHECK (match_type IN ('contains', 'exact')),
  total_triggered INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE automation_rules ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE automation_rules ADD COLUMN IF NOT EXISTS post_thumbnail_url TEXT;

-- 3. Ensure Comment Dispatches Table & Columns
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

ALTER TABLE comment_dispatches ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 4. Multi-Tenant Performance Indexes
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON connected_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_ig_user_id ON connected_accounts(instagram_user_id);
CREATE INDEX IF NOT EXISTS idx_rules_user_id ON automation_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_rules_account_id ON automation_rules(account_id);
CREATE INDEX IF NOT EXISTS idx_rules_is_active ON automation_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_dispatches_user_id ON comment_dispatches(user_id);
CREATE INDEX IF NOT EXISTS idx_dispatches_account_id ON comment_dispatches(account_id);
CREATE INDEX IF NOT EXISTS idx_dispatches_status ON comment_dispatches(status);
CREATE INDEX IF NOT EXISTS idx_dispatches_created_at ON comment_dispatches(created_at DESC);

-- 5. Strict Row Level Security (RLS)
ALTER TABLE connected_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_dispatches ENABLE ROW LEVEL SECURITY;

-- Connected Accounts RLS
DROP POLICY IF EXISTS "Users can manage their own connected accounts" ON connected_accounts;
DROP POLICY IF EXISTS "Tenant accounts policy" ON connected_accounts;
CREATE POLICY "Tenant accounts policy"
  ON connected_accounts
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Automation Rules RLS
DROP POLICY IF EXISTS "Users can manage automation rules for their accounts" ON automation_rules;
DROP POLICY IF EXISTS "Tenant rules policy" ON automation_rules;
CREATE POLICY "Tenant rules policy"
  ON automation_rules
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Comment Dispatches RLS
DROP POLICY IF EXISTS "Users can read dispatches for their accounts" ON comment_dispatches;
DROP POLICY IF EXISTS "Tenant dispatches policy" ON comment_dispatches;
CREATE POLICY "Tenant dispatches policy"
  ON comment_dispatches
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6. Helper Function: Atomic increment of total_triggered count
CREATE OR REPLACE FUNCTION increment_rule_triggers(rule_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE automation_rules
  SET total_triggered = total_triggered + 1, updated_at = NOW()
  WHERE id = rule_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
