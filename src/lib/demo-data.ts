/**
 * Demo Mode Fixtures
 *
 * Provides an interactive, realistic simulation of the two-account platform
 * when live Meta or Supabase credentials are not active.
 */

import { ConnectedAccount, AutomationRule, CommentDispatch } from './types';

export const DEMO_ACCOUNTS: ConnectedAccount[] = [
  {
    id: 'acc_demo_1',
    instagram_user_id: '178414055219901',
    username: 'buildbybits',
    name: 'BuildBybits Studio',
    profile_picture_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    account_type: 'BUSINESS',
    is_active: true,
    webhook_subscribed: true,
    token_expires_at: '2027-01-01T00:00:00Z',
    permissions: [
      'instagram_business_basic',
      'instagram_business_manage_messages',
      'instagram_business_manage_comments'
    ],
    created_at: '2026-10-01T10:00:00Z',
    updated_at: '2026-10-13T12:00:00Z'
  },
  {
    id: 'acc_demo_2',
    instagram_user_id: '178414088992211',
    username: 'normieautomation',
    name: 'Normie Automation Labs',
    profile_picture_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    account_type: 'CREATOR',
    is_active: true,
    webhook_subscribed: true,
    token_expires_at: '2026-12-15T00:00:00Z',
    permissions: [
      'instagram_business_basic',
      'instagram_business_manage_messages',
      'instagram_business_manage_comments'
    ],
    created_at: '2026-10-05T14:30:00Z',
    updated_at: '2026-10-13T15:45:00Z'
  }
];

export const DEMO_RULES: AutomationRule[] = [
  {
    id: 'rule_demo_1',
    account_id: 'acc_demo_1',
    name: 'Open Source Repo Dispatch',
    trigger_keywords: ['link', 'code', 'repo', 'github'],
    reply_template: 'Hey {{username}}! Here is the open-source repository link: https://github.com/buildbybits/starter',
    post_id: null,
    post_caption: 'All Posts & Reels',
    is_active: true,
    match_type: 'contains',
    total_triggered: 42,
    created_at: '2026-10-02T11:00:00Z',
    updated_at: '2026-10-13T14:20:00Z'
  },
  {
    id: 'rule_demo_2',
    account_id: 'acc_demo_1',
    name: 'PDF Growth Guide',
    trigger_keywords: ['guide', 'pdf', 'cheatsheet', 'download'],
    reply_template: 'Hey {{username}}! Check your DMs for the free 2026 growth checklist: https://buildbybits.com/guide',
    post_id: 'post_reel_99182',
    post_caption: 'Reel: How we scaled to 50k followers in 3 months',
    is_active: true,
    match_type: 'contains',
    total_triggered: 89,
    created_at: '2026-10-04T09:15:00Z',
    updated_at: '2026-10-13T16:00:00Z'
  },
  {
    id: 'rule_demo_3',
    account_id: 'acc_demo_2',
    name: 'Early Beta VIP Access',
    trigger_keywords: ['vip', 'beta', 'access', 'invite'],
    reply_template: 'Welcome {{username}}! You have been granted early VIP beta access: https://autodm.dev/invite',
    post_id: null,
    post_caption: 'All Posts & Reels',
    is_active: true,
    match_type: 'contains',
    total_triggered: 17,
    created_at: '2026-10-06T13:00:00Z',
    updated_at: '2026-10-12T18:30:00Z'
  },
  {
    id: 'rule_demo_4',
    account_id: 'acc_demo_2',
    name: 'Pricing & Demo Inquiry',
    trigger_keywords: ['pricing', 'cost', 'plan', 'demo'],
    reply_template: 'Hey {{username}}! AutoDm is 100% self-hosted & zero cost for 2 accounts. Watch our setup demo: https://autodm.dev/demo',
    post_id: null,
    post_caption: 'All Posts & Reels',
    is_active: false,
    match_type: 'contains',
    total_triggered: 6,
    created_at: '2026-10-08T15:20:00Z',
    updated_at: '2026-10-11T10:10:00Z'
  }
];

export const DEMO_DISPATCHES: CommentDispatch[] = [
  {
    comment_id: 'comment_180293847561001',
    account_id: 'acc_demo_1',
    author_username: 'alex_developer',
    media_id: '18116468645326656',
    comment_text: 'Send me the github repo link please!',
    keyword_matched: 'link',
    reply_text: 'Hey @alex_developer! Here is the open-source repository link: https://github.com/buildbybits/starter',
    status: 'delivered',
    meta_message_id: 'aWdfZ_m998124901',
    meta_recipient_id: '178414099218201',
    retry_count: 0,
    created_at: '2026-10-13T17:15:00Z',
    updated_at: '2026-10-13T17:15:02Z'
  },
  {
    comment_id: 'comment_180293847561002',
    account_id: 'acc_demo_1',
    author_username: 'sophia_codes',
    media_id: 'post_reel_99182',
    comment_text: 'Would love the growth guide! PDF link?',
    keyword_matched: 'guide',
    reply_text: 'Hey @sophia_codes! Check your DMs for the free 2026 growth checklist: https://buildbybits.com/guide',
    status: 'delivered',
    meta_message_id: 'aWdfZ_m998124902',
    meta_recipient_id: '178414099218202',
    retry_count: 0,
    created_at: '2026-10-13T16:45:00Z',
    updated_at: '2026-10-13T16:45:01Z'
  },
  {
    comment_id: 'comment_180293847561003',
    account_id: 'acc_demo_1',
    author_username: 'marcus_design',
    media_id: '18116468645326656',
    comment_text: 'Awesome visuals, what editor do you use?',
    status: 'ignored',
    retry_count: 0,
    created_at: '2026-10-13T16:10:00Z',
    updated_at: '2026-10-13T16:10:00Z'
  },
  {
    comment_id: 'comment_180293847561004',
    account_id: 'acc_demo_2',
    author_username: 'jordan_ai',
    media_id: '182293847561029',
    comment_text: 'Need beta access for this automation tool',
    keyword_matched: 'beta',
    reply_text: 'Welcome @jordan_ai! You have been granted early VIP beta access: https://autodm.dev/invite',
    status: 'delivered',
    meta_message_id: 'aWdfZ_m998124903',
    meta_recipient_id: '178414099218203',
    retry_count: 0,
    created_at: '2026-10-13T15:30:00Z',
    updated_at: '2026-10-13T15:30:02Z'
  },
  {
    comment_id: 'comment_180293847561005',
    account_id: 'acc_demo_1',
    author_username: 'unverified_public_user',
    media_id: '18116468645326656',
    comment_text: 'Send me the link',
    keyword_matched: 'link',
    reply_text: 'Hey @unverified_public_user! Here is the link...',
    status: 'failed',
    error_code: 230,
    error_message: '(#230) Permissions disallow message to this user (App in Dev Mode; user must be an assigned Instagram Tester)',
    fb_trace_id: 'AW_q8zJ01k9Lp',
    retry_count: 1,
    created_at: '2026-10-13T14:20:00Z',
    updated_at: '2026-10-13T14:20:01Z'
  }
];
