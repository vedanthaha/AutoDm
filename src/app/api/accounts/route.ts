/**
 * Accounts API
 * Path: /api/accounts
 */

import { NextResponse } from 'next/server';
import { fetchAccounts } from '@/lib/storage';

export const runtime = 'nodejs';

export async function GET() {
  const accounts = await fetchAccounts();
  return NextResponse.json({ accounts });
}
