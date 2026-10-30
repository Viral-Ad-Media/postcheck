# PostCheck submission package — October 30, 2026

Owner: Luqman Adeyemo. Build lead: Azeez Ademola. Dates and role names follow the project brief; confirm the organizer's exact cutoff and named people's acceptance before submission.

## Deliverables and status

- Application copy: `APPLICATION.md`, ready for owner review. Submit only after filling final demo and evidence links.
- Recording script: `DEMO-SCRIPT.md`, 2 minutes 30 seconds. The accompanying illustrated preview is a storyboard, not a recording of a live NIPOST response.
- Proposed KPI, budget and access templates: downloadable CSV from `/dashboard/operations` after staff role assignment. Targets are proposals, actuals are blank, fees are unapproved.
- Release checklist: `ACCEPTANCE.md`. Live email delivery, actual NIPOST suite results, representative performance measurements and final recording remain acceptance tasks.
- Role setup and revocation: `ACCESS.md`. Luqman’s requested superadmin is provisioned, awaiting email confirmation; platform privileges are managed separately.

The Oct 30 video and Nov 2 application dates are delivery milestones, not evidence that either has been submitted. No external messages or applications have been sent.

## Four-week pilot

Week 1: approve scope/fees, nominate testers, pass auth and access checks, capture baseline timings with synthetic inputs.
Week 2: run ten observed usability sessions, record failures, fix priority issues.
Week 3: hold two bank/fintech discovery meetings and document integration needs without collecting applicant identity records.
Week 4: review measurements against targets, seek one written expression of interest, agree a scoped next phase.

## Proposed commercial terms

Engineering ₦250,000; QA ₦80,000; demo production ₦60,000; coordination ₦100,000. Subtotal ₦490,000. Ten percent reserve ₦49,000. Ceiling ₦539,000. These are fixed-scope work-package proposals, not salaries or researched market rates. Previously completed work requires a separate agreement. One person covering multiple roles must not bill overlapping deliverables twice.

Milestones on the ₦490,000 base: 30% ₦147,000 after scope acceptance; 40% ₦196,000 on reviewable delivery; 30% ₦147,000 after accepted handover. Reserve is released only by explicit owner approval. Taxes and platform/API/email costs are excluded. No payment commitment is made by this document.

## Measurement rules

- Latency: start immediately before the browser request, stop when its result renders; collect at least 100 representative L1 requests, retaining success/failure and elapsed milliseconds. Sort successful timings and take the nearest-rank p95 at index ceil(0.95*n)-1. Report failure rate and sample size alongside p95. Do not label a fast failure a successful validation.
- Usability: ten distinct consenting testers, same script, no coaching. Count completion only when capture, validation and JSON handoff finish without assistance. Proposed pass target: eight.
- Adoption: meetings need dated notes; an expression of interest needs a written partner response. An invitation alone is not a meeting or commitment.
- Evidence fields must link to actual records. Do not replace missing data with zero or a passing status.
