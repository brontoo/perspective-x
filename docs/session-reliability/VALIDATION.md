# Validation

Final application code passed production build, ESLint, TypeScript and **97 unit tests**.

**110 distinct browser cases were verified against the final production build using Chromium and synthetic backend fixtures.** The broad portal run passed 109 cases. Its remaining failure was an overly strict test assertion about two empty PKCE fields added by the Supabase SDK; the password reset itself completed successfully. After correcting that assertion, the focused run passed all 51 sign-in, session, approved-UI and profile-schema cases. Application code did not change between those runs.

The 15 new session cases cover four temporary-outage routes, concurrent profile creation, genuine denied profile access, local logout scope, cross-tab logout on dashboard and mission, cross-tab account changes, rejected credentials, rate limiting, successful refresh, revoked refresh, and delayed password recovery through a completed synthetic password update.

The wider cases include full legacy and ionic mission journeys, notebook persistence, assessment results, certificate export, unlocking, teacher locks, role restrictions, teacher controls, selected avatars, mobile layouts, and existing sign-in performance safeguards. The targeted tests reproduce the original failures; the original build did not pass the outage, profile-race, logout-scope or cross-tab cases. Delaying the Sign-In chunk also reproduced the recovery-form failure before the recovery fix.

Screenshots use synthetic accounts:

- [Retry after a temporary Auth outage](screenshots/session-retry.png)
- [Password recovery after delayed UI loading](screenshots/password-recovery.png)

Reproduce core checks:

```sh
npm run lint
npm run typecheck
npm run test:unit
npm run build
npx playwright test --config playwright.built.config.js tests/session-reliability.spec.js tests/signin-performance.spec.js tests/approved-ui.spec.js tests/profile-schema.spec.js
```

Broader browser selection:

```sh
npx playwright test --config playwright.built.config.js tests/session-reliability.spec.js tests/signin-performance.spec.js tests/approved-ui.spec.js tests/profile-schema.spec.js tests/teacher-workspace.spec.js tests/teacher-avatars.spec.js tests/remaining-student.spec.js tests/remaining-records.spec.js tests/remaining-portal.spec.js tests/ionic-missions.spec.js tests/atom-start.spec.js tests/homepage-account.spec.js
```

No real student account was used and no production backend writes were made. Physical student devices, Safari, classroom Wi-Fi and Supabase account-level logs remain unverified. The sampled public health/settings checks are availability observations, not a login/load benchmark. See [review](REVIEW.md).
