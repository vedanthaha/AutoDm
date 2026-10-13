/**
 * Unified Storage Layer
 *
 * Provides transparent access to either live Supabase PostgreSQL
 * or interactive Demo mode state with in-memory persistence.
 */

import { ConnectedAccount, AutomationRule, CommentDispatch } from './types';
import { DEMO_ACCOUNTS, DEMO_RULES, DEMO_DISPATCHES } from './demo-data';
import { getSupabaseClient, isSupabaseConfigured } from './supabase';

// In-memory demo state for active server/client sessions
const inMemoryAccounts: ConnectedAccount[] = [...DEMO_ACCOUNTS];
let inMemoryRules: AutomationRule[] = [...DEMO_RULES];
const inMemoryDispatches: CommentDispatch[] = [...DEMO_DISPATCHES];

export async function fetchAccounts(): Promise<ConnectedAccount[]> {
  const supabase = getSupabaseClient();
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('connected_accounts')
      .select('*')
      .order('created_at', { ascending: true });

    if (!error && data && data.length > 0) {
      return data as ConnectedAccount[];
    }
  }
  return inMemoryAccounts;
}

export async function fetchRules(accountId?: string): Promise<AutomationRule[]> {
  const supabase = getSupabaseClient();
  if (isSupabaseConfigured && supabase) {
    let query = supabase.from('automation_rules').select('*').order('created_at', { ascending: false });
    if (accountId) query = query.eq('account_id', accountId);
    const { data, error } = await query;
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
  const supabase = getSupabaseClient();
  const id = rule.id || `rule_${Date.now()}`;
  const now = new Date().toISOString();

  const newRule: AutomationRule = {
    id,
    account_id: rule.account_id || inMemoryAccounts[0].id,
    name: rule.name || 'Untitled Automation',
    trigger_keywords: rule.trigger_keywords || ['link'],
    reply_template: rule.reply_template || 'Hey {{username}}! Thanks for commenting.',
    post_id: rule.post_id || null,
    post_caption: rule.post_caption || (rule.post_id ? 'Specific Post' : 'All Posts & Reels'),
    is_active: rule.is_active !== undefined ? rule.is_active : true,
    match_type: rule.match_type || 'contains',
    total_triggered: rule.total_triggered || 0,
    created_at: rule.created_at || now,
    updated_at: now
  };

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('automation_rules')
      .upsert(newRule)
      .select()
      .single();

    if (!error && data) {
      return data as AutomationRule;
    }
  }

  // Update in-memory
  const existingIdx = inMemoryRules.findIndex(r => r.id === id);
  if (existingIdx !== -1) {
    inMemoryRules[existingIdx] = newRule;
  } else {
    inMemoryRules.unshift(newRule);
  }

  return newRule;
}

export async function deleteRule(ruleId: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('automation_rules').delete().eq('id', ruleId);
    if (!error) return true;
  }

  inMemoryRules = inMemoryRules.filter(r => r.id !== ruleId);
  return true;
}

export async function fetchDispatches(accountId?: string): Promise<CommentDispatch[]> {
  const supabase = getSupabaseClient();
  if (isSupabaseConfigured && supabase) {
    let query = supabase.from('comment_dispatches').select('*').order('created_at', { ascending: false }).limit(50);
    if (accountId) query = query.eq('account_id', accountId);
    const { data, error } = await query;
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
  const supabase = getSupabaseClient();
  if (isSupabaseConfigured && supabase) {
    await supabase.from('comment_dispatches').upsert(dispatch);
  }

  const existingIdx = inMemoryDispatches.findIndex(d => d.comment_id === dispatch.comment_id);
  if (existingIdx !== -1) {
    inMemoryDispatches[existingIdx] = dispatch;
  } else {
    inMemoryDispatches.unshift(dispatch);
  }
}
