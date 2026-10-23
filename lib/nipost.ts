import {
  SAMPLE,
  SEGMENTS,
  canonical,
  formatPostcode,
  type Operation,
  type RateLimitInfo,
  type Result,
} from './postcode.ts';
export {
  DEFAULT_ALLOWED_ORIGINS,
  NIPOST_STATE_NAMES,
  SAMPLE,
  SAMPLE_BATCH,
  SEGMENTS,
  WELCOME_CREDITS,
  buildKycHandoffPayload,
  buildPhase2TierPreview,
  buildWebhookEventPayload,
  calculateCommercialBillingPreview,
  canonical,
  estimateCreditUsage,
  evaluateOriginAllowlist,
  formatPostcode,
  getAdministrativeNames,
  getKycVerdict,
  nextQuery,
} from './postcode.ts';
export type {
  CommercialBillingPreview,
  CreditEstimate,
  FormattedPostcode,
  KycVerdict,
  LookupTierLevel,
  Operation,
  OriginEvaluation,
  RateLimitInfo,
  Result,
  VerificationLogEntry,
  WebhookEventType,
} from './postcode.ts';

export type BatchAuditItem = {
  input: string;
  dashed: string | null;
  compact: string;
  classification:
    | 'verified_active'
    | 'canonical_unseeded'
    | 'invalid_rejected'
    | 'upstream_error';
  valid: boolean;
  status: string;
  durationMs: number;
  upstreamStatus: number | null;
  at: string;
};

function defaultStatusErrorMessage(status: number): {
  code: string;
  message: string;
} {
  if (status === 402) {
    return {
      code: 'insufficient_credits',
      message:
        'NIPOST returned HTTP 402 (Insufficient Credits). Level 1 lookups are free; check account credit balance.',
    };
  }
  if (status === 403) {
    return {
      code: 'forbidden_origin_or_scope',
      message:
        'NIPOST returned HTTP 403 (Forbidden). Verify key scope and allowed origin settings.',
    };
  }
  if (status === 404) {
    return {
      code: 'not_found',
      message:
        'No matching postcode record was found in the NIPOST sandbox dataset.',
    };
  }
  if (status === 429) {
    return {
      code: 'rate_limited',
      message:
        'NIPOST rate limit reached (HTTP 429). Please wait a moment before retrying.',
    };
  }
  return {
    code: 'upstream_error',
    message: 'NIPOST could not complete this request.',
  };
}

export async function callNipost(
  operation: Operation,
  input: Record<string, unknown>,
  key: string | undefined,
  fetcher: typeof fetch = fetch
): Promise<Result> {
  const started = Date.now();
  const base = () => ({
    operation,
    durationMs: Date.now() - started,
    at: new Date().toISOString(),
  });
  const fail = (
    status: number,
    code: string,
    message: string,
    upstreamStatus: number | null = null,
    rateLimit?: RateLimitInfo
  ): Result => ({
    ...base(),
    ok: false,
    status,
    upstreamStatus,
    source: upstreamStatus === null ? 'application' : 'nipost',
    error: { code, message },
    ...(rateLimit ? { rateLimit } : {}),
  });
  if (!key)
    return fail(
      503,
      'not_configured',
      'The NIPOST test key has not been connected. No API call was made.'
    );
  if (!key.startsWith('nipost_test_'))
    return fail(
      503,
      'test_key_required',
      'This demo accepts a server-side NIPOST test key only.'
    );
  let path = '';
  let body: string | undefined;
  const text = (value: unknown, max: number) =>
    typeof value === 'string' &&
    value.trim().length > 0 &&
    value.length <= max;
  if (operation === 'search') {
    if (!text(input.query, 64))
      return fail(
        400,
        'invalid_input',
        'Enter a partial postcode of 1–64 characters.'
      );
    path =
      '/v1/search/autocomplete?q=' +
      encodeURIComponent(String(input.query).trim());
  } else if (operation === 'nearby') {
    const code = input.code ?? input.postcode;
    if (!text(code, 64))
      return fail(
        400,
        'invalid_input',
        'Enter a postcode of 1–64 characters to search nearby units.'
      );
    path =
      '/v1/search/nearby?code=' +
      encodeURIComponent(String(code).trim());
  } else if (operation === 'lookup' || operation === 'bad-postcode') {
    const code =
      operation === 'bad-postcode'
        ? 'NOT-A-POSTCODE'
        : (input.code ?? input.postcode);
    if (!text(code, 64))
      return fail(
        400,
        'invalid_input',
        'Enter a postcode of 1–64 characters.'
      );
    path =
      '/v1/lookup?code=' +
      encodeURIComponent(String(code).trim()) +
      '&level=1';
  } else if (operation === 'assemble') {
    const fields = ['state', 'lga', 'district', 'area', 'unit'];
    if (!fields.every((k) => text(input[k], 8)))
      return fail(400, 'invalid_input', 'Provide all five postcode segments.');
    body = JSON.stringify(
      Object.fromEntries(fields.map((k) => [k, String(input[k]).trim()]))
    );
    path = '/v1/assembly/assemble';
  } else if (operation === 'disassemble') {
    const code = input.code ?? input.postcode;
    if (!text(code, 64))
      return fail(
        400,
        'invalid_input',
        'Enter a postcode of 1–64 characters to disassemble.'
      );
    path =
      '/v1/assembly/disassemble?code=' +
      encodeURIComponent(String(code).trim());
  } else if (operation === 'states') {
    path = '/v1/reference/states';
  } else if (operation === 'lgas') {
    if (!text(input.state, 4))
      return fail(400, 'invalid_input', 'Provide a 2-letter state code.');
    path =
      '/v1/reference/lgas?state=' +
      encodeURIComponent(String(input.state).trim().toUpperCase());
  } else if (operation === 'districts') {
    if (!text(input.state, 4) || !text(input.lga, 4))
      return fail(400, 'invalid_input', 'Provide state and LGA codes.');
    path =
      '/v1/reference/districts?state=' +
      encodeURIComponent(String(input.state).trim().toUpperCase()) +
      '&lga=' +
      encodeURIComponent(String(input.lga).trim());
  } else if (operation === 'areas') {
    if (
      !text(input.state, 4) ||
      !text(input.lga, 4) ||
      !text(input.district, 6)
    )
      return fail(
        400,
        'invalid_input',
        'Provide state, LGA, and district codes.'
      );
    path =
      '/v1/reference/areas?state=' +
      encodeURIComponent(String(input.state).trim().toUpperCase()) +
      '&lga=' +
      encodeURIComponent(String(input.lga).trim()) +
      '&district=' +
      encodeURIComponent(String(input.district).trim().toUpperCase());
  } else return fail(400, 'invalid_operation', 'Unsupported operation.');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetcher('https://api.postcode.gov.ng' + path, {
      method: body ? 'POST' : 'GET',
      headers: {
        'X-API-Key': key,
        Accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body,
      signal: controller.signal,
      redirect: 'error',
      cache: 'no-store',
    });

    const rlLimit = response.headers?.get?.('x-ratelimit-limit') ?? null;
    const rlRemaining =
      response.headers?.get?.('x-ratelimit-remaining') ?? null;
    const rateLimit: RateLimitInfo | undefined =
      rlLimit !== null || rlRemaining !== null
        ? { limit: rlLimit, remaining: rlRemaining }
        : undefined;

    // Never forward request headers or unbounded upstream content to the browser.
    const raw = await response.text();
    if (raw.length > 100000)
      return fail(
        502,
        'invalid_response',
        'NIPOST returned an oversized response.',
        response.status,
        rateLimit
      );
    let payload: {
      data?: Record<string, unknown>;
      error?: { code?: string; message?: string };
    };
    try {
      payload = JSON.parse(
        raw
          .split(key)
          .join('[REDACTED]')
          .replace(/nipost_(?:pk_)?(?:test|live)_[A-Za-z0-9_-]+/g, '[REDACTED]')
      );
    } catch {
      return fail(
        502,
        'invalid_response',
        'NIPOST returned an unreadable response.',
        response.status,
        rateLimit
      );
    }
    if (!payload || typeof payload !== 'object')
      return fail(
        502,
        'invalid_response',
        'NIPOST returned an unexpected response.',
        response.status,
        rateLimit
      );
    if (!response.ok || payload.error) {
      const fallback = defaultStatusErrorMessage(response.status);
      return fail(
        response.ok ? 502 : response.status,
        typeof payload.error?.code === 'string'
          ? payload.error.code.slice(0, 100)
          : fallback.code,
        typeof payload.error?.message === 'string'
          ? payload.error.message.slice(0, 500)
          : fallback.message,
        response.status,
        rateLimit
      );
    }
    const data = payload.data;
    if (!data || typeof data !== 'object' || Array.isArray(data))
      return fail(
        502,
        'invalid_response',
        'NIPOST returned no usable data.',
        response.status,
        rateLimit
      );
    const validShape =
      operation === 'search'
        ? Array.isArray(data.suggestions) &&
          typeof data.segment === 'string' &&
          data.suggestions.every(
            (s: unknown) =>
              !!s &&
              typeof s === 'object' &&
              typeof (s as Record<string, unknown>).code === 'string'
          )
        : operation === 'assemble'
          ? typeof data.postcode === 'string'
          : operation === 'disassemble'
            ? typeof data.state === 'string' &&
              typeof data.lga === 'string' &&
              typeof data.district === 'string' &&
              typeof data.area === 'string' &&
              typeof data.unit === 'string'
            : operation === 'states'
              ? Array.isArray(data.states)
              : operation === 'lgas'
                ? Array.isArray(data.lgas)
                : operation === 'districts'
                  ? Array.isArray(data.districts)
                  : operation === 'areas'
                    ? Array.isArray(data.areas)
                    : operation === 'nearby'
                      ? Array.isArray(data.units) || Array.isArray(data.suggestions) || typeof data === 'object'
                      : typeof data.valid === 'boolean';
    if (!validShape)
      return fail(
        502,
        'invalid_response',
        'The NIPOST response did not match the documented schema.',
        response.status,
        rateLimit
      );
    return {
      ...base(),
      ok: true,
      status: response.status,
      upstreamStatus: response.status,
      source: 'nipost',
      data,
      ...(rateLimit ? { rateLimit } : {}),
    };
  } catch {
    return fail(
      controller.signal.aborted ? 504 : 502,
      controller.signal.aborted ? 'upstream_timeout' : 'upstream_unavailable',
      controller.signal.aborted
        ? 'NIPOST did not respond within 10 seconds. Please retry.'
        : 'Could not reach NIPOST. Please retry.'
    );
  } finally {
    clearTimeout(timer);
  }
}

export function accepted(result: Result): boolean {
  if (result.source !== 'nipost') return false;
  if (result.operation === 'bad-postcode')
    return (
      (result.ok &&
        result.data?.valid === false &&
        result.data?.status !== 'not_found') ||
      (!result.ok &&
        [400, 404, 422].includes(result.upstreamStatus ?? 0) &&
        result.error?.code !== 'invalid_response')
    );
  if (!result.ok) return false;
  if (result.operation === 'search')
    return (
      Array.isArray(result.data?.suggestions) &&
      ['state', 'lga', 'district', 'area', 'unit'].includes(
        String(result.data?.segment ?? '')
      )
    );
  if (result.operation === 'assemble')
    return canonical(String(result.data?.postcode ?? '')) === canonical(SAMPLE);
  return (
    (result.data?.valid === true || result.data?.status === 'not_found') &&
    (result.data.postcode === undefined ||
      canonical(String(result.data.postcode)) === canonical(SAMPLE))
  );
}

export async function runSuite(
  key: string | undefined,
  fetcher: typeof fetch = fetch
) {
  const results: Result[] = [];
  for (const [operation, input] of [
    ['search', { query: 'FC01A01KP' }],
    ['lookup', { code: SAMPLE }],
    ['assemble', SEGMENTS],
    ['bad-postcode', {}],
  ] as [Operation, Record<string, unknown>][]) {
    results.push(await callNipost(operation, input, key, fetcher));
  }
  return results.map((r) => ({ ...r, passed: accepted(r) }));
}

export async function runBatch(
  codes: string[],
  key: string | undefined,
  fetcher: typeof fetch = fetch
): Promise<BatchAuditItem[]> {
  const cleaned = codes
    .map((c) => String(c).trim())
    .filter((c) => c.length > 0 && c.length <= 64)
    .slice(0, 10);
  const items: BatchAuditItem[] = [];
  for (const raw of cleaned) {
    const res = await callNipost('lookup', { code: raw }, key, fetcher);
    const fmt = formatPostcode(
      typeof res.data?.postcode === 'string' ? res.data.postcode : raw
    );
    const classification: BatchAuditItem['classification'] =
      res.ok && res.data?.valid === true
        ? 'verified_active'
        : res.ok && res.data?.status === 'not_found'
          ? 'canonical_unseeded'
          : (res.ok &&
                res.data?.valid === false &&
                res.data?.status !== 'not_found') ||
              (!res.ok && [400, 404, 422].includes(res.upstreamStatus ?? 0))
            ? 'invalid_rejected'
            : 'upstream_error';
    items.push({
      input: raw,
      dashed: fmt?.dashed ?? null,
      compact: fmt?.canonical ?? canonical(raw),
      classification,
      valid: Boolean(res.data?.valid),
      status: String(
        res.data?.status ??
          (res.ok
            ? res.data?.valid
              ? 'verified'
              : 'invalid'
            : res.error?.code ?? 'error')
      ),
      durationMs: res.durationMs,
      upstreamStatus: res.upstreamStatus,
      at: res.at,
    });
  }
  return items;
}
