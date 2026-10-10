# Validation results

- Production build: **passed** (`npm run build`).
- ESLint: **passed** (`npm run lint`).
- TypeScript check: **passed** (`npm run typecheck`).
- Unit tests: **18 passed**, none failed/skipped (`npm run test:unit`). Chemistry checks cover electron conservation, every offered ion pair's neutral simplest ratio, polyatomic parentheses, NaCl coordination, planar calcite carbonate groups/Ca–O neighbours, full rotation, qualitative water trends, and the 80% passing boundary.
- Full Chromium regression against the built application: **119 passed**, none failed/skipped, 6.2 minutes (`npx playwright test --config playwright.built.config.js`). Includes all sixteen original mission chapter/assessment journeys, existing authenticated pages, homepage motion/soundtrack, and the new missions.
- After completing the display of learners' compound hypotheses in the notebook/teacher review, rebuilt and reran the affected flows: **15 passed**, none failed/skipped, 47.7 seconds. This includes all eleven new mission browser checks and four existing notebook/submission-review checks.
- Source preservation comparison: **all nine original roles and sixteen original missions, including assessment questions, badges, skills and mappings, unchanged** against the starting main commit `6e7d4789071bfa0e8c14b9440c783610df46f684`.
- Actual UI screenshots captured at **1440, 820 and 390 px**, including both mission briefings and interactive models; no horizontal overflow. Keyboard ion selection/rotation and native drag/drop verified; expanded mineral reference text meets the 4.5:1 contrast check.
- Both missions retain the exact same Hamad portrait URL; the role thumbnail and shared portrait have identical SHA-256 hashes in [ASSET_SHA256.txt](ASSET_SHA256.txt).
- No generated videos; both reserved introduction paths fall back to playable static briefings.

Browser authentication and persistence checks used **synthetic student and teacher fixtures**, as authorized. No live student/teacher records were changed. Live authenticated Supabase QA remains unverified. The user's textbook was reviewed but is not redistributed in the repository.

Publication is limited to a feature branch, pull request and Vercel **Preview**. Main and production are not part of this change.
