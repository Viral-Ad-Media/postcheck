# Session 2 application draft

**Product:** PostCheck by Viral Ad Media  
**Contact:** Luqman Adeyemo (project owner; confirm submission contact details)  
**Code:** https://github.com/Viral-Ad-Media/postcheck  
**Application:** https://postcheck-nine.vercel.app  
**Demo video:** [ADD FINAL APPROVED VIDEO URL]  
**Live evidence:** [ADD DATED TEST EVIDENCE URL]

## Summary
PostCheck is a prototype that brings structured Nigerian postcode capture and Level 1 validation into a bank or fintech onboarding workflow. It produces a structured JSON handoff while clearly distinguishing a valid location reference from proof of identity or residence.

## Problem
Free-text address collection makes it difficult to standardize, compare and review onboarding records. PostCheck demonstrates how a postcode-based location reference can be captured and checked before the applicant continues through an institution's separate identity and residence checks.

## Demonstration
A user signs in to a protected workspace, enters a postcode, requests a Level 1 check and reviews the actual result. The workspace presents decoded segments where provided and supports a structured onboarding handoff. Test failures are surfaced rather than presented as successful verification. Marketing pages remain public; verification API calls require a verified account.

## Scope and safeguards
The demo uses synthetic applicant information. NIPOST credentials stay server-side. Level 1 postcode validity does not prove who lives at an address. Identity, residence verification, and institution-specific compliance decisions remain separate. Browser-local history is account-scoped but is not a centralized audit store. Phase 2/3 commercial, widget and higher-level concepts must be described as previews unless separately implemented and tested.

## Pilot request
We seek a scoped four-week evaluation with a bank or fintech team, starting with synthetic records. Proposed evaluation targets include 8 of 10 testers completing the workflow unaided and a p95 response time of at most three seconds across at least 100 measured requests. These are targets, not achieved results.

## Before sending
Replace both placeholder links. Confirm successful live signup/recovery and the actual NIPOST test results. Review the final recording for sensitive data and unsupported claims. Confirm the application deadline, contact details and organizer requirements. Retain the final submission receipt.
