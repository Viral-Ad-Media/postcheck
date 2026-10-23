# Verification status (PRD v1.0 — Phase 1, Phase 2 & Phase 3)

- **Phase 1 Exit Milestone (Oct 23, 2026)**:
  - **Full flow verified end-to-end**: Mock account-opening form (`Adaeze Okonkwo`, Tier 2 Savings) → postcode autocomplete (`/v1/search/autocomplete`) → verification (`/v1/lookup?level=1` + `/v1/assembly/assemble`) → bank-side verdict screen with API-matched boundaries → session verification log with 1-click JSON export.
  - **Negative case verified**: `NOT-A-POSTCODE` visibly and prominently fails with `NOT VERIFIED · INVALID CODE` (destructive badge), `Invalid postcode rejected`, `verdict: "not_verified"` in the bank compliance view, and audit log recording.
  - **API-matched verdict wording**: Verdict card, segment chips, and KYC handoff JSON explicitly name matched boundaries in NIPOST's terms: State (`FC · Federal Capital Territory`), LGA (`01 · Abuja Municipal Area Council (AMAC)`), District (`A01 · Garki`).
  - **Strict Level 1 scope**: Zero dependence on KYB approval or L2/L3 access (`0 credits` consumed, NDPA data minimization).
- **14 / 14 automated unit tests passed** (`npm test` in `tests/nipost.test.mjs`), covering key isolation, L1 enforcement, secret redaction, timeout/abort handling, segment autocomplete, negative-test guards, `/v1/assembly/disassemble`, `/v1/reference/*` catalog schemas, `/v1/search/nearby`, Section 9 KYC handoff payload (`includeApiResponse` toggle), batch backbook classification, HTTP `402`/`403`/`404`/`429` + `X-RateLimit-*` header surfacing, Phase 2 L1/L2/L3 credit estimator & origin allowlist guards, and Phase 3 per-verification commercial billing & signed webhook (`X-PostCheck-Signature`) payloads.
- **4 / 4 live NIPOST staging checks passed** (`npm run test:staging` → `staging-evidence.json`).
- **TypeScript type checking passed** (`npm run typecheck`).
- **Next.js production build passed with zero warnings** (`npm run build`) with `outputFileTracingRoot` pinned, `productionBrowserSourceMaps: false`, and server-only secret key isolation.
