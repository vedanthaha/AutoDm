/**
 * Compatibility Forwarder -> /api/auth/instagram/callback
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = '/api/auth/instagram/callback';
  return NextResponse.redirect(url);
}
