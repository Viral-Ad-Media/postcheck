# Application access

Roles come from the database-validated Better Auth session and server-controlled Neon `user.role`. Client metadata and form fields cannot grant privilege. Missing roles default to participant; unknown roles fail closed.

| Role | Verification / postcode API | Operations + KPI/access/checklist exports | Budget export |
| --- | --- | --- | --- |
| superadmin | Yes | Yes | Yes |
| owner | Yes | Yes | Yes |
| build_lead | Yes | Yes | No |
| qa | Yes | Yes | No |
| participant | Yes | No | No |
| demo_editor | No | No | No |
| disabled | No | No | No |
| signed out | No | No | No |

GitHub, Vercel and Neon memberships are separate. Browser-local verification history remains local; there is no shared customer data table.

The superadmin directory lists 25 users per page and the latest 100 role changes. Server transactions recheck verified administrator access, prohibit self changes and superadmin changes, require an audit reason, and revoke affected sessions. New superadmins require a trusted database administrator and separately verified identity; ordinary application forms cannot create them.

Luqman’s existing superadmin account was copied with its original UUID. See [authentication migration and cutover](../AUTHENTICATION.md) for status and validation. Historical Supabase SQL remains only for rollback reference.
