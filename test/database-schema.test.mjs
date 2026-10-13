import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const MIGRATIONS_DIR = path.resolve('supabase/migrations');

test('Database Migrations: Migration files exist and are non-empty', () => {
  const files = fs.readdirSync(MIGRATIONS_DIR).filter(f => f.endsWith('.sql')).sort();
  assert.equal(files.length >= 2, true, 'At least 2 migrations should exist');
  assert.equal(files.includes('20261013000001_initial_schema.sql'), true);
  assert.equal(files.includes('20261014000001_multi_tenant_instagram_login.sql'), true);

  for (const f of files) {
    const content = fs.readFileSync(path.join(MIGRATIONS_DIR, f), 'utf8');
    assert.equal(content.length > 500, true, `Migration ${f} is too short or empty`);
  }
});

test('Database Schema: Pure Instagram Login (no Facebook Page fields)', () => {
  const latestMigration = fs.readFileSync(
    path.join(MIGRATIONS_DIR, '20261014000001_multi_tenant_instagram_login.sql'),
    'utf8'
  );

  assert.equal(latestMigration.includes('DROP COLUMN IF EXISTS facebook_page_id'), true);
  assert.equal(latestMigration.includes('DROP COLUMN IF EXISTS facebook_page_name'), true);
  assert.equal(latestMigration.includes('account_type TEXT DEFAULT \'BUSINESS\''), true);
  assert.equal(latestMigration.includes('webhook_subscribed BOOLEAN DEFAULT FALSE'), true);
});

test('Database Schema: Tenant Isolation & Foreign Keys', () => {
  const latestMigration = fs.readFileSync(
    path.join(MIGRATIONS_DIR, '20261014000001_multi_tenant_instagram_login.sql'),
    'utf8'
  );

  // Foreign keys to auth.users with CASCADE
  assert.equal(latestMigration.includes('user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE'), true);
  // Foreign keys to connected_accounts with CASCADE
  assert.equal(latestMigration.includes('account_id UUID REFERENCES connected_accounts(id) ON DELETE CASCADE'), true);
  // Atomic deduplication key on comment_dispatches
  assert.equal(latestMigration.includes('comment_id TEXT PRIMARY KEY'), true);
});

test('Database Schema: RLS Policies enforce auth.uid() = user_id', () => {
  const latestMigration = fs.readFileSync(
    path.join(MIGRATIONS_DIR, '20261014000001_multi_tenant_instagram_login.sql'),
    'utf8'
  );

  // RLS must be enabled on all 3 tables
  assert.equal(latestMigration.includes('ALTER TABLE connected_accounts ENABLE ROW LEVEL SECURITY;'), true);
  assert.equal(latestMigration.includes('ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;'), true);
  assert.equal(latestMigration.includes('ALTER TABLE comment_dispatches ENABLE ROW LEVEL SECURITY;'), true);

  // Tenant policies must check auth.uid() = user_id
  assert.equal(latestMigration.includes('auth.uid() = user_id'), true);
  assert.equal(latestMigration.includes('CREATE POLICY "Tenant accounts policy"'), true);
  assert.equal(latestMigration.includes('CREATE POLICY "Tenant rules policy"'), true);
  assert.equal(latestMigration.includes('CREATE POLICY "Tenant dispatches policy"'), true);
});

test('Database Schema: increment_rule_triggers RPC function is defined', () => {
  const latestMigration = fs.readFileSync(
    path.join(MIGRATIONS_DIR, '20261014000001_multi_tenant_instagram_login.sql'),
    'utf8'
  );

  assert.equal(latestMigration.includes('CREATE OR REPLACE FUNCTION increment_rule_triggers'), true);
  assert.equal(latestMigration.includes('SECURITY DEFINER'), true);
});
