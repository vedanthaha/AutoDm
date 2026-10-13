/**
 * Meta Data Deletion Request Callback
 * Path: /api/webhooks/instagram/data-deletion
 *
 * Called by Meta when a user requests deletion of their data associated with our app.
 * Receives a signed_request containing the user_id.
 * We delete the connected account, tokens, automation rules, and dispatch records.
 *
 * Meta requires us to return:
 * { url: "status check URL", confirmation_code: "unique code" }
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSupabaseServiceRoleClient } from '@/lib/supabase';

export const runtime = 'nodejs';

interface DeletionPayload {
  user_id: string;
  algorithm: string;
  issued_at: number;
}

function parseSignedRequest(signedRequest: string, appSecret: string): DeletionPayload | null {
  try {
    const [encodedSig, encodedPayload] = signedRequest.split('.');
    if (!encodedSig || !encodedPayload) return null;

    const payload = JSON.parse(
      Buffer.from(encodedPayload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
    );

    const expectedSig = crypto
      .createHmac('sha256', appSecret)
      .update(encodedPayload)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const actualSig = encodedSig.replace(/=+$/, '');

    if (expectedSig !== actualSig) {
      console.error('[DataDeletion] Signature verification failed.');
      return null;
    }

    return payload as DeletionPayload;
  } catch (err) {
    console.error('[DataDeletion] Failed to parse signed_request:', (err as Error).message);
    return null;
  }
}

export async function POST(req: NextRequest) {
  const appSecret = process.env.META_APP_SECRET;
  if (!appSecret) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  let signedRequest: string | null = null;

  const contentType = req.headers.get('content-type') || '';
  if (contentType.includes('application/x-www-form-urlencoded')) {
    const formData = await req.formData();
    signedRequest = formData.get('signed_request') as string;
  } else {
    try {
      const body = await req.json();
      signedRequest = body.signed_request;
    } catch {
      // fallback
    }
  }

  if (!signedRequest) {
    return NextResponse.json({ error: 'Missing signed_request' }, { status: 400 });
  }

  const payload = parseSignedRequest(signedRequest, appSecret);
  if (!payload) {
    return NextResponse.json({ error: 'Invalid signed_request' }, { status: 403 });
  }

  const igUserId = payload.user_id;
  console.log(`[DataDeletion] Processing data deletion for Instagram user ${igUserId}.`);

  const supabase = getSupabaseServiceRoleClient();
  if (supabase) {
    // 1. Find the connected account
    const { data: account } = await supabase
      .from('connected_accounts')
      .select('id, user_id')
      .eq('instagram_user_id', igUserId)
      .maybeSingle();

    if (account) {
      // 2. Delete automation rules for this account
      await supabase
        .from('automation_rules')
        .delete()
        .eq('account_id', account.id);

      // 3. Delete dispatch records for this account
      await supabase
        .from('comment_dispatches')
        .delete()
        .eq('account_id', account.id);

      // 4. Delete the connected account itself (includes encrypted token)
      await supabase
        .from('connected_accounts')
        .delete()
        .eq('id', account.id);

      console.log(`[DataDeletion] All data deleted for account ${account.id} (IG: ${igUserId}).`);
    } else {
      console.log(`[DataDeletion] No connected account found for IG user ${igUserId}.`);
    }
  }

  const confirmationCode = crypto.randomBytes(16).toString('hex');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;

  return NextResponse.json({
    url: `${appUrl}/data-deletion?confirmation=${confirmationCode}`,
    confirmation_code: confirmationCode,
  });
}
