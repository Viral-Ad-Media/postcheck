# Release acceptance — record results, do not assume passes

| Check | Required evidence | Current live status |
| --- | --- | --- |
| Signup + email confirmation | Successful account confirmation in originating browser | Not verified |
| Login + logout + reload | Signed-in workspace and rejected logged-out access | Not verified live |
| Forgot/reset password | Received email, password changed, old password rejected | Not verified |
| Invalid/expired links | Recovery guidance without an authenticated dashboard | Not verified live |
| Staff role assignment | Verified UUID and approved role; allow/deny checks | Luqman superadmin provisioned; email confirmation pending |
| SMTP sender | Confirm sender configuration and recipient delivery | Not verified |
| NIPOST suite | Current actual JSON evidence and timestamp | Not run in this build session |
| Performance target | ≥100 representative requests; p95 and failure rate | Not measured |
| Ten-user usability test | Dated observation sheets, unaided completion count | Not conducted |
| Demo video | Actual screen recording, synthetic inputs, approved export | Live recording pending |
| Application | Final links, owner approval, submission receipt | Not submitted |

Automated tests use mocks to verify software behavior. They do not verify Supabase email delivery, production role provisioning, NIPOST connectivity, or pilot adoption. Keep those evidence categories separate.
