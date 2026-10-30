export const kpis = [
 ['K01','Demo video','One 2–3 minute video','Build lead','2026-10-30','Approved MP4; synthetic data only'],
 ['K02','Application package','Complete package','Project owner','2026-11-02','Submission receipt and final links'],
 ['K03','Authentication','6 of 6 flows pass','Build lead','Before pilot','Signup, confirmation, login, logout, reset request, password update'],
 ['K04','Access control','100% allow/deny cases pass','QA','Every release','Automated HTTP and role tests'],
 ['K05','L1 response time','p95 ≤ 3000 ms; n ≥ 100','Engineering','Weekly','End-to-end timing; report errors separately; no cherry-picking'],
 ['K06','Failure handling','All defined error cases pass','QA','Every release','Invalid, timeout, permission, credits, rate limit'],
 ['K07','Pilot adoption','2 meetings; 1 written expression of interest','Project owner','End of week 4','Dated meeting notes and explicit partner response'],
 ['K08','Usability','8 of 10 users complete unaided','Pilot coordinator','End of week 4','Capture → validation → JSON handoff observed'],
 ['K09','Test data','0 real applicant records in demo/tests','All contributors','Every release','Fixture and recording review'],
] as const;
export const budget = [
 ['Engineering and authentication',250000,'Reviewed deployed flows, access tests, handover'],
 ['QA and release verification',80000,'Auth, postcode and mobile test report'],
 ['Demo recording and editing',60000,'Approved 2–3 minute MP4; synthetic data'],
 ['Application and pilot coordination',100000,'Application pack, KPI tracker and outreach log'],
] as const;
export const accessMatrix = [
 ['superadmin','Yes','Yes','Yes','Account directory and role audit; own checks','App role management; platform access separate'],
 ['owner','Yes','Yes','Yes','Own browser-local checks','Organization access separately approved'],
 ['build_lead','Yes','Yes','No','Own synthetic checks','Repository and preview access separately approved'],
 ['qa','Yes','Yes','No','Own synthetic checks','Preview access separately approved'],
 ['demo_editor','No','No','No','Supplied synthetic footage only','None'],
 ['participant','Yes','No','No','Own browser-local checks','None'],
 ['disabled','No','No','No','None','Revoke platform access separately'],
 ['public','No','No','No','None','Marketing and auth pages only'],
] as const;
export const acceptance = [
 ['A01','Signup and confirmation','Confirm with controlled inbox; open link in originating browser'],
 ['A02','Login and logout','Sign in, reload, sign out; dashboard redirects after logout'],
 ['A03','Password recovery','Request reset, change password, verify old password fails'],
 ['A04','Link failures','Expired, consumed and wrong-browser links show recovery guidance'],
 ['A05','Access matrix','Check every role against pages and direct API/download requests'],
 ['A06','NIPOST evidence','Run live suite; retain actual results and timestamp; never prefill passes'],
 ['A07','Performance','Collect ≥100 representative timings and error count'],
 ['A08','Mobile and keyboard','Complete auth and validation with keyboard and narrow viewport'],
 ['A09','Video review','No secrets, real applicant data, unsupported claims or fake live evidence'],
 ['A10','Application receipt','Owner submits approved package and retains receipt'],
] as const;
export function csv(rows: ReadonlyArray<ReadonlyArray<string | number>>) {
 return '\uFEFF' + rows.map(row => row.map(value => '"' + String(value).replace(/"/g,'""') + '"').join(',')).join('\r\n') + '\r\n';
}
export function reportCsv(report: string) {
 switch(report) {
  case 'kpis': return csv([['ID','KPI','Proposed target','Owner','Due / cadence','Evidence method','Actual','Status','Evidence URL'],...kpis.map(row=>[...row,'','Not measured',''])]);
  case 'budget': return csv([['Work package','Proposed NGN','Acceptance basis','Approval status'],...budget.map(row=>[...row,'Unapproved']),['Subtotal',490000,'Fixed scope','Unapproved'],['Contingency 10%',49000,'Owner approval before use','Unapproved'],['Ceiling',539000,'Excludes platform charges and applicable taxes','Unapproved']]);
  case 'access': return csv([['Role','Workspace / postcode API','Operations / KPI export','Budget export','Data scope','Infrastructure'],...accessMatrix]);
  case 'acceptance': return csv([['ID','Check','Procedure','Result','Evidence','Tester','Date'],...acceptance.map(row=>[...row,'Not run','','',''])]);
  default: return null;
 }
}
