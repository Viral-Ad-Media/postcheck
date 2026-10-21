import test from 'node:test';
import assert from 'node:assert/strict';
import {
  callNipost,
  accepted,
  runSuite,
  runBatch,
  formatPostcode,
  buildKycHandoffPayload,
  SAMPLE,
  nextQuery,
} from '../lib/nipost.ts';

const key = 'nipost_test_fixture_not_a_real_credential';
const response = (data, status = 200, extraHeaders = {}) =>
  new Response(JSON.stringify(data), { status, headers: extraHeaders });

test('missing and production keys never reach the network', async () => {
  for (const k of [undefined, 'nipost_live_fixture']) {
    const r = await callNipost('lookup', { code: SAMPLE }, k, () => {
      throw Error('must not call');
    });
    assert.equal(r.source, 'application');
    assert.equal(r.ok, false);
  }
});

test('lookup forces L1, sends secret only in header, forbids redirects', async () => {
  const r = await callNipost(
    'lookup',
    { code: SAMPLE, level: 5 },
    key,
    async (url, init) => {
      assert.match(url, /level=1$/);
      assert.equal(init.headers['X-API-Key'], key);
      assert.equal(init.redirect, 'error');
      return response({ data: { postcode: SAMPLE, valid: true } });
    }
  );
  assert.equal(accepted(r), true);
});

test('bad postcode actually reaches upstream and rejection passes', async () => {
  const r = await callNipost('bad-postcode', {}, key, async (url) => {
    assert.match(url, /NOT-A-POSTCODE/);
    return response(
      { error: { code: 'invalid_postcode', message: 'Bad postcode' } },
      400
    );
  });
  assert.equal(r.source, 'nipost');
  assert.equal(accepted(r), true);
});

test('auth, rate limit, server failure and malformed payload never pass negative test', async () => {
  for (const status of [401, 403, 429, 500]) {
    const r = await callNipost('bad-postcode', {}, key, async () =>
      response({ error: { code: 'error', message: 'fail' } }, status)
    );
    assert.equal(accepted(r), false);
  }
  const malformed = await callNipost('bad-postcode', {}, key, async () =>
    new Response('<html>oops</html>', { status: 400 })
  );
  assert.equal(accepted(malformed), false);
});

test('redacts echoed secret and handles unreachable upstream', async () => {
  const r = await callNipost('lookup', { code: SAMPLE }, key, async () =>
    response({ error: { code: 'auth', message: key } }, 401)
  );
  assert.equal(JSON.stringify(r).includes(key), false);
  const failure = await callNipost('lookup', { code: SAMPLE }, key, async () => {
    throw Error(key);
  });
  assert.equal(failure.error.code, 'upstream_unavailable');
  assert.equal(JSON.stringify(failure).includes(key), false);
});

test('unexpected success schema cannot create a false positive', async () => {
  const r = await callNipost('lookup', { code: SAMPLE }, key, async () =>
    response({ data: { valid: 'true' } })
  );
  assert.equal(r.ok, false);
});

test('suite executes four actual fetches and requires matching assembly', async () => {
  let calls = 0;
  const results = await runSuite(key, async (url) => {
    calls++;
    if (url.includes('autocomplete'))
      return response({
        data: { segment: 'unit', suggestions: [{ code: '27' }] },
      });
    if (url.includes('assembly'))
      return response({ data: { postcode: SAMPLE } });
    if (url.includes('NOT-A')) return response({ data: { valid: false } });
    return response({ data: { postcode: SAMPLE, valid: true } });
  });
  assert.equal(calls, 4);
  assert.equal(results.every((r) => r.passed), true);
  assert.equal(accepted({ ...results[2], data: { postcode: 'WRONG' } }), false);
});

test('segment suggestions extend or replace active segment correctly', () => {
  assert.equal(nextQuery('FC01A01KP', 'unit', '27'), 'FC01A01KP27');
  assert.equal(nextQuery('FC01A01K', 'area', 'KP'), 'FC01A01KP');
  assert.equal(nextQuery('FC01', 'district', 'FC-01-A01'), 'FC01A01');
});

test('sandbox empty suggestions and unseeded not_found lookup pass while invalid status only passes negative check', async () => {
  const s = await callNipost(
    'search',
    { query: 'FC01A01KP' },
    key,
    async () => response({ data: { segment: 'area', suggestions: [] } })
  );
  assert.equal(accepted(s), true);
  const l = await callNipost('lookup', { code: SAMPLE }, key, async () =>
    response({
      data: {
        postcode: SAMPLE,
        valid: false,
        status: 'not_found',
        verified: false,
      },
    })
  );
  assert.equal(accepted(l), true);
  assert.equal(accepted({ ...l, operation: 'bad-postcode' }), false);
  const b = await callNipost('bad-postcode', {}, key, async () =>
    response({
      data: {
        postcode: 'NOT-A-POSTCODE',
        valid: false,
        status: 'invalid',
        verified: false,
      },
    })
  );
  assert.equal(accepted(b), true);
});

test('disassemble and reference catalog operations validate schemas and format PRD Section 9 KYC handoff payload', async () => {
  const dis = await callNipost(
    'disassemble',
    { code: SAMPLE },
    key,
    async (url) => {
      assert.match(url, /\/v1\/assembly\/disassemble\?code=FC-01-A01-KP-27$/);
      return response({
        data: { state: 'FC', lga: '01', district: 'A01', area: 'KP', unit: '27' },
      });
    }
  );
  assert.equal(dis.ok, true);
  assert.equal(dis.data.district, 'A01');

  const st = await callNipost('states', {}, key, async () =>
    response({
      data: { states: [{ code: 'FC', name: 'Federal Capital Territory' }] },
    })
  );
  assert.equal(st.ok, true);

  const fmt = formatPostcode('fc 01 a01 kp 27');
  assert.equal(fmt?.dashed, 'FC-01-A01-KP-27');
  assert.equal(fmt?.display, 'FC 01 A01 KP 27');
  assert.equal(formatPostcode('NOT-A-POSTCODE'), null);

  const lookupRes = await callNipost('lookup', { code: SAMPLE }, key, async () =>
    response({ data: { postcode: SAMPLE, valid: false, status: 'not_found' } })
  );
  const handoff = buildKycHandoffPayload(lookupRes, SAMPLE, {
    fullName: 'Adaeze Okonkwo (Test Applicant)',
    phone: '+234 803 000 0127',
    accountTier: 'Tier 2 Savings (KYC)',
  });
  assert.equal(handoff.postcode, 'FC-01-A01-KP-27');
  assert.deepEqual(handoff.segments, {
    state: 'FC',
    lga: '01',
    district: 'A01',
    area: 'KP',
    unit: '27',
  });
  assert.equal(handoff.verdict, 'verified');
  assert.equal(handoff.level, 1);
  assert.equal(handoff.source, 'NIPOST Postcode API — test environment');
  assert.equal(handoff.applicant_demo?.test_data_only, true);
});

test('runBatch classifies active, canonical unseeded, and invalid postcodes', async () => {
  const items = await runBatch(
    ['FC-01-A01-KP-27', 'EK-01-A03-FK-01', 'NOT-A-POSTCODE'],
    key,
    async (url) => {
      if (url.includes('EK-01'))
        return response({ data: { postcode: 'EK-01-A03-FK-01', valid: true } });
      if (url.includes('FC-01'))
        return response({
          data: {
            postcode: 'FC-01-A01-KP-27',
            valid: false,
            status: 'not_found',
          },
        });
      return response({
        data: { postcode: 'NOT-A-POSTCODE', valid: false, status: 'invalid' },
      });
    }
  );
  assert.equal(items.length, 3);
  assert.equal(items[0].classification, 'canonical_unseeded');
  assert.equal(items[1].classification, 'verified_active');
  assert.equal(items[2].classification, 'invalid_rejected');
});

test('surfaces 402, 403, 404, and 429 with rate-limit headers per PRD Section 8 and FR-7', async () => {
  const r429 = await callNipost('lookup', { code: SAMPLE }, key, async () =>
    response({}, 429, {
      'X-RateLimit-Limit': '60',
      'X-RateLimit-Remaining': '0',
    })
  );
  assert.equal(r429.ok, false);
  assert.equal(r429.error.code, 'rate_limited');
  assert.equal(r429.rateLimit?.limit, '60');
  assert.equal(r429.rateLimit?.remaining, '0');

  const r402 = await callNipost('lookup', { code: SAMPLE }, key, async () =>
    response({}, 402)
  );
  assert.equal(r402.error.code, 'insufficient_credits');

  const r403 = await callNipost('lookup', { code: SAMPLE }, key, async () =>
    response({}, 403)
  );
  assert.equal(r403.error.code, 'forbidden_origin_or_scope');
});
