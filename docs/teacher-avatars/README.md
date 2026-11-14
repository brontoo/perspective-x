# Teacher recent-activity avatars

The **Latest submitted work** card now renders each student's selected avatar or authorized profile photo at its existing size. Layout, colours, names, scores and Review work behaviour are unchanged. Initials remain the fallback when a picture is unavailable.

## Why the database migration is necessary

The card previously passed only a name to `Avatar`. Additionally, preset selections live in the signed-in user's private Auth metadata (`px_avatar_id`), which a teacher cannot read for other accounts. A frontend-only change cannot retrieve those selections safely.

`supabase/migrations/202611140001_sync_profile_avatar_presets.sql` adds a display-only `profiles.avatar_preset_id` field, backfills existing choices, and synchronizes future selections/removals and new profiles with database triggers. Only the ten approved portrait IDs are accepted. The existing profile query uses `select('*')`, so no additional browser request is needed.

The migration preserves existing row policies, roles, names, photo paths and scoring. Its trigger functions use an empty search path and are not executable by application roles. Private Auth metadata is not exposed. Uploaded photos continue to use existing signed-URL Storage permissions; denied photos retain the initials fallback.

## Deployment dependency — not yet applied to the live database

This workspace has GitHub access but no authorized Supabase SQL connection or database-management tool. The migration was tested against an isolated PostgreSQL fixture database; it has **not** been executed against the application's live database. Anonymous schema discovery returned HTTP 401 and supplied no student data.

An authorized project administrator must open this project's Supabase SQL Editor, paste the complete migration above, and run it as the database owner. Alternatively, use the project's authorized migration runner. It is transactional and can be rerun. Then refresh the teacher dashboard to load the backfilled profile fields. No student needs to select their avatar again.

The frontend remains compatible with the old schema, but students with preset avatars will continue to show initials to teachers until the migration is applied. Do not treat the browser fixture screenshots as verification of live student data. No production deployment or database modification was performed for this change.

## Validation

- Production build, ESLint and TypeScript checks passed.
- All 93 unit tests passed.
- All 50 browser checks passed across the new avatar suite and existing approved UI, profile-schema, teacher-workspace, homepage-account and sign-in performance suites.
- Local PostgreSQL 16 tests passed: backfill, rerun/idempotence, selection updates, removals, new profiles, photo/name/role preservation, existing RLS, column-level grants and restricted Auth access.
- Avatar browser cases cover two different students, desktop/mobile sizing, teacher-avatar isolation, missing/invalid preset IDs, allowed/denied signed photos, no writes/admin calls, and explicit removal overriding stale own-profile cache.

Reproduce with:

```sh
npm run build
npm run lint
npm run typecheck
npm run test:unit
npx playwright test --config playwright.built.config.js tests/teacher-avatars.spec.js tests/approved-ui.spec.js tests/profile-schema.spec.js tests/teacher-workspace.spec.js tests/homepage-account.spec.js tests/signin-performance.spec.js
bash scripts/test-avatar-migration.sh
```

The SQL harness requires local Docker and uses an isolated `postgres:16-alpine` container without a published port, host volume or production connection. It removes the container afterward.

## Screenshots

Both screenshots use synthetic accounts against the production build:

- [Desktop activity card](screenshots/recent-activity-1440.png)
- [Mobile activity card](screenshots/recent-activity-390.png)
