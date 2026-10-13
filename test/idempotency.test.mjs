import test from 'node:test';
import assert from 'node:assert/strict';
import { IdempotencyLedger } from '../test-harness/ledger.js';
import path from 'path';
import fs from 'fs';

const testDbPath = path.join(process.cwd(), 'test', 'temp-test-ledger.sqlite');

test('Idempotency: atomically claims new comment', () => {
  const ledger = new IdempotencyLedger(testDbPath);
  const commentId = `comm_${Date.now()}_1`;

  const claim1 = ledger.claimComment(commentId, 'alex', 'media_1', 'link');
  assert.equal(claim1.claimed, true);
  assert.equal(claim1.existingRecord, null);

  // Duplicate claim for the same comment ID
  const claim2 = ledger.claimComment(commentId, 'alex', 'media_1', 'link');
  assert.equal(claim2.claimed, false);
  assert.notEqual(claim2.existingRecord, null);
  assert.equal(claim2.existingRecord.comment_id, commentId);
});

test('Idempotency: marks delivery with Meta message_id', () => {
  const ledger = new IdempotencyLedger(testDbPath);
  const commentId = `comm_${Date.now()}_2`;

  ledger.claimComment(commentId, 'sophia', 'media_2', 'guide');
  ledger.markDelivered(commentId, 'msg_meta_123', 'rec_meta_456');

  const record = ledger.getRecord(commentId);
  assert.equal(record.status, 'delivered');
  assert.equal(record.meta_message_id, 'msg_meta_123');
  assert.equal(record.meta_recipient_id, 'rec_meta_456');
});

test('Idempotency: marks failure safely with error diagnostics', () => {
  const ledger = new IdempotencyLedger(testDbPath);
  const commentId = `comm_${Date.now()}_3`;

  ledger.claimComment(commentId, 'jordan', 'media_3', 'link');
  ledger.markFailed(commentId, 230, 'Permissions disallow message to this user');

  const record = ledger.getRecord(commentId);
  assert.equal(record.status, 'failed');
  assert.equal(record.error_code, 230);
  assert.equal(record.error_message, 'Permissions disallow message to this user');
  assert.equal(record.retry_count, 1);

  // Clean up temp DB
  try {
    fs.unlinkSync(testDbPath);
  } catch {}
});
