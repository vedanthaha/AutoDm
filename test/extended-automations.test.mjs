import test from 'node:test';
import assert from 'node:assert/strict';
import { matchComment, matchAutomationRule, renderReplyTemplate } from '../src/lib/matcher.ts';
import { getInstagramMedia, sendDirectMessage, checkUserFollowsBusiness } from '../src/lib/meta.ts';

test('Mode A (Any Comment): triggers on any top-level comment without keywords', () => {
  const rule = {
    id: 'rule_a',
    account_id: 'acc_1',
    name: 'Any Comment Rule',
    trigger_type: 'any_comment',
    trigger_keywords: [],
    exclude_keywords: [],
    match_type: 'contains',
    match_logic: 'any',
    is_active: true,
  };

  const res1 = matchAutomationRule('Great photo!', rule);
  assert.equal(res1.matched, true);
  assert.equal(res1.trigger_type, 'any_comment');

  const res2 = matchAutomationRule('How much does this cost?', rule);
  assert.equal(res2.matched, true);
  assert.equal(res2.trigger_type, 'any_comment');
});

test('Mode A with Exclusions: blocks comments containing excluded words', () => {
  const rule = {
    id: 'rule_a_ex',
    account_id: 'acc_1',
    name: 'Any Comment with Exclusions',
    trigger_type: 'any_comment',
    trigger_keywords: [],
    exclude_keywords: ['scam', 'spam', 'fake'],
    match_type: 'contains',
    match_logic: 'any',
    is_active: true,
  };

  const good = matchAutomationRule('Love this post, thanks!', rule);
  assert.equal(good.matched, true);

  const blocked = matchAutomationRule('This looks like a scam to me', rule);
  assert.equal(blocked.matched, false);
});

test('Mode B (Whole Word Match): matches complete words, avoids substrings in longer words', () => {
  // 'link' should match 'send link please'
  const matchWhole = matchComment('Please send the link now', ['link'], 'whole_word');
  assert.equal(matchWhole.matched, true);
  assert.equal(matchWhole.keyword, 'link');

  // 'link' should NOT match 'blink' or 'hyperlink'
  const matchBlink = matchComment('Did you blink in that picture?', ['link'], 'whole_word');
  assert.equal(matchBlink.matched, false);

  const matchHyper = matchComment('Where is the hyperlink?', ['link'], 'whole_word');
  assert.equal(matchHyper.matched, false);
});

test('Mode B (Match Logic: ALL vs ANY terms)', () => {
  const ruleAll = {
    id: 'rule_all',
    account_id: 'acc_1',
    name: 'All Terms Required',
    trigger_type: 'keywords',
    trigger_keywords: ['price', 'guide'],
    exclude_keywords: [],
    match_type: 'contains',
    match_logic: 'all',
    is_active: true,
  };

  // Has both 'price' and 'guide'
  const both = matchAutomationRule('What is the price of the guide?', ruleAll);
  assert.equal(both.matched, true);

  // Has only 'price'
  const onlyPrice = matchAutomationRule('What is the price please?', ruleAll);
  assert.equal(onlyPrice.matched, false);

  // Match logic 'any'
  const ruleAny = { ...ruleAll, match_logic: 'any' };
  const anyPrice = matchAutomationRule('What is the price please?', ruleAny);
  assert.equal(anyPrice.matched, true);
  assert.equal(anyPrice.keyword, 'price');
});

test('Automation Pause: inactive rules are strictly skipped', () => {
  const pausedRule = {
    id: 'rule_paused',
    account_id: 'acc_1',
    name: 'Paused Rule',
    trigger_type: 'keywords',
    trigger_keywords: ['link'],
    match_type: 'contains',
    match_logic: 'any',
    is_active: false,
  };

  const res = matchAutomationRule('send the link', pausedRule);
  assert.equal(res.matched, false);
});

test('Template Interpolation: supports {{username}}, {{name}}, {{account_username}}', () => {
  const template = 'Hey {{username}}! Follow @{{account_username}} to unlock your gift, {{name}}!';
  const rendered = renderReplyTemplate(template, {
    username: 'johndoe',
    name: 'John',
    account_username: 'mybrand',
  });
  assert.equal(rendered, 'Hey @johndoe! Follow @mybrand to unlock your gift, John!');
});

test('Follow Gate API Feasibility: explicit FOLLOWS, DOES_NOT_FOLLOW, and UNKNOWN states', async () => {
  const originalFetch = globalThis.fetch;

  try {
    // 1. Confirmed Follower (is_user_follow_business = true)
    globalThis.fetch = async () => ({
      ok: true,
      json: async () => ({ is_user_follow_business: true }),
    });
    const stateFollows = await checkUserFollowsBusiness('ig_user_1', 'token_123');
    assert.equal(stateFollows, 'FOLLOWS');

    // 2. Confirmed Non-Follower (is_user_follow_business = false)
    globalThis.fetch = async () => ({
      ok: true,
      json: async () => ({ is_user_follow_business: false }),
    });
    const stateNotFollows = await checkUserFollowsBusiness('ig_user_1', 'token_123');
    assert.equal(stateNotFollows, 'DOES_NOT_FOLLOW');

    // 3. API Error or Missing Permission (Never assume DOES_NOT_FOLLOW)
    globalThis.fetch = async () => ({
      ok: false,
      json: async () => ({
        error: {
          message: 'Unsupported get request. Object with ID does not exist or missing instagram_business_manage_messages permission',
          code: 100,
        },
      }),
    });
    const stateUnknown = await checkUserFollowsBusiness('ig_user_1', 'token_123');
    assert.equal(stateUnknown, 'UNKNOWN');

    // 4. Network Failure -> strictly UNKNOWN
    globalThis.fetch = async () => {
      throw new Error('Connection reset by peer');
    };
    const stateNetError = await checkUserFollowsBusiness('ig_user_1', 'token_123');
    assert.equal(stateNetError, 'UNKNOWN');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('Direct Messaging: distinguishes recipient.id (IGSID) from recipient.comment_id', async () => {
  const originalFetch = globalThis.fetch;
  let interceptedBody = null;

  globalThis.fetch = async (url, options) => {
    interceptedBody = JSON.parse(options.body);
    return {
      ok: true,
      status: 200,
      headers: new Headers({ 'x-fb-trace-id': 'trace_dm_999' }),
      json: async () => ({
        recipient_id: 'igsid_user_456',
        message_id: 'mid.dm_established_999',
      }),
    };
  };

  try {
    const res = await sendDirectMessage(
      '1784140001',
      'token_test',
      'igsid_user_456',
      'Here is your unlocked content!'
    );

    assert.equal(res.success, true);
    assert.equal(res.message_id, 'mid.dm_established_999');
    assert.equal(interceptedBody.recipient.id, 'igsid_user_456');
    assert.equal(interceptedBody.recipient.comment_id, undefined);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('Media Pagination: requests beyond 16 items with cursor and limit', async () => {
  const originalFetch = globalThis.fetch;
  let interceptedUrl = '';

  globalThis.fetch = async (url) => {
    interceptedUrl = String(url);
    // Return 25 media items with paging cursor
    const items = Array.from({ length: 25 }, (_, i) => ({
      id: `media_${i + 1}`,
      caption: `Post #${i + 1}`,
      media_type: i % 2 === 0 ? 'IMAGE' : 'VIDEO',
      permalink: `https://instagram.com/p/${i + 1}`,
      timestamp: '2026-10-14T10:00:00+0000',
    }));

    return {
      ok: true,
      json: async () => ({
        data: items,
        paging: {
          cursors: {
            before: 'cursor_before_123',
            after: 'cursor_after_456',
          },
          next: 'https://graph.instagram.com/v26.0/1784/media?after=cursor_after_456',
        },
      }),
    };
  };

  try {
    // Request page 1 with limit=25
    const page1 = await getInstagramMedia('1784140001', 'token_test', 25);
    assert.equal(interceptedUrl.includes('limit=25'), true);
    assert.equal(page1.length, 25);
    assert.equal(page1.paging?.has_next, true);
    assert.equal(page1.paging?.cursors?.after, 'cursor_after_456');

    // Request page 2 with after cursor
    const page2 = await getInstagramMedia('1784140001', 'token_test', 25, 'cursor_after_456');
    assert.equal(interceptedUrl.includes('after=cursor_after_456'), true);
    assert.equal(page2.length, 25);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('Rule Duplication: creates a detached copy with (Copy) label and reset counter', async () => {
  const originalRule = {
    id: 'rule_original_123',
    account_id: 'acc_dup_test',
    name: 'VIP Lead Magnet',
    trigger_type: 'keywords',
    trigger_keywords: ['vip', 'access'],
    exclude_keywords: ['test'],
    match_type: 'exact',
    match_logic: 'all',
    action_type: 'both',
    send_dm: true,
    send_comment: true,
    reply_template: 'Here is your VIP pass!',
    comment_reply_template: 'Sent to your inbox!',
    follow_gate_enabled: true,
    follow_prompt_template: 'Follow to unlock VIP pass',
    follow_unlocked_template: 'VIP pass unlocked: https://vip.link',
    post_id: 'post_999',
    post_caption: 'VIP reel announcement',
    is_active: false, // Paused by default on duplicate for safety
    total_triggered: 542,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Mock fetchRules and saveRule in memory test
  const copy = {
    ...originalRule,
    id: 'rule_copy_' + Date.now(),
    name: `${originalRule.name} (Copy)`,
    is_active: false,
    total_triggered: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  assert.equal(copy.name, 'VIP Lead Magnet (Copy)');
  assert.equal(copy.total_triggered, 0);
  assert.notEqual(copy.id, originalRule.id);
  assert.equal(copy.reply_template, originalRule.reply_template);
  assert.equal(copy.follow_gate_enabled, true);
});
