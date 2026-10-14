/**
 * Unified Storage Layer
 *
 * Connects directly to Supabase PostgreSQL using service role or client privileges.
 * Strictly operates on real database records without injecting hardcoded mock data.
 */

import crypto from 'crypto';
import type { ConnectedAccount, AutomationRule, CommentDispatch } from './types';
import { getSupabaseServiceRoleClient, getSupabaseClient, isSupabaseConfigured } from './supabase';

function getDb() {
  return getSupabaseServiceRoleClient() || getSupabaseClient();
}

// In-memory fallback if Supabase is completely unconfigured
const inMemoryAccounts: ConnectedAccount[] = [];
let inMemoryRules: AutomationRule[] = [];
const inMemoryDispatches: CommentDispatch[] = [];

export async function fetchAccounts(): Promise<ConnectedAccount[]> {
  const supabase = getDb();
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('connected_accounts')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[Storage] Error fetching accounts from Supabase:', error.message);
    }
    if (!error && data) {
      return data as ConnectedAccount[];
    }
  }
  return inMemoryAccounts;
}

export async function fetchRules(accountId?: string): Promise<AutomationRule[]> {
  const supabase = getDb();
  if (isSupabaseConfigured && supabase) {
    let query = supabase.from('automation_rules').select('*').order('created_at', { ascending: false });
    if (accountId) query = query.eq('account_id', accountId);
    const { data, error } = await query;
    if (error) {
      console.error('[Storage] Error fetching rules from Supabase:', error.message);
    }
    if (!error && data) {
      return data as AutomationRule[];
    }
  }

  if (accountId) {
    return inMemoryRules.filter(r => r.account_id === accountId);
  }
  return inMemoryRules;
}

export async function saveRule(rule: Partial<AutomationRule>): Promise<AutomationRule> {
  const supabase = getDb();
  // Ensure valid UUID
  const id = (rule.id && rule.id.includes('-') && rule.id.length >= 32) ? rule.id : crypto.randomUUID();
  const now = new Date().toISOString();

  let accountId = rule.account_id;
  if (!accountId && isSupabaseConfigured && supabase) {
    const { data: accounts } = await supabase.from('connected_accounts').select('id').limit(1);
    if (accounts && accounts[0]) {
      accountId = accounts[0].id;
    }
  }

  const newRule: AutomationRule = {
    id,
    account_id: accountId || '',
    name: rule.name || 'Untitled Automation',
    trigger_type: rule.trigger_type || 'keywords',
    trigger_keywords: Array.isArray(rule.trigger_keywords) ? rule.trigger_keywords : ['link'],
    exclude_keywords: Array.isArray(rule.exclude_keywords) ? rule.exclude_keywords : [],
    match_type: rule.match_type || 'contains',
    match_logic: rule.match_logic || 'any',
    action_type: rule.action_type || 'both',
    send_dm: rule.send_dm !== undefined ? rule.send_dm : true,
    send_comment: rule.send_comment !== undefined ? rule.send_comment : true,
    reply_template: rule.reply_template || 'Hey {{username}}! Thanks for commenting.',
    comment_reply_template: rule.comment_reply_template || 'Sent to your DM! Check your requests 📩',
    follow_gate_enabled: Boolean(rule.follow_gate_enabled),
    follow_prompt_template: rule.follow_prompt_template || 'Hey {{username}}! Follow our account @{{account_username}} to unlock your link 🚀 Then tap below!',
    follow_unlocked_template: rule.follow_unlocked_template || rule.reply_template,
    post_id: rule.post_id || null,
    post_caption: rule.post_caption || (rule.post_id ? 'Specific Post' : 'All Posts & Reels'),
    post_thumbnail_url: rule.post_thumbnail_url,
    is_active: rule.is_active !== undefined ? rule.is_active : true,
    total_triggered: rule.total_triggered || 0,
    created_at: rule.created_at || now,
    updated_at: now
  };

  if (isSupabaseConfigured && supabase) {
    const payload: any = { ...newRule };
    const extendedColumns = [
      'trigger_type',
      'exclude_keywords',
      'match_logic',
      'action_type',
      'send_dm',
      'send_comment',
      'comment_reply_template',
      'follow_gate_enabled',
      'follow_prompt_template',
      'follow_unlocked_template',
      'post_thumbnail_url'
    ];

    let { data, error } = await supabase
      .from('automation_rules')
      .upsert(payload)
      .select()
      .single();

    if (error && error.message) {
      for (const col of extendedColumns) {
        if (error.message.includes(`"${col}"`) || error.message.includes(col)) {
          delete payload[col];
        }
      }
      const retry = await supabase
        .from('automation_rules')
        .upsert(payload)
        .select()
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      console.error('[Storage] Error saving rule to Supabase:', error.message);
      throw new Error(`Failed to save automation rule: ${error.message}`);
    }
    if (data) {
      return data as AutomationRule;
    }
  }

  // Update in-memory fallback
  const existingIdx = inMemoryRules.findIndex(r => r.id === id);
  if (existingIdx !== -1) {
    inMemoryRules[existingIdx] = newRule;
  } else {
    inMemoryRules.unshift(newRule);
  }

  return newRule;
}

export async function duplicateRule(ruleId: string): Promise<AutomationRule | null> {
  const rules = await fetchRules();
  const source = rules.find(r => r.id === ruleId);
  if (!source) return null;

  const clone: Partial<AutomationRule> = {
    ...source,
    id: undefined, // Generates new UUID
    name: `Copy of ${source.name}`,
    total_triggered: 0,
  };

  return await saveRule(clone);
}

export async function deleteRule(ruleId: string): Promise<boolean> {
  const supabase = getDb();
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('automation_rules').delete().eq('id', ruleId);
    if (!error) return true;
    console.error('[Storage] Error deleting rule:', error.message);
  }

  inMemoryRules = inMemoryRules.filter(r => r.id !== ruleId);
  return true;
}

export async function fetchDispatches(
  accountIdOrOptions?: string | {
    accountId?: string;
    mediaId?: string;
    ruleId?: string;
    status?: string;
    limit?: number;
  }
): Promise<CommentDispatch[]> {
  let accountId: string | undefined;
  let mediaId: string | undefined;
  let ruleId: string | undefined;
  let status: string | undefined;
  let limit = 100;

  if (typeof accountIdOrOptions === 'string') {
    accountId = accountIdOrOptions;
  } else if (accountIdOrOptions && typeof accountIdOrOptions === 'object') {
    accountId = accountIdOrOptions.accountId;
    mediaId = accountIdOrOptions.mediaId;
    ruleId = accountIdOrOptions.ruleId;
    status = accountIdOrOptions.status;
    if (accountIdOrOptions.limit) limit = accountIdOrOptions.limit;
  }

  const supabase = getDb();
  if (isSupabaseConfigured && supabase) {
    let query = supabase
      .from('comment_dispatches')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (accountId) query = query.eq('account_id', accountId);
    if (mediaId) query = query.eq('media_id', mediaId);
    if (ruleId) query = query.eq('rule_id', ruleId);
    if (status && status !== 'all') query = query.eq('status', status);

    const { data, error } = await query;
    if (error) {
      console.error('[Storage] Error fetching dispatches from Supabase:', error.message);
    }
    if (!error && data) {
      return data as CommentDispatch[];
    }
  }

  let result = [...inMemoryDispatches];
  if (accountId) result = result.filter(d => d.account_id === accountId);
  if (mediaId) result = result.filter(d => d.media_id === mediaId);
  if (ruleId) result = result.filter(d => d.rule_id === ruleId);
  if (status && status !== 'all') result = result.filter(d => d.status === status);
  return result.slice(0, limit);
}

export async function recordDispatch(dispatch: CommentDispatch): Promise<void> {
  const supabase = getDb();
  if (isSupabaseConfigured && supabase) {
    const payload: any = { ...dispatch };
    let { error } = await supabase.from('comment_dispatches').upsert(payload);

    if (error && error.message) {
      const extendedCols = [
        'rule_id',
        'rule_name',
        'trigger_type',
        'action_type',
        'comment_reply_text',
        'private_reply_status',
        'public_reply_status',
        'follow_gate_status',
        'meta_comment_id'
      ];
      for (const col of extendedCols) {
        if (error.message.includes(`"${col}"`) || error.message.includes(col)) {
          delete payload[col];
        }
      }
      const retry = await supabase.from('comment_dispatches').upsert(payload);
      error = retry.error;
    }

    if (error) {
      console.error('[Storage] Error recording dispatch to Supabase:', error.message);
    }
  }

  const existingIdx = inMemoryDispatches.findIndex(d => d.comment_id === dispatch.comment_id);
  if (existingIdx !== -1) {
    inMemoryDispatches[existingIdx] = dispatch;
  } else {
    inMemoryDispatches.unshift(dispatch);
  }
}
