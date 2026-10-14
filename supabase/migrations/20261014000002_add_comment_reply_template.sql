-- ==============================================================================
-- AutoDm: Add Public Comment Reply Template Column Migration
-- Version: 20261014000002
-- Scope: Store custom public comment reply messages posted directly under Instagram comments
-- ==============================================================================

-- 1. Add comment_reply_template to automation_rules
-- When an automation triggers upon matching a keyword in a comment, AutoDm executes two actions:
--   a) Sends a Private Reply (Direct Message) to the commenter's Instagram inbox/requests.
--   b) Posts a Public Comment Reply directly under the user's comment on the Instagram post.
-- This ensures the commenter receives an instant notification and knows to check their DM requests,
-- while also providing visible social proof in the comment section.

ALTER TABLE automation_rules 
ADD COLUMN IF NOT EXISTS comment_reply_template TEXT DEFAULT 'Sent to your DM! Check your requests 📩';

-- 2. Performance & consistency check
COMMENT ON COLUMN automation_rules.comment_reply_template IS 'Template text for the public comment reply posted under the commenter on the media object.';
