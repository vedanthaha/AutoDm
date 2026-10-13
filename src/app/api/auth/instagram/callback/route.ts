/**
 * Instagram Login for Business — OAuth Callback Handler
 * Path: /api/auth/instagram/callback
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  exchangeInstagramCode,
  getLongLivedInstagramToken,
  getInstagramUserProfile,
  subscribeAccountWebhooks
} from '@/lib/meta';
import { encryptToken } from '@/lib/crypto';
import { getSupabaseServiceRoleClient } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const errorReason = searchParams.get('error_reason');
  const errorDescription = searchParams.get('error_description');

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;

  if (error) {
    console.error('[Instagram OAuth] Authorization error:', error, errorReason, errorDescription);
    return NextResponse.redirect(`${appUrl}/accounts?error=${encodeURIComponent(errorDescription || errorReason || error)}`);
  }

  // 1. Validate CSRF state
  const savedState = req.cookies.get('ig_oauth_state')?.value;
  if (!state || !savedState || state !== savedState) {
    console.error('[Instagram OAuth] CSRF state mismatch or expired.');
    return NextResponse.redirect(`${appUrl}/accounts?error=CSRF+State+Validation+Failed`);
  }

  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  const redirectUri = process.env.META_REDIRECT_URI || `${appUrl}/api/auth/instagram/callback`;

  if (!appId || !appSecret || !code) {
    return NextResponse.redirect(`${appUrl}/accounts?error=Missing+Configuration+Or+Code`);
  }

  // 2. Exchange authorization code for short-lived token (1 hour)
  const shortTokenRes = await exchangeInstagramCode(code, redirectUri, appId, appSecret);
  if (!shortTokenRes.access_token) {
    console.error('[Instagram OAuth] Failed short-lived token exchange:', shortTokenRes.error);
    return NextResponse.redirect(`${appUrl}/accounts?error=Failed+to+exchange+Instagram+code`);
  }

  // 3. Exchange short-lived token for long-lived token (60 days)
  const longTokenRes = await getLongLivedInstagramToken(shortTokenRes.access_token, appSecret);
  const activeToken = longTokenRes.access_token || shortTokenRes.access_token;
  const expiresInSeconds = longTokenRes.expires_in || 5184000;
  const expiresAt = new Date(Date.now() + expiresInSeconds * 1000).toISOString();

  // 4. Retrieve Instagram user profile
  const profile = await getInstagramUserProfile(activeToken);
  const igUserId = profile.user_id || shortTokenRes.user_id;

  if (!igUserId) {
    console.error('[Instagram OAuth] Unable to resolve Instagram user ID.');
    return NextResponse.redirect(`${appUrl}/accounts?error=Unable+to+resolve+Instagram+Account+ID`);
  }

  // 5. Per-Account Webhook Subscription (comments, messages)
  const webhookSub = await subscribeAccountWebhooks(igUserId, activeToken, 'comments,messages');
  console.log(`[Instagram OAuth] Webhook subscription for @${profile.username}:`, webhookSub.success ? 'SUCCESS' : 'FAILED');

  // 6. Encrypt long-lived token at rest
  const encryptedToken = encryptToken(activeToken);

  const supabase = getSupabaseServiceRoleClient();
  if (supabase) {
    // Upsert into connected_accounts
    const { error: dbError } = await supabase.from('connected_accounts').upsert({
      instagram_user_id: igUserId,
      username: profile.username || 'unknown',
      name: profile.name || profile.username || 'Instagram Professional',
      profile_picture_url: profile.profile_picture_url || null,
      account_type: profile.account_type || 'BUSINESS',
      encrypted_access_token: encryptedToken,
      token_expires_at: expiresAt,
      webhook_subscribed: webhookSub.success,
      is_active: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'instagram_user_id' });

    if (dbError) {
      console.error('[Instagram OAuth] Database save failed:', dbError.message);
    }
  }

  const res = NextResponse.redirect(`${appUrl}/accounts?connected=true&username=${encodeURIComponent(profile.username || '')}`);
  // Clear CSRF cookie
  res.cookies.delete('ig_oauth_state');
  return res;
}
