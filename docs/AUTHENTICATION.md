# PostCheck authentication

Supabase project: `qdwlbeknzjimybwszsdg` (Postcheck), Europe West, in `viraladmediacontent@gmail.com's Org`.

The public Auth settings endpoint was checked: email signups are enabled and email confirmation is required. No service-role key is needed or used. The application requires verified email before authorizing access.

## Environment

Copy `.env.example` to `.env.local` and fill in the project's publishable key from the Supabase Connect dialog. Production Vercel connection variables have been configured for the PostCheck project. Local development must set `NEXT_PUBLIC_SITE_URL=http://localhost:3000`.

- `NEXT_PUBLIC_SUPABASE_URL=https://qdwlbeknzjimybwszsdg.supabase.co`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: public `sb_publishable_…` key, never a secret/service-role key.
- `NEXT_PUBLIC_SITE_URL`: exact app origin. Production is `https://postcheck-nine.vercel.app`. Preview deployments derive their origin from Vercel’s VERCEL_URL unless NEXT_PUBLIC_SITE_URL is set; add that exact callback URL to Supabase before testing email flows there.
- `NIPOST_API_KEY`: existing server-side test key; never add a `NEXT_PUBLIC_` prefix.

## Supabase dashboard settings (required before email flows go live)

Authentication → URL Configuration:

Site URL: `https://postcheck-nine.vercel.app`

Redirect URLs:

```
https://postcheck-nine.vercel.app/auth/callback
https://postcheck-nine.vercel.app/auth/callback?next=/reset-password
http://localhost:3000/auth/callback
http://localhost:3000/auth/callback?next=/reset-password
```

Keep email confirmation enabled. Set the provider password minimum to at least 12 characters to match the app. Keep the default confirmation/recovery email templates using `{{ .ConfirmationURL }}`. The app uses PKCE: open the email link in the same browser that started signup or recovery. A consumed/expired link returns a clear error and links to request a fresh one.

Configure an appropriate email sender and SMTP provider before inviting users. The default Supabase email service has delivery/recipient restrictions. Supabase Auth rate limits apply. Enable CAPTCHA before a broad public rollout if needed; that requires adding the matching challenge UI and passing its token to the auth calls.

The dashboard URL settings and actual email delivery still require confirmation; the connector does not expose these settings and the browser session was signed out. Do not treat a successful build or a public settings response as successful signup/email delivery.

## Routes

| Route | Access |
| --- | --- |
| `/`, `/overview`, `/how-it-works`, `/sectors`, `/privacy`, `/pilot` | Public marketing |
| `/login`, `/signup`, `/forgot-password`, `/resend-confirmation` | Public auth forms |
| `/auth/callback` | Exchanges one-time PKCE code; allowlisted destinations only |
| `/reset-password` | Password form requires verified session; otherwise shows link recovery guidance |
| `/dashboard`, `/dashboard/pilot`, `/dashboard/account` | Verified Supabase user required |
| GET and POST `/api/postcode` | Independently verified user required; otherwise HTTP 401 |

The root now renders the existing marketing overview. All existing marketing content is retained. Live verification and the interactive widget are in the dashboard. The widget uses a same-origin session; its demo publishable-key attribute is not an authorization credential. Third-party embedding is not enabled by this change.

## Security and data behavior

- Authorization uses `auth.getUser()`, not unverified cookie contents or `getSession()`.
- Proxy refreshes cookies; dashboard, callback, and API responses are not publicly cacheable.
- Server actions perform mutations and Next.js enforces origin checks. API origin checks remain in place.
- Callback destinations are restricted to `/dashboard` and `/reset-password`.
- Password recovery errors never count as sent emails. Unknown account reset requests receive generic acknowledgement from the provider/application.
- Password updates attempt global refresh-session revocation and return to login. Existing access tokens can remain valid until their normal expiry.
- Verification logs remain browser-local and are keyed by authenticated user ID. Old unscoped logs are not imported into another account.
- No customer identity table, profile table, or new database schema is introduced. Add and test RLS policies before storing user data in public tables.

## Validation

`npm test`: existing NIPOST tests plus auth flow unit tests covering validation, unconfirmed login, recovery, email failures, callback allowlisting and password update/session revocation.

`npm run build` and `npm run typecheck` validate the Next.js app.

`npm run test:auth-http` starts the production build against a temporary local mock Supabase service. It checks public routes, anonymous and forged-cookie rejection, protected descendants, API 401 behavior and invalid callbacks. It does not create real Supabase users or send email.

Live acceptance remains necessary after URL/email configuration: create an account using an inbox you control, confirm, sign in, reload the dashboard, sign out, request password recovery, change password, and verify the old password fails. Also test expired/consumed links and provider email rate limits.
