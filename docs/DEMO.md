# Demo walkthrough

## Phase 1 acceptance

The implementation is ready for key configuration. Do not describe Phase 1 as complete until the four real staging checks pass and their evidence is reviewed.

1. Configure the server-side NIPOST test key.
2. Open PostCheck and confirm that the key is connected. This label means configuration is present, not that NIPOST has authenticated it.
3. Enter `FC01A01KP` into postcode search. Select a unit suggestion to complete the postcode, or choose the documented sample.
4. Select **Verify postcode** and show the actual L1 result.
5. Expand **Have the individual segments?** and assemble the default sandbox segments.
6. Open **API test suite**, run all four checks and inspect each response.
7. Demonstrate the bad-postcode response without treating auth/server errors as validation success.
8. Export the evidence JSON. Keep secrets and environment settings out of screen recordings.

## Suggested 90-second video, after successful staging tests

- 0–15s: Explain the problem: inconsistent address capture during onboarding.
- 15–35s: Demonstrate postcode suggestions and capture.
- 35–50s: Show L1 verification and explain its limited meaning.
- 50–65s: Assemble the five postcode segments.
- 65–80s: Show the error-handling test and four-check evidence.
- 80–90s: Close with the pilot proposition: integrate a consistent postcode step into a partner's onboarding flow.

Use sandbox public places only. Do not claim proof of identity, proof of residence, regulatory compliance, a NIPOST partnership or endorsement based on this demo.

## Remaining milestones

- Real sandbox acceptance: requires the user's test key.
- Deployed demo: user chooses host and imports GitHub repository.
- Demo video: record only after the real flow passes.
- Programme application: user-reviewed project description, working URL and video before Session 2 shortlisting on November 3, 2026; session November 6, 2026.
