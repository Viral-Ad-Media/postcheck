'use client';
import { AccountMenu } from '@/components/account-menu';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Building2,
  Check,
  CheckCheck,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  Clock,
  Code2,
  Copy,
  Database,
  Download,
  FileSpreadsheet,
  Fingerprint,
  FlaskConical,
  History,
  Layers3,
  Loader2,
  LockKeyhole,
  MapPin,
  Play,
  Search,
  ShieldCheck,
  SplitSquareVertical,
  Terminal,
  Trash2,
  UserCheck,
  X,
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SITE_URL } from '@/lib/seo';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { BatchAuditItem } from '@/lib/nipost';
import {
  DEFAULT_ALLOWED_ORIGINS,
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
  type LookupTierLevel,
  type Result,
  type VerificationLogEntry,
  type WebhookEventType,
} from '@/lib/postcode';

type Evidence = Result & { passed: boolean };
type Suggestion = { code: string; label?: string };
type NamedCode = { code: string; name?: string };



const names: Record<string, string> = {
  search: 'Postcode autocomplete',
  lookup: 'L1 postcode lookup',
  assemble: 'Assembly validation',
  'bad-postcode': 'Bad-postcode handling',
};

const SEGMENT_LENGTHS = [2, 4, 7, 9, 11];
const SEGMENT_CAPTIONS = ['State', 'LGA', 'District', 'Area', 'Unit'] as const;

async function request(
  operation: string,
  input: Record<string, unknown> = {},
  signal?: AbortSignal
) {
  const res = await fetch('/api/postcode', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ operation, input }),
    signal,
  });
  const body = await res.json();
  if (!body.operation && !body.results && !body.items)
    throw new Error(
      typeof body.error === 'string'
        ? body.error
        : 'The application could not complete the request. Please retry.'
    );
  return body;
}

export function PostcodeWorkspace({ userId, email }: { userId: string; email?: string }) {
  const LOG_STORAGE_KEY = `postcheck-verification-log-v2:${userId}`;
  const [tab, setTab] = useState<'capture' | 'phase2' | 'tests' | 'batch'>(
    'capture'
  );
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [statusError, setStatusError] = useState(false);
  const [query, setQuery] = useState('');
  const [searchResult, setSearchResult] = useState<Result | null>(null);
  const [selected, setSelected] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [searchBusy, setSearchBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [suiteBusy, setSuiteBusy] = useState(false);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [segments, setSegments] = useState({ ...SEGMENTS });
  const [assemblyOpen, setAssemblyOpen] = useState(false);
  const [responseOpen, setResponseOpen] = useState(false);
  const [kycOpen, setKycOpen] = useState(false);
  const [copiedKyc, setCopiedKyc] = useState(false);
  const [copiedLogId, setCopiedLogId] = useState<string | null>(null);

  // FR-9: Continue Onboarding — Mock Account-Opening Flow state
  const [demoName, setDemoName] = useState('Adaeze Okonkwo (Demo Applicant)');
  const [demoPhone, setDemoPhone] = useState('+234 803 000 0127');
  const [demoTier, setDemoTier] = useState('Tier 2 Savings (KYC)');
  const [includeRawApiInKyc, setIncludeRawApiInKyc] = useState(true);
  const [onboardingSubmitted, setOnboardingSubmitted] = useState(false);

  // FR-10: Session Verification Log state
  const [verificationLog, setVerificationLog] = useState<
    VerificationLogEntry[]
  >([]);

  // FR-3: Reference Catalog state
  const [catalogBusy, setCatalogBusy] = useState(false);
  const [statesList, setStatesList] = useState<NamedCode[]>([]);
  const [lgasList, setLgasList] = useState<NamedCode[]>([]);
  const [districtsList, setDistrictsList] = useState<NamedCode[]>([]);
  const [areasList, setAreasList] = useState<NamedCode[]>([]);

  // FR-11 (P2): Batch Backbook Audit state
  const [batchInput, setBatchInput] = useState(SAMPLE_BATCH.join('\n'));
  const [batchBusy, setBatchBusy] = useState(false);
  const [batchItems, setBatchItems] = useState<BatchAuditItem[]>([]);

  // Phase 2 (Post-KYB): L1/L2/L3 Tier, 500-Credit Estimator, Origin Allowlist & Pilot SDK state
  const [tierLevel, setTierLevel] = useState<LookupTierLevel>(2);
  const [buildingUsePreview, setBuildingUsePreview] = useState<
    'Residential' | 'Commercial' | 'Public'
  >('Commercial');
  const [monthlyApplicants, setMonthlyApplicants] = useState(1200);
  const [escalationPct, setEscalationPct] = useState(15);
  const [allowedOrigins, setAllowedOrigins] = useState<string[]>([
    ...DEFAULT_ALLOWED_ORIGINS,
  ]);
  const [newOriginInput, setNewOriginInput] = useState('');
  const [newOriginError, setNewOriginError] = useState('');
  const [testOriginUrl, setTestOriginUrl] = useState(
    'https://onboarding.partnerfintech.ng'
  );
  const [sdkFormat, setSdkFormat] = useState<'widget' | 'node' | 'curl'>(
    'widget'
  );
  const [copiedSdk, setCopiedSdk] = useState(false);

  // Phase 3 (Commercial): Per-Verification Billing, Usage Dashboard & Webhooks state
  const [simulatedNairaRate, setSimulatedNairaRate] = useState(25);
  const [applyWelcomeInBilling, setApplyWelcomeInBilling] = useState(true);
  const [webhookEvent, setWebhookEvent] = useState<WebhookEventType>(
    'postcheck.verification.completed'
  );
  const [webhookEndpoint, setWebhookEndpoint] = useState(
    'https://api.partnerfintech.ng/webhooks/postcheck'
  );
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  const generation = useRef(0);
  // FR-1: Client-side autocomplete query cache
  const searchCache = useRef<Map<string, Result>>(new Map());

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(LOG_STORAGE_KEY) || localStorage.getItem(LOG_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setVerificationLog(parsed.slice(0, 25));
      }
    } catch {}
  }, []);

  function appendToVerificationLog(res: Result, rawCode: string) {
    const codeStr =
      typeof res.data?.postcode === 'string' ? res.data.postcode : rawCode;
    const fmt = formatPostcode(codeStr);
    const entry: VerificationLogEntry = {
      id: `${res.at}-${Math.random().toString(36).slice(2, 7)}`,
      checked_at: res.at,
      postcode: fmt?.dashed ?? (codeStr.trim() || SAMPLE),
      segments: fmt?.segments ?? null,
      verdict: getKycVerdict(res),
      level: 1,
      durationMs: res.durationMs,
      upstreamStatus: res.upstreamStatus,
      source: 'NIPOST Postcode API — test environment',
      api_response: (res.data ?? res.error ?? null) as Record<
        string,
        unknown
      > | null,
    };
    setVerificationLog((prev) => {
      const next = [entry, ...prev].slice(0, 25);
      try {
        localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  function clearVerificationLog() {
    setVerificationLog([]);
    try {
      localStorage.removeItem(LOG_STORAGE_KEY);
      sessionStorage.removeItem(LOG_STORAGE_KEY);
    } catch {}
  }

  useEffect(() => {
    fetch('/api/postcode', { cache: 'no-store' })
      .then((r) => {
        if (!r.ok) throw Error();
        return r.json();
      })
      .then((d) => setConfigured(d.configured))
      .catch(() => {
        setConfigured(false);
        setStatusError(true);
      });
  }, []);

  // FR-1: 300ms debounce + client-side cache for repeated queries
  useEffect(() => {
    const trimmed = query.trim();
    if (!configured || !trimmed || selected === query) {
      setSearchBusy(false);
      return;
    }
    const cacheKey = canonical(trimmed);
    const cached = searchCache.current.get(cacheKey);
    if (cached) {
      setSearchResult(cached);
      setSearchBusy(false);
      return;
    }
    const controller = new AbortController();
    const id = ++generation.current;
    const timer = setTimeout(async () => {
      setSearchBusy(true);
      try {
        const r: Result = await request(
          'search',
          { query: trimmed },
          controller.signal
        );
        if (r.ok) searchCache.current.set(cacheKey, r);
        if (id === generation.current) setSearchResult(r);
      } catch {
        if (!controller.signal.aborted && id === generation.current)
          setMessage('Search is unavailable. Please try again.');
      } finally {
        if (id === generation.current) setSearchBusy(false);
      }
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
      generation.current++;
    };
  }, [query, configured, selected]);

  function changeQuery(value: string) {
    setQuery(value);
    setSelected('');
    setResult(null);
    setSearchResult(null);
    setMessage('');
    setOnboardingSubmitted(false);
  }

  function choose(s: Suggestion) {
    const value = nextQuery(
      query,
      String(searchResult?.data?.segment ?? ''),
      s.code
    );
    setQuery(value);
    setSearchResult(null);
    setResult(null);
    setOnboardingSubmitted(false);
    if (value.replace(/[ -]/g, '').length === 11) setSelected(value);
  }

  function sample() {
    setQuery(SAMPLE);
    setSelected(SAMPLE);
    setResult(null);
    setSearchResult(null);
    setMessage('');
    setOnboardingSubmitted(false);
    if (configured) {
      void verify(SAMPLE);
    }
  }

  async function verify(codeOverride?: string) {
    const targetCode = (codeOverride ?? query).trim();
    if (!targetCode) return;
    setBusy(true);
    setMessage('');
    setResult(null);
    setResponseOpen(false);
    setKycOpen(false);
    setOnboardingSubmitted(false);
    try {
      const r: Result = await request('lookup', { code: targetCode });
      setResult(r);
      appendToVerificationLog(r, targetCode);
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function assemble() {
    setBusy(true);
    setMessage('');
    setResult(null);
    setResponseOpen(false);
    setOnboardingSubmitted(false);
    try {
      const r: Result = await request('assemble', segments);
      setResult(r);
      if (r.ok && typeof r.data?.postcode === 'string') {
        setQuery(r.data.postcode);
        setSelected(r.data.postcode);
        setSearchResult(null);
        appendToVerificationLog(r, r.data.postcode);
      }
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function disassembleCurrent() {
    const targetCode = query.trim() || SAMPLE;
    setBusy(true);
    setMessage('');
    try {
      const r: Result = await request('disassemble', { code: targetCode });
      if (r.ok && r.data) {
        setSegments({
          state: String(r.data.state ?? 'FC'),
          lga: String(r.data.lga ?? '01'),
          district: String(r.data.district ?? 'A01'),
          area: String(r.data.area ?? 'KP'),
          unit: String(r.data.unit ?? '27'),
        });
      } else {
        setMessage(
          r.error?.message ?? 'Could not disassemble this postcode string.'
        );
      }
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function loadReferenceStates() {
    setCatalogBusy(true);
    setMessage('');
    try {
      const r: Result = await request('states');
      if (r.ok && Array.isArray(r.data?.states)) {
        const list = r.data.states as NamedCode[];
        setStatesList(list);
        await selectCatalogState(segments.state || 'FC');
      } else {
        setMessage(r.error?.message ?? 'Could not load NIPOST state catalog.');
      }
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setCatalogBusy(false);
    }
  }

  async function selectCatalogState(stateCode: string) {
    setCatalogBusy(true);
    try {
      const r: Result = await request('lgas', { state: stateCode });
      const lgas = (
        r.ok && Array.isArray(r.data?.lgas) ? r.data.lgas : []
      ) as NamedCode[];
      setLgasList(lgas);
      const nextLga = lgas[0]?.code ?? '01';
      setSegments((prev) => ({ ...prev, state: stateCode, lga: nextLga }));
      await selectCatalogLga(stateCode, nextLga);
    } catch {
      setLgasList([]);
    } finally {
      setCatalogBusy(false);
    }
  }

  async function selectCatalogLga(stateCode: string, lgaCode: string) {
    setCatalogBusy(true);
    try {
      const r: Result = await request('districts', {
        state: stateCode,
        lga: lgaCode,
      });
      const districts = (
        r.ok && Array.isArray(r.data?.districts) ? r.data.districts : []
      ) as NamedCode[];
      setDistrictsList(districts);
      const nextDistrict = districts[0]?.code ?? 'A01';
      setSegments((prev) => ({
        ...prev,
        state: stateCode,
        lga: lgaCode,
        district: nextDistrict,
      }));
      await selectCatalogDistrict(stateCode, lgaCode, nextDistrict);
    } catch {
      setDistrictsList([]);
    } finally {
      setCatalogBusy(false);
    }
  }

  async function selectCatalogDistrict(
    stateCode: string,
    lgaCode: string,
    districtCode: string
  ) {
    setCatalogBusy(true);
    try {
      const r: Result = await request('areas', {
        state: stateCode,
        lga: lgaCode,
        district: districtCode,
      });
      const areas = (
        r.ok && Array.isArray(r.data?.areas) ? r.data.areas : []
      ) as NamedCode[];
      setAreasList(areas);
      const nextArea = areas[0]?.code ?? 'KP';
      setSegments((prev) => ({
        ...prev,
        state: stateCode,
        lga: lgaCode,
        district: districtCode,
        area: nextArea,
      }));
    } catch {
      setAreasList([]);
    } finally {
      setCatalogBusy(false);
    }
  }

  async function run() {
    setSuiteBusy(true);
    setEvidence([]);
    setMessage('');
    try {
      const r = await request('suite');
      setEvidence(r.results);
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setSuiteBusy(false);
    }
  }

  async function runBatchAudit() {
    const codes = batchInput
      .split(/[\n,;]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 10);
    if (codes.length === 0) {
      setMessage('Enter at least 1 postcode to audit.');
      return;
    }
    setBatchBusy(true);
    setMessage('');
    try {
      const r = await request('batch', { codes });
      setBatchItems(r.items ?? []);
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBatchBusy(false);
    }
  }

  function download() {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            project: 'PostCheck by Viral Ad Media (Lagos Team)',
            environment: 'NIPOST test dataset',
            level: 1,
            exportedAt: new Date().toISOString(),
            passed: evidence.filter((r) => r.passed).length,
            total: 4,
            results: evidence,
          },
          null,
          2
        ),
      ],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'postcheck-staging-evidence.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function downloadBatchCsv() {
    const header =
      'input,normalized_dashed,compact,classification,nipost_status,duration_ms,upstream_http\n';
    const rows = batchItems
      .map((item) =>
        [
          `"${item.input.replace(/"/g, '""')}"`,
          item.dashed ?? '',
          item.compact,
          item.classification,
          item.status,
          item.durationMs,
          item.upstreamStatus ?? '',
        ].join(',')
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'postcheck-batch-audit.csv';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function copyKycHandoff() {
    if (!result) return;
    const payload = buildKycHandoffPayload(
      result,
      query || SAMPLE,
      {
        fullName: demoName,
        phone: demoPhone,
        accountTier: demoTier,
      },
      includeRawApiInKyc
    );
    navigator.clipboard?.writeText(JSON.stringify(payload, null, 2));
    setCopiedKyc(true);
    setTimeout(() => setCopiedKyc(false), 2000);
  }

  function downloadKycHandoff() {
    if (!result) return;
    const payload = buildKycHandoffPayload(
      result,
      query || SAMPLE,
      {
        fullName: demoName,
        phone: demoPhone,
        accountTier: demoTier,
      },
      includeRawApiInKyc
    );
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `postcheck-kyc-${payload.compact.toLowerCase()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function copyLogEntry(entry: VerificationLogEntry) {
    const payload = {
      postcode: entry.postcode,
      segments: entry.segments,
      verdict: entry.verdict,
      level: entry.level,
      checked_at: entry.checked_at,
      source: entry.source,
      api_response: entry.api_response,
    };
    navigator.clipboard?.writeText(JSON.stringify(payload, null, 2));
    setCopiedLogId(entry.id);
    setTimeout(() => setCopiedLogId(null), 1800);
  }

  const suggestions = (searchResult?.data?.suggestions ?? []) as Suggestion[];
  const passCount = evidence.filter((r) => r.passed).length;
  const valid =
    result?.ok &&
    result.operation === 'lookup' &&
    (result.data?.valid === true || result.data?.status === 'not_found');
  const cleanChars = Math.min(query.replace(/[^A-Za-z0-9]/g, '').length, 11);

  const decodedCurrent = result
    ? formatPostcode(
        typeof result.data?.postcode === 'string'
          ? result.data.postcode
          : query || SAMPLE
      )
    : formatPostcode(query);

  const adminNames = decodedCurrent
    ? getAdministrativeNames(decodedCurrent.segments, result?.data)
    : null;

  const kycPayload = result
    ? buildKycHandoffPayload(
        result,
        query || SAMPLE,
        {
          fullName: demoName,
          phone: demoPhone,
          accountTier: demoTier,
        },
        includeRawApiInKyc
      )
    : null;

  const isRateLimited =
    result &&
    (!result.ok &&
      (result.upstreamStatus === 429 || result.error?.code === 'rate_limited'));
  const isInsufficientCredits =
    result &&
    (!result.ok &&
      (result.upstreamStatus === 402 ||
        result.error?.code === 'insufficient_credits'));
  const isForbiddenOrigin =
    result &&
    (!result.ok &&
      (result.upstreamStatus === 403 ||
        result.error?.code === 'forbidden_origin_or_scope'));
  const isInvalidCode =
    result &&
    ((result.ok &&
      result.data?.valid === false &&
      result.data?.status !== 'not_found') ||
      (!result.ok && [400, 422].includes(result.upstreamStatus ?? 0)));
  const isUnseededNotFound =
    result &&
    ((result.ok && result.data?.status === 'not_found') ||
      (!result.ok && result.upstreamStatus === 404));

  const batchPassCount = batchItems.filter(
    (i) =>
      i.classification === 'verified_active' ||
      i.classification === 'canonical_unseeded'
  ).length;
  const batchRejectCount = batchItems.filter(
    (i) => i.classification === 'invalid_rejected'
  ).length;

  const creditEstimate = estimateCreditUsage(
    monthlyApplicants,
    tierLevel,
    escalationPct
  );
  const tierPreviewPayload = buildPhase2TierPreview(
    query.trim() || SAMPLE,
    tierLevel,
    buildingUsePreview
  );
  const originCheck = evaluateOriginAllowlist(testOriginUrl, allowedOrigins);

  const commercialBilling = calculateCommercialBillingPreview({
    l1Count: creditEstimate.l1Checks,
    l2Count: creditEstimate.l2Checks,
    l3Count: creditEstimate.l3Checks,
    simulatedNairaPerCredit: simulatedNairaRate,
    applyWelcomeCredits: applyWelcomeInBilling,
  });

  const webhookPayload = buildWebhookEventPayload(
    webhookEvent,
    query.trim() || SAMPLE,
    webhookEndpoint,
    result?.at ?? '2026-10-21T10:00:00.000Z'
  );

  const avgSessionLatencyMs =
    verificationLog.length > 0
      ? Math.round(
          verificationLog.reduce((acc, item) => acc + item.durationMs, 0) /
            verificationLog.length
        )
      : null;

  const sdkSnippet =
    sdkFormat === 'widget'
      ? `<!-- PostCheck Phase 2 · Customer-Facing Onboarding Widget (Origin-Allowlisted) -->
<div
  id="postcheck-address-step"
  data-publishable-key="nipost_pk_test_vam_session2_demo"
  data-allowed-origin="${allowedOrigins[0] ?? 'https://onboarding.partnerfintech.ng'}"
  data-default-level="1"
  data-escalation-level="${tierLevel}"
></div>
<script
  src="${SITE_URL}/widget/v1/postcheck-embed.js"
  async
></script>
<script>
  window.addEventListener('postcheck:verified', (event) => {
    // Receives canonical Section 9 KYC handoff payload
    const kycAddressPayload = event.detail;
    console.log('Verified NIPOST Postcode:', kycAddressPayload.postcode);
  });
</script>`
      : sdkFormat === 'node'
        ? `// PostCheck Phase 2 · Fintech Server-to-Server KYC Handoff Integration
// Preview: /api/postcode currently requires a signed-in PostCheck session.
// Partner server API keys are planned for Phase 2.
const response = await fetch('${SITE_URL}/api/postcode', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    operation: 'lookup',
    input: { postcode: '${query.trim() || SAMPLE}', level: 1 },
  }),
});

const verification = await response.json();
// Persist canonical 5-segment reference alongside BVN/NIN check
await db.kycAddresses.insert({
  postcode: '${tierPreviewPayload.postcode}',
  segments: ${JSON.stringify(tierPreviewPayload.segments)},
  verdict: verification.ok ? 'verified' : 'not_verified',
  level: 1,
  source: 'NIPOST Postcode API — test environment',
});`
        : `# PostCheck Phase 2 · Direct NIPOST Gateway Lookup (Server-Only X-API-Key)
curl -X GET "https://api.postcode.gov.ng/v1/lookup?code=${encodeURIComponent(query.trim() || SAMPLE)}&level=${tierLevel}" \\
  -H "X-API-Key: $NIPOST_API_KEY" \\
  -H "Accept: application/json"`;

  function handleAddAllowedOrigin(e: React.FormEvent) {
    e.preventDefault();
    const check = evaluateOriginAllowlist(newOriginInput, [newOriginInput]);
    if (check.code === 'invalid_origin' || !check.normalizedOrigin) {
      setNewOriginError(
        'Enter a valid HTTPS origin URL (e.g. https://checkout.partnerbank.ng).'
      );
      return;
    }
    if (
      !check.normalizedOrigin.startsWith('https://') &&
      !check.normalizedOrigin.startsWith('http://localhost')
    ) {
      setNewOriginError(
        'Publishable widget origins must use HTTPS (or http://localhost in dev).'
      );
      return;
    }
    if (!allowedOrigins.includes(check.normalizedOrigin)) {
      setAllowedOrigins((prev) => [...prev, check.normalizedOrigin!]);
    }
    setTestOriginUrl(check.normalizedOrigin);
    setNewOriginInput('');
    setNewOriginError('');
  }

  function copySdkSnippet() {
    navigator.clipboard?.writeText(sdkSnippet);
    setCopiedSdk(true);
    setTimeout(() => setCopiedSdk(false), 1800);
  }

  function copyWebhookJson() {
    navigator.clipboard?.writeText(JSON.stringify(webhookPayload, null, 2));
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 1800);
  }

  function handleBatchFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setBatchInput(reader.result.slice(0, 2000));
      }
    };
    reader.readAsText(file);
  }

  return (
    <Tabs
      value={tab}
      onValueChange={(v) => {
        setTab(v as 'capture' | 'phase2' | 'tests' | 'batch');
        setMessage('');
      }}
      className="app-shell"
    >
      <aside className="sidebar">
        <Link className="brand" href="/" aria-label="PostCheck home">
          <img
            src="/icon.svg"
            alt="PostCheck by Viral Ad Media brand mark"
            width={36}
            height={36}
            className="mkt-logo-img"
          />
          PostCheck<span className="brand-dot">.</span>
        </Link>
        <div className="workspace-label">
          VIRAL AD MEDIA <Badge variant="gold">LAGOS</Badge>
        </div>
        <p className="nav-label">WORKSPACE</p>
        <nav aria-label="Main">
          <TabsList className="w-full">
            <TabsTrigger
              value="capture"
              className={tab === 'capture' ? 'nav-item active' : 'nav-item'}
            >
              <ShieldCheck size={18} />
              Address verification
              <ChevronRight size={14} />
            </TabsTrigger>
            <TabsTrigger
              value="phase2"
              className={tab === 'phase2' ? 'nav-item active' : 'nav-item'}
            >
              <Code2 size={18} />
              Pilot &amp; widget studio
              <Badge variant="gold" className="count">
                L2/L3
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="batch"
              className={tab === 'batch' ? 'nav-item active' : 'nav-item'}
            >
              <FileSpreadsheet size={18} />
              Batch &amp; commercial
              <Badge variant="gold" className="count">
                P2/P3
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="tests"
              className={tab === 'tests' ? 'nav-item active' : 'nav-item'}
            >
              <FlaskConical size={18} />
              API test suite
              <Badge variant="default" className="count">
                4
              </Badge>
            </TabsTrigger>
          </TabsList>
        </nav>

        <p className="nav-label nav-label-spaced">PRODUCT &amp; PITCH</p>
        <nav aria-label="Product and pitch" className="sidebar-links">
          <Link href="/overview" className="nav-item">
            <BookOpen size={17} />
            Overview
            <ChevronRight size={14} />
          </Link>
          <Link href="/how-it-works" className="nav-item">
            <Layers3 size={17} />
            How it works
            <ChevronRight size={14} />
          </Link>
          <Link href="/sectors" className="nav-item">
            <Building2 size={17} />
            Sectors
            <ChevronRight size={14} />
          </Link>
          <Link href="/dashboard/pilot" className="nav-item">
            <Code2 size={17} />
            Fintech pilot
            <ChevronRight size={14} />
          </Link>
          <Link href="/privacy" className="nav-item">
            <LockKeyhole size={17} />
            Privacy &amp; NDPA
            <ChevronRight size={14} />
          </Link>
        </nav>

        <Card className="sidebar-card">
          <span className="mini-icon">
            <Layers3 size={18} />
          </span>
          <h3>Built for better onboarding.</h3>
          <p>A postcode-first address step for Nigerian businesses.</p>
          <Link href="/overview">
            Read the pitch overview
            <ArrowUpRight size={14} />
          </Link>
        </Card>
        <div className="sidebar-footer">
          <Avatar className="avatar">
            <AvatarFallback>VA</AvatarFallback>
          </Avatar>
          <div>
            {email}<small>Verified account · Sandbox</small>
          </div>
          <LockKeyhole size={14} />
        </div>
      </aside>

      <div className="workspace">
        <div className="hairline" aria-hidden="true" />
        <header className="topbar">
          <nav aria-label="Breadcrumb" className="breadcrumb">
            <Link href="/overview" className="breadcrumb-link">
              PostCheck
            </Link>
            <ChevronRight size={13} aria-hidden="true" />
            <strong aria-current="page">
              {tab === 'capture'
                ? 'Address verification'
                : tab === 'phase2'
                  ? 'Phase 2 · Pilot & widget studio'
                  : tab === 'batch'
                    ? 'Batch backbook audit'
                    : 'API test suite'}
            </strong>
          </nav>
          <div className="topbar-right">
            {verificationLog.length > 0 && (
              <Badge variant="secondary" className="log-count-pill">
                <History size={12} />
                {verificationLog.length}{' '}
                {verificationLog.length === 1 ? 'check' : 'checks'} logged
              </Badge>
            )}
            <Badge variant="gold" className="badge">
              <i />
              Sandbox
            </Badge>
            <ThemeToggle />
            <AccountMenu email={email} />
          </div>
        </header>

        <main id="main-content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">NIGERIA’S ADDRESS LAYER</div>
              <h1>
                {tab === 'capture' ? (
                  <>
                    A clearer{' '}
                    <span className="gold-word">
                      address
                      <svg viewBox="0 0 200 10" aria-hidden="true">
                        <path
                          d="M3 7 C 60 2, 140 2, 197 6"
                          stroke="#EBC700"
                          strokeWidth="5"
                          fill="none"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                    . A better start.
                  </>
                ) : tab === 'phase2' ? (
                  <>
                    Post-KYB{' '}
                    <span className="gold-word">
                      tiers
                      <svg viewBox="0 0 200 10" aria-hidden="true">
                        <path
                          d="M3 7 C 60 2, 140 2, 197 6"
                          stroke="#EBC700"
                          strokeWidth="5"
                          fill="none"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>{' '}
                    &amp; widget studio.
                  </>
                ) : tab === 'batch' ? (
                  <>
                    Normalize legacy{' '}
                    <span className="gold-word">
                      backbooks
                      <svg viewBox="0 0 200 10" aria-hidden="true">
                        <path
                          d="M3 7 C 60 2, 140 2, 197 6"
                          stroke="#EBC700"
                          strokeWidth="5"
                          fill="none"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                    .
                  </>
                ) : (
                  <>
                    Real calls. Clear{' '}
                    <span className="gold-word">
                      evidence
                      <svg viewBox="0 0 200 10" aria-hidden="true">
                        <path
                          d="M3 7 C 60 2, 140 2, 197 6"
                          stroke="#EBC700"
                          strokeWidth="5"
                          fill="none"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                    .
                  </>
                )}
              </h1>
              <p>
                {tab === 'capture' ? (
                  <>
                    Bring 5-segment NIPOST postcode validation into your customer
                    onboarding flow. Learn more in the{' '}
                    <Link href="/how-it-works" className="inline-link">
                      5-segment architecture guide
                    </Link>{' '}
                    or explore{' '}
                    <Link href="/sectors" className="inline-link">
                      8 Nigerian sector playbooks
                    </Link>
                    .
                  </>
                ) : tab === 'phase2' ? (
                  <>
                    Configure Phase 2 post-KYB lookup tiers (L1 free vs. L2/L3
                    credit-metered), manage publishable widget origin
                    allowlists, and copy fintech pilot SDK snippets.
                  </>
                ) : tab === 'batch' ? (
                  <>
                    Audit up to 10 customer onboarding postcodes in one pass and
                    export a normalized CSV report for KYC compliance queues.
                  </>
                ) : (
                  <>
                    Four live verification checks against the NIPOST Postcode
                    Gateway with{' '}
                    <Link href="/privacy" className="inline-link">
                      NDPA-compliant credential isolation
                    </Link>
                    .
                  </>
                )}
              </p>
            </div>
            <Button asChild variant="outline" className="docs-link">
              <a
                href="https://docs.postcode.gov.ng/"
                target="_blank"
                rel="noreferrer"
              >
                API documentation
                <ArrowUpRight size={15} />
              </a>
            </Button>
          </div>

          <Alert
            variant={configured ? 'success' : 'default'}
            className={'connection ' + (configured ? 'connected' : '')}
            role="status"
          >
            <div className="connection-icon">
              {configured ? <Check size={17} /> : <LockKeyhole size={17} />}
            </div>
            <div>
              <AlertTitle>
                {configured
                  ? 'Test key connected'
                  : statusError
                    ? 'Connection status unavailable'
                    : configured === null
                      ? 'Checking connection…'
                      : 'Ready to connect to NIPOST'}
              </AlertTitle>
              <AlertDescription>
                {configured
                  ? 'Requests use NIPOST’s sandbox dataset. Live calls have not passed until results appear below.'
                  : statusError
                    ? 'Reload the page to check the server connection.'
                    : 'The server-side test key is the next step. No live API results are shown yet.'}
              </AlertDescription>
            </div>
            <Badge
              variant={configured ? 'success' : 'gold'}
              className="connection-tag"
            >
              {configured ? 'TEST ENVIRONMENT' : 'SETUP PENDING'}
            </Badge>
          </Alert>

          {message && (
            <Alert variant="destructive" className="error-notice" role="alert">
              {message}
            </Alert>
          )}

          <TabsContent value="capture" className="tab-stage">
            {/* PRD Section 5 & Section 10: Always-visible 3-step rail (mobile & desktop) */}
            <ol
              className="three-step-rail"
              role="list"
              aria-label="PostCheck 3-step verification flow"
            >
              <li
                className={
                  'rail-step' +
                  (query.trim() ? ' step-done' : ' step-active')
                }
              >
                <span className="rail-num">1</span>
                <div className="rail-copy">
                  <strong>Capture</strong>
                  <span>Autocomplete, 37-state catalog, or 1-click sample</span>
                </div>
              </li>
              <li
                className={
                  'rail-step' +
                  (valid
                    ? ' step-done'
                    : query.trim()
                      ? ' step-active'
                      : '')
                }
              >
                <span className="rail-num">2</span>
                <div className="rail-copy">
                  <strong>Validate</strong>
                  <span>L1 NIPOST lookup + raw API response proof</span>
                </div>
              </li>
              <li
                className={
                  'rail-step' +
                  (onboardingSubmitted || copiedKyc
                    ? ' step-done'
                    : valid
                      ? ' step-active'
                      : '')
                }
              >
                <span className="rail-num">3</span>
                <div className="rail-copy">
                  <strong>Continue onboarding</strong>
                  <span>Copy KYC handoff JSON + session verification log</span>
                </div>
              </li>
            </ol>

            <div className="content-grid">
              <div className="capture-stack">
                <Card className="panel capture-panel">
                  <CardHeader className="panel-heading">
                    <span className="panel-icon">
                      <MapPin size={20} />
                    </span>
                    <div>
                      <CardTitle>Verify an address postcode</CardTitle>
                      <CardDescription>
                        Start with a postcode. Let the data do the checking.
                      </CardDescription>
                    </div>
                    <CardAction>
                      <Badge variant="secondary" className="step-tag">
                        {onboardingSubmitted
                          ? '03 / 03'
                          : valid
                            ? '02 / 03'
                            : '01 / 03'}
                      </Badge>
                    </CardAction>
                  </CardHeader>

                  <CardContent className="panel-body">
                    <div className="field-heading">
                      <Label htmlFor="postcode">Postcode search</Label>
                      <span>Segment-aware autocomplete (300ms + cache)</span>
                    </div>
                    <div className="search-wrap">
                      <Search size={19} />
                      <Input
                        id="postcode"
                        name="postal-code"
                        disabled={busy}
                        value={query}
                        onChange={(e) => changeQuery(e.target.value)}
                        placeholder="Start typing, e.g. FC 01 A01…"
                        maxLength={64}
                        autoComplete="postal-code"
                        autoCorrect="off"
                        autoCapitalize="characters"
                        spellCheck={false}
                        aria-describedby="search-help"
                      />
                      {searchBusy && <Loader2 className="spin" size={18} />}
                    </div>

                    <div className="seg-meter" aria-hidden="true">
                      <div className="seg-bars">
                        {SEGMENT_LENGTHS.map((threshold, idx) => {
                          const prev = idx === 0 ? 0 : SEGMENT_LENGTHS[idx - 1];
                          const filled = cleanChars >= threshold;
                          const active =
                            cleanChars > prev && cleanChars < threshold;
                          return (
                            <span
                              key={threshold}
                              className={
                                'seg-bar' +
                                (idx === 2 ? ' wide' : '') +
                                (filled ? ' filled' : active ? ' active' : '')
                              }
                            />
                          );
                        })}
                      </div>
                      <span className="seg-counter">{cleanChars} / 11</span>
                    </div>

                    <p className="field-help" id="search-help">
                      Search by postcode segments, not a street name.
                    </p>

                    {suggestions.length > 0 && (
                      <ul
                        className="suggestions"
                        role="list"
                        aria-label="Postcode suggestions"
                      >
                        {suggestions.map((s, i) => (
                          <li key={s.code + i}>
                            <button type="button" onClick={() => choose(s)}>
                              <MapPin size={16} />
                              <span>
                                {s.label || s.code}
                                <small>{s.code}</small>
                              </span>
                              <ChevronRight size={15} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}

                    {searchResult && !searchResult.ok && (
                      <Alert
                        variant="destructive"
                        role="alert"
                        className="inline-error"
                      >
                        {searchResult.error?.message}
                      </Alert>
                    )}

                    {searchResult?.ok && suggestions.length === 0 && (
                      <p className="empty-search">
                        No sandbox matches. Try the sample below.
                      </p>
                    )}

                    <div className="sample-row">
                      <span>Try a sandbox address (1-click verify)</span>
                      <button type="button" disabled={busy} onClick={sample}>
                        {SAMPLE}
                        <ArrowUpRight size={13} />
                      </button>
                    </div>

                    <Button
                      className="verify-button"
                      disabled={!configured || !query.trim() || busy}
                      onClick={() => verify()}
                    >
                      {busy ? <Loader2 className="spin" /> : <ShieldCheck />}
                      Verify postcode
                      <ArrowRight className="button-arrow" />
                    </Button>

                    <div
                      className={'result-box ' + (valid ? 'valid' : '')}
                      aria-live="polite"
                    >
                      {result ? (
                        <div className="result-stage">
                          <span className="result-symbol">
                            {valid ? (
                              <CheckCheck size={25} />
                            ) : result.ok ? (
                              <Layers3 size={25} />
                            ) : (
                              <CircleHelp size={25} />
                            )}
                          </span>

                          <div className="verdict-badges">
                            <Badge
                              variant={
                                valid ||
                                (result.ok && result.operation === 'assemble')
                                  ? 'success'
                                  : isUnseededNotFound
                                    ? 'gold'
                                    : 'destructive'
                              }
                            >
                              {result.data?.valid === true
                                ? 'VERIFIED · LEVEL 1'
                                : valid
                                  ? 'VERIFIED · L1 CANONICAL'
                                  : result.ok && result.operation === 'assemble'
                                    ? 'ASSEMBLED · CANONICAL'
                                    : isRateLimited
                                      ? 'RATE LIMITED · HTTP 429'
                                      : isInsufficientCredits
                                        ? 'INSUFFICIENT CREDITS · HTTP 402'
                                        : isForbiddenOrigin
                                          ? 'FORBIDDEN · HTTP 403'
                                          : isInvalidCode
                                            ? 'NOT VERIFIED · INVALID CODE'
                                            : isUnseededNotFound
                                              ? 'NO RECORD FOUND · HTTP 404'
                                              : 'API ERROR'}
                            </Badge>
                            <Badge variant="secondary">
                              {result.durationMs} ms
                            </Badge>
                            {result.rateLimit &&
                              (result.rateLimit.remaining !== null ||
                                result.rateLimit.limit !== null) && (
                                <Badge variant="outline">
                                  Rate limit: {result.rateLimit.remaining ?? '—'}
                                  /{result.rateLimit.limit ?? '—'}
                                </Badge>
                              )}
                          </div>

                          <h3>
                            {result.data?.valid === true
                              ? 'Postcode exists in the sandbox'
                              : valid
                                ? 'Canonical postcode verified (L1 sandbox)'
                                : result.ok && result.operation === 'assemble'
                                  ? 'Postcode assembled'
                                  : isRateLimited
                                    ? 'NIPOST rate limit reached (HTTP 429)'
                                    : isInsufficientCredits
                                      ? 'Insufficient NIPOST credits (HTTP 402)'
                                      : isForbiddenOrigin
                                        ? 'Origin or key scope not allowed (HTTP 403)'
                                        : isInvalidCode
                                          ? 'Invalid postcode rejected'
                                          : isUnseededNotFound
                                            ? 'No matching record in sandbox'
                                            : 'Verification could not complete'}
                          </h3>
                          <p>
                            {result.ok && result.operation === 'assemble'
                              ? 'Structure assembled successfully. Run L1 verification to check existence.'
                              : result.data?.valid === true
                                ? `NIPOST Level 1 verified. Matched State: ${adminNames?.stateName ?? decodedCurrent?.segments.state} (${decodedCurrent?.segments.state}) · LGA: ${adminNames?.lgaName ?? decodedCurrent?.segments.lga} · District: ${adminNames?.districtName ?? decodedCurrent?.segments.district}. Identity and proof of residence remain separate checks.`
                                : valid
                                  ? `NIPOST Level 1 verified. Matched State: ${adminNames?.stateName ?? decodedCurrent?.segments.state} (${decodedCurrent?.segments.state}) · LGA: ${adminNames?.lgaName ?? decodedCurrent?.segments.lga} · District: ${adminNames?.districtName ?? decodedCurrent?.segments.district} (status: not_found in unseeded sandbox). Identity and proof of residence remain separate checks.`
                                  : isRateLimited
                                    ? (result.error?.message ??
                                      'Rate limit exceeded on NIPOST gateway. Observe X-RateLimit-Remaining and retry shortly.')
                                    : (result.error?.message ??
                                      'NIPOST rejected this input as an invalid postcode format (expected 5 segments: AA-99-H77-BB-55).')}
                          </p>

                          {/* FR-5: Decoded 5-segment pills inside verdict card with API terms */}
                          {decodedCurrent && (
                            <div
                              className="verdict-decoded-segments"
                              aria-label="Decoded postcode segments"
                            >
                              <span className="verdict-seg-chip">
                                <small>State</small>
                                <strong>{decodedCurrent.segments.state}</strong>
                                {adminNames?.stateName && (
                                  <span className="verdict-seg-sub">
                                    {adminNames.stateName}
                                  </span>
                                )}
                              </span>
                              <span className="verdict-seg-chip">
                                <small>LGA</small>
                                <strong>{decodedCurrent.segments.lga}</strong>
                                {adminNames?.lgaName && (
                                  <span className="verdict-seg-sub">
                                    {adminNames.lgaName}
                                  </span>
                                )}
                              </span>
                              <span className="verdict-seg-chip">
                                <small>District</small>
                                <strong>{decodedCurrent.segments.district}</strong>
                                {adminNames?.districtName && (
                                  <span className="verdict-seg-sub">
                                    {adminNames.districtName}
                                  </span>
                                )}
                              </span>
                              <span className="verdict-seg-chip">
                                <small>Area</small>
                                <strong>{decodedCurrent.segments.area}</strong>
                                {adminNames?.areaName && (
                                  <span className="verdict-seg-sub">
                                    {adminNames.areaName}
                                  </span>
                                )}
                              </span>
                              <span className="verdict-seg-chip">
                                <small>Unit</small>
                                <strong>{decodedCurrent.segments.unit}</strong>
                                {adminNames?.unitName && (
                                  <span className="verdict-seg-sub">
                                    {adminNames.unitName}
                                  </span>
                                )}
                              </span>
                            </div>
                          )}

                          <div className="result-actions-row">
                            <Collapsible
                              open={responseOpen}
                              onOpenChange={setResponseOpen}
                            >
                              <CollapsibleTrigger className="response-trigger">
                                View API response <Code2 size={13} />
                              </CollapsibleTrigger>
                              <CollapsibleContent className="collapsible-body">
                                <pre>{JSON.stringify(result, null, 2)}</pre>
                              </CollapsibleContent>
                            </Collapsible>

                            {kycPayload && (
                              <Collapsible
                                open={kycOpen}
                                onOpenChange={setKycOpen}
                              >
                                <div className="kyc-trigger-bar">
                                  <CollapsibleTrigger className="response-trigger">
                                    Downstream KYC handoff payload{' '}
                                    <ClipboardCheck size={13} />
                                  </CollapsibleTrigger>
                                  <button
                                    type="button"
                                    className="copy-kyc-btn"
                                    onClick={copyKycHandoff}
                                  >
                                    {copiedKyc ? (
                                      <>
                                        <Check size={12} /> Copied JSON
                                      </>
                                    ) : (
                                      <>
                                        <Copy size={12} /> Copy KYC JSON
                                      </>
                                    )}
                                  </button>
                                </div>
                                <CollapsibleContent className="collapsible-body">
                                  <pre>
                                    {JSON.stringify(kycPayload, null, 2)}
                                  </pre>
                                </CollapsibleContent>
                              </Collapsible>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="result-stage">
                          <span className="result-symbol">
                            <Fingerprint size={28} />
                          </span>
                          <h3>Your verification result will appear here</h3>
                          <p>
                            We’ll show the actual NIPOST response after you
                            verify.
                          </p>
                          <Badge variant="secondary" className="quiet-badge">
                            AWAITING VERIFICATION
                          </Badge>
                        </div>
                      )}
                    </div>

                    <Collapsible
                      open={assemblyOpen}
                      onOpenChange={setAssemblyOpen}
                      className="assembly"
                    >
                      <CollapsibleTrigger className="assembly-trigger">
                        <Layers3 size={17} />
                        Have the individual segments or need the state catalog?
                        <ChevronRight size={15} />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="collapsible-body">
                        <p>
                          Assemble five segments into a canonical postcode,
                          disassemble an existing code, or browse NIPOST’s live
                          37-state reference catalog (
                          <code>/v1/reference/*</code>).
                        </p>

                        <div className="catalog-toolbar">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={!configured || catalogBusy}
                            onClick={loadReferenceStates}
                          >
                            {catalogBusy ? (
                              <Loader2 size={14} className="spin" />
                            ) : (
                              <Database size={14} />
                            )}
                            {statesList.length > 0
                              ? `Catalog loaded (${statesList.length} states)`
                              : 'Load live NIPOST catalog'}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={!configured || busy}
                            onClick={disassembleCurrent}
                          >
                            <SplitSquareVertical size={14} />
                            Disassemble query
                          </Button>
                        </div>

                        {statesList.length > 0 && (
                          <div className="catalog-selects">
                            <label className="catalog-select-label">
                              <span>State (`/v1/reference/states`)</span>
                              <select
                                value={segments.state}
                                disabled={catalogBusy}
                                onChange={(e) =>
                                  selectCatalogState(e.target.value)
                                }
                              >
                                {statesList.map((st) => (
                                  <option key={st.code} value={st.code}>
                                    {st.code} — {st.name || st.code}
                                  </option>
                                ))}
                              </select>
                            </label>

                            {lgasList.length > 0 && (
                              <label className="catalog-select-label">
                                <span>LGA (`/v1/reference/lgas`)</span>
                                <select
                                  value={segments.lga}
                                  disabled={catalogBusy}
                                  onChange={(e) =>
                                    selectCatalogLga(
                                      segments.state,
                                      e.target.value
                                    )
                                  }
                                >
                                  {lgasList.map((lg) => (
                                    <option key={lg.code} value={lg.code}>
                                      {lg.code} — {lg.name || lg.code}
                                    </option>
                                  ))}
                                </select>
                              </label>
                            )}

                            {districtsList.length > 0 && (
                              <label className="catalog-select-label">
                                <span>
                                  District (`/v1/reference/districts`)
                                </span>
                                <select
                                  value={segments.district}
                                  disabled={catalogBusy}
                                  onChange={(e) =>
                                    selectCatalogDistrict(
                                      segments.state,
                                      segments.lga,
                                      e.target.value
                                    )
                                  }
                                >
                                  {districtsList.map((d) => (
                                    <option key={d.code} value={d.code}>
                                      {d.code}
                                    </option>
                                  ))}
                                </select>
                              </label>
                            )}

                            {areasList.length > 0 && (
                              <label className="catalog-select-label">
                                <span>Area (`/v1/reference/areas`)</span>
                                <select
                                  value={segments.area}
                                  disabled={catalogBusy}
                                  onChange={(e) =>
                                    setSegments((prev) => ({
                                      ...prev,
                                      area: e.target.value,
                                    }))
                                  }
                                >
                                  {areasList.map((ar) => (
                                    <option key={ar.code} value={ar.code}>
                                      {ar.code}
                                    </option>
                                  ))}
                                </select>
                              </label>
                            )}
                          </div>
                        )}

                        <div className="segment-inputs">
                          {Object.entries(segments).map(([k, v]) => (
                            <Label key={k} className="segment-label">
                              {k}
                              <Input
                                aria-label={k + ' segment'}
                                value={v}
                                maxLength={8}
                                autoCorrect="off"
                                spellCheck={false}
                                onChange={(e) =>
                                  setSegments({
                                    ...segments,
                                    [k]: e.target.value,
                                  })
                                }
                              />
                            </Label>
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          disabled={!configured || busy}
                          onClick={assemble}
                        >
                          Assemble postcode
                          <ArrowRight size={14} />
                        </Button>
                      </CollapsibleContent>
                    </Collapsible>
                  </CardContent>

                  <CardFooter className="panel-bottom">
                    <LockKeyhole size={13} />
                    Test data only. No customer identity information collected.
                  </CardFooter>
                </Card>

                {/* FR-9: Continue Onboarding — Mock Account-Opening Flow */}
                <Card className="panel onboarding-card">
                  <CardHeader className="panel-heading">
                    <span className="panel-icon">
                      <UserCheck size={20} />
                    </span>
                    <div>
                      <CardTitle>
                        Step 3 · Continue onboarding (Mock KYC handoff)
                      </CardTitle>
                      <CardDescription>
                        Wrap Capture → Validate → Handoff into a single
                        applicant account-opening step using fake demo fields.
                      </CardDescription>
                    </div>
                    <CardAction>
                      <Badge variant={valid ? 'gold' : 'secondary'}>
                        {onboardingSubmitted
                          ? 'HANDOFF COMPLETE'
                          : valid
                            ? 'READY FOR HANDOFF'
                            : 'VERIFY POSTCODE FIRST'}
                      </Badge>
                    </CardAction>
                  </CardHeader>

                  <CardContent className="panel-body">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (result) setOnboardingSubmitted(true);
                      }}
                    >
                      <fieldset className="onboarding-fieldset">
                        <legend className="sr-only">
                          Mock applicant onboarding details (test data only)
                        </legend>

                        <div className="onboarding-grid">
                          <div className="onboarding-field">
                            <Label htmlFor="demo-applicant-name">
                              Applicant full name (Demo)
                            </Label>
                            <Input
                              id="demo-applicant-name"
                              name="applicant-name"
                              value={demoName}
                              onChange={(e) => setDemoName(e.target.value)}
                              autoComplete="name"
                              required
                            />
                          </div>

                          <div className="onboarding-field">
                            <Label htmlFor="demo-applicant-phone">
                              Phone number (Demo)
                            </Label>
                            <Input
                              id="demo-applicant-phone"
                              name="applicant-phone"
                              type="tel"
                              inputMode="tel"
                              autoComplete="tel"
                              value={demoPhone}
                              onChange={(e) => setDemoPhone(e.target.value)}
                              required
                            />
                          </div>
                        </div>

                        <div className="onboarding-tier-group">
                          <span className="onboarding-tier-label">
                            Target onboarding product tier
                          </span>
                          <div
                            className="onboarding-radios"
                            role="radiogroup"
                            aria-label="Target onboarding product tier"
                          >
                            {[
                              'Tier 1 Wallet',
                              'Tier 2 Savings (KYC)',
                              'Merchant POS',
                            ].map((tierOption) => (
                              <label
                                key={tierOption}
                                className={
                                  'onboarding-radio-pill' +
                                  (demoTier === tierOption ? ' active' : '')
                                }
                              >
                                <input
                                  type="radio"
                                  name="account-tier"
                                  value={tierOption}
                                  checked={demoTier === tierOption}
                                  onChange={() => setDemoTier(tierOption)}
                                />
                                <span>{tierOption}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <label className="onboarding-checkbox-row">
                          <input
                            type="checkbox"
                            checked={includeRawApiInKyc}
                            onChange={(e) =>
                              setIncludeRawApiInKyc(e.target.checked)
                            }
                          />
                          <span>
                            Include raw <code>api_response</code> object in KYC
                            JSON payload (PRD Section 9 optional include)
                          </span>
                        </label>

                        <div className="onboarding-actions">
                          <Button
                            type="submit"
                            disabled={!result}
                            className="onboarding-submit-btn"
                          >
                            <ClipboardCheck size={16} />
                            Complete onboarding &amp; generate KYC JSON
                          </Button>
                          {kycPayload && (
                            <>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={copyKycHandoff}
                              >
                                {copiedKyc ? (
                                  <>
                                    <Check size={14} /> Copied KYC JSON
                                  </>
                                ) : (
                                  <>
                                    <Copy size={14} /> Copy KYC JSON
                                  </>
                                )}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={downloadKycHandoff}
                              >
                                <Download size={14} />
                                Export .json
                              </Button>
                            </>
                          )}
                        </div>
                      </fieldset>
                    </form>

                    {onboardingSubmitted && kycPayload && (
                      <div
                        className="bank-compliance-view"
                        aria-live="polite"
                      >
                        <div className="bank-compliance-head">
                          <div>
                            <span className="eyebrow">
                              DOWNSTREAM BANK / FINTECH COMPLIANCE VIEW
                            </span>
                            <h4>
                              Structured KYC Payload ·{' '}
                              <code>{kycPayload.postcode}</code>
                            </h4>
                          </div>
                          <Badge
                            variant={
                              kycPayload.verdict === 'verified'
                                ? 'success'
                                : 'destructive'
                            }
                          >
                            verdict: {kycPayload.verdict}
                          </Badge>
                        </div>
                        <pre>{JSON.stringify(kycPayload, null, 2)}</pre>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="panel-bottom">
                    <CircleHelp size={13} />
                    Honesty rule: a valid postcode confirms a location
                    reference; it does not prove who lives there.
                  </CardFooter>
                </Card>

                {/* FR-10: Session Verification Log */}
                <Card className="panel log-panel">
                  <CardHeader className="panel-heading">
                    <span className="panel-icon">
                      <History size={20} />
                    </span>
                    <div>
                      <CardTitle>Session verification log</CardTitle>
                      <CardDescription>
                        Every postcode check in this session is recorded with
                        timestamp, decoded segments, verdict, and level.
                      </CardDescription>
                    </div>
                    <CardAction>
                      {verificationLog.length > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="xs"
                          onClick={clearVerificationLog}
                        >
                          <Trash2 size={13} />
                          Clear log
                        </Button>
                      )}
                    </CardAction>
                  </CardHeader>

                  <CardContent className="panel-body">
                    {verificationLog.length === 0 ? (
                      <p className="empty-log-note">
                        No checks recorded yet in this session. Verify a
                        postcode above to populate the audit trail.
                      </p>
                    ) : (
                      <div
                        tabIndex={0}
                        role="region"
                        aria-labelledby="session-log-table-caption"
                        className="mkt-table-scroll log-table-wrap responsive-table-region"
                      >
                        <table className="mkt-table sticky-data-table">
                          <caption
                            id="session-log-table-caption"
                            className="sr-only"
                          >
                            Session postcode verification log
                          </caption>
                          <thead>
                            <tr>
                              <th scope="col">Postcode</th>
                              <th scope="col">Time</th>
                              <th scope="col">Decoded Segments</th>
                              <th scope="col">Verdict</th>
                              <th scope="col">Level</th>
                              <th scope="col">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {verificationLog.map((entry) => (
                              <tr key={entry.id}>
                                <th scope="row">
                                  <code>{entry.postcode}</code>
                                </th>
                                <td>
                                  <span className="log-time">
                                    <Clock size={12} />
                                    {new Date(
                                      entry.checked_at
                                    ).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      second: '2-digit',
                                    })}
                                  </span>
                                </td>
                                <td>
                                  {entry.segments ? (
                                    <span className="log-segments-inline">
                                      {entry.segments.state} ·{' '}
                                      {entry.segments.lga} ·{' '}
                                      {entry.segments.district} ·{' '}
                                      {entry.segments.area} ·{' '}
                                      {entry.segments.unit}
                                    </span>
                                  ) : (
                                    <span className="text-muted">—</span>
                                  )}
                                </td>
                                <td>
                                  <Badge
                                    variant={
                                      entry.verdict === 'verified'
                                        ? 'success'
                                        : 'destructive'
                                    }
                                  >
                                    {entry.verdict}
                                  </Badge>
                                </td>
                                <td>
                                  <code>L{entry.level}</code>
                                </td>
                                <td>
                                  <button
                                    type="button"
                                    className="log-copy-btn"
                                    onClick={() => copyLogEntry(entry)}
                                  >
                                    {copiedLogId === entry.id ? (
                                      <>
                                        <Check size={12} /> Copied
                                      </>
                                    ) : (
                                      <>
                                        <Copy size={12} /> JSON
                                      </>
                                    )}
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <aside className="right-column">
                <Card className="explainer">
                  <div className="explainer-top">
                    <span className="eyebrow">ONE CODE. FIVE PARTS.</span>
                    <span className="decor-icon">
                      <MapPin size={21} />
                    </span>
                  </div>
                  <h2>
                    Every address starts
                    <br />
                    with a place.
                  </h2>
                  <p>
                    A structured postcode helps make the address step
                    consistent, from capture to validation.
                  </p>
                  <img
                    src="/images/postcode-segments.svg"
                    alt="NIPOST 5-segment postcode FC 01 A01 KP 27 breakdown into State FC, LGA 01, District A01, Area KP, and Unit 27"
                    width={560}
                    height={220}
                    className="workspace-diagram-img"
                  />
                  <div className="explainer-foot">
                    <span className="dot" />
                    <Link href="/how-it-works" className="explainer-link">
                      NIPOST national postcode system →
                    </Link>
                  </div>
                </Card>

                <Card className="panel flow-panel">
                  <h3>A focused verification flow</h3>
                  <ol role="list">
                    <li>
                      <span className={query.trim() ? 'step-done' : ''}>1</span>
                      <div>
                        <strong>Capture</strong>
                        <p>
                          Find and select a postcode via autocomplete, catalog,
                          or sample.
                        </p>
                      </div>
                    </li>
                    <li>
                      <span className={valid ? 'step-done' : ''}>2</span>
                      <div>
                        <strong>Validate</strong>
                        <p>
                          Check existence and format with an L1 lookup; inspect
                          raw API proof.
                        </p>
                      </div>
                    </li>
                    <li>
                      <span
                        className={
                          onboardingSubmitted || copiedKyc ? 'step-done' : ''
                        }
                      >
                        3
                      </span>
                      <div>
                        <strong>Continue onboarding</strong>
                        <p>
                          {onboardingSubmitted || copiedKyc
                            ? 'KYC handoff JSON emitted and logged in session trail.'
                            : 'Produce the KYC handoff payload and record in verification log.'}
                        </p>
                      </div>
                    </li>
                  </ol>
                  <Separator className="mb-3.5" />
                  <div className="scope-note">
                    <CircleHelp size={16} />
                    <p>
                      A valid postcode confirms a location reference. It does
                      not prove who lives there.{' '}
                      <Link href="/privacy" className="inline-link">
                        Read NDPA policy
                      </Link>
                      .
                    </p>
                  </div>
                </Card>
              </aside>
            </div>
          </TabsContent>

          <TabsContent value="phase2" className="tab-stage">
            <div className="phase2-grid">
              {/* 1. L1 / L2 / L3 Lookup Tier & 500-Welcome-Credit Estimator */}
              <Card className="panel">
                <CardHeader className="panel-heading">
                  <span className="panel-icon">
                    <Layers3 size={20} />
                  </span>
                  <div>
                    <CardTitle>
                      L1 / L2 / L3 Lookup Tiers &amp; 500-Credit Estimator
                    </CardTitle>
                    <CardDescription>
                      Phase 1 locks live calls to free L1. Model how Post-KYB L2
                      (house address) and L3 (building use) draw against Viral
                      Ad Media’s 500 welcome credits.
                    </CardDescription>
                  </div>
                  <CardAction>
                    <Badge
                      variant={
                        tierLevel === 1
                          ? 'success'
                          : creditEstimate.withinWelcomeGrant
                            ? 'gold'
                            : 'destructive'
                      }
                    >
                      {tierLevel === 1
                        ? 'L1 · 0 CREDITS (ACTIVE)'
                        : `L${tierLevel} · POST-KYB PREVIEW`}
                    </Badge>
                  </CardAction>
                </CardHeader>

                <CardContent className="panel-body">
                  <fieldset className="onboarding-fieldset">
                    <legend className="onboarding-tier-label">
                      Select target NIPOST lookup tier (1–3 options)
                    </legend>
                    <div
                      className="onboarding-radios"
                      role="radiogroup"
                      aria-label="Target NIPOST lookup tier"
                    >
                      {(
                        [
                          {
                            lvl: 1 as const,
                            label: 'L1 · Validity & Segments (0 credits)',
                          },
                          {
                            lvl: 2 as const,
                            label: 'L2 · + Admin & House Address (1 credit)',
                          },
                          {
                            lvl: 3 as const,
                            label: 'L3 · + Building Use Status (2 credits)',
                          },
                        ] as const
                      ).map((opt) => (
                        <label
                          key={opt.lvl}
                          className={
                            'onboarding-radio-pill' +
                            (tierLevel === opt.lvl ? ' active' : '')
                          }
                        >
                          <input
                            type="radio"
                            name="lookup-tier-level"
                            value={opt.lvl}
                            checked={tierLevel === opt.lvl}
                            onChange={() => setTierLevel(opt.lvl)}
                          />
                          <span>{opt.label}</span>
                        </label>
                      ))}
                    </div>

                    {tierLevel === 3 && (
                      <div className="onboarding-tier-group">
                        <span className="onboarding-tier-label">
                          Simulated L3 building-use classification
                        </span>
                        <div
                          className="onboarding-radios"
                          role="radiogroup"
                          aria-label="Simulated L3 building use status"
                        >
                          {(
                            ['Residential', 'Commercial', 'Public'] as const
                          ).map((useType) => (
                            <label
                              key={useType}
                              className={
                                'onboarding-radio-pill' +
                                (buildingUsePreview === useType
                                  ? ' active'
                                  : '')
                              }
                            >
                              <input
                                type="radio"
                                name="building-use-preview"
                                value={useType}
                                checked={buildingUsePreview === useType}
                                onChange={() => setBuildingUsePreview(useType)}
                              />
                              <span>{useType}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="phase2-sliders-grid">
                      <div className="onboarding-field">
                        <Label htmlFor="monthly-applicants-range">
                          Monthly onboarding applicants:{' '}
                          <strong>
                            {monthlyApplicants.toLocaleString()}
                          </strong>
                        </Label>
                        <input
                          id="monthly-applicants-range"
                          name="monthly-applicants"
                          type="range"
                          min={100}
                          max={5000}
                          step={100}
                          value={monthlyApplicants}
                          onChange={(e) =>
                            setMonthlyApplicants(Number(e.target.value))
                          }
                        />
                      </div>

                      <div className="onboarding-field">
                        <Label htmlFor="escalation-pct-range">
                          Tier 2/3 escalation rate (L2/L3 share):{' '}
                          <strong>{escalationPct}%</strong>
                        </Label>
                        <input
                          id="escalation-pct-range"
                          name="escalation-pct"
                          type="range"
                          min={0}
                          max={100}
                          step={5}
                          disabled={tierLevel === 1}
                          value={escalationPct}
                          onChange={(e) =>
                            setEscalationPct(Number(e.target.value))
                          }
                        />
                      </div>
                    </div>

                    <div className="credit-meter-card">
                      <div className="credit-meter-head">
                        <span>
                          Estimated credit consumption:{' '}
                          <strong>
                            {creditEstimate.creditsUsed.toLocaleString()}
                          </strong>{' '}
                          / {WELCOME_CREDITS} welcome credits
                        </span>
                        <Badge
                          variant={
                            creditEstimate.withinWelcomeGrant
                              ? 'success'
                              : 'destructive'
                          }
                        >
                          {creditEstimate.withinWelcomeGrant
                            ? `${creditEstimate.creditsRemaining} credits remaining`
                            : 'Exceeds 500 welcome grant'}
                        </Badge>
                      </div>
                      <progress
                        className="credit-progress"
                        max={WELCOME_CREDITS}
                        value={Math.min(
                          WELCOME_CREDITS,
                          creditEstimate.creditsUsed
                        )}
                        aria-label="Estimated credit usage against 500 welcome credits"
                      />
                      <p className="credit-meter-note">
                        <strong>
                          {creditEstimate.l1Checks.toLocaleString()}
                        </strong>{' '}
                        applicants verified free at L1 ·{' '}
                        <strong>
                          {(
                            creditEstimate.l2Checks + creditEstimate.l3Checks
                          ).toLocaleString()}
                        </strong>{' '}
                        escalated to L{tierLevel}. KYB status: submitted 4 Oct
                        2026 (under NIPOST review).
                      </p>
                    </div>

                    <div className="bank-compliance-view">
                      <div className="bank-compliance-head">
                        <div>
                          <span className="eyebrow">
                            L{tierLevel} SCHEMA &amp; KYB GATE PREVIEW
                          </span>
                          <h4>
                            Postcode <code>{tierPreviewPayload.postcode}</code>{' '}
                            · {tierPreviewPayload.credits_per_lookup} credit(s)
                            / call
                          </h4>
                        </div>
                        <Badge
                          variant={tierLevel === 1 ? 'success' : 'gold'}
                        >
                          {tierLevel === 1
                            ? 'Live Sandbox Schema'
                            : 'Post-KYB Schema Preview'}
                        </Badge>
                      </div>
                      <pre>{JSON.stringify(tierPreviewPayload, null, 2)}</pre>
                    </div>
                  </fieldset>
                </CardContent>

                <CardFooter className="panel-bottom">
                  <LockKeyhole size={14} />
                  Phase 1 runtime strictly enforces L1 (0 credits). L2/L3 unlock
                  automatically once NIPOST approves Viral Ad Media’s KYB.
                </CardFooter>
              </Card>

              {/* 2. Publishable Key & Origin Allowlist Guard + Pilot SDK Studio */}
              <div className="capture-stack">
                <Card className="panel">
                  <CardHeader className="panel-heading">
                    <span className="panel-icon">
                      <ShieldCheck size={20} />
                    </span>
                    <div>
                      <CardTitle>
                        Publishable Key &amp; Origin Allowlist Guard
                      </CardTitle>
                      <CardDescription>
                        Configure allowed checkout/onboarding origins for{' '}
                        <code>nipost_pk_*</code> embeds and test HTTP 403 origin
                        rejection (PRD Sections 6 &amp; 8).
                      </CardDescription>
                    </div>
                    <CardAction>
                      <Badge variant="gold">ORIGIN GUARD</Badge>
                    </CardAction>
                  </CardHeader>

                  <CardContent className="panel-body">
                    <form
                      onSubmit={handleAddAllowedOrigin}
                      className="origin-add-form"
                      noValidate
                    >
                      <fieldset className="onboarding-fieldset">
                        <legend className="sr-only">
                          Add an allowed HTTPS origin for publishable widget
                          embeds
                        </legend>
                        <div className="onboarding-field">
                          <Label htmlFor="new-origin-url">
                            Add allowed partner origin (HTTPS)
                          </Label>
                          <div className="origin-input-row">
                            <Input
                              id="new-origin-url"
                              name="allowed-origin"
                              type="url"
                              inputMode="url"
                              autoCorrect="off"
                              autoCapitalize="off"
                              spellCheck={false}
                              placeholder="https://checkout.partnerbank.ng"
                              value={newOriginInput}
                              onChange={(e) => {
                                setNewOriginInput(e.target.value);
                                if (newOriginError) setNewOriginError('');
                              }}
                              onBlur={() => {
                                if (!newOriginInput.trim()) return;
                                const chk = evaluateOriginAllowlist(
                                  newOriginInput,
                                  [newOriginInput]
                                );
                                if (chk.code === 'invalid_origin') {
                                  setNewOriginError(chk.message);
                                }
                              }}
                              aria-describedby="origin-help"
                            />
                            <Button type="submit" variant="outline">
                              Add origin
                            </Button>
                          </div>
                          <span id="origin-help" className="field-help">
                            Only listed origins may initialize the client-side
                            PostCheck widget.
                          </span>
                          {newOriginError && (
                            <p className="origin-error-msg" role="alert">
                              {newOriginError}
                            </p>
                          )}
                        </div>
                      </fieldset>
                    </form>

                    <ul
                      className="origin-pill-list"
                      role="list"
                      aria-label="Allowed widget origins"
                    >
                      {allowedOrigins.map((orig) => (
                        <li key={orig} className="origin-pill">
                          <code>{orig}</code>
                          {allowedOrigins.length > 1 && (
                            <button
                              type="button"
                              aria-label={`Remove ${orig} from allowlist`}
                              onClick={() =>
                                setAllowedOrigins((prev) =>
                                  prev.filter((x) => x !== orig)
                                )
                              }
                            >
                              <X size={12} />
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>

                    <Separator className="my-3.5" />

                    <div className="onboarding-field">
                      <Label htmlFor="test-origin-input">
                        Simulate incoming widget request <code>Origin</code>{' '}
                        header
                      </Label>
                      <div className="sample-row">
                        <span>Quick test:</span>
                        <button
                          type="button"
                          onClick={() =>
                            setTestOriginUrl(
                              allowedOrigins[0] ??
                                'https://onboarding.partnerfintech.ng'
                            )
                          }
                        >
                          Allowed partner (200)
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setTestOriginUrl(
                              'https://untrusted-phishing.example.com'
                            )
                          }
                        >
                          Unlisted origin (403)
                        </button>
                      </div>
                      <Input
                        id="test-origin-input"
                        name="test-origin"
                        type="url"
                        inputMode="url"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck={false}
                        value={testOriginUrl}
                        onChange={(e) => setTestOriginUrl(e.target.value)}
                      />
                    </div>

                    <Alert
                      variant={originCheck.allowed ? 'success' : 'destructive'}
                      className="mt-3.5"
                      role="status"
                    >
                      <div>
                        <AlertTitle>
                          HTTP {originCheck.status} · {originCheck.code}
                        </AlertTitle>
                        <AlertDescription>
                          {originCheck.message}
                        </AlertDescription>
                      </div>
                    </Alert>
                  </CardContent>
                </Card>

                <Card className="panel">
                  <CardHeader className="panel-heading">
                    <span className="panel-icon">
                      <Code2 size={20} />
                    </span>
                    <div>
                      <CardTitle>
                        Fintech Pilot SDK &amp; Widget Embed Snippets
                      </CardTitle>
                      <CardDescription>
                        Ready-to-paste integration code for Nigerian banks,
                        fintechs, and microfinance onboarding teams.
                      </CardDescription>
                    </div>
                    <CardAction>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={copySdkSnippet}
                      >
                        {copiedSdk ? (
                          <>
                            <Check size={13} /> Copied snippet
                          </>
                        ) : (
                          <>
                            <Copy size={13} /> Copy code
                          </>
                        )}
                      </Button>
                    </CardAction>
                  </CardHeader>

                  <CardContent className="panel-body">
                    <div
                      className="onboarding-radios mb-3.5"
                      role="radiogroup"
                      aria-label="SDK integration snippet format"
                    >
                      {(
                        [
                          { id: 'widget', label: 'HTML Widget Embed' },
                          { id: 'node', label: 'Next.js / Node KYC Proxy' },
                          { id: 'curl', label: 'cURL Gateway Call' },
                        ] as const
                      ).map((fmt) => (
                        <label
                          key={fmt.id}
                          className={
                            'onboarding-radio-pill' +
                            (sdkFormat === fmt.id ? ' active' : '')
                          }
                        >
                          <input
                            type="radio"
                            name="sdk-snippet-format"
                            value={fmt.id}
                            checked={sdkFormat === fmt.id}
                            onChange={() => setSdkFormat(fmt.id)}
                          />
                          <span>{fmt.label}</span>
                        </label>
                      ))}
                    </div>

                    <div className="bank-compliance-view">
                      <pre>{sdkSnippet}</pre>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="batch" className="tab-stage">
            <div className="capture-stack">
              <Card className="panel tests-panel">
                <CardHeader className="panel-heading">
                  <span className="panel-icon">
                    <FileSpreadsheet size={20} />
                  </span>
                  <div>
                    <CardTitle>
                      FR-11 (P2) &amp; Phase 3 · Batch backbook normalization API
                    </CardTitle>
                    <CardDescription>
                      Paste or upload a CSV/text list of customer postcodes,
                      validate against NIPOST Level 1, and export a normalized
                      compliance report.
                    </CardDescription>
                  </div>
                  <CardAction className="test-score">
                    {batchPassCount}
                    <small> / {batchItems.length || 0} valid</small>
                  </CardAction>
                </CardHeader>

                <CardContent className="panel-body">
                  <div className="field-heading">
                    <Label htmlFor="batch-codes">
                      Postcodes to audit (one per line or comma-separated, max
                      10 in sandbox)
                    </Label>
                    <div className="batch-top-controls">
                      <label className="batch-upload-label">
                        <span>Upload .csv / .txt</span>
                        <input
                          type="file"
                          accept=".csv,.txt,text/csv,text/plain"
                          className="sr-only"
                          disabled={batchBusy}
                          onChange={handleBatchFileUpload}
                        />
                      </label>
                      <button
                        type="button"
                        className="batch-sample-btn"
                        disabled={batchBusy}
                        onClick={() => setBatchInput(SAMPLE_BATCH.join('\n'))}
                      >
                        Reset sample batch
                      </button>
                    </div>
                  </div>

                  <textarea
                    id="batch-codes"
                    name="batch-codes"
                    className="batch-textarea"
                    rows={4}
                    value={batchInput}
                    disabled={batchBusy}
                    onChange={(e) => setBatchInput(e.target.value)}
                    placeholder="FC-01-A01-KP-27&#10;EK-01-A03-FK-01&#10;NOT-A-POSTCODE"
                  />

                  <div className="batch-actions-bar">
                    <Button
                      disabled={!configured || batchBusy || !batchInput.trim()}
                      onClick={runBatchAudit}
                    >
                      {batchBusy ? <Loader2 className="spin" /> : <Play />}
                      {batchBusy ? 'Auditing postcodes…' : 'Run batch L1 audit'}
                    </Button>
                    <Button
                      variant="outline"
                      disabled={batchItems.length === 0 || batchBusy}
                      onClick={downloadBatchCsv}
                    >
                      <Download />
                      Export CSV report
                    </Button>
                    {batchItems.length > 0 && (
                      <div className="batch-summary-pills">
                        <Badge variant="success">
                          {batchPassCount} Valid / Canonical
                        </Badge>
                        <Badge variant="destructive">
                          {batchRejectCount} Rejected Invalid
                        </Badge>
                      </div>
                    )}
                  </div>

                  {batchItems.length > 0 && (
                    <div
                      tabIndex={0}
                      role="region"
                      aria-labelledby="batch-audit-table-caption"
                      className="mkt-table-scroll batch-table-wrap responsive-table-region"
                    >
                      <table className="mkt-table sticky-data-table">
                        <caption
                          id="batch-audit-table-caption"
                          className="sr-only"
                        >
                          Batch postcode normalization audit results
                        </caption>
                        <thead>
                          <tr>
                            <th scope="col">Raw Input</th>
                            <th scope="col">#</th>
                            <th scope="col">Normalized (`AA-99-H77-BB-55`)</th>
                            <th scope="col">Classification</th>
                            <th scope="col">Latency</th>
                          </tr>
                        </thead>
                        <tbody>
                          {batchItems.map((item, idx) => (
                            <tr key={item.input + idx}>
                              <th scope="row">
                                <code>{item.input}</code>
                              </th>
                              <td>
                                <code>{String(idx + 1).padStart(2, '0')}</code>
                              </td>
                              <td>
                                {item.dashed ? (
                                  <code>{item.dashed}</code>
                                ) : (
                                  <span className="text-muted">—</span>
                                )}
                              </td>
                              <td>
                                {item.classification === 'verified_active' ? (
                                  <Badge variant="success">
                                    L1 Active Building
                                  </Badge>
                                ) : item.classification ===
                                  'canonical_unseeded' ? (
                                  <Badge variant="gold">
                                    L1 Canonical (`not_found`)
                                  </Badge>
                                ) : item.classification ===
                                  'invalid_rejected' ? (
                                  <Badge variant="destructive">
                                    Rejected (`invalid`)
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary">
                                    Upstream error
                                  </Badge>
                                )}
                              </td>
                              <td>
                                <code>{item.durationMs} ms</code>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="panel-bottom">
                  <LockKeyhole size={14} />
                  All batch lookups run server-side at Level 1 (0 credits
                  consumed, zero PII retained).
                </CardFooter>
              </Card>

              {/* Phase 3 — Commercial Usage & Billing Dashboard + Signed Webhooks */}
              <div className="phase2-grid">
                <Card className="panel">
                  <CardHeader className="panel-heading">
                    <span className="panel-icon">
                      <Database size={20} />
                    </span>
                    <div>
                      <CardTitle>
                        Phase 3 · Commercial Usage &amp; Billing Dashboard
                      </CardTitle>
                      <CardDescription>
                        Per-verification billing &amp; ROI model against
                        traditional ₦2,500 physical address-verification visits
                        (pending official NIPOST commercial pricing).
                      </CardDescription>
                    </div>
                    <CardAction>
                      <Badge variant="gold">PHASE 3 PREVIEW</Badge>
                    </CardAction>
                  </CardHeader>

                  <CardContent className="panel-body">
                    <div className="phase3-kpi-grid">
                      <div className="phase3-kpi-tile">
                        <small>Session checks logged</small>
                        <strong>{verificationLog.length}</strong>
                        <span>
                          {avgSessionLatencyMs !== null
                            ? `Avg ${avgSessionLatencyMs} ms latency`
                            : '0 credits consumed (L1)'}
                        </span>
                      </div>
                      <div className="phase3-kpi-tile">
                        <small>Monthly volume modeled</small>
                        <strong>
                          {commercialBilling.totalVerifications.toLocaleString()}
                        </strong>
                        <span>
                          {commercialBilling.l1FreeCount.toLocaleString()} free
                          L1 ·{' '}
                          {(
                            commercialBilling.l2Count +
                            commercialBilling.l3Count
                          ).toLocaleString()}{' '}
                          L2/L3
                        </span>
                      </div>
                      <div className="phase3-kpi-tile">
                        <small>Net billable credits</small>
                        <strong>
                          {commercialBilling.billableCredits.toLocaleString()}
                        </strong>
                        <span>
                          After {commercialBilling.welcomeCreditsApplied}{' '}
                          welcome credits
                        </span>
                      </div>
                      <div className="phase3-kpi-tile highlight">
                        <small>Est. monthly KYC savings</small>
                        <strong>
                          ₦
                          {commercialBilling.estimatedSavingsNgn.toLocaleString()}
                        </strong>
                        <span>
                          {commercialBilling.savingsPct}% vs. ₦2,500 field
                          visits
                        </span>
                      </div>
                    </div>

                    <div className="onboarding-fieldset mt-3.5">
                      <div className="onboarding-field">
                        <Label htmlFor="simulated-naira-rate">
                          Simulated NIPOST commercial rate per credit:{' '}
                          <strong>₦{simulatedNairaRate}</strong> / credit
                        </Label>
                        <input
                          id="simulated-naira-rate"
                          name="simulated-naira-rate"
                          type="range"
                          min={5}
                          max={100}
                          step={5}
                          value={simulatedNairaRate}
                          onChange={(e) =>
                            setSimulatedNairaRate(Number(e.target.value))
                          }
                        />
                      </div>

                      <label className="onboarding-checkbox-row">
                        <input
                          type="checkbox"
                          checked={applyWelcomeInBilling}
                          onChange={(e) =>
                            setApplyWelcomeInBilling(e.target.checked)
                          }
                        />
                        <span>
                          Deduct Viral Ad Media’s{' '}
                          <strong>500 welcome credits</strong> before billing
                        </span>
                      </label>
                    </div>
                  </CardContent>

                  <CardFooter className="panel-bottom">
                    <CircleHelp size={14} />
                    NIPOST has not yet published commercial per-credit rates
                    (PRD Section 11); slider models indicative unit economics.
                  </CardFooter>
                </Card>

                <Card className="panel">
                  <CardHeader className="panel-heading">
                    <span className="panel-icon">
                      <Terminal size={20} />
                    </span>
                    <div>
                      <CardTitle>
                        Phase 3 · Signed Webhooks (
                        <code>X-PostCheck-Signature</code>)
                      </CardTitle>
                      <CardDescription>
                        Inspect signed webhook events dispatched to partner core
                        banking or KYC queues after verification or batch jobs.
                      </CardDescription>
                    </div>
                    <CardAction>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={copyWebhookJson}
                      >
                        {copiedWebhook ? (
                          <>
                            <Check size={13} /> Copied event
                          </>
                        ) : (
                          <>
                            <Copy size={13} /> Copy webhook JSON
                          </>
                        )}
                      </Button>
                    </CardAction>
                  </CardHeader>

                  <CardContent className="panel-body">
                    <div className="onboarding-fieldset">
                      <div
                        className="onboarding-radios"
                        role="radiogroup"
                        aria-label="Webhook event type"
                      >
                        {(
                          [
                            {
                              id: 'postcheck.verification.completed',
                              label: 'verification.completed',
                            },
                            {
                              id: 'postcheck.verification.rejected',
                              label: 'verification.rejected',
                            },
                            {
                              id: 'postcheck.batch.completed',
                              label: 'batch.completed',
                            },
                          ] as const
                        ).map((ev) => (
                          <label
                            key={ev.id}
                            className={
                              'onboarding-radio-pill' +
                              (webhookEvent === ev.id ? ' active' : '')
                            }
                          >
                            <input
                              type="radio"
                              name="webhook-event-type"
                              value={ev.id}
                              checked={webhookEvent === ev.id}
                              onChange={() => setWebhookEvent(ev.id)}
                            />
                            <span>{ev.label}</span>
                          </label>
                        ))}
                      </div>

                      <div className="onboarding-field">
                        <Label htmlFor="webhook-endpoint-url">
                          Partner webhook destination URL
                        </Label>
                        <Input
                          id="webhook-endpoint-url"
                          name="webhook-endpoint-url"
                          type="url"
                          inputMode="url"
                          autoCorrect="off"
                          autoCapitalize="off"
                          spellCheck={false}
                          value={webhookEndpoint}
                          onChange={(e) => setWebhookEndpoint(e.target.value)}
                        />
                      </div>

                      <div className="bank-compliance-view">
                        <pre>{JSON.stringify(webhookPayload, null, 2)}</pre>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tests" className="tab-stage">
            <Card className="panel tests-panel">
              <CardHeader className="panel-heading">
                <span className="panel-icon">
                  <Terminal size={20} />
                </span>
                <div>
                  <CardTitle>Phase 1 acceptance tests</CardTitle>
                  <CardDescription>
                    Sandbox calls only. No simulated passes.
                  </CardDescription>
                </div>
                <CardAction className="test-score">
                  {passCount}
                  <small> / 4 passed</small>
                </CardAction>
              </CardHeader>

              <div className="test-actions">
                <Button disabled={!configured || suiteBusy} onClick={run}>
                  {suiteBusy ? <Loader2 className="spin" /> : <Play />}
                  {suiteBusy ? 'Running four checks…' : 'Run all four checks'}
                </Button>
                <Button
                  variant="outline"
                  onClick={download}
                  disabled={evidence.length === 0 || suiteBusy}
                >
                  <Download />
                  Export evidence
                </Button>
              </div>

              <div className="test-list">
                {['search', 'lookup', 'assemble', 'bad-postcode'].map(
                  (op, i) => {
                    const r = evidence.find((x) => x.operation === op);
                    return (
                      <div className="test-row" key={op}>
                        <div className="test-number">
                          {String(i + 1).padStart(2, '0')}
                        </div>
                        <div className="test-detail">
                          <h3>{names[op]}</h3>
                          <p>
                            {
                              [
                                'Return suggestions for FC01A01KP',
                                'Confirm FC-01-A01-KP-27 exists at level 1',
                                'Assemble five segments into the expected postcode',
                                'Send NOT-A-POSTCODE and handle the real rejection',
                              ][i]
                            }
                          </p>
                          {r && (
                            <Collapsible>
                              <CollapsibleTrigger className="evidence-trigger">
                                Response evidence · {r.durationMs} ms ·{' '}
                                {r.upstreamStatus === null
                                  ? 'No upstream response'
                                  : 'HTTP ' + r.upstreamStatus}
                                <ChevronRight size={13} />
                              </CollapsibleTrigger>
                              <CollapsibleContent className="collapsible-body">
                                <pre>{JSON.stringify(r, null, 2)}</pre>
                              </CollapsibleContent>
                            </Collapsible>
                          )}
                        </div>
                        <Badge
                          variant={
                            r
                              ? r.passed
                                ? 'success'
                                : 'destructive'
                              : 'secondary'
                          }
                          className={
                            'test-state ' +
                            (r ? (r.passed ? 'pass' : 'fail') : '')
                          }
                        >
                          {r ? (
                            r.passed ? (
                              <>
                                <Check size={14} />
                                Passed
                              </>
                            ) : (
                              <>
                                <X size={14} />
                                Not passed
                              </>
                            )
                          ) : suiteBusy ? (
                            'Running'
                          ) : (
                            'Not run'
                          )}
                        </Badge>
                      </div>
                    );
                  }
                )}
              </div>

              <CardFooter className="panel-bottom">
                <CircleHelp size={14} />
                Authentication failures, timeouts and server errors never count
                as a passed bad-postcode test.
              </CardFooter>
            </Card>
          </TabsContent>

          <footer>
            <span>
              PostCheck by <strong>Viral Ad Media — Lagos Team</strong> (Owner:
              Luqman Adeyemo · Lead: Azeez Ademola)
            </span>
            <nav
              aria-label="Workspace footer"
              className="workspace-footer-links"
            >
              <Link href="/overview">Overview</Link>
              <Link href="/how-it-works">How It Works</Link>
              <Link href="/sectors">Sectors</Link>
              <Link href="/dashboard/pilot">Fintech Pilot</Link>
              <Link href="/privacy">Privacy &amp; NDPA</Link>
              <a href="/sitemap.xml">Sitemap</a>
              <a href="/llms.txt">LLMs.txt</a>
            </nav>
          </footer>
        </main>
      </div>
    </Tabs>
  );
}
