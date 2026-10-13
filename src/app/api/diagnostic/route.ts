import { NextResponse } from 'next/server';
import { getSupabaseServiceRoleClient, getSupabaseClient } from '@/lib/supabase';

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
  let upsertTestResult: any = { tested: false };
  if (serviceClient) {
    try {
      const { data, error, count } = await serviceClient
        .from('connected_accounts')
        .select('*', { count: 'exact' });
      serviceResult = {
        tested: true,
        ok: !error,
        count: count ?? data?.length,
        data,
        error: error ? error.message : null,
      };

      // Test upsert
      const testId = 'test_diag_' + Date.now();
      const { data: upsertData, error: upsertErr } = await serviceClient
        .from('connected_accounts')
        .upsert({
          instagram_user_id: testId,
          username: 'test_normie',
          name: 'Test Normie',
          account_type: 'BUSINESS',
          encrypted_access_token: 'test_token',
          is_active: true,
        }, { onConflict: 'instagram_user_id' })
        .select();

      upsertTestResult = {
        tested: true,
        ok: !upsertErr,
        data: upsertData,
        error: upsertErr ? `${upsertErr.message} (code: ${upsertErr.code}, details: ${upsertErr.details})` : null,
      };

      if (!upsertErr) {
        // Clean up test row
        await serviceClient.from('connected_accounts').delete().eq('instagram_user_id', testId);
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
    upsertTestResult,
    anonResult,
  });
}
