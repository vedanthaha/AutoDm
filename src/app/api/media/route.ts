/**
 * Instagram Media API
 * Path: /api/media
 *
 * Fetches the connected account's published posts and Reels for the visual selector.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getInstagramMedia } from '@/lib/meta';
import { decryptToken } from '@/lib/crypto';
import { getSupabaseServiceRoleClient, getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get('account_id');

  const supabase = getSupabaseServiceRoleClient() || getSupabaseClient();
  if (isSupabaseConfigured && supabase && accountId) {
    const { data: account, error } = await supabase
      .from('connected_accounts')
      .select('instagram_user_id, encrypted_access_token')
      .eq('id', accountId)
      .maybeSingle();

    if (error) {
      console.error('[Media API] Error fetching account:', error.message);
    }

    if (account && account.encrypted_access_token) {
      const token = decryptToken(account.encrypted_access_token);
      if (token) {
        try {
          const media = await getInstagramMedia(account.instagram_user_id, token, 20);
          return NextResponse.json({ media });
        } catch (mediaErr) {
          console.error('[Media API] Meta API media fetch failed:', (mediaErr as Error).message);
        }
      }
    }
  }

  return NextResponse.json({ media: [] });
}
