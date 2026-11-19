# Student sign-in and portal review — 19 November 2026

The reported symptoms are rejected logins and unexpected sign-outs. This review found reproducible frontend/session problems and fixes them on `fix/student-session-reliability`. These are plausible contributors to the reports, not a confirmed diagnosis of every affected student's account.

## Findings and corrections

| Finding | What a student could experience | Correction |
| --- | --- | --- |
| Temporary Auth errors are treated as missing sessions in the shared portal loader and Account Settings. Other screens label failures as needing sign-in. | Following a portal link during a network/server interruption sends a still-authenticated student to Sign-In, or misleadingly suggests the session expired. | Distinguish confirmed missing/revoked sessions from transport failures. Keep the session and show a retry state during an outage. Apply consistent error messages to dashboard, teacher, leaderboard, reflection and avatar checks. |
| Sign-out uses Supabase's default global scope. | Signing out on one device revokes **the same account's** other device sessions; they are rejected on their next refresh. This does not sign out unrelated student accounts. | Use `scope: 'local'` for the normal sign-out button. Other tabs in the same browser still receive the SDK sign-out event. |
| Protected routes check the session only when mounted. ScenarioPlayer is outside that guard. | Another tab can sign out while a dashboard or mission continues to appear signed in, leading to later rejected operations. | Subscribe synchronously to Auth events, clear the protected view after sign-out, and apply the same guard to ScenarioPlayer. |
| Existing page state survives a different account signing in through another tab. | A shared browser can show the previous learner's cached dashboard while the SDK now holds the new account's session. Server-side RLS still applies, but the old view is misleading and should be discarded. | Key the protected subtree by user ID so account changes reset page state and mission writers. Ignore late loader responses after navigation/unmount. |
| Profile lookup and first-profile creation are separate operations. | A signup trigger or another tab can create the profile between lookup and insert. The insert returns `23505`, so valid credentials appear to have failed. | Only for that unique conflict, re-read the authenticated user's profile and use its stored role. Do not overwrite roles, upsert accounts, ignore permission failures, or retry arbitrary writes. |
| The password-recovery listener is inside the lazy Sign-In component. | On a slow connection, Auth finishes the recovery link before the screen mounts; the reset-password form never opens. | Capture the recovery event when the shared client is created and retain only its UI state until the screen is ready. Clear it on completion, sign-out or a fresh sign-in. Supabase still validates the actual token/password update. |
| Rejection messages do not distinguish common recovery actions. | Students repeatedly retry during rate limiting or cannot tell whether to check credentials or connectivity. | Explain wrong email/password, unconfirmed email, rate limits and service failures separately. Normalize email casing/outer whitespace; preserve passwords exactly. Do not automatically resubmit credentials. |

Auth callbacks remain synchronous and do not await Supabase queries while its session lock is held. The legacy `AuthContext.jsx` is not mounted by the active application; it was not treated as the incident's cause. The existing SDK token-refresh/locking policy, transport deadlines, RLS, roles, scoring and mission access prerequisites remain in place. No database migration or new backend permission is required for these changes.

## Public-service observations

Read-only checks from this environment on 19 November returned:

- Production homepage: HTTP 200, approximately 0.187 seconds for the response.
- Supabase Auth health with the application's public API key: HTTP 200, 0.774 seconds.
- Public Auth settings: HTTP 200, 0.768 seconds. Email authentication and signup are enabled, automatic email confirmation is enabled, and Google/Microsoft OAuth are disabled. The UI correctly does not advertise those disabled providers.
- Anonymous REST schema discovery was denied with HTTP 401; no student records were read.

These observations show availability at the sampled time. They are not measurements of school Wi-Fi, classroom peak load, live student credentials, or account-specific rejection rates. See [sanitized service checks](public-service-check.json).

## Validation

The new browser suite reproduces temporary Auth outages, first-profile creation conflicts, genuine permission failures, local logout scope, cross-tab logout on dashboards/missions, account switching, invalid credentials, rate limiting, normal refresh, revoked refresh, and a delayed password-recovery screen. All accounts, API responses and writes in browser tests are synthetic fixtures. The recovery test completes a synthetic password update; it never changes a real password.

Validation results are recorded in `VALIDATION.md` after the final checks.

## What remains unverified

There is no authorized Supabase administration connection, Auth log access or synthetic live account available in this environment. No real student passwords, private profiles or production Auth settings were accessed or changed. The existing avatar migration is a separate deployment dependency and was not used or modified to address sign-in.

For students who still receive a rejection after these frontend fixes, an authorized project administrator should correlate the **exact error code and Dubai time** with Supabase Authentication logs. Check whether that account is disabled, has an invalid/revoked refresh token, is rate-limited, or has a missing/inaccessible profile. Verify production password-reset redirect settings if recovery emails point somewhere unexpected. Request error text and device/browser details, not passwords or secret keys.

The fixes and the review are submitted for review in a GitHub pull request and Vercel Preview. Production remains on the previously published release unless separately published.
