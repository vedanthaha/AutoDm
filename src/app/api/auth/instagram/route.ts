/**
 * Instagram Login for Business — OAuth Initiator
 * Path: /api/auth/instagram
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { INSTAGRAM_OAUTH_AUTHORIZE_URL, INSTAGRAM_BUSINESS_SCOPES } from '@/lib/meta';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const appId = process.env.META_APP_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
  const redirectUri = process.env.META_REDIRECT_URI || `${appUrl}/api/auth/instagram/callback`;

  if (!appId) {
    return NextResponse.json(
      { error: 'META_APP_ID is not configured in environment variables.' },
      { status: 500 }
    );
  }

  // Generate cryptographic state for CSRF prevention
  const state = crypto.randomBytes(24).toString('hex');
  const scopes = INSTAGRAM_BUSINESS_SCOPES.join(',');

  const authUrl = `${INSTAGRAM_OAUTH_AUTHORIZE_URL}?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&response_type=code&state=${state}`;

  const res = NextResponse.redirect(authUrl);

  // Store state in secure httpOnly cookie
  res.cookies.set('ig_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600, // 10 minutes
    path: '/',
  });

  return res;
}
