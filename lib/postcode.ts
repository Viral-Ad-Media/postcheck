export type Operation =
  | 'search'
  | 'lookup'
  | 'assemble'
  | 'disassemble'
  | 'states'
  | 'lgas'
  | 'districts'
  | 'areas'
  | 'bad-postcode';

export type RateLimitInfo = {
  limit: string | null;
  remaining: string | null;
};

export type Result = {
  operation: Operation;
  ok: boolean;
  status: number;
  upstreamStatus: number | null;
  durationMs: number;
  at: string;
  data?: Record<string, unknown>;
  error?: { code: string; message: string };
  rateLimit?: RateLimitInfo;
  source: 'nipost' | 'application';
};

export type FormattedPostcode = {
  canonical: string;
  dashed: string;
  display: string;
  segments: {
    state: string;
    lga: string;
    district: string;
    area: string;
    unit: string;
  };
};

export type KycVerdict = 'verified' | 'not_verified' | 'error';

export type VerificationLogEntry = {
  id: string;
  checked_at: string;
  postcode: string;
  segments: FormattedPostcode['segments'] | null;
  verdict: KycVerdict;
  level: 1;
  durationMs: number;
  upstreamStatus: number | null;
  source: string;
  api_response: Record<string, unknown> | null;
};

export const SAMPLE = 'FC-01-A01-KP-27';
export const SEGMENTS = {
  state: 'FC',
  lga: '01',
  district: 'A01',
  area: 'KP',
  unit: '27',
};

export const SAMPLE_BATCH = [
  'FC-01-A01-KP-27',
  'EK-01-A03-FK-01',
  'LA-01-A01-AA-01',
  'NOT-A-POSTCODE',
];

export function canonical(code: string) {
  return code.replace(/[ -]/g, '').toUpperCase();
}

export function formatPostcode(raw: string): FormattedPostcode | null {
  const clean = canonical(raw);
  if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]{3}[A-Z]{2}[0-9]{2}$/.test(clean)) {
    return null;
  }
  const state = clean.slice(0, 2);
  const lga = clean.slice(2, 4);
  const district = clean.slice(4, 7);
  const area = clean.slice(7, 9);
  const unit = clean.slice(9, 11);
  return {
    canonical: clean,
    dashed: `${state}-${lga}-${district}-${area}-${unit}`,
    display: `${state} ${lga} ${district} ${area} ${unit}`,
    segments: { state, lga, district, area, unit },
  };
}

export function nextQuery(query: string, segment: string, suggestion: string) {
  const code = canonical(suggestion);
  const index = ['state', 'lga', 'district', 'area', 'unit'].indexOf(segment);
  const starts = [0, 2, 4, 7, 9];
  const lengths = [2, 2, 3, 2, 2];
  if (index < 0) return suggestion;
  const prefix = canonical(query).slice(0, starts[index]);
  return code.length === lengths[index] ? prefix + code : code;
}

export function getKycVerdict(result: Result): KycVerdict {
  if (!result.ok) {
    if ([400, 404, 422].includes(result.upstreamStatus ?? 0)) {
      return 'not_verified';
    }
    return 'error';
  }
  if (
    result.data?.valid === true ||
    result.data?.status === 'not_found' ||
    (result.operation === 'assemble' && typeof result.data?.postcode === 'string')
  ) {
    return 'verified';
  }
  return 'not_verified';
}

export function buildKycHandoffPayload(
  result: Result,
  fallbackCode: string,
  applicantDemo?: {
    fullName: string;
    phone: string;
    accountTier: string;
  }
) {
  const rawCode =
    typeof result.data?.postcode === 'string'
      ? result.data.postcode
      : fallbackCode;
  const formatted = formatPostcode(rawCode);
  const verdict = getKycVerdict(result);

  return {
    postcode: formatted?.dashed ?? rawCode,
    display: formatted?.display ?? rawCode,
    compact: formatted?.canonical ?? canonical(rawCode),
    segments: formatted?.segments ?? null,
    verdict,
    level: 1 as const,
    checked_at: result.at,
    source: 'NIPOST Postcode API — test environment',
    duration_ms: result.durationMs,
    ...(applicantDemo
      ? {
          applicant_demo: {
            full_name: applicantDemo.fullName,
            phone: applicantDemo.phone,
            account_tier: applicantDemo.accountTier,
            test_data_only: true,
          },
        }
      : {}),
    ndpa_scope: {
      pii_stored_server_side: false,
      credits_consumed: 0,
      honesty_rule:
        'A valid postcode confirms a location reference; it does not prove who lives there. Identity and proof of residence remain separate checks.',
    },
    api_response: result.data ?? result.error ?? null,
  };
}
