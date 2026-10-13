import test from 'node:test';
import assert from 'node:assert/strict';
import {
  META_API_VERSION,
  META_API_HOST,
  INSTAGRAM_OAUTH_AUTHORIZE_URL,
  INSTAGRAM_TOKEN_EXCHANGE_URL,
  INSTAGRAM_BUSINESS_SCOPES,
  exchangeInstagramCode,
  getLongLivedInstagramToken,
  refreshLongLivedInstagramToken,
  getInstagramUserProfile,
  subscribeAccountWebhooks,
  getAccountWebhookSubscriptions,
  unsubscribeAccountWebhooks,
  getInstagramMedia,
  sendPrivateReply
} from '../src/lib/meta.ts';

test('Instagram Config: defaults to v26.0 and graph.instagram.com', () => {
  assert.equal(META_API_VERSION, 'v26.0');
  assert.equal(META_API_HOST, 'graph.instagram.com');
  assert.equal(INSTAGRAM_OAUTH_AUTHORIZE_URL, 'https://www.instagram.com/oauth/authorize');
  assert.equal(INSTAGRAM_TOKEN_EXCHANGE_URL, 'https://api.instagram.com/oauth/access_token');
});

test('Instagram Scopes: requests strictly Instagram Business scopes with zero Facebook Page permissions', () => {
  const scopes = INSTAGRAM_BUSINESS_SCOPES;

  // Must contain pure Instagram business scopes
  assert.equal(scopes.includes('instagram_business_basic'), true);
  assert.equal(scopes.includes('instagram_business_manage_messages'), true);
  assert.equal(scopes.includes('instagram_business_manage_comments'), true);

  // Must NOT contain any Facebook Page scopes
  assert.equal(scopes.includes('pages_show_list'), false);
  assert.equal(scopes.includes('pages_read_engagement'), false);
  assert.equal(scopes.includes('pages_manage_metadata'), false);
  assert.equal(scopes.includes('pages_messaging'), false);
  assert.equal(scopes.includes('business_management'), false);
});

test('OAuth Authorization URL Builder: constructs valid Instagram OAuth URL with CSRF state', () => {
  const appId = '1234567890123456';
  const redirectUri = 'https://autodm.app/api/auth/instagram/callback';
  const state = 'csrf_state_token_123456';

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: INSTAGRAM_BUSINESS_SCOPES.join(','),
    state: state,
    enable_fb_login: '0',
    force_authentication: '1',
  });

  const authUrl = `${INSTAGRAM_OAUTH_AUTHORIZE_URL}?${params.toString()}`;

  assert.equal(authUrl.startsWith('https://www.instagram.com/oauth/authorize?'), true);
  assert.equal(authUrl.includes('client_id=1234567890123456'), true);
  assert.equal(authUrl.includes('response_type=code'), true);
  assert.equal(authUrl.includes('scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments'), true);
  assert.equal(authUrl.includes('state=csrf_state_token_123456'), true);
  assert.equal(authUrl.includes('enable_fb_login=0'), true);
});

test('OAuth Step 1: exchangeInstagramCode sends valid form-urlencoded payload and parses short-lived token', async () => {
  const originalFetch = globalThis.fetch;
  let interceptedUrl = '';
  let interceptedMethod = '';
  let interceptedBody = '';

  globalThis.fetch = async (url, opts) => {
    interceptedUrl = String(url);
    interceptedMethod = opts.method;
    interceptedBody = String(opts.body);
    return {
      ok: true,
      json: async () => ({
        access_token: 'IGQVJ_short_lived_test_token_12345',
        user_id: '17841400000000001'
      })
    };
  };

  try {
    const res = await exchangeInstagramCode(
      'auth_code_sample',
      'https://autodm.app/api/auth/instagram/callback',
      '1234567890123456',
      'test_app_secret'
    );

    assert.equal(interceptedUrl, 'https://api.instagram.com/oauth/access_token');
    assert.equal(interceptedMethod, 'POST');
    assert.equal(interceptedBody.includes('grant_type=authorization_code'), true);
    assert.equal(interceptedBody.includes('client_id=1234567890123456'), true);
    assert.equal(interceptedBody.includes('code=auth_code_sample'), true);

    assert.equal(res.access_token, 'IGQVJ_short_lived_test_token_12345');
    assert.equal(res.user_id, '17841400000000001');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('OAuth Step 2: getLongLivedInstagramToken exchanges short-lived token via ig_exchange_token', async () => {
  const originalFetch = globalThis.fetch;
  let interceptedUrl = '';

  globalThis.fetch = async (url) => {
    interceptedUrl = String(url);
    return {
      ok: true,
      json: async () => ({
        access_token: 'IGAA_long_lived_60_day_token_99999',
        token_type: 'bearer',
        expires_in: 5184000 // 60 days
      })
    };
  };

  try {
    const res = await getLongLivedInstagramToken('IGQVJ_short_lived_token', 'app_secret_123');

    assert.equal(interceptedUrl.includes('graph.instagram.com/access_token?'), true);
    assert.equal(interceptedUrl.includes('grant_type=ig_exchange_token'), true);
    assert.equal(interceptedUrl.includes('client_secret=app_secret_123'), true);
    assert.equal(interceptedUrl.includes('access_token=IGQVJ_short_lived_token'), true);

    assert.equal(res.access_token, 'IGAA_long_lived_60_day_token_99999');
    assert.equal(res.expires_in, 5184000);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('OAuth Step 3: refreshLongLivedInstagramToken refreshes active token via ig_refresh_token', async () => {
  const originalFetch = globalThis.fetch;
  let interceptedUrl = '';

  globalThis.fetch = async (url) => {
    interceptedUrl = String(url);
    return {
      ok: true,
      json: async () => ({
        access_token: 'IGAA_refreshed_60_day_token',
        token_type: 'bearer',
        expires_in: 5184000
      })
    };
  };

  try {
    const res = await refreshLongLivedInstagramToken('IGAA_current_token');

    assert.equal(interceptedUrl.includes('graph.instagram.com/refresh_access_token?'), true);
    assert.equal(interceptedUrl.includes('grant_type=ig_refresh_token'), true);
    assert.equal(interceptedUrl.includes('access_token=IGAA_current_token'), true);

    assert.equal(res.access_token, 'IGAA_refreshed_60_day_token');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('OAuth Step 4: getInstagramUserProfile queries v26.0 /me with business identity fields', async () => {
  const originalFetch = globalThis.fetch;
  let interceptedUrl = '';

  globalThis.fetch = async (url) => {
    interceptedUrl = String(url);
    return {
      ok: true,
      json: async () => ({
        user_id: '178414055219901',
        username: 'creator_studio',
        name: 'Creator Studio Official',
        profile_picture_url: 'https://example.com/avatar.jpg',
        account_type: 'BUSINESS'
      })
    };
  };

  try {
    const profile = await getInstagramUserProfile('mock_access_token');

    assert.equal(interceptedUrl.includes(`graph.instagram.com/${META_API_VERSION}/me?`), true);
    assert.equal(interceptedUrl.includes('fields=user_id,username,name,profile_picture_url,account_type'), true);

    assert.equal(profile.user_id, '178414055219901');
    assert.equal(profile.username, 'creator_studio');
    assert.equal(profile.account_type, 'BUSINESS');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('Per-Account Webhooks: subscribeAccountWebhooks calls v26.0 /{user_id}/subscribed_apps with fields', async () => {
  const originalFetch = globalThis.fetch;
  let interceptedUrl = '';
  let interceptedMethod = '';

  globalThis.fetch = async (url, opts) => {
    interceptedUrl = String(url);
    interceptedMethod = opts.method;
    return {
      ok: true,
      json: async () => ({ success: true })
    };
  };

  try {
    const res = await subscribeAccountWebhooks('178414055219901', 'token_123', 'comments,messages');

    assert.equal(interceptedMethod, 'POST');
    assert.equal(interceptedUrl.includes(`graph.instagram.com/${META_API_VERSION}/178414055219901/subscribed_apps?`), true);
    assert.equal(interceptedUrl.includes('subscribed_fields=comments%2Cmessages'), true);
    assert.equal(res.success, true);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('Per-Account Webhooks: getAccountWebhookSubscriptions queries active subscribed fields', async () => {
  const originalFetch = globalThis.fetch;
  let interceptedUrl = '';

  globalThis.fetch = async (url) => {
    interceptedUrl = String(url);
    return {
      ok: true,
      json: async () => ({
        data: [{ subscribed_fields: ['comments', 'messages'] }]
      })
    };
  };

  try {
    const res = await getAccountWebhookSubscriptions('178414055219901', 'token_123');

    assert.equal(interceptedUrl.includes(`graph.instagram.com/${META_API_VERSION}/178414055219901/subscribed_apps?`), true);
    assert.equal(res.success, true);
    assert.deepEqual(res.subscribed_fields, ['comments', 'messages']);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('Per-Account Webhooks: unsubscribeAccountWebhooks sends DELETE request to subscribed_apps', async () => {
  const originalFetch = globalThis.fetch;
  let interceptedMethod = '';

  globalThis.fetch = async (url, opts) => {
    interceptedMethod = opts.method;
    return {
      ok: true,
      json: async () => ({ success: true })
    };
  };

  try {
    const res = await unsubscribeAccountWebhooks('178414055219901', 'token_123');

    assert.equal(interceptedMethod, 'DELETE');
    assert.equal(res.success, true);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('Media Retrieval: getInstagramMedia requests v26.0 /{user_id}/media with required fields', async () => {
  const originalFetch = globalThis.fetch;
  let interceptedUrl = '';

  globalThis.fetch = async (url) => {
    interceptedUrl = String(url);
    return {
      ok: true,
      json: async () => ({
        data: [
          {
            id: 'media_101',
            caption: 'Awesome Reel about automation #saas',
            media_type: 'VIDEO',
            media_url: 'https://example.com/video.mp4',
            thumbnail_url: 'https://example.com/thumb.jpg',
            permalink: 'https://instagram.com/reel/101',
            timestamp: '2026-10-14T00:00:00+0000'
          }
        ]
      })
    };
  };

  try {
    const media = await getInstagramMedia('178414055219901', 'mock_token', 15);

    assert.equal(interceptedUrl.includes(`graph.instagram.com/${META_API_VERSION}/178414055219901/media?`), true);
    assert.equal(interceptedUrl.includes('fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp'), true);
    assert.equal(interceptedUrl.includes('limit=15'), true);

    assert.equal(media.length, 1);
    assert.equal(media[0].id, 'media_101');
    assert.equal(media[0].media_type, 'VIDEO');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('Private Reply: sendPrivateReply sends recipient.comment_id to v26.0 /{user_id}/messages', async () => {
  const originalFetch = globalThis.fetch;
  let interceptedUrl = '';
  let interceptedMethod = '';
  let interceptedHeaders = {};
  let interceptedBody = null;

  globalThis.fetch = async (url, opts) => {
    interceptedUrl = String(url);
    interceptedMethod = opts.method;
    interceptedHeaders = opts.headers;
    interceptedBody = JSON.parse(opts.body);
    return {
      ok: true,
      status: 200,
      headers: { get: (h) => (h === 'x-fb-trace-id' ? 'Trace-ABC-123' : null) },
      json: async () => ({
        message_id: 'mid.18042918239012345',
        recipient_id: '17841499999999999'
      })
    };
  };

  try {
    const result = await sendPrivateReply(
      '178414055219901',
      'long_lived_token_xyz',
      '18042918239012345',
      'Hey @creator! Here is your link: https://example.com'
    );

    assert.equal(interceptedMethod, 'POST');
    assert.equal(interceptedUrl, `https://graph.instagram.com/${META_API_VERSION}/178414055219901/messages`);
    assert.equal(interceptedHeaders['Authorization'], 'Bearer long_lived_token_xyz');
    assert.equal(interceptedBody.recipient.comment_id, '18042918239012345');
    assert.equal(interceptedBody.message.text, 'Hey @creator! Here is your link: https://example.com');

    assert.equal(result.success, true);
    assert.equal(result.message_id, 'mid.18042918239012345');
    assert.equal(result.recipient_id, '17841499999999999');
    assert.equal(result.fb_trace_id, 'Trace-ABC-123');
  } finally {
    globalThis.fetch = originalFetch;
  }
});
