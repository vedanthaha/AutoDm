/**
 * Automation Rules CRUD API
 * Path: /api/automations
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchRules, saveRule, deleteRule } from '@/lib/storage';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get('account_id') || undefined;
  const rules = await fetchRules(accountId);
  return NextResponse.json({ rules });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const saved = await saveRule(body);
    return NextResponse.json({ rule: saved });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing rule ID' }, { status: 400 });
  }
  const deleted = await deleteRule(id);
  return NextResponse.json({ success: deleted });
}
