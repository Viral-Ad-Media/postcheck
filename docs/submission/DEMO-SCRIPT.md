# Recording script — 2:30

Use 1920×1080, browser at 100%, notifications disabled, synthetic data only. Record only the app tab; do not show inboxes, environment settings, API keys, passwords or Supabase administration. Prepare a verified test account in advance. A signed-in demo does not establish that signup/recovery has been tested.

| Time | Screen / action | Narration |
| --- | --- | --- |
| 0:00–0:20 | Public marketing page and PostCheck identity | “PostCheck brings a structured postcode reference into customer onboarding. The goal is to make location capture clearer for applicants and more useful for bank and fintech teams.” |
| 0:20–0:35 | Login page, then cut to already signed-in dashboard | “The public site explains the product. Verification tools sit behind a verified account, and the server checks access on every postcode request.” |
| 0:35–1:00 | Enter sample FC-01-A01-KP-27; request L1 check | “We start with a synthetic example. PostCheck sends the request through its server boundary to NIPOST and presents the actual response. A missing sandbox unit or upstream error remains visible.” |
| 1:00–1:20 | Show actual segments and response viewer | “When the response supplies a valid location reference, these segments make the result easier to interpret. We can inspect the underlying response rather than relying on a decorative success label.” |
| 1:20–1:45 | Complete synthetic onboarding and copy JSON | “The next step prepares a structured handoff for downstream onboarding. A valid postcode does not prove identity or residence. Those checks remain the responsibility of the receiving institution.” |
| 1:45–2:00 | Browser-local verification history | “The prototype keeps a history in this browser, scoped to the signed-in account. This is not yet a centralized bank audit system.” |
| 2:00–2:20 | Run suite and show actual outcome | “These checks exercise the integration, including error handling. We retain the real results and timestamp. Performance figures will come from measured requests during the pilot.” |
| 2:20–2:30 | Closing card | “We are seeking a four-week pilot with a Nigerian bank or fintech team. Start with synthetic records, measure usability and reliability, and agree the next integration step.” |

If the live API is unavailable, show the error and reschedule the evidence segment; do not substitute mocked success. Do not claim four tests passed until the current run actually shows that result. Do not state unverified industry cost statistics or API launch dates.

## Capture and export

Record one clean take per segment. Trim pauses and password entry. Keep readable captions. Export H.264 MP4, 1080p, 24 or 30fps; AAC if narration is recorded. Watch the entire exported file, check opening and closing frames, and verify the shared video URL in a signed-out browser. Owner approval precedes application submission.
