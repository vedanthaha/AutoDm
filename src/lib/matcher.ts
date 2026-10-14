/**
 * AutoDm Flexible Comment Matching Engine & Template Formatter
 * Supports:
 * - Mode A: Any comment (with optional exclusion list)
 * - Mode B: Specific keywords (contains, exact, whole_word)
 * - Match Logic: 'any' (default) vs 'all'
 * - Personalization: {{username}}, {{name}}, {{account_username}}
 */

import type { TriggerType, MatchType, MatchLogic } from './types';

export interface MatchOptions {
  triggerType?: TriggerType; // 'any_comment' | 'keywords' (default: 'keywords')
  keywords?: string[];
  excludeKeywords?: string[]; // Optional exclusion list
  matchType?: MatchType; // 'contains' | 'exact' | 'whole_word'
  matchLogic?: MatchLogic; // 'any' | 'all'
}

export interface MatchResult {
  matched: boolean;
  keyword: string | null;
  matchedKeywords: string[];
  reason?: string;
}

/**
 * Normalizes input text for matching (lowercase, removes excess whitespace).
 */
export function normalizeText(text: string): string {
  return (text || '').trim().toLowerCase();
}

/**
 * Escapes special regex characters in a search term.
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Checks whether text contains a whole-word match (using unicode boundaries).
 */
export function isWholeWordMatch(text: string, term: string): boolean {
  if (!text || !term) return false;
  const escaped = escapeRegExp(term.trim().toLowerCase());
  // Unicode-aware word boundary: check preceding & succeeding non-word chars or start/end
  const regex = new RegExp(`(^|[^\\p{L}\\p{N}_])${escaped}([^\\p{L}\\p{N}_]|$)`, 'iu');
  return regex.test(text.toLowerCase());
}

/**
 * Evaluates whether a comment satisfies an automation's trigger configuration.
 * Fully backward-compatible with legacy signatures: matchComment(text, keywords, matchType).
 */
export function matchComment(
  commentText: string,
  keywordsOrOptions: string[] | MatchOptions,
  legacyMatchType: MatchType = 'contains'
): MatchResult {
  if (!commentText || typeof commentText !== 'string' || !commentText.trim()) {
    return { matched: false, keyword: null, matchedKeywords: [] };
  }

  // Parse options
  let opts: MatchOptions;
  if (Array.isArray(keywordsOrOptions)) {
    opts = {
      triggerType: 'keywords',
      keywords: keywordsOrOptions,
      matchType: legacyMatchType,
      matchLogic: 'any',
      excludeKeywords: [],
    };
  } else {
    opts = {
      triggerType: keywordsOrOptions.triggerType || 'keywords',
      keywords: keywordsOrOptions.keywords || [],
      excludeKeywords: keywordsOrOptions.excludeKeywords || [],
      matchType: keywordsOrOptions.matchType || 'contains',
      matchLogic: keywordsOrOptions.matchLogic || 'any',
    };
  }

  const normalizedComment = normalizeText(commentText);

  // 1. Check Exclusion List first (Mode A and Mode B)
  if (Array.isArray(opts.excludeKeywords) && opts.excludeKeywords.length > 0) {
    for (const rawEx of opts.excludeKeywords) {
      const ex = normalizeText(rawEx);
      if (!ex) continue;
      // If comment contains the excluded phrase/word, skip immediately
      if (normalizedComment.includes(ex) || isWholeWordMatch(commentText, ex)) {
        return {
          matched: false,
          keyword: null,
          matchedKeywords: [],
          reason: `Excluded by keyword: ${rawEx.trim()}`,
        };
      }
    }
  }

  // 2. Mode A — Any comment
  if (opts.triggerType === 'any_comment') {
    return {
      matched: true,
      keyword: 'any_comment',
      matchedKeywords: ['any_comment'],
    };
  }

  // 3. Mode B — Specific keywords
  const validKeywords = (opts.keywords || [])
    .map(k => (typeof k === 'string' ? k.trim() : ''))
    .filter(Boolean);

  if (validKeywords.length === 0) {
    return { matched: false, keyword: null, matchedKeywords: [] };
  }

  const matchedList: string[] = [];

  for (const rawKw of validKeywords) {
    const kw = normalizeText(rawKw);
    if (!kw) continue;

    let isMatch = false;
    if (opts.matchType === 'exact') {
      isMatch = normalizedComment === kw;
    } else if (opts.matchType === 'whole_word') {
      isMatch = isWholeWordMatch(commentText, kw);
    } else {
      // 'contains' (default)
      isMatch = normalizedComment.includes(kw);
    }

    if (isMatch) {
      matchedList.push(rawKw);
    }
  }

  // Evaluate Match Logic: 'all' vs 'any'
  if (opts.matchLogic === 'all') {
    const allMatched = validKeywords.length > 0 && matchedList.length === validKeywords.length;
    if (allMatched) {
      return {
        matched: true,
        keyword: matchedList.join(', '),
        matchedKeywords: matchedList,
      };
    }
    return { matched: false, keyword: null, matchedKeywords: [] };
  }

  // Default: 'any'
  if (matchedList.length > 0) {
    return {
      matched: true,
      keyword: matchedList[0],
      matchedKeywords: matchedList,
    };
  }

  return { matched: false, keyword: null, matchedKeywords: [] };
}

/**
 * Convenience helper to match a comment against an AutomationRule record
 */
export function matchAutomationRule(
  commentText: string,
  rule: Partial<import('./types.ts').AutomationRule>
): MatchResult & { trigger_type?: TriggerType } {
  if (rule.is_active === false) {
    return {
      matched: false,
      keyword: null,
      matchedKeywords: [],
      reason: 'Rule is paused / inactive',
    };
  }

  const result = matchComment(commentText, {
    triggerType: rule.trigger_type || 'keywords',
    keywords: rule.trigger_keywords || [],
    excludeKeywords: rule.exclude_keywords || [],
    matchType: rule.match_type || 'contains',
    matchLogic: rule.match_logic || 'any',
  });

  return {
    ...result,
    trigger_type: rule.trigger_type || 'keywords',
  };
}

/**
 * Renders a reply template by safely substituting dynamic placeholders:
 * - {{username}} -> commenter's IG username (prefixed with @)
 * - {{name}} -> commenter's display name or username
 * - {{account_username}} -> connected Instagram account's username
 */
export function renderReplyTemplate(
  template: string,
  variables: { username?: string; name?: string; account_username?: string }
): string {
  let result = template || '';
  const username = variables.username ? `@${variables.username.replace(/^@/, '')}` : 'there';
  const name = variables.name || variables.username || 'there';
  const accountUsername = variables.account_username ? variables.account_username.replace(/^@/, '') : '';

  result = result.replace(/\{\{username\}\}/gi, username);
  result = result.replace(/\{\{name\}\}/gi, name);
  result = result.replace(/\{\{account_username\}\}/gi, accountUsername);

  return result;
}
