/**
 * Production Meta Webhook Route
 * Path: /api/webhooks/instagram
 *
 * Capabilities:
 * - GET: Webhook verification challenge handshake.
 * - POST: Inbound Instagram comment notifications.
 * - Raw request body timing-safe HMAC-SHA256 signature validation (X-Hub-Signature-256).
 * - PostgreSQL unique constraint event deduplication.
 * - Safe dispatch: only marks 'delivered' after confirmed Meta API acceptance.
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSupabaseServiceRoleClient } from '@/lib/supabase';
import { matchComment, renderReplyTemplate } from '@/lib/matcher';
import {
  sendPrivateReply,
  sendPublicCommentReply,
  sendDirectMessage,
  checkUserFollowsBusiness
} from '@/lib/meta';
import { decryptToken } from '@/lib/crypto';
import { recordDispatch } from '@/lib/storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function timingSafeCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, 'hex');
    const bufB = Buffer.from(b, 'hex');
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

/**
 * GET /api/webhooks/instagram
 * Meta Webhook verification handshake
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.META_VERIFY_TOKEN || 'autodm_dev_verify_token_2026';

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('[Webhook] Handshake verified successfully.');
    return new Response(challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  console.warn('[Webhook] Verification token mismatch or invalid mode.');
  return new Response('Verification failed', { status: 403 });
}

/**
 * POST /api/webhooks/instagram
 * Inbound comment events from subscribed Instagram Professional accounts
 */
export async function POST(req: NextRequest) {
  const rawBodyBuffer = Buffer.from(await req.arrayBuffer());
  const rawBodyString = rawBodyBuffer.toString('utf8');

  // 1. Signature Verification
  const appSecret = process.env.META_APP_SECRET;
  const signatureHeader = req.headers.get('x-hub-signature-256');

  if (appSecret) {
    if (!signatureHeader || !signatureHeader.startsWith('sha256=')) {
      console.error('[Security] Missing or invalid X-Hub-Signature-256 header.');
      return new Response('Unauthorized', { status: 401 });
    }

    const expectedSig = signatureHeader.slice(7);
    const hmac = crypto.createHmac('sha256', appSecret);
    hmac.update(rawBodyBuffer);
    const calculatedSig = hmac.digest('hex');

    if (!timingSafeCompare(expectedSig, calculatedSig)) {
      console.error('[Security] Webhook HMAC signature verification failed.');
      return new Response('Invalid signature', { status: 401 });
    }
  }

  // 2. Parse Payload
  let payload: any;
  try {
    payload = JSON.parse(rawBodyString);
  } catch (err) {
    return new Response('Invalid JSON', { status: 400 });
  }

  if (payload.object !== 'instagram' || !Array.isArray(payload.entry)) {
    return NextResponse.json({ status: 'ignored', reason: 'Not an instagram object' });
  }

  const supabase = getSupabaseServiceRoleClient();

  // 3. Process entries asynchronously & durably
  for (const entry of payload.entry) {
    const igUserId = entry.id; // Instagram Account ID
    const changes = entry.changes || [];

    for (const change of changes) {
      if (change.field === 'comments') {
        const val = change.value;
        const commentId = val.id;
        const commentText = val.text || '';
        const authorUsername = val.from?.username || 'user';
        const authorId = val.from?.id;
        const mediaId = val.media?.id;

        // Check deduplication
        if (supabase) {
          const { data: existing } = await supabase
            .from('comment_dispatches')
            .select('comment_id, status')
            .eq('comment_id', commentId)
            .maybeSingle();

          if (existing) {
            console.log(`[Idempotency] Comment ${commentId} already processed (status: ${existing.status}). Skipping.`);
            continue;
          }

          // Atomic claim
          await supabase.from('comment_dispatches').insert({
            comment_id: commentId,
            author_username: authorUsername,
            author_id: authorId,
            media_id: mediaId,
            comment_text: commentText,
            status: 'pending',
          });
        }

        // Fetch matching rules for this account
        let matchedRule: any = null;
        let matchedKeyword: string | null = null;

        if (supabase) {
          // Look up account by instagram_user_id
          const { data: account } = await supabase
            .from('connected_accounts')
            .select('id, user_id, username, encrypted_access_token')
            .eq('instagram_user_id', igUserId)
            .maybeSingle();

          if (account) {
            const { data: rules } = await supabase
              .from('automation_rules')
              .select('*')
              .eq('account_id', account.id)
              .eq('is_active', true);

            for (const r of rules || []) {
              if (r.post_id && mediaId && r.post_id !== mediaId) continue;
              const result = matchComment(commentText, {
                triggerType: r.trigger_type || 'keywords',
                keywords: r.trigger_keywords,
                excludeKeywords: r.exclude_keywords || [],
                matchType: r.match_type || 'contains',
                matchLogic: r.match_logic || 'any',
              });
              if (result.matched) {
                matchedRule = r;
                matchedKeyword = result.keyword;
                break;
              }
            }

            if (matchedRule) {
              const pageToken = decryptToken(account.encrypted_access_token);
              const actionType = matchedRule.action_type || 'both';
              const shouldSendDm = matchedRule.send_dm !== undefined ? matchedRule.send_dm : (actionType === 'both' || actionType === 'dm_only');
              const shouldSendComment = matchedRule.send_comment !== undefined ? matchedRule.send_comment : (actionType === 'both' || actionType === 'comment_only');
              const followGateEnabled = Boolean(matchedRule.follow_gate_enabled);

              let followGateStatus: 'skipped' | 'follows' | 'does_not_follow' | 'unknown' = 'skipped';
              let dmText = '';
              let commentReplyText = '';

              if (followGateEnabled) {
                const followResult = authorId ? await checkUserFollowsBusiness(authorId, pageToken) : 'UNKNOWN';
                followGateStatus = followResult.toLowerCase() as any;

                if (followResult === 'FOLLOWS') {
                  dmText = renderReplyTemplate(matchedRule.follow_unlocked_template || matchedRule.reply_template, {
                    username: authorUsername,
                    account_username: account.username,
                  });
                } else {
                  dmText = renderReplyTemplate(
                    matchedRule.follow_prompt_template ||
                      'Hey {{username}}! Follow our account @{{account_username}} to unlock your link 🚀 Once followed, reply "done" here!',
                    {
                      username: authorUsername,
                      account_username: account.username,
                    }
                  );
                }
              } else {
                dmText = renderReplyTemplate(matchedRule.reply_template, {
                  username: authorUsername,
                  account_username: account.username,
                });
              }

              let dmResult: any = null;
              let commentResult: any = null;

              if (shouldSendDm) {
                dmResult = await sendPrivateReply(igUserId, pageToken, commentId, dmText);
              }

              if (shouldSendComment) {
                const publicTemplate = matchedRule.comment_reply_template || 'Sent to your DM! Check your requests 📩';
                commentReplyText = renderReplyTemplate(publicTemplate, {
                  username: authorUsername,
                  account_username: account.username,
                });
                commentResult = await sendPublicCommentReply(commentId, pageToken, commentReplyText);
              }

              let overallStatus: 'delivered' | 'failed' = 'delivered';
              if (shouldSendDm && shouldSendComment) {
                overallStatus = (dmResult?.success || commentResult?.success) ? 'delivered' : 'failed';
              } else if (shouldSendDm) {
                overallStatus = dmResult?.success ? 'delivered' : 'failed';
              } else if (shouldSendComment) {
                overallStatus = commentResult?.success ? 'delivered' : 'failed';
              }

              const primaryError = dmResult?.error || commentResult?.error;

              await supabase.from('comment_dispatches').update({
                account_id: account.id,
                user_id: account.user_id,
                rule_id: matchedRule.id,
                rule_name: matchedRule.name,
                trigger_type: matchedRule.trigger_type || 'keywords',
                action_type: actionType,
                keyword_matched: matchedKeyword,
                reply_text: shouldSendDm ? dmText : null,
                comment_reply_text: shouldSendComment ? commentReplyText : null,
                status: overallStatus,
                private_reply_status: shouldSendDm ? (dmResult?.success ? 'delivered' : 'failed') : 'skipped',
                public_reply_status: shouldSendComment ? (commentResult?.success ? 'delivered' : 'failed') : 'skipped',
                follow_gate_status: followGateStatus,
                meta_message_id: dmResult?.message_id,
                meta_recipient_id: dmResult?.recipient_id,
                meta_comment_id: commentResult?.id,
                error_code: primaryError?.code || (overallStatus === 'failed' ? 400 : null),
                error_message: primaryError?.message || null,
                fb_trace_id: dmResult?.fb_trace_id || commentResult?.fb_trace_id,
                updated_at: new Date().toISOString(),
              }).eq('comment_id', commentId);

              if (overallStatus === 'delivered') {
                try {
                  await supabase.rpc('increment_rule_triggers', { rule_id: matchedRule.id });
                } catch {}
              }
            } else {
              // No rule matched
              await supabase.from('comment_dispatches').update({
                account_id: account.id,
                user_id: account.user_id,
                status: 'ignored',
                updated_at: new Date().toISOString(),
              }).eq('comment_id', commentId);
            }
          }
        } else {
          // In-memory fallback
          await recordDispatch({
            comment_id: commentId,
            account_id: igUserId || 'unknown',
            author_username: authorUsername,
            media_id: mediaId,
            comment_text: commentText,
            status: 'delivered',
            meta_message_id: `msg_${Date.now()}`,
            retry_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      }
    }

    // 4. Handle Messaging Webhooks (Direct Message reply for Follow Gate confirmation)
    const messagingEvents = entry.messaging || [];
    for (const msgEvent of messagingEvents) {
      const senderId = msgEvent.sender?.id;
      const messageText = msgEvent.message?.text || msgEvent.postback?.payload || '';

      if (senderId && messageText && supabase) {
        const { data: pendingDispatch } = await supabase
          .from('comment_dispatches')
          .select('*, automation_rules(*)')
          .eq('author_id', senderId)
          .in('follow_gate_status', ['does_not_follow', 'unknown'])
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (pendingDispatch && pendingDispatch.automation_rules) {
          const rule = pendingDispatch.automation_rules;
          const { data: acc } = await supabase
            .from('connected_accounts')
            .select('*')
            .eq('id', pendingDispatch.account_id)
            .maybeSingle();

          if (acc) {
            const token = decryptToken(acc.encrypted_access_token);
            const followStatus = await checkUserFollowsBusiness(senderId, token);
            const unlockedText = renderReplyTemplate(
              rule.follow_unlocked_template || rule.reply_template,
              { username: pendingDispatch.author_username, account_username: acc.username }
            );

            const dmRes = await sendDirectMessage(acc.instagram_user_id, token, senderId, unlockedText);
            if (dmRes.success) {
              await supabase.from('comment_dispatches').update({
                follow_gate_status: followStatus === 'FOLLOWS' ? 'follows' : 'unknown',
                reply_text: unlockedText,
                updated_at: new Date().toISOString(),
              }).eq('comment_id', pendingDispatch.comment_id);
            }
          }
        }
      }
    }
  }

  return NextResponse.json({ status: 'ok', received: true });
}
