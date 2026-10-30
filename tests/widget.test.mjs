import test from 'node:test';
import assert from 'node:assert/strict';
import { allowedWidgetOrigin, createRateLimiter, parseWidgetOrigins } from '../lib/widget.ts';

test('Widget origin list keeps only valid HTTPS (or localhost) origins', () => {
  assert.deepEqual(
    parseWidgetOrigins(' https://KYC.Bank.ng/path , http://evil.example, not a url,,http://localhost:4000'),
    ['https://kyc.bank.ng', 'http://localhost:4000']
  );
  assert.deepEqual(parseWidgetOrigins(undefined), []);
});

test('Widget accepts same-site and allowlisted origins only', () => {
  const site = 'https://postcheck-nine.vercel.app';
  const list = ['https://kyc.bank.ng'];
  assert.equal(allowedWidgetOrigin(site, site, list), site);
  assert.equal(allowedWidgetOrigin('https://kyc.bank.ng', site, list), 'https://kyc.bank.ng');
  assert.equal(allowedWidgetOrigin('https://kyc.bank.ng.evil.example', site, list), null);
  assert.equal(allowedWidgetOrigin('null', site, list), null);
  assert.equal(allowedWidgetOrigin(null, site, list), null);
});

test('Widget rate limiter blocks after the limit and resets after the window', () => {
  const limit = createRateLimiter({ max: 2, windowMs: 1000 });
  assert.equal(limit('a', 0).allowed, true);
  assert.equal(limit('a', 10).allowed, true);
  const blocked = limit('a', 20);
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.retryAfter, 1);
  assert.equal(limit('b', 20).allowed, true);
  assert.equal(limit('a', 1001).allowed, true);
});
