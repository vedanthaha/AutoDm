/**
 * AutoDm Core TypeScript Types & Models
 * Standardized on: Instagram Login for Business (graph.instagram.com)
 */

export type ExecutionStatus = 'received' | 'matched' | 'ignored' | 'pending' | 'processing' | 'delivered' | 'failed';
export type TriggerType = 'any_comment' | 'keywords';
export type MatchType = 'contains' | 'exact' | 'whole_word';
export type MatchLogic = 'any' | 'all';
export type ActionType = 'dm_only' | 'comment_only' | 'both';
export type FollowGateStatus = 'skipped' | 'follows' | 'does_not_follow' | 'unknown';
export type FollowCheckResult = 'FOLLOWS' | 'DOES_NOT_FOLLOW' | 'UNKNOWN';

export interface InstagramMedia {
  id: string;
  caption?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_product_type?: 'FEED' | 'REELS' | 'STORY';
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
  comments_count?: number;
  like_count?: number;
}

export interface MediaPaging {
  cursors?: {
    before?: string;
    after?: string;
  };
  next?: string;
  has_next: boolean;
}

export interface ConnectedAccount {
  id: string;
  user_id?: string;
  instagram_user_id: string;
  username: string;
  name: string;
  profile_picture_url?: string;
  account_type?: 'BUSINESS' | 'CREATOR';
  encrypted_access_token?: string;
  is_active: boolean;
  webhook_subscribed: boolean;
  token_expires_at?: string;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

export interface AutomationRule {
  id: string;
  user_id?: string;
  account_id: string;
  name: string;
  trigger_type?: TriggerType; // 'any_comment' | 'keywords' (default: 'keywords')
  trigger_keywords: string[];
  exclude_keywords?: string[]; // Optional exclusion list
  match_type: MatchType; // 'contains' | 'exact' | 'whole_word'
  match_logic?: MatchLogic; // 'any' | 'all'
  action_type?: ActionType; // 'dm_only' | 'comment_only' | 'both'
  send_dm?: boolean;
  send_comment?: boolean;
  reply_template: string; // Private Reply DM template
  comment_reply_template?: string; // Public comment reply template
  follow_gate_enabled?: boolean;
  follow_prompt_template?: string;
  follow_unlocked_template?: string;
  post_id: string | null; // null = all posts & reels
  post_caption?: string;
  post_thumbnail_url?: string;
  is_active: boolean;
  total_triggered: number;
  created_at: string;
  updated_at: string;
}

export interface CommentDispatch {
  comment_id: string;
  account_id: string;
  user_id?: string;
  rule_id?: string;
  rule_name?: string;
  author_username: string;
  author_id?: string;
  media_id?: string;
  comment_text: string;
  trigger_type?: TriggerType;
  action_type?: ActionType;
  keyword_matched?: string;
  reply_text?: string;
  comment_reply_text?: string;
  status: ExecutionStatus;
  private_reply_status?: 'pending' | 'delivered' | 'failed' | 'skipped';
  public_reply_status?: 'pending' | 'delivered' | 'failed' | 'skipped';
  follow_gate_status?: FollowGateStatus;
  meta_message_id?: string;
  meta_recipient_id?: string;
  meta_comment_id?: string;
  error_code?: number;
  error_message?: string;
  fb_trace_id?: string;
  retry_count: number;
  created_at: string;
  updated_at: string;
}

export interface MetaWebhookCommentValue {
  id: string;
  text: string;
  from?: {
    id: string;
    username: string;
  };
  media?: {
    id: string;
    media_product_type?: string;
  };
  parent_id?: string;
}

export interface MetaWebhookChange {
  field: string;
  value: MetaWebhookCommentValue;
}

export interface MetaWebhookEntry {
  id: string; // The Instagram Professional Account ID
  time: number;
  changes: MetaWebhookChange[];
}

export interface MetaWebhookPayload {
  object: string;
  entry: MetaWebhookEntry[];
}

export interface PrivateReplyResult {
  success: boolean;
  message_id?: string;
  recipient_id?: string;
  status?: number;
  error?: {
    message: string;
    type?: string;
    code?: number;
    error_subcode?: number;
    fbtrace_id?: string;
  };
  fb_trace_id?: string;
  simulation?: boolean;
}

export interface PublicCommentReplyResult {
  success: boolean;
  id?: string;
  status?: number;
  error?: {
    message: string;
    type?: string;
    code?: number;
    error_subcode?: number;
    fbtrace_id?: string;
  };
  fb_trace_id?: string;
}

export interface AppModeState {
  isLive: boolean;
  supabaseConfigured: boolean;
  metaConfigured: boolean;
  activeAccountId: string;
}
