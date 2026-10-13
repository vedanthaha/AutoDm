import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';

/**
 * Helper: generates a valid signed_request from a payload and secret
 */
function createSignedRequest(payload, secret) {
  const encodedPayload = Buffer.from(JSON.stringify(payload))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(encodedPayload)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return `${expectedSig}.${encodedPayload}`;
}

/**
 * Signature validator matching deauthorize and data-deletion logic
 */
function parseSignedRequest(signedRequest, appSecret) {
  try {
    const [encodedSig, encodedPayload] = signedRequest.split('.');
    if (!encodedSig || !encodedPayload) return null;

    const payload = JSON.parse(
      Buffer.from(encodedPayload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
    );

    const expectedSig = crypto
      .createHmac('sha256', appSecret)
      .update(encodedPayload)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const actualSig = encodedSig.replace(/=+$/, '');

    if (expectedSig !== actualSig) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

test('Meta Compliance: valid signed_request parses correctly with valid HMAC', () => {
  const secret = 'test_meta_app_secret_998877';
  const payload = {
    user_id: '17841400011122233',
    algorithm: 'HMAC-SHA256',
    issued_at: Math.floor(Date.now() / 1000),
  };

  const signedRequest = createSignedRequest(payload, secret);
  const parsed = parseSignedRequest(signedRequest, secret);

  assert.ok(parsed);
  assert.equal(parsed.user_id, '17841400011122233');
  assert.equal(parsed.algorithm, 'HMAC-SHA256');
});

test('Meta Compliance: tampered payload fails signature validation', () => {
  const secret = 'test_meta_app_secret_998877';
  const originalPayload = {
    user_id: '17841400011122233',
    algorithm: 'HMAC-SHA256',
    issued_at: Math.floor(Date.now() / 1000),
  };

  const signedRequest = createSignedRequest(originalPayload, secret);
  const [sig] = signedRequest.split('.');

  // Alter the payload bytes
  const tamperedPayload = {
    user_id: '99999999999999999',
    algorithm: 'HMAC-SHA256',
    issued_at: Math.floor(Date.now() / 1000),
  };
  const tamperedEncoded = Buffer.from(JSON.stringify(tamperedPayload)).toString('base64');
  const tamperedSignedRequest = `${sig}.${tamperedEncoded}`;

  const parsed = parseSignedRequest(tamperedSignedRequest, secret);
  assert.equal(parsed, null);
});

test('Meta Compliance: invalid secret fails signature validation', () => {
  const secret = 'correct_secret';
  const wrongSecret = 'wrong_secret';
  const payload = {
    user_id: '17841400011122233',
    algorithm: 'HMAC-SHA256',
    issued_at: Math.floor(Date.now() / 1000),
  };

  const signedRequest = createSignedRequest(payload, secret);
  const parsed = parseSignedRequest(signedRequest, wrongSecret);

  assert.equal(parsed, null);
});

test('Meta Compliance: malformed signed_request returns null safely', () => {
  assert.equal(parseSignedRequest('invalid_format', 'secret'), null);
  assert.equal(parseSignedRequest('', 'secret'), null);
  assert.equal(parseSignedRequest('no_period_here', 'secret'), null);
  assert.equal(parseSignedRequest('sig.not_base64_json!!!', 'secret'), null);
});
