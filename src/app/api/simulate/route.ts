/**
 * Interactive Automation Simulator API
 * Path: /api/simulate
 *
 * Tests keyword matching and reply templating directly from the UI,
 * recording the outcome in the activity ledger.
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchRules, recordDispatch } from '@/lib/storage';
import { matchComment, renderReplyTemplate } from '@/lib/matcher';
import { CommentDispatch } from '@/lib/types';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { account_id, comment_text, author_username, media_id } = await req.json();

    if (!comment_text) {
      return NextResponse.json({ error: 'Comment text is required.' }, { status: 400 });
    }

    const rules = await fetchRules(account_id);
    const activeRules = rules.filter(r => r.is_active);

    let matchedRule: any = null;
    let matchedKeyword: string | null = null;

    for (const rule of activeRules) {
      if (rule.post_id && media_id && rule.post_id !== media_id) continue;
      const res = matchComment(comment_text, rule.trigger_keywords, rule.match_type);
      if (res.matched) {
        matchedRule = rule;
        matchedKeyword = res.keyword;
        break;
      }
    }

    const commentId = `sim_comm_${Date.now()}`;
    const author = author_username || 'test_user';
    const now = new Date().toISOString();

    let dispatch: CommentDispatch;

    if (matchedRule) {
      const reply = renderReplyTemplate(matchedRule.reply_template, { username: author });
      dispatch = {
        comment_id: commentId,
        account_id: account_id || 'acc_demo_1',
        author_username: author,
        media_id: media_id || 'sim_media_101',
        comment_text: comment_text,
        keyword_matched: matchedKeyword || undefined,
        reply_text: reply,
        status: 'delivered',
        meta_message_id: `sim_msg_${Date.now()}`,
        meta_recipient_id: `sim_rec_${author}`,
        retry_count: 0,
        created_at: now,
        updated_at: now,
      };
    } else {
      dispatch = {
        comment_id: commentId,
        account_id: account_id || 'acc_demo_1',
        author_username: author,
        media_id: media_id || 'sim_media_101',
        comment_text: comment_text,
        status: 'ignored',
        retry_count: 0,
        created_at: now,
        updated_at: now,
      };
    }

    await recordDispatch(dispatch);

    return NextResponse.json({
      success: true,
      matched: !!matchedRule,
      matchedRule: matchedRule ? { id: matchedRule.id, name: matchedRule.name } : null,
      matchedKeyword,
      dispatch,
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
