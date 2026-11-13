# Neon and Better Auth

PostCheck runs Better Auth 1.7.22 inside Next.js using a server-only PostgreSQL connection to Neon. It does not use managed Neon Auth. Database credentials and the auth signing secret never enter client bundles.

## Configuration

Copy `.env.example` to `.env.local`. Set `DATABASE_URL` to a pooled Neon URL with `sslmode=verify-full`, and generate a random `BETTER_AUTH_SECRET` of at least 32 bytes. Set `BETTER_AUTH_URL` to the exact origin (production: `https://postcheck-nine.vercel.app`). Unconfigured previews use their unique `VERCEL_URL`; email links must be opened on that exact deployment, not a different preview alias.

Set `AUTH_EMAIL_FROM`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, and `SMTP_PASSWORD` for a verified sender. Port 465 uses TLS; other ports require STARTTLS. With no mail configuration, signup, resend, and recovery return 503 rather than claim a message was sent. Login for confirmed accounts remains available. Provider delivery must be tested with an actual inbox before cutover.

Run `npm run db:migrate` with the target environment loaded. It uses Better Auth's schema migrator and adds the role audit table. Initial generated SQL is retained in `migrations/` for connector-based provisioning. Never rerun the initial CREATE TABLE script on an existing schema; use the migration command instead.

## Authentication and authorization

Signup requires email verification. New and reset passwords require 12–128 characters and use Better Auth's default scrypt hashing. Imported bcrypt hashes are verified with bcryptjs, preserving existing passwords. Reset changes the hash to scrypt and revokes all sessions. Existing Supabase cookies are not transferred; users sign in again after cutover.

Browser forms POST to `/api/auth/*` so Better Auth's database-backed rate limits execute. Sessions are stored in PostgreSQL, cookie caching is disabled, and protected server pages/APIs query the session each request. Cookies alone cannot grant access. A remembered login uses Better Auth's persistent cookie; an unchecked Remember me uses a browser-session cookie.

Application roles live in the server-controlled `user.role` column; signup/update-user input cannot change it. Unknown roles fail closed. Superadmin queries recheck the database role and verified email inside a transaction. Changes require a reason, prohibit self changes and changes to/from superadmin, append an audit record, and revoke the target's sessions. Platform membership remains separate.

Marketing pages are public. `/dashboard/*`, `/api/postcode`, and operations exports require verified sessions and their corresponding role permissions. `/api/widget` retains its partner-origin checks and existing public integration behavior.

## Migration prepared November 13, 2026

- Neon project: `still-forest-27993468`, Luqman organization, AWS London.
- Production branch: `br-restless-sky-zaar2c52`; database: `postcheck`.
- Isolated preview/test branch: `br-weathered-fire-zaao28n4` (synthetic data only).
- One confirmed Supabase account copied to production with its UUID, email, name, timestamps, role, and bcrypt hash preserved. Hash equality was checked without displaying it. There were zero role-audit rows to transfer.
- Production Vercel database/signing variables are configured. Preview variables are pending explicit authorization: automatic approval review blocked transferring the test database credential and auth signing secret to Vercel. The preview builds, but authentication returns 503 until those variables are added and a new deployment is created. Supabase remains live until this PR is merged and deployed.
- **Pending: the user selected another email sender; its domain/address and SMTP credentials have not been supplied. Do not merge for production until mail delivery and recovery pass.**

Immediately before cutover, reconcile any new Supabase users, password changes, role changes and audit rows since the snapshot; keep Supabase signups/account changes quiet during this short final reconciliation. Import through trusted administrative tooling, parameterized SQL, and an encrypted temporary export; never commit hashes or secrets. Existing Better Auth credentials must not be overwritten by a retry. Do not copy Supabase sessions or recovery tokens.

After merge, verify the imported account login, superadmin directory, real signup/confirmation/resend/reset email, anonymous rejection, and role changes on production. Preserve the Supabase project and old Vercel variables until verified. A deployment rollback restores the old auth code, but any Neon-only accounts or password changes after cutover need reconciliation before rollback; there is no automatic dual write.

## Validation

`npm test` runs the auth lifecycle against embedded PostgreSQL (PGlite): confirmation, imported bcrypt login, session reads, forged-cookie rejection, cross-origin rejection, reset token reuse prevention, session revocation, role escalation prevention, and audited administrator changes. No mail is sent. Other tests cover the permission matrix and NIPOST/widget behavior.

`npm run typecheck`, `npm run build`, and `npm run test:auth-http` check the production build, public pages, protected routes, anonymous APIs, forged cookies, caching, and widget origins. These do not prove real email delivery or deployed account access.
