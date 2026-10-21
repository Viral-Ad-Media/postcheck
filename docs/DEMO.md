# Demo walkthrough — PostCheck (Session 2 Showcase)

## Phase 1 acceptance flow (PRD v1.0)

1. Configure the server-side NIPOST test key (`NIPOST_API_KEY=nipost_test_...` in `.env.local`).
2. Open PostCheck (`/`) and confirm **Test key connected** and the top **3-step verification rail** (`1 · Capture` → `2 · Validate` → `3 · Continue onboarding`).
3. **Capture (`FR-1` – `FR-4`)**:
   - Type `FC01A01KP` into postcode search (300ms debounce + client cache) or click the 1-click sample chip `FC-01-A01-KP-27` to verify immediately (`FR-2`).
   - Optionally expand **Have the individual segments or need the state catalog?** to load NIPOST's live 37-state catalog (`/v1/reference/*`, `FR-3`), disassemble a code (`/v1/assembly/disassemble`), or assemble five segments (`POST /v1/assembly/assemble`, `FR-4`).
4. **Validate (`FR-5` – `FR-7`)**:
   - Inspect the Level 1 verdict card (`GET /v1/lookup?level=1`) showing the decoded 5-segment chips (`State`, `LGA`, `District`, `Area`, `Unit`), latency badge, and rate-limit counters.
   - Click **View API response** (`FR-6`) to display the live NIPOST JSON response.
5. **Continue onboarding & audit (`FR-8` – `FR-10`)**:
   - In **Step 3 · Continue onboarding**, review the mock applicant fields (test data only), toggle optional `api_response` inclusion, and click **Complete onboarding & generate KYC JSON** (`FR-9`).
   - Click **Copy KYC JSON** (`FR-8`) to copy the structured Section 9 payload.
   - Scroll to **Session verification log** (`FR-10`) to view the timestamped audit trail and copy any historical check.
6. **Batch audit (`FR-11`, P2) & API test suite (`FR-12`)**:
   - Open **Batch backbook audit** (`P2`) to normalize up to 10 postcodes and export CSV.
   - Open **API test suite**, run all four live checks (`4 / 4 passed`), and click **Export evidence** to download `postcheck-staging-evidence.json`.

## Suggested 2–3 minute video script (problem → flow → bank view → close)

- **0:00–0:25 (Problem)**: Nigerian banks and fintechs still verify addresses with utility bills and physical agent visits—slow, costly, and easy to forge—while misdelivery costs Nigeria ₦50–80bn annually.
- **0:25–1:05 (Capture & L1 Validate)**: Show the 3-step rail on PostCheck. Type a postcode with segment-aware autocomplete or click the 1-click sandbox sample `FC-01-A01-KP-27`. Show the sub-second L1 verdict, decoded 5-segment chips, and raw NIPOST API response proof. State the honesty rule: *a valid postcode confirms a location reference; it does not prove who lives there.*
- **1:05–1:45 (Bank KYC View & Session Log)**: Complete Step 3 (**Continue onboarding**) with demo applicant fields, reveal the Downstream Bank / Fintech Compliance View, copy the KYC JSON payload, and show the Session Verification Log plus graceful failure states (`NOT-A-POSTCODE`).
- **1:45–2:15 (4-Check Suite & Close)**: Run the 4-check live API test suite (`4 / 4 passed`) and close with the pilot proposition for Nigerian fintechs and microfinance banks.
