# Superseded submission draft

Use [the current submission package](submission/README.md). The historical draft below contains unverified statistics and integration claims and must not be submitted or narrated without independent verification. Its old root-workspace route is superseded by `/dashboard`.

# PostCheck — "Built on Nigeria's Postcode" Session 2 Submission Package

- **Product**: PostCheck (by Viral Ad Media — Lagos Team)
- **Owner**: Luqman Adeyemo, Viral Ad Media
- **Build Lead**: Azeez Ademola (Lagos Tech Team)
- **Target Showcase**: Session 2 — Identity, Banking & Payments
- **Application Deadline**: Monday, 2 November 2026 (Shortlist closes Tuesday, 3 November 2026)
- **Live Showcase**: Friday, 6 November 2026 (5-minute live demo + 5-minute Q&A)

---

## 1. Ready-to-Paste Session 2 Application Copy

### One-Sentence Summary
PostCheck brings Nigeria's 5-segment national digital postcode (NIPOST) directly into bank and fintech customer onboarding—capturing, validating at Level 1 in under a second, and handing downstream a structured KYC JSON payload to replace utility-bill uploads and slow physical address visits.

### Problem & Opportunity
Nigerian banks, fintechs, and microfinance lenders still verify customer addresses using utility bills and physical field-agent visits—a process that takes days, costs ~₦2,500 per applicant, and is easy to forge. Meanwhile, poor address quality drives failed KYC reviews, dormant accounts, and a share of Nigeria's estimated ₦50–80bn annual misdelivery cost. With NIPOST's launch of the national digital postcode and developer API on 1 October 2026, PostCheck gives regulated onboarders a fast, deterministic, auditable 5-segment location reference at the exact moment an applicant opens an account.

### How PostCheck Uses the Official NIPOST API (`https://api.postcode.gov.ng`)
All NIPOST calls are routed through PostCheck's hardened Next.js server boundary (`POST /api/postcode`), which injects the secret key (`X-API-Key`) server-side, enforces a 10-second abort timeout, and redacts any echoed tokens:
1. **Capture (`FR-1` – `FR-4`)**:
   - `GET /v1/search/autocomplete?q=` — Segment-aware autocomplete with 300ms debounce and client-side query cache.
   - `GET /v1/reference/states`, `/lgas`, `/districts`, `/areas` — Live 37-state + FCT hierarchical catalog (zero hard-coded geography).
   - `POST /v1/assembly/assemble` & `GET /v1/assembly/disassemble?code=` — 5-segment assembly and disassembly (`State / LGA / District / Area / Unit`, e.g., `FC-01-A01-KP-27`).
   - `GET /v1/search/nearby?code=` — Optional nearby building unit lookup.
2. **Validate (`FR-5` – `FR-7`)**:
   - `GET /v1/lookup?code=&level=1` — Free Level 1 validity and canonical structure check, returning decoded 5-segment chips, latency, rate-limit headers (`X-RateLimit-Limit` / `X-RateLimit-Remaining`), and a 1-click raw NIPOST JSON proof viewer.
   - Distinct, non-blank failure states for invalid codes (`status: "invalid"` / HTTP 400/422), unseeded sandbox units (`status: "not_found"` / HTTP 404), insufficient credits (`HTTP 402`), forbidden origin/scope (`HTTP 403`), and rate limits (`HTTP 429`).
3. **Handoff & Audit (`FR-8` – `FR-12`)**:
   - **Continue Onboarding (`FR-9`) & KYC JSON Handoff (`FR-8`)**: Wraps Capture → Validate → Handoff into a single applicant account-opening flow and emits a 1-click copyable KYC JSON payload.
   - **Session Verification Log (`FR-10`)**: Records every check in session/local storage with timestamp, postcode, decoded segments, verdict, and level.
   - **Batch Back-Book Audit (`FR-11`) & 4-Check Live Test Suite (`FR-12`)**: Audits up to 10 postcodes in one pass with CSV export and runs all 4 live NIPOST staging checks (`4 / 4 passed`).

### NDPA 2023 Compliance & Scope Honesty (Pass/Fail Gate)
- **Test Data Only in Phase 1**: Zero real personal data (no real names, phone numbers, BVN, or NIN) in the application, screenshots, or demo video.
- **Data Minimization**: Queries NIPOST Lookup Level 1 (`level=1`) exclusively in Phase 1—consuming 0 credits and requesting no sensitive GPS point geometry (`L5`).
- **Explicit Honesty Rule**: Baked into the UI and every KYC JSON payload: *"A valid postcode confirms a location reference; it does not prove who lives there. Identity and proof of residence remain separate checks."*

---

## 2. Public Deployment Checklist (Milestone: Tue 27 Oct 2026)

1. **Import Repository to Vercel / Node Host**:
   - Repository: `https://github.com/Viral-Ad-Media/postcheck`
   - Framework Preset: **Next.js**
   - Node.js Version: **22.x** (`.nvmrc` specifies `22`)
2. **Configure Server-Only Environment Variable**:
   - Add `NIPOST_API_KEY` = `nipost_test_...` (Viral Ad Media's "Session 2 prototype-test" secret key) in the host environment settings.
   - **Never** add a `NEXT_PUBLIC_` prefix.
   - Optionally set `NEXT_PUBLIC_SITE_URL` to the production domain.
3. **Smoke-Test on the Exact Public Demo URL**:
   - Open `/` on desktop and mobile; confirm the **Test key connected (`TEST ENVIRONMENT`)** banner and top **3-step verification rail** appear.
   - Click the 1-click sample chip `FC-01-A01-KP-27` and confirm L1 verification completes in `< 3 seconds` (`G2`).
   - Open **API test suite → Run all four checks**, confirm `4 / 4 passed`, and export `postcheck-staging-evidence.json`.

---

## 3. Demo Video Script — 2 to 3 Minutes (Milestone: Fri 30 Oct 2026)

- **0:00 – 0:25 | The Problem**:
  - *"Every bank and fintech in Nigeria knows the onboarding bottleneck: an applicant types 'opposite yellow transformer, off Admiralty Way' and uploads a blurry utility bill. Compliance teams spend days and ₦2,500 per field visit verifying addresses, while misdelivery costs Nigeria ₦50 to ₦80 billion a year. On October 1st, NIPOST launched Nigeria's 5-segment digital postcode API. PostCheck brings that API directly into customer onboarding."*
- **0:25 – 1:10 | Step 1 & Step 2 — Capture & L1 Validate**:
  - Point to the **3-step rail** (`1 · Capture` → `2 · Validate` → `3 · Continue onboarding`).
  - Type `FC01A01KP` to show segment-aware autocomplete (`GET /v1/search/autocomplete`), or click the 1-click sample `FC-01-A01-KP-27`.
  - Show the **VERIFIED · L1** verdict card returning in under a second, the decoded 5-segment chips (`State: FC`, `LGA: 01`, `District: A01`, `Area: KP`, `Unit: 27`), and click **View API response** to prove live NIPOST API usage.
  - Open **Have the individual segments or need the state catalog?** to show live `/v1/reference/states` loading and 5-segment assembly/disassembly.
- **1:10 – 1:50 | Step 3 — Bank KYC Handoff & Session Audit Log**:
  - In **Step 3 · Continue onboarding**, click **Complete onboarding & generate KYC JSON** (using clearly labeled fake demo applicant fields).
  - Highlight the **Downstream Bank / Fintech Compliance View**, click **Copy KYC JSON**, and call out the honesty rule: *a valid postcode confirms a location reference; identity (BVN/NIN) and proof of residence remain separate checks.*
  - Scroll down to the **Session verification log** showing every check recorded in real time.
- **1:50 – 2:30 | Phase 2/3 Readiness & 4-Check Live Evidence**:
  - Briefly click **Pilot & widget studio (`L2/L3`)** to show how PostCheck scales post-KYB with the 500-welcome-credit estimator, `nipost_pk_*` origin allowlist guard (`HTTP 403` test), and drop-in widget snippets, plus **Batch & commercial (`P2/P3`)** for back-book CSV audits.
  - Finish on **API test suite**, click **Run all four checks**, show `4 / 4 passed` including real rejection of `NOT-A-POSTCODE`, and close with our pilot invitation for Nigerian banks and fintechs.

---

## 4. Live Session 2 Q&A Preparation (Milestone: Fri 6 Nov 2026)

| Likely Judge Question | Concise Answer |
| --- | --- |
| **Does a verified NIPOST postcode prove the applicant lives at that address?** | **No.** PostCheck enforces a strict honesty rule in both UI copy and the KYC JSON payload: an L1 postcode check confirms the location reference exists and is canonically structured (`State / LGA / District / Area / Unit`). Identity (BVN/NIN) and occupancy proof remain separate checks. |
| **Why do you lock Phase 1 to Lookup Level 1 (`L1`)?** | Three reasons: (1) L1 is free (`0 credits`), making top-of-funnel onboarding zero-cost; (2) it practices NDPA data minimization by not pulling street strings (`L2`), building use (`L3`), or GPS coordinates (`L5`) until needed; and (3) `L2`/`L3` require KYB approval (Viral Ad Media's KYB was submitted 4 Oct 2026). |
| **How is the NIPOST secret key protected?** | The secret key (`nipost_test_*`) lives exclusively in the server environment and is injected by our Next.js Route Handler (`/api/postcode`) via the `X-API-Key` header. It never appears in client bundles, URLs, or git history, and any echoed token is automatically redacted. |
| **How do banks integrate PostCheck into existing onboarding flows?** | Either via our server-to-server JSON proxy (`POST /api/postcode`) or our origin-allowlisted Phase 2 widget embed (`nipost_pk_*`), which emits a standardized `postcheck:verified` event and signed webhook (`X-PostCheck-Signature`). |
