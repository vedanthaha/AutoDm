/**
 * Keyword Matching Engine & Template Formatter
 */

export interface MatchResult {
  matched: boolean;
  keyword: string | null;
}

/**
 * Normalizes input text for matching (lowercase, removes excess whitespace).
 */
export function normalizeText(text: string): string {
  return (text || '').trim().toLowerCase();
}

/**
 * Evaluates whether a comment satisfies a rule's keyword triggers.
 */
export function matchComment(
  commentText: string,
  keywords: string[],
  matchType: 'contains' | 'exact' = 'contains'
): MatchResult {
  if (!commentText || !Array.isArray(keywords) || keywords.length === 0) {
    return { matched: false, keyword: null };
  }

  const normalizedComment = normalizeText(commentText);

  for (const rawKw of keywords) {
    const kw = normalizeText(rawKw);
    if (!kw) continue;

    if (matchType === 'exact') {
      if (normalizedComment === kw) {
        return { matched: true, keyword: rawKw.trim() };
      }
    } else {
      // 'contains' matching: checks if comment contains the keyword as a substring or word
      if (normalizedComment.includes(kw)) {
        return { matched: true, keyword: rawKw.trim() };
      }
    }
  }

  return { matched: false, keyword: null };
}

/**
 * Renders a private reply template by safely substituting dynamic placeholders:
 * - {{username}} -> commenter's IG username
 * - {{name}} -> commenter's display name or username
 */
export function renderReplyTemplate(
  template: string,
  variables: { username?: string; name?: string }
): string {
  let result = template || '';
  const username = variables.username ? `@${variables.username.replace(/^@/, '')}` : 'there';
  const name = variables.name || variables.username || 'there';

  result = result.replace(/\{\{username\}\}/gi, username);
  result = result.replace(/\{\{name\}\}/gi, name);

  return result;
}
