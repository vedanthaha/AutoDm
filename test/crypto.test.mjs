import test from 'node:test';
import assert from 'node:assert/strict';
import { encryptToken, decryptToken, maskToken } from '../src/lib/crypto.ts';

test('Crypto: encrypts and decrypts Page Access Token symmetrically', () => {
  const sampleToken = 'EAA1234567890123456_AQB_mock_secret_long_lived_token_xyz987';
  const encrypted = encryptToken(sampleToken);

  assert.notEqual(encrypted, sampleToken);
  assert.equal(encrypted.includes(':'), true);

  const decrypted = decryptToken(encrypted);
  assert.equal(decrypted, sampleToken);
});

test('Crypto: tampered ciphertext returns empty string without crashing', () => {
  const valid = encryptToken('secret_token');
  const parts = valid.split(':');
  // Tamper with the ciphertext segment
  const tampered = `${parts[0]}:${parts[1]}:bad000000000deadbeef`;

  const decrypted = decryptToken(tampered);
  assert.equal(decrypted, '');
});

test('Crypto: maskToken sanitizes token for logs and UI', () => {
  const token = 'EAA1234567890abcdef';
  const masked = maskToken(token);
  assert.equal(masked, 'EAA123••••cdef');
  assert.equal(masked.includes('7890'), false);
});
