/**
 * Compatibility Forwarder -> /api/auth/instagram
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = '/api/auth/instagram';
  return NextResponse.redirect(url);
}
