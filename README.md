# PostCheck by Viral Ad Media

A standalone Next.js application for NIPOST's **Built on Nigeria's Postcode — Session 2 (Identity, Banking & Payments)**.

PostCheck provides a structured, postcode-first address verification step for Nigerian customer onboarding: segment-aware autocomplete, Level 1 (L1) validity lookup, 5-part postcode assembly (`AA-99-H77-BB-55`), and a 4-check live staging acceptance suite with exportable JSON evidence. **A valid postcode confirms a structured location reference only; identity verification (BVN/NIN) and proof of residence remain separate downstream KYC checks.**

---

## Routes & Architecture

| Route | Type | Description |
| --- | --- | --- |
| `/` | Static (SSR + Client Workspace) | Interactive postcode capture workspace (`Address verification`) and 4-check live acceptance runner (`API test suite`) |
| `/overview` | Static | Programme alignment, 4 evaluation criteria (25% each) + NDPA pass/fail gate, showcase schedule, and FAQ |
| `/how-it-works` | Static | 5-segment postcode anatomy (`FC-01-A01-KP-27`), 3-step verification proxy workflow, and L1–L5 lookup comparison matrix |
| `/sectors` | Static | Before/after onboarding comparison and playbooks across all 8 national priority sectors |
| `/privacy` | Static | Nigeria Data Protection Act (NDPA) 2023 safeguards, verification scope boundaries, and accessibility commitment |
| `/api/postcode` | Dynamic (Server Route Handler) | Server-isolated proxy to `https://api.postcode.gov.ng` enforcing `level=1`, 10s abort timeout, and secret redaction |
| `/sitemap.xml` | Static | XML sitemap generated from `app/sitemap.ts` |
| `/robots.txt` | Static | Crawler directives generated from `app/robots.ts` (allows public pages, disallows `/api/`) |
| `/llms.txt` | Static | Machine-readable architectural and API documentation index for AI/LLM agents |

---

## Stack & Engineering Highlights

- **Next.js 16 App Router + React 19 + TypeScript** (`strict: true`, `reactStrictMode: true`, `poweredByHeader: false`, `productionBrowserSourceMaps: false`)
- **Official NIPOST Pitch Aesthetic**: Styled to match `https://pitch.postcode.gov.ng/` using `Syne` and `JetBrains Mono` (`next/font/google`), warm alabaster/coal surfaces, NIPOST Gold (`#EBC700`), and Nigerian Green (`#008753`) with zero flash-of-wrong-theme (`light` / `dark` persistence)
- **Lightweight Accessible Primitives**: Semantic `components/ui/*` primitives (`Button`, `Badge`, `Card`, `Alert`, `Input`, `Label`, `Separator`, `Tabs`, `Collapsible`, `Tooltip`) engineered without heavy client bundle overhead
- **SEO & Structured Data**: Unique `<title>`, `<meta name="description">`, `<link rel="canonical">`, OpenGraph/Twitter social cards (`/og-image.png`), visible `<nav aria-label="Breadcrumb">`, single `<h1>` per route, and JSON-LD schemas (`LocalBusiness`, `WebApplication`, `BreadcrumbList`, and `FAQPage`)
- **NDPA Data Minimization**: Queries NIPOST Lookup Level 1 (`L1`) exclusively—no customer PII, no commercial credits consumed, and no building GPS point geometry (`L5`) requested

---

## Run Locally

Use **Node.js 22.13+** (Node 22 LTS recommended) and `npm`.

1. Open a terminal in the `postcheck` folder and run:

```bash
npm ci
cp .env.example .env.local
npm run dev
```

*(On Windows PowerShell, use `Copy-Item .env.example .env.local` instead of `cp`.)*

2. Open `.env.local` and set `NIPOST_API_KEY` to your NIPOST test secret (`nipost_test_...`).
   - Do not add quotes unless needed.
   - **Never** use a `NEXT_PUBLIC_` prefix.
   - Restart the development server after changing environment variables.
3. Open [http://localhost:3000](http://localhost:3000).

Without a configured test key, the workspace displays **Setup pending** and never fabricates API responses.

---

## Four Live Acceptance Checks

Open **API test suite → Run all four checks** in the browser UI and click **Export evidence** to download `postcheck-staging-evidence.json`, or run the CLI suite directly:

```bash
npm run test:staging
```

This reads `.env.local`, executes all four live calls against `https://api.postcode.gov.ng`, and writes `staging-evidence.json`. It exits with code `0` only when all `4 / 4` checks pass.

| # | Check | Upstream Request | Pass Condition |
| --- | --- | --- | --- |
| `01` | **Postcode autocomplete** | `GET /v1/search/autocomplete?q=FC01A01KP` | HTTP 200 with structured `suggestions` array and valid `segment` metadata from the NIPOST sandbox |
| `02` | **L1 postcode lookup** | `GET /v1/lookup?code=FC-01-A01-KP-27&level=1` | HTTP 200 with `valid: true` or canonical `status: "not_found"` for an unseeded sandbox building unit |
| `03` | **Assembly validation** | `POST /v1/assembly/assemble` (`FC` / `01` / `A01` / `KP` / `27`) | HTTP 200 with `postcode: "FC-01-A01-KP-27"` |
| `04` | **Bad-postcode handling** | `GET /v1/lookup?code=NOT-A-POSTCODE&level=1` | Upstream rejection (`status: "invalid"` with `valid: false`, or HTTP `400`/`404`/`422` validation error) |

### Important NIPOST Gateway Details

- **Gateway URL**: `https://api.postcode.gov.ng` (the `nipost_test_*` key selects the sandbox dataset via the `X-API-Key` header).
- **Test-Key Isolation**: Only server-side keys starting with `nipost_test_` are accepted. Live keys (`nipost_live_*`) and publishable keys (`nipost_pub_*`) are rejected before any network call is made.
- **Locked to Level 1 (L1)**: Every lookup explicitly requests `level=1` regardless of client input.
- **Negative Test Integrity**: Authentication failures (`401`/`403`), rate limits (`429`), upstream `5xx` errors, timeouts, and malformed payloads never count as a passed negative test.

---

## Verify & Build

Run the unit test suite, TypeScript compiler check, and production build:

```bash
npm test
npm run typecheck
npm run build
```

- `npm test` runs `11` unit tests in `tests/nipost.test.mjs` covering key validation, L1 enforcement, secret redaction, timeout/abort handling, segment autocomplete helpers, negative-test guards, `/v1/assembly/disassemble`, `/v1/reference/*` catalog validation, `postcheck.kyc.handoff.v1` payload formatting, and batch backbook classification.
- `npm run typecheck` runs `tsc --noEmit`.
- `npm run build` compiles and prerenders all static pages and discovery files with browser source maps disabled.

---

## Deployment

PostCheck is a standard Next.js Node.js application:

```bash
npm ci
npm run build
npm start
```

- **Vercel / Node Hosting**: Import the repository, keep the Next.js preset, and configure `NIPOST_API_KEY` as a server-only environment variable.
- **Git Hygiene**: Never commit `.env.local`, `staging-evidence.json`, `node_modules`, or `.next` (all excluded in `.gitignore`).

---

## Project Layout

- `app/layout.tsx` — Root HTML shell, `Syne` + `JetBrains Mono` fonts, theme initialization script, and global OpenGraph/Twitter metadata
- `app/page.tsx` — Server Component entry for `/` with `LocalBusiness`, `WebApplication`, and `BreadcrumbList` JSON-LD schemas
- `components/postcode-workspace.tsx` — Interactive postcode verification and 4-check staging test suite client component
- `components/marketing-shell.tsx` — Server-rendered header, breadcrumb bar, JSON-LD injector, and footer for static pages
- `components/theme-toggle.tsx` — Lightweight client leaf button for light/dark theme switching
- `app/overview/page.tsx` — Static programme overview & FAQ page (`/overview`)
- `app/how-it-works/page.tsx` — Static 5-segment postcode & L1–L5 architecture page (`/how-it-works`)
- `app/sectors/page.tsx` — Static 8-sector industry playbooks page (`/sectors`)
- `app/privacy/page.tsx` — Static NDPA compliance & accessibility page (`/privacy`)
- `app/api/postcode/route.ts` — Server-only Next.js Route Handler boundary (`/api/postcode`)
- `app/sitemap.ts` & `app/robots.ts` — Static `/sitemap.xml` and `/robots.txt` generators
- `public/llms.txt` — LLM documentation index (`/llms.txt`)
- `public/og-image.png`, `public/icon.svg`, `public/images/*.svg` — Social card, brand icon, and architectural diagrams
- `lib/nipost.ts` — NIPOST API client, credential guard, secret redaction, and 4-check suite runner
- `lib/postcode.ts` — Shared segment constants (`FC-01-A01-KP-27`) and segment-aware query helpers
- `lib/seo.ts` — Canonical metadata builder and JSON-LD schema generators
- `scripts/check-staging.mjs` — CLI runner for the 4-check live NIPOST staging suite
- `tests/nipost.test.mjs` — Node test runner suite (`9` tests)
- `docs/DEMO.md` — Demo walkthrough and 90-second showcase script

---

## Next Phase (Phase 2 Roadmap & Showcase Milestones)

### Immediate Session 2 Milestones

1. **Hosted Sandbox Deployment**: Deploy the application to a production Node host (e.g., Vercel) with `NIPOST_API_KEY` (`nipost_test_*`) configured exclusively as a server-side secret environment variable.
2. **90-Second Demo Walkthrough Video**: Record the live capture, 5-segment assembly, negative rejection test, and `4 / 4` staging evidence export (`postcheck-staging-evidence.json`) following [`docs/DEMO.md`](docs/DEMO.md).
3. **Session 2 Submission**: Submit the deployed URL, exported JSON evidence, and walkthrough video ahead of the **Session 2 (Identity, Banking & Payments)** shortlisting deadline on **Tuesday, 3 November 2026** (Showcase: **Friday, 6 November 2026**).

### Phase 2 Product Roadmap (Post-Showcase Pilot)

- **Embeddable KYC Onboarding Step & Signed Webhook Handoff**: Package the postcode capture and L1 verification flow as a drop-in component and server webhook that binds a normalized `AA-99-H77-BB-55` reference to a bank or fintech's downstream identity (BVN/NIN) and proof-of-address workflow.
- **Opt-In Graded Lookup Escalation (L2 & L3)**: Support policy-driven escalation from free `L1` validity checks to `L2` (State, LGA, Locality, and recent house address string) and `L3` (Residential / Commercial / Public building use status) for Tier-3 account upgrades and merchant KYB, gated by explicit NDPA consent.
- **Guided Reference Catalog Selector (`/v1/reference/*`)**: Add cascading State → LGA → Postal District → Area drill-down backed by NIPOST's precomputed reference endpoints so field agents can resolve postcodes even when a customer does not yet know their code.
- **Batch Backbook Normalization (`/v1/lookup/batch`)**: Provide a server-side batch validation pipeline for financial institutions, logistics fleets, and utilities to audit and migrate legacy free-text address books to verified 5-segment postcodes.
- **Production Governance & Observability**: Add per-tenant rate limiting, structured audit logs (with zero PII retention), and `nipost_live_*` key rotation after NIPOST KYB approval.

---

## Official References

- [Built on Nigeria's Postcode Pitch Portal](https://pitch.postcode.gov.ng/)
- [NIPOST Postcode API Documentation](https://docs.postcode.gov.ng/)
- [NIPOST OpenAPI Specification](https://docs.postcode.gov.ng/api-reference/openapi.yaml)
