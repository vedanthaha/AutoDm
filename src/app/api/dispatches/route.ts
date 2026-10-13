/**
 * Dispatches API
 * Path: /api/dispatches
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchDispatches } from '@/lib/storage';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get('account_id') || undefined;
  const dispatches = await fetchDispatches(accountId);
  return NextResponse.json({ dispatches });
}
