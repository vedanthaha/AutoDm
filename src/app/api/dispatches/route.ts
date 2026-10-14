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
  const mediaId = searchParams.get('media_id') || undefined;
  const ruleId = searchParams.get('rule_id') || undefined;
  const status = searchParams.get('status') || undefined;
  const limit = Math.min(Number(searchParams.get('limit')) || 100, 200);

  const dispatches = await fetchDispatches({
    accountId,
    mediaId,
    ruleId,
    status,
    limit,
  });
  return NextResponse.json({ dispatches });
}
