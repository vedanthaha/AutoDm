/**
 * Instagram Deauthorization Callback
 * Path: /api/webhooks/instagram/deauthorize
 *
 * Called by Meta when a user removes our app from their Instagram settings.
 * Receives a signed_request containing the user_id.
 * We invalidate the stored token and deactivate the connected account.
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSupabaseServiceRoleClient } from '@/lib/supabase';

export const runtime = 'nodejs';

interface DeauthPayload {
  user_id: string;
  algorithm: string;
  issued_at: number;
}

function parseSignedRequest(signedRequest: string, appSecret: string): DeauthPayload | null {
  try {
    const [encodedSig, encodedPayload] = signedRequest.split('.');
    if (!encodedSig || !encodedPayload) return null;

    // Decode the payload
    const payload = JSON.parse(
      Buffer.from(encodedPayload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
    );

    // Verify signature
    const expectedSig = crypto
      .createHmac('sha256', appSecret)
      .update(encodedPayload)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const actualSig = encodedSig.replace(/=+$/, '');

    if (expectedSig !== actualSig) {
      console.error('[Deauth] Signature verification failed.');
      return null;
    }

    return payload as DeauthPayload;
  } catch (err) {
    console.error('[Deauth] Failed to parse signed_request:', (err as Error).message);
    return null;
  }
}

export async function POST(req: NextRequest) {
  const appSecret = process.env.META_APP_SECRET;
  if (!appSecret) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  let signedRequest: string | null = null;

  // Meta sends as application/x-www-form-urlencoded
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
  console.log(`[Deauth] Instagram user ${igUserId} has removed our app.`);

  const supabase = getSupabaseServiceRoleClient();
  if (supabase) {
    // Deactivate the connected account and clear the encrypted token
    await supabase
      .from('connected_accounts')
      .update({
        is_active: false,
        encrypted_access_token: null,
        webhook_subscribed: false,
        updated_at: new Date().toISOString(),
      })
      .eq('instagram_user_id', igUserId);

    // Deactivate all automation rules for this account
    const { data: account } = await supabase
      .from('connected_accounts')
      .select('id')
      .eq('instagram_user_id', igUserId)
      .maybeSingle();

    if (account) {
      await supabase
        .from('automation_rules')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('account_id', account.id);
    }
  }

  // Meta expects a JSON response with a URL and confirmation_code
  const confirmationCode = crypto.randomBytes(16).toString('hex');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;

  return NextResponse.json({
    url: `${appUrl}/data-deletion?confirmation=${confirmationCode}`,
    confirmation_code: confirmationCode,
  });
}
