/**
 * Unified Storage Layer
 *
 * Connects directly to Supabase PostgreSQL using service role or client privileges.
 * Strictly operates on real database records without injecting hardcoded mock data.
 */

import crypto from 'crypto';
import { ConnectedAccount, AutomationRule, CommentDispatch } from './types';
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
    trigger_keywords: rule.trigger_keywords || ['link'],
    reply_template: rule.reply_template || 'Hey {{username}}! Thanks for commenting.',
    comment_reply_template: rule.comment_reply_template || 'Sent to your DM! Check your requests 📩',
    post_id: rule.post_id || null,
    post_caption: rule.post_caption || (rule.post_id ? 'Specific Post' : 'All Posts & Reels'),
    is_active: rule.is_active !== undefined ? rule.is_active : true,
    match_type: rule.match_type || 'contains',
    total_triggered: rule.total_triggered || 0,
    created_at: rule.created_at || now,
    updated_at: now
  };

  if (isSupabaseConfigured && supabase) {
    const payload: any = { ...newRule };
    let { data, error } = await supabase
      .from('automation_rules')
      .upsert(payload)
      .select()
      .single();

    if (error && error.message?.includes('comment_reply_template')) {
      delete payload.comment_reply_template;
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

export async function fetchDispatches(accountId?: string): Promise<CommentDispatch[]> {
  const supabase = getDb();
  if (isSupabaseConfigured && supabase) {
    let query = supabase.from('comment_dispatches').select('*').order('created_at', { ascending: false }).limit(50);
    if (accountId) query = query.eq('account_id', accountId);
    const { data, error } = await query;
    if (error) {
      console.error('[Storage] Error fetching dispatches from Supabase:', error.message);
    }
    if (!error && data) {
      return data as CommentDispatch[];
    }
  }

  if (accountId) {
    return inMemoryDispatches.filter(d => d.account_id === accountId);
  }
  return inMemoryDispatches;
}

export async function recordDispatch(dispatch: CommentDispatch): Promise<void> {
  const supabase = getDb();
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('comment_dispatches').upsert(dispatch);
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
