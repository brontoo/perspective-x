# Sign-in delay investigation and fix

14 November 2026. Repository `brontoo/perspective-x`, production baseline `42206494c861a95bbdc073f659d3bf6eb9f5d019`.

## Findings and reproduction

The active sign-in path was traced through `SignIn.jsx`, `ProtectedRoute` and the student dashboard, including optional avatar saving. Browser tests use synthetic accounts and persistence responses; no student credentials were requested, used or changed.

Two production-build reproductions failed before the fix:

1. A successful login made **two document navigations**: the Sign-In document and an unnecessary full reload into Dashboard. The expected one-document assertion failed with 2. Reloading also discards Supabase's in-memory session fallback when persistent browser storage is unavailable.
2. A deliberately stalled profile request left the sign-in button disabled indefinitely. After advancing the browser clock beyond 20 seconds, there was still no recoverable error. Authentication and dashboard read requests likewise lacked a deadline.

Build inspection found another avoidable cost: initial HTML preloaded PDF and chart libraries used by teacher analytics and certificates, even before displaying Sign-In. Broad manual vendor grouping had pulled shared dependencies into those eager chunks.

These are reproducible client-side issues that can contribute to reported delays. They do not establish that every student experienced the same cause.

## Changes

- Sign-in uses the existing React Router navigation after authentication and trusted profile lookup. It keeps the loaded app and current session rather than reloading the document.
- Remembered-email storage is optional and guarded. Restricted browser storage no longer crashes Sign-In or turns successful authentication into an error. Supabase's existing in-memory fallback can survive route changes within the current tab; persistence across browser reload still requires browser storage.
- Duplicate submit events are ignored while a credential request is pending. Mode/provider switches are disabled while it runs. The button reports Signing in, Loading your profile, or Saving your picture so those stages are distinguishable.
- Late optional-picture completion cannot navigate a visitor back after they leave Sign-In, including during a lazy route transition.
- A shared fetch adapter gives authentication requests and read-only PostgREST JSON requests a **20-second per-request deadline**, including body delivery. It aborts the actual fetch, preserves caller cancellation, clears its timer, and surfaces an actionable connection error. It does not introduce automatic credential retries. Supabase's existing refresh policy remains unchanged, so an SDK refresh sequence may span more than one request deadline.
- Mission writes, `profiles` table writes and storage uploads keep their existing cancellation behavior. Auth metadata updates use the authentication deadline. Optional picture selection/saving remains supported. A genuine picture-save error still offers the existing continuation link.
- Rejected session checks now show a retry/back-to-sign-in state instead of leaving the protected-route spinner running. Missing sessions still redirect to Sign-In.
- Rollup chooses route-based chunks for PDF, charts and other libraries. React retains its separate initialization chunk. Lazy features remain available when opened.

Role routing continues to use the stored `profiles.role`, never editable auth metadata. Existing backend identity checks, RLS, profile setup, password reset/recovery, avatar ownership checks, student progress and teacher controls are preserved. No backend/schema or authentication-provider settings changed.

## Build result

[Build metrics](build-metrics.json) record eager entry JavaScript:

| Metric | Before | After |
|---|---:|---:|
| Uncompressed initial JS | 1,638,354 bytes | 431,696 bytes |
| Reduction | | **73.65%** |
| Unneeded initial PDF chunk | 594,757 bytes | Deferred |
| Unneeded initial chart chunk | 409,807 bytes | Deferred |

This compares JavaScript referenced eagerly by the entry document. It excludes route-specific lazy chunks, CSS and images, and is **not** a measured 73.65% reduction in end-to-end login time. Actual improvement depends on caching, device and network conditions.

## Verification

- Before-fix browser reproductions: 2 failed as expected (extra document reload and unbounded profile wait).
- Targeted sign-in browser checks: **10 passed**. They cover SPA navigation, stalled profile/auth/dashboard recovery, retry, blocked storage, untrusted teacher metadata, duplicate submission, late avatar completion, cold-load dependencies and lowercase/uppercase sign-in URLs.
- Unit tests: **93 passed**, including authentication/read aborts, body stalls, status/row-count preservation, caller cancellation, timer cleanup, invalid credentials and unaffected mission writes/uploads.
- Lint, typecheck and production build passed.
- Full production-bundle portal regression: **268 passed**, with the unchanged opt-in full native story walkthrough skipped. The suite includes native media checks; this change does not alter mission media or narration.

Three read-only checks of the public Auth settings endpoint returned HTTP 200 in 0.785, 0.744 and 0.714 seconds from this environment. [Samples](public-service-check.json) contain no credentials or student data. This confirms the public service answered those checks; it is not an authenticated login benchmark, school Wi-Fi measurement or peak class-load test.

Reproduce:

```sh
npm run lint
npm run typecheck
npm run test:unit
npm run build
npx playwright test --config playwright.built.config.js tests/signin-performance.spec.js tests/approved-ui.spec.js tests/profile-schema.spec.js
npx playwright test --config playwright.built.config.js
```

## Limits and release scope

Live student-account authentication, the school network and Supabase peak-load behavior remain unverified. Browser QA uses Chromium and synthetic records. No passwords, private student data or production user records were accessed. The public service check reads only advertised auth settings.

The fix changes `SignIn.jsx`, the protected-route error handling in `App.jsx`, the Supabase client's bounded transport and the Vite chunk configuration, with related tests. The legacy unused `AuthContext` is not mounted by the active application and was not treated as the cause of this incident. The approved page designs, original media, five-question assessments and scoring are unchanged.
