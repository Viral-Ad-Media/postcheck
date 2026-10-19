# PostCheck by Viral Ad Media

A standalone Next.js demo for NIPOST's **Built on Nigeria's Postcode — Session 2 (identity, banking and payments)**.

PostCheck provides the address-capture step of a KYC flow: postcode autocomplete, L1 existence lookup, postcode assembly, and a deliberate bad-postcode test. **A valid postcode is not proof of identity or residence.**

## Stack

- Next.js App Router + React + TypeScript
- Tailwind CSS + shadcn/ui components
- Server-side Node.js API route (API key never sent to the browser)
- Node's built-in test runner
- No database, account service, Sites SDK, Cloudflare runtime or customer data storage

## Run locally

Use Node.js 22.13+ (Node 22 LTS recommended) and npm.

1. Extract this ZIP and open the `postcheck` folder in VS Code.
2. Open **Terminal → New Terminal** in that folder.
3. Run:

```bash
npm ci
cp .env.example .env.local
npm run dev
```

On Windows PowerShell, use `Copy-Item .env.example .env.local` instead of `cp`.

4. Open `.env.local` and set `NIPOST_API_KEY` to your test secret. Do not add quotes unless needed. Never use a `NEXT_PUBLIC_` prefix. Restart the development server after changing environment variables.
5. Open http://localhost:3000.

Without a key, the page displays **Setup pending**. It does not fabricate API results. You can inspect the interface before connecting the key.

## First four real calls

Open **API test suite → Run all four checks**. Download the JSON evidence report after the run.

Alternatively, from the project folder:

```bash
npm run test:staging
```

This uses `.env.local` and writes `staging-evidence.json`. It exits with a nonzero code unless all four acceptance checks pass. Both `.env.local` and the evidence file are ignored by Git.

| Check | Request | Pass condition |
| --- | --- | --- |
| Autocomplete | GET `/v1/search/autocomplete?q=FC01A01KP` | Non-empty segment suggestions |
| L1 lookup | GET `/v1/lookup?code=FC-01-A01-KP-27&level=1` | `valid: true` |
| Assembly | POST `/v1/assembly/assemble` with FC / 01 / A01 / KP / 27 | Expected canonical postcode |
| Bad postcode | GET `/v1/lookup?code=NOT-A-POSTCODE&level=1` | Upstream 400, 404 or 422 with a readable error, or `valid: false` |

The negative test must receive a real NIPOST rejection. Authentication errors, timeouts, rate limits, malformed responses and server failures do not count as successful negative tests.

### Important API details

- The official gateway is `https://api.postcode.gov.ng`. The test key selects the sandbox dataset; there is no separate staging hostname in the public documentation.
- Only server-side keys beginning `nipost_test_` are accepted. Live and publishable keys are rejected by this demo.
- Every lookup explicitly requests L1, regardless of client input.
- `FC-01-A01-KP-27` is an official sandbox example. Production codes may not exist in the sandbox.
- Autocomplete works on postcode segments, not free-text street names.
- The spec documents assembly and disassembly, not a separate `/validate` endpoint. Assembly checks structure; lookup checks existence.
- No NIN, bank information, identity documents or real residential addresses are collected.

## Upload to GitHub yourself

1. Create an empty repository in your GitHub account or organization.
2. Choose **Add file → Upload files**.
3. Upload the extracted project's contents, not the ZIP itself. `package.json` should be at the repository root.
4. Include `.gitignore`, `.env.example`, `.nvmrc`, and `.github/workflows/ci.yml`. On a Mac, press **Command + Shift + .** to reveal hidden files.
5. Never upload `.env.local`, `node_modules`, `.next` or API keys.

You can also open the extracted folder in VS Code, use **Source Control → Initialize Repository**, review the files, commit and publish to your selected GitHub repository.

## Deploy after GitHub upload

This is a standard Next.js Node application. On Vercel, import your repository, keep the Next.js preset, add `NIPOST_API_KEY` as a secret environment variable, then deploy. Redeploy after adding or changing the key. Keep the test deployment access-protected while testing; server-side secrets do not themselves restrict who can call your app's endpoints. GitHub Pages cannot host its server API routes.

For any Node host:

```bash
npm ci
npm run build
npm start
```

Set `NIPOST_API_KEY` in the hosting platform's environment settings. The four-call suite can take up to 40 seconds during upstream timeouts, so the route declares a 60-second maximum on compatible hosts.

## Verify code

```bash
npm test
npm run typecheck
npm run build
```

Unit tests use explicit fake responses to check failure handling; they are not evidence of successful NIPOST calls. The browser UI and staging runner always call the real gateway when a test key is configured. A GitHub Actions workflow runs tests, type checking and build without requiring a secret.

## Project layout

- `app/page.tsx` — address-capture interface and test dashboard
- `app/api/postcode/route.ts` — server-only API boundary
- `lib/nipost.ts` — request handling, error redaction, timeout and acceptance checks
- `lib/postcode.ts` — shared types and postcode formatting helpers
- `components/ui/` — shadcn/ui Button and Input
- `scripts/check-staging.mjs` — command-line real API test suite
- `tests/nipost.test.mjs` — automated integration-logic tests
- `docs/DEMO.md` — demo walkthrough and remaining milestones

## Official references

- https://docs.postcode.gov.ng/authentication
- https://docs.postcode.gov.ng/api-reference/openapi.yaml
- https://pitch.postcode.gov.ng/
# postcheck
