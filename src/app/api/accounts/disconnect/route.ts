/**
 * Disconnect Account & Unsubscribe Webhook
 * Path: /api/accounts/disconnect
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceRoleClient, getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';
import { decryptToken } from '@/lib/crypto';
import { unsubscribeAccountWebhooks } from '@/lib/meta';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { account_id } = await req.json();
    if (!account_id) {
      return NextResponse.json({ error: 'Missing account_id' }, { status: 400 });
    }

    const supabase = getSupabaseServiceRoleClient() || getSupabaseClient();
    if (isSupabaseConfigured && supabase) {
      const { data: account } = await supabase
        .from('connected_accounts')
        .select('instagram_user_id, encrypted_access_token')
        .eq('id', account_id)
        .maybeSingle();

      if (account) {
        if (account.encrypted_access_token) {
          const token = decryptToken(account.encrypted_access_token);
          if (token) {
            // Unsubscribe from webhooks on Meta
            try {
              await unsubscribeAccountWebhooks(account.instagram_user_id, token);
            } catch (unsubErr) {
              console.warn('[Disconnect] Failed to unsubscribe webhooks:', (unsubErr as Error).message);
            }
          }
        }
        await supabase.from('connected_accounts').delete().eq('id', account_id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
