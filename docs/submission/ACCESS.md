# Access implementation and provisioning

Roles are read only from `app_metadata.postcheck_role` on the user returned by Supabase `auth.getUser()`. User-editable `user_metadata`, form fields and client cookie claims never assign privilege. Missing role means participant; malformed or unknown explicit roles fail closed.

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

These are application permissions, not platform permissions. GitHub, Vercel and Supabase membership must be assigned separately by the organization owner. No application role can read another user's browser-local history. There is no shared customer data table in this release. Do not claim local history is tamper-proof or server-enforced row isolation.

## Administrator procedure

1. Verify the exact user UUID and controlled email in Supabase Auth. Confirm the person's role with the project owner.
2. In a trusted administrator environment, use Supabase Auth Admin `updateUserById` with `app_metadata: { postcheck_role: 'owner' }` (or the approved role), preserving unrelated metadata. Do not use `updateUser` user metadata. Never put a secret/service-role key in this app's public environment or a browser client.
3. Read the user back with the Admin API and confirm the exact value. Test the corresponding allow/deny row using that account. Additional staff roles require explicit assignment; the requested Luqman superadmin is provisioned.
4. Revoke application access with `postcheck_role: 'disabled'`, then revoke refresh sessions. Existing JWTs may survive until expiry, but application routes call getUser and read current app metadata. Also remove platform memberships separately when appropriate.
5. Record UUID, old role, new role, approver, operator, timestamp and reason in the organization's access log. Review before pilot, weekly during pilot, and at offboarding.

Use separate synthetic test accounts for owner, lead, QA, participant and editor. Never promote a real participant merely to make a demonstration work. The new operations route is `/dashboard/operations`; an approved staff account also sees its link on the account page.

Reference: https://supabase.com/docs/reference/javascript/auth-admin-updateuserbyid

## Superadmin console

`/dashboard/admin` shows paginated account emails, confirmation state, application roles and the latest 20 role-change events. Only a confirmed superadmin can query its database RPCs. The application uses the caller's Supabase session, not a service-role key. Private security-definer functions validate current administrator status in Auth; public wrappers are security-invoker. The private audit table has RLS enabled and no direct client grants or policies by design.

Role updates preserve unrelated metadata, require an audit reason, prohibit self changes, and prohibit creating or changing superadmins from this UI. They do not change credentials or organization membership. Supabase organization administrators provision superadmins separately.

Luqman Adeyemo's requested account was created for viraladmediacontent@gmail.com and assigned superadmin. A confirmation email was sent; confirmation and successful live sign-in remain required. No password is stored in the repository.

Migration: `supabase/migrations/20261030135031_superadmin_controls.sql`. The migration has been applied to the Postcheck project. SQL permission tests in `supabase/tests/superadmin.sql` use rolled-back synthetic fixtures and passed against the project.

Security advisor review: the private audit table's no-policy notice is intentional deny-by-default. Existing project warnings concern `public.rls_auto_enable` execute grants and disabled leaked-password protection. These were not introduced by this migration. Review provider password protections before broader rollout.
