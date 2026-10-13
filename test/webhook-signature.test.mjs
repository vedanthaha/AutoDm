import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';

function verifySignature(rawBuffer, signatureHeader, secret) {
  if (!secret) return true;
  if (!signatureHeader || !signatureHeader.startsWith('sha256=')) return false;

  try {
    const expectedSig = signatureHeader.slice(7);
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(rawBuffer);
    const calculatedSig = hmac.digest('hex');

    const bufA = Buffer.from(expectedSig, 'hex');
    const bufB = Buffer.from(calculatedSig, 'hex');
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

test('Webhook Security: accepts valid HMAC-SHA256 signature over raw buffer', () => {
  const secret = 'test_app_secret_9981';
  const body = Buffer.from(JSON.stringify({ object: 'instagram', entry: [] }), 'utf8');

  const validHmac = crypto.createHmac('sha256', secret).update(body).digest('hex');
  const header = `sha256=${validHmac}`;

  assert.equal(verifySignature(body, header, secret), true);
});

test('Webhook Security: rejects altered request payload with same signature', () => {
  const secret = 'test_app_secret_9981';
  const originalBody = Buffer.from(JSON.stringify({ object: 'instagram', entry: [] }), 'utf8');
  const alteredBody = Buffer.from(JSON.stringify({ object: 'instagram', entry: [{ id: 'hacked' }] }), 'utf8');

  const originalHmac = crypto.createHmac('sha256', secret).update(originalBody).digest('hex');
  const header = `sha256=${originalHmac}`;

  // Signature calculated for original, but sent with altered body
  assert.equal(verifySignature(alteredBody, header, secret), false);
});

test('Webhook Security: rejects invalid signature headers', () => {
  const secret = 'test_app_secret_9981';
  const body = Buffer.from('hello', 'utf8');

  assert.equal(verifySignature(body, 'sha256=invalidhex123', secret), false);
  assert.equal(verifySignature(body, 'sha1=legacyheader', secret), false);
  assert.equal(verifySignature(body, '', secret), false);
});
