export type Operation =
  | 'search'
  | 'nearby'
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

export type LookupTierLevel = 1 | 2 | 3;

export type CreditEstimate = {
  welcomeCreditsTotal: number;
  l1Checks: number;
  l2Checks: number;
  l3Checks: number;
  creditsUsed: number;
  creditsRemaining: number;
  withinWelcomeGrant: boolean;
};

export type OriginEvaluation = {
  allowed: boolean;
  normalizedOrigin: string | null;
  status: 200 | 400 | 403;
  code: 'origin_allowed' | 'invalid_origin' | 'forbidden_origin_or_scope';
  message: string;
};

export type WebhookEventType =
  | 'postcheck.verification.completed'
  | 'postcheck.verification.rejected'
  | 'postcheck.batch.completed';

export type CommercialBillingPreview = {
  totalVerifications: number;
  l1FreeCount: number;
  l2Count: number;
  l3Count: number;
  grossCredits: number;
  welcomeCreditsApplied: number;
  billableCredits: number;
  simulatedNairaPerCredit: number;
  estimatedGatewayCostNgn: number;
  legacyAgentVisitCostNgn: number;
  estimatedSavingsNgn: number;
  savingsPct: number;
};

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

export const NIPOST_STATE_NAMES: Record<string, string> = {
  AB: 'Abia',
  AD: 'Adamawa',
  AK: 'Akwa Ibom',
  AN: 'Anambra',
  BA: 'Bauchi',
  BY: 'Bayelsa',
  BN: 'Benue',
  BO: 'Borno',
  CR: 'Cross River',
  DE: 'Delta',
  EB: 'Ebonyi',
  ED: 'Edo',
  EK: 'Ekiti',
  EN: 'Enugu',
  FC: 'Federal Capital Territory',
  GO: 'Gombe',
  IM: 'Imo',
  JI: 'Jigawa',
  KD: 'Kaduna',
  KN: 'Kano',
  KT: 'Katsina',
  KE: 'Kebbi',
  KO: 'Kogi',
  KW: 'Kwara',
  LA: 'Lagos',
  NA: 'Nasarawa',
  NI: 'Niger',
  OG: 'Ogun',
  ON: 'Ondo',
  OS: 'Osun',
  OY: 'Oyo',
  PL: 'Plateau',
  RI: 'Rivers',
  SO: 'Sokoto',
  TA: 'Taraba',
  YO: 'Yobe',
  ZA: 'Zamfara',
};

export function getAdministrativeNames(
  segments: FormattedPostcode['segments'] | null | undefined,
  apiData?: Record<string, unknown> | null
) {
  if (!segments) return null;
  const stateName =
    (typeof apiData?.state_name === 'string' && apiData.state_name) ||
    (typeof apiData?.state === 'string' &&
      apiData.state.length > 2 &&
      apiData.state) ||
    NIPOST_STATE_NAMES[segments.state] ||
    `State ${segments.state}`;

  const lgaName =
    (typeof apiData?.lga_name === 'string' && apiData.lga_name) ||
    (segments.state === 'FC' && segments.lga === '01'
      ? 'Abuja Municipal Area Council (AMAC)'
      : segments.state === 'EK' && segments.lga === '01'
        ? 'Ado-Ekiti'
        : segments.state === 'LA' && segments.lga === '01'
          ? 'Ikeja / Agege'
          : `LGA ${segments.lga}`);

  const districtName =
    (typeof apiData?.district_name === 'string' && apiData.district_name) ||
    (segments.state === 'FC' && segments.district === 'A01'
      ? 'Garki'
      : `District ${segments.district}`);

  const areaName =
    (typeof apiData?.area_name === 'string' && apiData.area_name) ||
    `Area ${segments.area}`;

  const unitName =
    (typeof apiData?.unit_name === 'string' && apiData.unit_name) ||
    `Building Unit ${segments.unit}`;

  return {
    stateCode: segments.state,
    stateName,
    lgaCode: segments.lga,
    lgaName,
    districtCode: segments.district,
    districtName,
    areaCode: segments.area,
    areaName,
    unitCode: segments.unit,
    unitName,
    state: `${segments.state} (${stateName})`,
    lga: `${segments.lga} (${lgaName})`,
    district: `${segments.district} (${districtName})`,
    area: areaName,
    unit: unitName,
    summary: `${stateName} · ${lgaName} · ${districtName}`,
  };
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
  },
  includeApiResponse = true
) {
  const rawCode =
    typeof result.data?.postcode === 'string'
      ? result.data.postcode
      : fallbackCode;
  const formatted = formatPostcode(rawCode);
  const verdict = getKycVerdict(result);
  const adminNames = getAdministrativeNames(formatted?.segments, result.data);

  return {
    postcode: formatted?.dashed ?? rawCode,
    display: formatted?.display ?? rawCode,
    compact: formatted?.canonical ?? canonical(rawCode),
    segments: formatted?.segments ?? null,
    matched_boundaries: adminNames
      ? {
          state: adminNames.state,
          lga: adminNames.lga,
          district: adminNames.district,
          area: adminNames.area,
          unit: adminNames.unit,
        }
      : null,
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
    ...(includeApiResponse
      ? { api_response: result.data ?? result.error ?? null }
      : {}),
  };
}

export const WELCOME_CREDITS = 500;

export const DEFAULT_ALLOWED_ORIGINS = [
  'https://postcheck.viraladmedia.com',
  'https://onboarding.partnerfintech.ng',
  'https://kyc.lagosmfb.ng',
];

export function estimateCreditUsage(
  totalApplicants: number,
  level: LookupTierLevel,
  highRiskEscalationPct = 15
): CreditEstimate {
  const safeTotal = Math.max(0, Math.min(100000, Math.round(totalApplicants)));
  const clampedPct = Math.max(0, Math.min(100, Math.round(highRiskEscalationPct)));

  if (level === 1) {
    return {
      welcomeCreditsTotal: WELCOME_CREDITS,
      l1Checks: safeTotal,
      l2Checks: 0,
      l3Checks: 0,
      creditsUsed: 0,
      creditsRemaining: WELCOME_CREDITS,
      withinWelcomeGrant: true,
    };
  }

  const escalatedCount = Math.round((safeTotal * clampedPct) / 100);
  const l1Count = safeTotal - escalatedCount;
  const creditsPerCheck = level === 2 ? 1 : 2;
  const creditsUsed = escalatedCount * creditsPerCheck;

  return {
    welcomeCreditsTotal: WELCOME_CREDITS,
    l1Checks: l1Count,
    l2Checks: level === 2 ? escalatedCount : 0,
    l3Checks: level === 3 ? escalatedCount : 0,
    creditsUsed,
    creditsRemaining: Math.max(0, WELCOME_CREDITS - creditsUsed),
    withinWelcomeGrant: creditsUsed <= WELCOME_CREDITS,
  };
}

export function evaluateOriginAllowlist(
  rawOrigin: string,
  allowlist: ReadonlyArray<string>
): OriginEvaluation {
  const trimmed = rawOrigin.trim();
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return {
      allowed: false,
      normalizedOrigin: null,
      status: 400,
      code: 'invalid_origin',
      message: 'Enter a valid origin URL including scheme (e.g. https://kyc.partnerbank.ng).',
    };
  }
  if (parsed.protocol !== 'https:' && parsed.hostname !== 'localhost') {
    return {
      allowed: false,
      normalizedOrigin: parsed.origin,
      status: 403,
      code: 'forbidden_origin_or_scope',
      message: `Origin ${parsed.origin} rejected: publishable keys require HTTPS origins in production.`,
    };
  }
  const normalizedAllowlist = allowlist
    .map((item) => {
      try {
        return new URL(item.trim()).origin.toLowerCase();
      } catch {
        return item.trim().toLowerCase();
      }
    })
    .filter(Boolean);

  const normalizedOrigin = parsed.origin.toLowerCase();
  if (normalizedAllowlist.includes(normalizedOrigin)) {
    return {
      allowed: true,
      normalizedOrigin: parsed.origin,
      status: 200,
      code: 'origin_allowed',
      message: `Origin ${parsed.origin} is allowlisted for publishable widget embeds.`,
    };
  }
  return {
    allowed: false,
    normalizedOrigin: parsed.origin,
    status: 403,
    code: 'forbidden_origin_or_scope',
    message: `NIPOST HTTP 403 (Forbidden): Origin ${parsed.origin} is not in the publishable key allowlist.`,
  };
}

export function buildPhase2TierPreview(
  code: string,
  level: LookupTierLevel,
  buildingUse: 'Residential' | 'Commercial' | 'Public' = 'Commercial'
) {
  const fmt = formatPostcode(code) ?? formatPostcode(SAMPLE)!;
  return {
    postcode: fmt.dashed,
    compact: fmt.canonical,
    display: fmt.display,
    level,
    kyb_gate:
      level === 1
        ? 'unlocked_phase1_sandbox'
        : 'requires_nipost_kyb_approval_submitted_2026_10_04',
    credits_per_lookup: level === 1 ? 0 : level === 2 ? 1 : 2,
    segments: fmt.segments,
    ...(level >= 2
      ? {
          l2_administrative_address: {
            state_code: fmt.segments.state,
            state_name:
              fmt.segments.state === 'FC'
                ? 'Federal Capital Territory'
                : 'Nigeria State Registry',
            lga_code: fmt.segments.lga,
            district_code: fmt.segments.district,
            area_code: fmt.segments.area,
            recent_house_address_preview: `Unit ${fmt.segments.unit}, Area ${fmt.segments.area}, District ${fmt.segments.district} (Phase 2 L2 preview — requires KYB live key)`,
          },
        }
      : {}),
    ...(level >= 3
      ? {
          l3_building_use: {
            building_use_status: buildingUse,
            kyb_suitability:
              buildingUse === 'Commercial'
                ? 'Matches SME / Corporate Merchant KYC profile'
                : 'Matches Retail / Individual Tier 2–3 KYC profile',
          },
        }
      : {}),
  };
}

export function calculateCommercialBillingPreview(params: {
  l1Count: number;
  l2Count: number;
  l3Count: number;
  simulatedNairaPerCredit: number;
  applyWelcomeCredits?: boolean;
}): CommercialBillingPreview {
  const l1FreeCount = Math.max(0, Math.round(params.l1Count));
  const l2Count = Math.max(0, Math.round(params.l2Count));
  const l3Count = Math.max(0, Math.round(params.l3Count));
  const rate = Math.max(0, Math.round(params.simulatedNairaPerCredit));
  const applyWelcome = params.applyWelcomeCredits ?? true;

  const totalVerifications = l1FreeCount + l2Count + l3Count;
  const grossCredits = l2Count * 1 + l3Count * 2;
  const welcomeCreditsApplied = applyWelcome
    ? Math.min(WELCOME_CREDITS, grossCredits)
    : 0;
  const billableCredits = Math.max(0, grossCredits - welcomeCreditsApplied);
  const estimatedGatewayCostNgn = billableCredits * rate;
  // Traditional physical address verification / utility-bill review benchmark in Nigeria: ~₦2,500 per applicant
  const legacyAgentVisitCostNgn = totalVerifications * 2500;
  const estimatedSavingsNgn = Math.max(
    0,
    legacyAgentVisitCostNgn - estimatedGatewayCostNgn
  );
  const savingsPct =
    legacyAgentVisitCostNgn > 0
      ? Math.round((estimatedSavingsNgn / legacyAgentVisitCostNgn) * 100)
      : 100;

  return {
    totalVerifications,
    l1FreeCount,
    l2Count,
    l3Count,
    grossCredits,
    welcomeCreditsApplied,
    billableCredits,
    simulatedNairaPerCredit: rate,
    estimatedGatewayCostNgn,
    legacyAgentVisitCostNgn,
    estimatedSavingsNgn,
    savingsPct,
  };
}

export function buildWebhookEventPayload(
  eventType: WebhookEventType,
  code: string,
  endpointUrl = 'https://api.partnerfintech.ng/webhooks/postcheck',
  timestampIso = new Date().toISOString()
) {
  const fmt = formatPostcode(code) ?? formatPostcode(SAMPLE)!;
  const isRejected = eventType === 'postcheck.verification.rejected';
  const unixTs = Math.floor(new Date(timestampIso).getTime() / 1000) || 1792569600;
  // Deterministic preview digest (browser + Node safe, no real secret exposed)
  const rawSigSource = `${unixTs}.${eventType}.${fmt.canonical}.whsec_postcheck_preview`;
  let previewDigest = '';
  for (let i = 0; i < rawSigSource.length && previewDigest.length < 32; i++) {
    previewDigest += (
      (rawSigSource.charCodeAt(i) * 31 + i * 17) &
      0xff
    )
      .toString(16)
      .padStart(2, '0');
  }
  previewDigest = previewDigest.padEnd(32, 'a').slice(0, 32);

  return {
    event_id: `evt_postcheck_${fmt.canonical.toLowerCase()}_${String(unixTs).slice(-6)}`,
    event_type: eventType,
    api_version: '2026-10-01',
    created_at: timestampIso,
    target_endpoint: endpointUrl,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'PostCheck-Webhook-Dispatcher/1.0 (+https://postcheck.viraladmedia.com)',
      'X-PostCheck-Event': eventType,
      'X-PostCheck-Signature': `t=${unixTs},v1=${previewDigest}`,
    },
    data:
      eventType === 'postcheck.batch.completed'
        ? {
            batch_id: `batch_${String(unixTs).slice(-6)}`,
            total_checked: 4,
            verified_or_canonical: 3,
            rejected_invalid: 1,
            level: 1,
            credits_consumed: 0,
            sample_postcode: fmt.dashed,
          }
        : {
            postcode: isRejected ? 'NOT-A-POSTCODE' : fmt.dashed,
            segments: isRejected ? null : fmt.segments,
            verdict: isRejected ? 'not_verified' : 'verified',
            level: 1,
            checked_at: timestampIso,
            source: 'NIPOST Postcode API — test environment',
          },
  };
}
