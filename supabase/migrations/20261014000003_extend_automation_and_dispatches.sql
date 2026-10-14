-- ==============================================================================
-- AutoDm: Flexible Automation Builder, Follow Gate & Detailed Audit Logging
-- Version: 20261014000003
-- Scope: Multi-mode triggers, action combinations, follow gate, and granular lifecycle tracking
-- ==============================================================================

-- 1. Extend automation_rules with Trigger Modes, Match Logic, Actions & Follow Gate
ALTER TABLE automation_rules
ADD COLUMN IF NOT EXISTS trigger_type TEXT DEFAULT 'keywords';

ALTER TABLE automation_rules
ADD COLUMN IF NOT EXISTS exclude_keywords TEXT[] DEFAULT '{}';

ALTER TABLE automation_rules
ADD COLUMN IF NOT EXISTS match_logic TEXT DEFAULT 'any';

ALTER TABLE automation_rules
ADD COLUMN IF NOT EXISTS action_type TEXT DEFAULT 'both';

ALTER TABLE automation_rules
ADD COLUMN IF NOT EXISTS send_dm BOOLEAN DEFAULT TRUE;

ALTER TABLE automation_rules
ADD COLUMN IF NOT EXISTS send_comment BOOLEAN DEFAULT TRUE;

ALTER TABLE automation_rules
ADD COLUMN IF NOT EXISTS follow_gate_enabled BOOLEAN DEFAULT FALSE;

ALTER TABLE automation_rules
ADD COLUMN IF NOT EXISTS follow_prompt_template TEXT DEFAULT 'Hey {{username}}! Follow our account @{{account_username}} to unlock your link 🚀 Then tap below!';

ALTER TABLE automation_rules
ADD COLUMN IF NOT EXISTS follow_unlocked_template TEXT;

-- Drop and recreate match_type check constraint to safely allow 'whole_word'
DO $$
BEGIN
  ALTER TABLE automation_rules DROP CONSTRAINT IF EXISTS automation_rules_match_type_check;
  ALTER TABLE automation_rules ADD CONSTRAINT automation_rules_match_type_check 
    CHECK (match_type IN ('contains', 'exact', 'whole_word'));
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- 2. Extend comment_dispatches with Granular Audit and Lifecycle Fields
ALTER TABLE comment_dispatches
ADD COLUMN IF NOT EXISTS rule_id UUID REFERENCES automation_rules(id) ON DELETE SET NULL;

ALTER TABLE comment_dispatches
ADD COLUMN IF NOT EXISTS rule_name TEXT;

ALTER TABLE comment_dispatches
ADD COLUMN IF NOT EXISTS trigger_type TEXT DEFAULT 'keywords';

ALTER TABLE comment_dispatches
ADD COLUMN IF NOT EXISTS action_type TEXT DEFAULT 'both';

ALTER TABLE comment_dispatches
ADD COLUMN IF NOT EXISTS private_reply_status TEXT DEFAULT 'skipped';

ALTER TABLE comment_dispatches
ADD COLUMN IF NOT EXISTS public_reply_status TEXT DEFAULT 'skipped';

ALTER TABLE comment_dispatches
ADD COLUMN IF NOT EXISTS meta_comment_id TEXT;

ALTER TABLE comment_dispatches
ADD COLUMN IF NOT EXISTS follow_gate_status TEXT DEFAULT 'skipped';

-- 3. Performance Indexes for Media Library & Granular Activity Queries
CREATE INDEX IF NOT EXISTS idx_rules_post_id ON automation_rules(post_id);
CREATE INDEX IF NOT EXISTS idx_dispatches_media_id ON comment_dispatches(media_id);
CREATE INDEX IF NOT EXISTS idx_dispatches_rule_id ON comment_dispatches(rule_id);
CREATE INDEX IF NOT EXISTS idx_dispatches_trigger_type ON comment_dispatches(trigger_type);
CREATE INDEX IF NOT EXISTS idx_dispatches_action_type ON comment_dispatches(action_type);
