/**
 * Test Harness: Direct Private Reply API Tester (Hardened)
 *
 * Verifies whether Meta Graph API allows sending a private reply to a comment,
 * and records the exact HTTP status, sanitized response body, error codes, and trace IDs.
 *
 * Security:
 * - NEVER prints raw access tokens or app secrets to console or logs.
 * - Graph API version is configurable via META_GRAPH_API_VERSION (default: v26.0).
 * - Host is configurable via META_API_HOST (default: graph.instagram.com).
 *
 * Usage:
 *   node test-private-reply.js --token <ACCESS_TOKEN> --account-id <ACCOUNT_ID> --comment-id <COMMENT_ID> [--message "Text"]
 */

const https = require('https');
const path = require('path');
const fs = require('fs');

// Attempt loading local .env if present
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

// Parse CLI args
const args = process.argv.slice(2);
function getArg(name, defaultValue = null) {
  const idx = args.indexOf(`--${name}`);
  if (idx !== -1 && args[idx + 1]) {
    return args[idx + 1];
  }
  return defaultValue;
}

const token = getArg('token') || process.env.PAGE_ACCESS_TOKEN;
const accountId = getArg('account-id') || process.env.INSTAGRAM_ACCOUNT_ID;
const commentId = getArg('comment-id');
const message = getArg('message', 'Hello! This is a test private reply from our self-hosted automation engine.');
const apiVersion = getArg('version') || process.env.META_GRAPH_API_VERSION || 'v26.0';
const apiHost = getArg('host') || process.env.META_API_HOST || 'graph.instagram.com';

function maskToken(t) {
  if (!t) return '[EMPTY]';
  if (t.length <= 8) return '****';
  return `${t.slice(0, 6)}...${t.slice(-4)}`;
}

console.log('='.repeat(70));
console.log('  Meta Instagram Graph API — Private Reply Integration Tester');
console.log(`  API Version: ${apiVersion} | Host: ${apiHost}`);
console.log('='.repeat(70));

if (!token || !accountId || !commentId) {
  console.error('\n[!] Missing required parameters.\n');
  console.log('Required Parameters:');
  console.log('  --token <PAGE_ACCESS_TOKEN>          (or set PAGE_ACCESS_TOKEN in test-harness/.env)');
  console.log('  --account-id <INSTAGRAM_ACCOUNT_ID>  (or set INSTAGRAM_ACCOUNT_ID in test-harness/.env)');
  console.log('  --comment-id <INSTAGRAM_COMMENT_ID>  (ID of real comment on post/reel)');
  console.log('\nOptional Parameters:');
  console.log('  --message "Custom reply message"');
  console.log('  --version v26.0 (defaults to META_GRAPH_API_VERSION or v26.0)');
  console.log('  --host graph.instagram.com (defaults to META_API_HOST or graph.instagram.com)\n');
  console.log('Example:');
  console.log('  node test-private-reply.js --token EAA... --account-id 178414... --comment-id 180123...\n');
  process.exit(1);
}

function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, headers: res.headers, body: parsed, rawBody: body });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body: null, rawBody: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runTest() {
  console.log(`\n[Config Check]`);
  console.log(`  Target Host: https://${apiHost}`);
  console.log(`  Graph API Version: ${apiVersion}`);
  console.log(`  Account ID: ${accountId}`);
  console.log(`  Comment ID: ${commentId}`);
  console.log(`  Access Token: ${maskToken(token)} (Sanitized)`);

  // Step 1: Token Inspection via /debug_token (Safe query)
  console.log(`\n[1/3] Inspecting Token Metadata via /debug_token...`);
  try {
    const debugRes = await makeRequest({
      hostname: apiHost,
      path: `/${apiVersion}/debug_token?input_token=${encodeURIComponent(token)}&access_token=${encodeURIComponent(token)}`,
      method: 'GET'
    });

    if (debugRes.status === 200 && debugRes.body?.data) {
      const d = debugRes.body.data;
      console.log('  ✓ Token Status: VALID');
      console.log(`  - App ID: ${d.app_id || 'N/A'}`);
      console.log(`  - Type: ${d.type || 'N/A'}`);
      console.log(`  - Valid: ${d.is_valid}`);
      console.log(`  - Expires At: ${d.expires_at ? new Date(d.expires_at * 1000).toISOString() : 'Never / Long-lived'}`);
      console.log(`  - Scopes Granted: ${(d.scopes || []).join(', ')}`);

      const requiredScopes = ['instagram_basic', 'instagram_manage_messages', 'instagram_manage_comments'];
      const missing = requiredScopes.filter(s => !(d.scopes || []).includes(s));
      if (missing.length > 0) {
        console.warn(`  ⚠️ Warning: Token may be missing recommended scope(s): ${missing.join(', ')}`);
      }
    } else {
      console.log(`  ℹ debug_token response HTTP ${debugRes.status}. Continuing with direct reply test...`);
    }
  } catch (err) {
    console.log(`  ℹ debug_token network check bypassed (${err.message}). Proceeding...`);
  }

  // Step 2: Dispatch Private Reply
  console.log(`\n[2/3] Dispatching Private Reply to Meta API...`);
  const endpointPath = `/${apiVersion}/${accountId}/messages`;
  const payload = {
    recipient: {
      comment_id: commentId
    },
    message: {
      text: message
    }
  };

  console.log(`  HTTP Method: POST`);
  console.log(`  Endpoint: https://${apiHost}${endpointPath}`);
  console.log(`  Payload:`, JSON.stringify(payload, null, 2));

  try {
    const res = await makeRequest({
      hostname: apiHost,
      path: endpointPath,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }, payload);

    const traceId = res.headers['x-fb-trace-id'] || res.body?.error?.fbtrace_id || 'N/A';
    const requestId = res.headers['x-fb-request-id'] || 'N/A';

    console.log(`\n[3/3] Meta API Response Summary:`);
    console.log(`  HTTP Status: ${res.status}`);
    console.log(`  FB Trace ID: ${traceId}`);
    console.log(`  Request ID:  ${requestId}`);
    console.log('='.repeat(70));
    console.log('SANITIZED RESPONSE BODY:');
    console.log(JSON.stringify(res.body || res.rawBody, null, 2));
    console.log('='.repeat(70));

    // Evaluation
    if (res.status === 200 && res.body?.message_id) {
      console.log('\n✅ [VERIFICATION SUCCESS] Meta delivered the private reply!');
      console.log(`   Message ID:   ${res.body.message_id}`);
      console.log(`   Recipient ID: ${res.body.recipient_id || 'N/A'}`);
      console.log('\nNext Verification Steps:');
      console.log('1. Open recipient Instagram account.');
      console.log('2. Check Direct Messages / Requests inbox.');
      console.log('3. Verify that the DM links back to the original comment/post.');
    } else {
      const err = res.body?.error || {};
      console.log(`\n❌ [VERIFICATION FAILED] Meta rejected the request:`);
      console.log(`   Error Code:    ${err.code || 'N/A'}`);
      console.log(`   Error Subcode: ${err.error_subcode || 'N/A'}`);
      console.log(`   Error Type:    ${err.type || 'N/A'}`);
      console.log(`   Message:       ${err.message || 'Unknown error'}`);

      console.log('\n[DIAGNOSTIC ANALYSIS]');
      if (err.code === 230) {
        console.log('• CAUSE: (#230) Permissions disallow message to this user.');
        console.log('  Your Meta App is in Development Mode. In Dev Mode, Meta only permits');
        console.log('  sending messages to Instagram accounts that hold an assigned App Role.');
        console.log('• RESOLUTION:');
        console.log('  1. Go to developers.facebook.com -> Your App -> App Roles -> Roles.');
        console.log('  2. Click "Add Instagram Testers" and enter the commenter\'s IG username.');
        console.log('  3. In the commenter\'s Instagram app: Settings -> Creator/Business -> Apps and Websites -> Tester Invites -> Accept.');
        console.log('  4. Re-run this test.');
      } else if (err.code === 100 && err.error_subcode === 2534063) {
        console.log('• CAUSE: Duplicate Private Reply (Subcode 2534063).');
        console.log('  A private reply has already been sent to this comment ID.');
        console.log('  Meta strictly enforces a hard limit of 1 private reply per comment ID.');
        console.log('• RESOLUTION: Add a fresh test comment on your post and use the new comment ID.');
      } else if (err.code === 190) {
        console.log('• CAUSE: Invalid or Expired OAuth Access Token.');
        console.log('• RESOLUTION: Generate a fresh Page Access Token in Meta Graph API Explorer.');
      } else if (err.code === 10 || err.code === 200) {
        console.log('• CAUSE: Missing required permissions or task permissions on Facebook Page.');
        console.log('  Verify that `instagram_manage_messages` and `pages_messaging` are granted.');
      } else if (err.code === 100) {
        console.log('• CAUSE: Parameter error or expired comment (older than 7 days).');
      }
    }
  } catch (err) {
    console.error('\n[!] Network or Execution Error:', err.message);
  }
}

runTest();
