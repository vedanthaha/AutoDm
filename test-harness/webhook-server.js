/**
 * Test Harness: Hardened Standalone Webhook Listener & Idempotent Automation Dispatcher
 *
 * Reliability & Security:
 * 1. Handles Meta Webhook Verification Handshake (GET /webhook).
 * 2. Receives Live Instagram Comments (POST /webhook).
 * 3. Verifies raw body HMAC-SHA256 signature (X-Hub-Signature-256) timing-safe against APP_SECRET.
 * 4. Database-backed atomic unique constraint idempotency ledger (IdempotencyLedger).
 * 5. Safe dispatch handling: does NOT mark an event as delivered until Meta API returns 200 OK with message_id.
 * 6. Never logs access tokens or app secrets.
 * 7. Configurable Meta Graph API version (META_GRAPH_API_VERSION, default v26.0).
 *
 * Usage:
 *   node webhook-server.js
 */

const http = require('http');
const https = require('https');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const { IdempotencyLedger } = require('./ledger');

// Load environment from test-harness/.env if present
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

const PORT = parseInt(process.env.PORT || '3000', 10);
const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || 'hyperdm_dev_verify_token_2026';
const APP_SECRET = process.env.META_APP_SECRET || '';
const ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN || '';
const ACCOUNT_ID = process.env.INSTAGRAM_ACCOUNT_ID || '';
const GRAPH_VERSION = process.env.META_GRAPH_API_VERSION || 'v26.0';
const API_HOST = process.env.META_API_HOST || 'graph.instagram.com';
const KEYWORDS = (process.env.TRIGGER_KEYWORDS || 'link,guide,dm,send,auto').toLowerCase().split(',').map(k => k.trim());
const REPLY_MESSAGE = process.env.REPLY_MESSAGE || 'Hey {{username}}! Here is the link you requested: https://example.com/demo';

const ledger = new IdempotencyLedger();

function maskToken(t) {
  if (!t) return '[UNCONFIGURED]';
  if (t.length <= 8) return '****';
  return `${t.slice(0, 6)}...${t.slice(-4)}`;
}

/**
 * Timing-safe HMAC-SHA256 signature verification on raw request Buffer
 */
function verifySignature(rawBodyBuffer, signatureHeader) {
  if (!APP_SECRET) return true; // Secret not set in local dev testing
  if (!signatureHeader || !signatureHeader.startsWith('sha256=')) return false;

  try {
    const expectedSigHex = signatureHeader.substring(7);
    const expectedSigBuffer = Buffer.from(expectedSigHex, 'hex');

    const hmac = crypto.createHmac('sha256', APP_SECRET);
    hmac.update(rawBodyBuffer);
    const calculatedSigBuffer = Buffer.from(hmac.digest('hex'), 'hex');

    if (expectedSigBuffer.length !== calculatedSigBuffer.length) {
      return false;
    }
    return crypto.timingSafeEqual(expectedSigBuffer, calculatedSigBuffer);
  } catch (e) {
    console.error('[!] Signature check error:', e.message);
    return false;
  }
}

/**
 * Dispatches private reply using Meta Graph API
 * Returns: { success: boolean, message_id?: string, recipient_id?: string, status?: number, error?: object }
 */
function sendPrivateReply(commentId, commenterUsername) {
  return new Promise((resolve) => {
    if (!ACCESS_TOKEN || !ACCOUNT_ID) {
      console.log('\n[SIMULATION MODE] ACCESS_TOKEN or INSTAGRAM_ACCOUNT_ID is unconfigured.');
      console.log('                 Simulating successful dispatch locally without sending to Meta.');
      return resolve({
        success: true,
        simulation: true,
        message_id: `sim_msg_${Date.now()}`,
        recipient_id: `sim_rec_${commenterUsername}`
      });
    }

    const endpointPath = `/${GRAPH_VERSION}/${ACCOUNT_ID}/messages`;
    const text = REPLY_MESSAGE.replace('{{username}}', commenterUsername || 'there');
    const payload = JSON.stringify({
      recipient: {
        comment_id: commentId
      },
      message: {
        text: text
      }
    });

    console.log(`\n>>> Dispatching Private Reply to Meta Graph API...`);
    console.log(`    Target: POST https://${API_HOST}${endpointPath}`);
    console.log(`    Payload:`, payload);

    const req = https.request({
      hostname: API_HOST,
      path: endpointPath,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ACCESS_TOKEN}`
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(body);
        } catch (e) {}

        const fbTraceId = res.headers['x-fb-trace-id'] || parsed?.error?.fbtrace_id || 'N/A';
        console.log(`<<< Meta Response HTTP ${res.statusCode} (Trace: ${fbTraceId}):`);
        console.log(JSON.stringify(parsed || body, null, 2));

        if (res.statusCode === 200 && parsed?.message_id) {
          resolve({
            success: true,
            status: res.statusCode,
            message_id: parsed.message_id,
            recipient_id: parsed.recipient_id,
            fbTraceId
          });
        } else {
          resolve({
            success: false,
            status: res.statusCode,
            error: parsed?.error || { message: body || 'HTTP ' + res.statusCode },
            fbTraceId
          });
        }
      });
    });

    req.on('error', (err) => {
      console.error('[!] Dispatch Network Error:', err.message);
      resolve({
        success: false,
        error: { message: err.message, code: 'NETWORK_ERROR' }
      });
    });

    req.write(payload);
    req.end();
  });
}

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);

  // 1. Webhook Verification Handshake (GET /webhook)
  if (req.method === 'GET' && parsedUrl.pathname === '/webhook') {
    const mode = parsedUrl.searchParams.get('hub.mode');
    const token = parsedUrl.searchParams.get('hub.verify_token');
    const challenge = parsedUrl.searchParams.get('hub.challenge');

    console.log(`\n[WEBHOOK HANDSHAKE] Received GET request: mode=${mode}, token=${token}`);

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('✓ Verification token matches! Returning challenge response.');
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      return res.end(challenge);
    } else {
      console.warn('✗ Verification failed: Token mismatch or invalid mode.');
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      return res.end('Verification token mismatch');
    }
  }

  // 2. Inbound Webhook Event Notification (POST /webhook or POST /simulate-event)
  if (req.method === 'POST' && (parsedUrl.pathname === '/webhook' || parsedUrl.pathname === '/simulate-event')) {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', async () => {
      const rawBodyBuffer = Buffer.concat(chunks);
      const rawBodyString = rawBodyBuffer.toString('utf8');

      // Signature verification against raw byte buffer
      if (parsedUrl.pathname === '/webhook') {
        const sigHeader = req.headers['x-hub-signature-256'];
        if (APP_SECRET && !verifySignature(rawBodyBuffer, sigHeader)) {
          console.error('[SECURITY ALERT] Invalid webhook HMAC signature! Rejecting request.');
          res.writeHead(401, { 'Content-Type': 'text/plain' });
          return res.end('Invalid signature');
        }
      }

      let data;
      try {
        data = JSON.parse(rawBodyString);
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        return res.end('Invalid JSON payload');
      }

      console.log('\n' + '='.repeat(70));
      console.log(`[INBOUND EVENT] Received at ${new Date().toISOString()}:`);
      console.log(JSON.stringify(data, null, 2));

      // Process Instagram Webhook Entry
      if (data.object === 'instagram' && Array.isArray(data.entry)) {
        for (const entry of data.entry) {
          const changes = entry.changes || [];
          for (const change of changes) {
            if (change.field === 'comments') {
              const val = change.value;
              const commentId = val.id;
              const text = val.text || '';
              const commenter = val.from?.username || 'user';
              const mediaId = val.media?.id || 'unknown_media';

              console.log(`\n[COMMENT DETECTED]`);
              console.log(`  Comment ID: ${commentId}`);
              console.log(`  Author: @${commenter}`);
              console.log(`  Media ID: ${mediaId}`);
              console.log(`  Text: "${text}"`);

              // KEYWORD MATCHING
              const textLower = text.toLowerCase();
              const matchedKeyword = KEYWORDS.find(kw => textLower.includes(kw));

              if (!matchedKeyword) {
                console.log(`  - No configured keywords (${KEYWORDS.join(', ')}) matched in comment. Skipping.`);
                continue;
              }

              console.log(`  ✓ Keyword matched: "${matchedKeyword}"`);

              // ATOMIC IDEMPOTENCY CLAIM
              const claim = ledger.claimComment(commentId, commenter, mediaId, matchedKeyword);
              if (!claim.claimed) {
                const existing = claim.existingRecord;
                console.log(`  [IDEMPOTENCY] ⚠️ Comment ${commentId} has already been registered.`);
                console.log(`  Current Record Status: "${existing?.status}".`);
                if (existing?.status === 'delivered') {
                  console.log(`  Duplicate webhook delivery SUPPRESSED. No duplicate DM will be sent.`);
                } else if (existing?.status === 'pending') {
                  console.log(`  In-flight delivery currently in progress. Skipping duplicate concurrent worker.`);
                }
                continue;
              }

              // SAFE DISPATCH: Only mark delivered AFTER confirmed acceptance
              console.log(`  [DISPATCH] Processing reply for comment ${commentId}...`);
              const dispatchResult = await sendPrivateReply(commentId, commenter);

              if (dispatchResult.success) {
                ledger.markDelivered(commentId, dispatchResult.message_id, dispatchResult.recipient_id);
                console.log(`  ✓ [LEDGER UPDATED] Status set to 'delivered' (Message ID: ${dispatchResult.message_id}).`);
              } else {
                const errCode = dispatchResult.error?.code || dispatchResult.status || 0;
                const errMsg = dispatchResult.error?.message || 'Meta API rejected request';
                ledger.markFailed(commentId, errCode, errMsg);
                console.log(`  ✗ [LEDGER UPDATED] Status set to 'failed' (Error: ${errCode} - ${errMsg}).`);
                console.log(`  Event NOT marked successful, preventing premature completion records.`);
              }
            }
          }
        }
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', received: true }));
      console.log('='.repeat(70));
    });
    return;
  }

  // Health check & status
  if (req.method === 'GET' && (parsedUrl.pathname === '/' || parsedUrl.pathname === '/status')) {
    const recent = ledger.listRecent(10);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      app: 'HyperDM Webhook Automation Engine',
      status: 'ready',
      apiVersion: GRAPH_VERSION,
      apiHost: API_HOST,
      tokenConfigured: !!ACCESS_TOKEN,
      accountIdConfigured: !!ACCOUNT_ID,
      verifyToken: VERIFY_TOKEN,
      configuredKeywords: KEYWORDS,
      recentDispatches: recent
    }, null, 2));
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log('='.repeat(70));
  console.log(`  HyperDM Webhook Server active on http://localhost:${PORT}`);
  console.log(`  API Target: https://${API_HOST}/${GRAPH_VERSION}`);
  console.log(`  Verify Token: "${VERIFY_TOKEN}"`);
  console.log(`  Page Token: ${maskToken(ACCESS_TOKEN)}`);
  console.log(`  Configured Keywords: [${KEYWORDS.join(', ')}]`);
  console.log('='.repeat(70));
  console.log('\nTo expose this endpoint to Meta using ngrok:');
  console.log(`  ngrok http ${PORT}\n`);
});
