import test from 'node:test';
import assert from 'node:assert/strict';
import { matchComment, renderReplyTemplate } from '../src/lib/matcher.ts';

test('Matcher: matches substring keyword in lowercase comment', () => {
  const result = matchComment('Can you send the link please?', ['link', 'guide'], 'contains');
  assert.equal(result.matched, true);
  assert.equal(result.keyword, 'link');
});

test('Matcher: case-insensitive matching', () => {
  const result = matchComment('PLEASE SEND THE LINK!', ['link'], 'contains');
  assert.equal(result.matched, true);
  assert.equal(result.keyword, 'link');
});

test('Matcher: non-matching comment returns false', () => {
  const result = matchComment('Awesome photo bro', ['link', 'guide'], 'contains');
  assert.equal(result.matched, false);
  assert.equal(result.keyword, null);
});

test('Matcher: exact match requires identical text', () => {
  const matchExact = matchComment('link', ['link'], 'exact');
  assert.equal(matchExact.matched, true);

  const matchExtra = matchComment('link please', ['link'], 'exact');
  assert.equal(matchExtra.matched, false);
});

test('Matcher: empty or invalid keywords return false', () => {
  assert.equal(matchComment('hello', []).matched, false);
  assert.equal(matchComment('', ['link']).matched, false);
});

test('Template: safely substitutes {{username}} and {{name}}', () => {
  const template = 'Hey {{username}}! Check your DMs {{name}}.';
  const rendered = renderReplyTemplate(template, { username: 'alex_dev', name: 'Alex' });
  assert.equal(rendered, 'Hey @alex_dev! Check your DMs Alex.');
});
