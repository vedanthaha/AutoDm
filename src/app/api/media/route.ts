/**
 * Instagram Media API
 * Path: /api/media
 *
 * Fetches the connected account's published posts and Reels for the visual selector.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getInstagramMedia } from '@/lib/meta';
import { decryptToken } from '@/lib/crypto';
import { fetchAccounts } from '@/lib/storage';
import { getSupabaseServiceRoleClient, getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get('account_id');
  const limit = Math.min(Math.max(Number(searchParams.get('limit')) || 24, 1), 50);
  const after = searchParams.get('after') || undefined;
  const isRefresh = searchParams.get('refresh') === 'true';

  if (!accountId) {
    return NextResponse.json({ error: 'account_id query parameter is required', media: [], paging: { has_next: false } }, { status: 400 });
  }

  let igUserId = '';
  let encryptedToken = '';

  const supabase = getSupabaseServiceRoleClient() || getSupabaseClient();
  if (isSupabaseConfigured && supabase) {
    const { data: account, error } = await supabase
      .from('connected_accounts')
      .select('instagram_user_id, encrypted_access_token')
      .eq('id', accountId)
      .maybeSingle();

    if (error) {
      console.error('[Media API] Error fetching account:', error.message);
    }
    if (account) {
      igUserId = account.instagram_user_id;
      encryptedToken = account.encrypted_access_token || '';
    }
  }

  if (!igUserId) {
    const allAccounts = await fetchAccounts();
    const found = allAccounts.find(a => a.id === accountId);
    if (found) {
      igUserId = found.instagram_user_id;
      encryptedToken = found.encrypted_access_token || '';
    }
  }

  if (!igUserId || !encryptedToken) {
    return NextResponse.json({
      error: 'Connected account not found or access token missing',
      media: [],
      paging: { has_next: false }
    }, { status: 404 });
  }

  const token = decryptToken(encryptedToken);
  if (!token) {
    return NextResponse.json({
      error: 'Failed to decrypt access token for account',
      media: [],
      paging: { has_next: false }
    }, { status: 500 });
  }

  try {
    const media = await getInstagramMedia(igUserId, token, limit, after);
    const headers: Record<string, string> = {
      'Cache-Control': isRefresh ? 'no-cache, no-store' : 'private, max-age=60',
    };
    return NextResponse.json({
      media,
      paging: media.paging || { has_next: false },
    }, { headers });
  } catch (mediaErr) {
    console.error('[Media API] Meta API media fetch failed:', (mediaErr as Error).message);
    return NextResponse.json({
      error: `Meta API media fetch failed: ${(mediaErr as Error).message}`,
      media: [],
      paging: { has_next: false }
    }, { status: 502 });
  }
}
