import { NextResponse } from 'next/server';
import { getSupabaseServiceRoleClient, getSupabaseClient } from '@/lib/supabase';
import { decryptToken } from '@/lib/crypto';
import { getAccountWebhookSubscriptions, subscribeAccountWebhooks } from '@/lib/meta';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const hasUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const hasAnonKey = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const hasServiceKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const hasAppId = Boolean(process.env.META_APP_ID);
  const hasAppSecret = Boolean(process.env.META_APP_SECRET);

  const serviceClient = getSupabaseServiceRoleClient();
  const anonClient = getSupabaseClient();

  let serviceResult: any = { tested: false };
  let metaWebhookCheck: any = { tested: false };
  if (serviceClient) {
    try {
      const { data, error, count } = await serviceClient
        .from('connected_accounts')
        .select('*', { count: 'exact' });
      serviceResult = {
        tested: true,
        ok: !error,
        count: count ?? data?.length,
        data: data?.map(a => ({ id: a.id, username: a.username, ig_id: a.instagram_user_id })),
        error: error ? error.message : null,
      };

      if (data && data.length > 0) {
        const acc = data[0];
        const token = decryptToken(acc.encrypted_access_token);
        if (token) {
          const subs = await getAccountWebhookSubscriptions(acc.instagram_user_id, token);
          const reSub = await subscribeAccountWebhooks(acc.instagram_user_id, token, 'comments,messages');
          metaWebhookCheck = {
            tested: true,
            currentSubscriptions: subs,
            reSubscribeAttempt: reSub,
          };
        } else {
          metaWebhookCheck = { tested: false, error: 'Token decryption failed' };
        }
      }
    } catch (e) {
      serviceResult = { tested: true, ok: false, error: (e as Error).message };
    }
  }

  let anonResult: any = { tested: false };
  if (anonClient) {
    try {
      const { data, error, count } = await anonClient
        .from('connected_accounts')
        .select('id, username, instagram_user_id, is_active, created_at', { count: 'exact' });
      anonResult = {
        tested: true,
        ok: !error,
        count: count ?? data?.length,
        data,
        error: error ? error.message : null,
      };
    } catch (e) {
      anonResult = { tested: true, ok: false, error: (e as Error).message };
    }
  }

  return NextResponse.json({
    env: {
      hasUrl,
      hasAnonKey,
      hasServiceKey,
      hasAppId,
      hasAppSecret,
    },
    serviceResult,
    metaWebhookCheck,
    anonResult,
  });
}
