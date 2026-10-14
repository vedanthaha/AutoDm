/**
 * AutoDm Core TypeScript Types & Models
 * Standardized on: Instagram Login for Business (graph.instagram.com)
 */

export type ExecutionStatus = 'pending' | 'delivered' | 'failed' | 'ignored';

export interface InstagramMedia {
  id: string;
  caption?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
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
  trigger_keywords: string[];
  reply_template: string;
  comment_reply_template?: string;
  post_id: string | null; // null = all posts & reels
  post_caption?: string;
  post_thumbnail_url?: string;
  is_active: boolean;
  match_type: 'contains' | 'exact';
  total_triggered: number;
  created_at: string;
  updated_at: string;
}

export interface CommentDispatch {
  comment_id: string;
  account_id: string;
  user_id?: string;
  author_username: string;
  author_id?: string;
  media_id?: string;
  comment_text: string;
  keyword_matched?: string;
  reply_text?: string;
  status: ExecutionStatus;
  meta_message_id?: string;
  meta_recipient_id?: string;
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
