# Approved internal UI review

Branch: `feature/approved-ui-handoff-2026-10`. Base: `b27bc0b44244193ff5caa88c505d76c3ae6f5efd`. Design package: `2026-10-10.1`.

The four internal pages use scoped React/CSS and optimized, UI-free illustrations reconstructed from the approved references. The original five approved PNGs passed SHA-256, byte-size and dimension checks outside the repository and remain unchanged. No full-page screenshot is used as application UI. Illustration fidelity still requires owner visual review; these reconstructed illustrations and portraits are not pixel-identical crops of the references.

[Complete added/modified file list](FILES.md). No files removed.

## Screenshots

All pictured identities, rankings and records below are **synthetic browser fixtures**, not live student data. Screenshots demonstrate the actual React implementation; fixtures exist only in tests. Full PNG evidence at all viewports is generated under ignored `test-results/screenshots/`. The WebP review copies below reduce download size.

| Screen | Desktop | Mobile (390px) |
| --- | --- | --- |
| Sign-in | [1448 × 1086](screenshots/signin-desktop.webp) | [390px](screenshots/signin-mobile.webp) |
| Student | [1774 × 887 viewport](screenshots/student-desktop.webp) | [390px](screenshots/student-mobile.webp) |
| Teacher | [1672 × 941 viewport](screenshots/teacher-desktop.webp) | [390px](screenshots/teacher-mobile.webp) |
| Leaderboard | [1672 × 941 viewport](screenshots/leaderboard-desktop.webp) | [390px](screenshots/leaderboard-mobile.webp) |

Full-page captures can exceed viewport height. Automated checks cover native reference widths, 1024, 768, 430, 390 and 375px without document overflow. The homepage has a regression capture; computed heading/button/header/body styles remain equal before and after interior CSS loads. Pixel identity is not asserted because the existing homepage has continuous Framer Motion and cursor effects. Its current source visually differs from the frozen handoff reference; it has deliberately not been rebuilt.

## Implementation and compatibility

| Area | Result |
| --- | --- |
| Sign-in | Wide form and museum sunrise, optional portrait presets/photo selection, accessible email/password fields and visibility toggle, signup, confirmation-required flow, reset/recovery handling. Existing successful student/teacher destinations remain. Public signup provisions students; teacher privileges are read only from `profiles`, not editable account metadata. |
| Avatar persistence | Presets use `auth.user_metadata.px_avatar_id`, keeping `profiles.avatar_path` compatible with existing object paths. The shared header/ProfileSettings render presets or short-lived signed photo URLs with initials fallback. Metadata persistence and reload are fixture-tested. No database migration. |
| Photo upload | Decodes JPEG/PNG/WebP, checks 2MB/dimension limits, center-crops/resizes to at most 512px, re-encodes WebP (discarding EXIF), uses a random user-owned path and checks profile writes. Fails closed when the bucket is public or metadata cannot confirm it is private. Both denied and permitted paths are fixture-tested. Old objects are not deleted on replacement/removal; storage retention cleanup is a separate policy decision. |
| Student | User-scoped profile, progress and feedback, settings-aware next mission, lock/progression recheck at launch, passed-only badges using existing tier rules, actual assessment statistics, read-only notebook/history dialog, existing role/path navigation and skills/history expansion. Autosaved notes do not award a pass. |
| Five chapters | Shows the intended five-chapter sequence, without inventing checkpoint progress or claiming exact chapter resume. Main still uses the legacy player. PR #1 is open/draft/unmerged at verification and was not merged or overwritten. New UI files do not overlap its changed mission files. |
| Teacher | Distinct Louvre hero, actual authorized-view student/assessment summaries, feedback, resources, and quick actions. Existing scenarios, review, feedback, difficulty, locking, preview, export, analytics and debate tools remain in an expandable section. Profile role check occurs before fetching teacher data. Accessible lock/mandatory controls added. |
| Leaderboard | Requests an explicit limited column list from the existing view, orders by points descending then stable ID, paginates, queries own rank separately and displays earned badges. Broad profile realtime subscriptions removed; refresh is explicit. Others use initials rather than unauthorized private avatar reads. Weekly/monthly/role filters remain disabled because data contracts are unavailable. |
| Branding | Existing repository logo and school name retained, Home navigation provided, creator credit kept in footer rather than user identity. Approved institutional emblems have no independent authorized source assets in the package/repository and were not traced or fabricated. |

The dashboard's mission CTA says **Open Mission** for saved work because exact chapter restoration is not supported by main; new work says **Start Mission**. Notebook history reads original answers without writing them or inventing missing responses. Role locks/difficulty mechanisms and all mission assessments remain unchanged.

## Validation executed

| Command/check | Outcome |
| --- | --- |
| `npm ci --cache /workspace/.npm --no-audit --no-fund` (baseline) | Pass, 638 packages installed |
| `npm run build` (after implementation) | Pass |
| `npm run typecheck` | Pass with existing `jsconfig.json`; JavaScript checking is limited by that config |
| `npm run test:unit` | 5 passed, 0 failed, 0 skipped |
| `npm run test:ui` | 19 passed, 0 failed, 0 skipped; synthetic Supabase responses |
| ESLint on all changed page/shared React components | Pass |
| `npm run lint` | Same 13 baseline unused imports in HeroSection, KenBurnsSlideshow, ScenarioVisual, SceneTwo, LearningPath; these protected/unapproved files were not changed |
| `git diff --check` | Pass |
| Protected source/media diff | Zero changes to Home, landing components, index.css, Layout, App, generated pages.config, ScenarioPlayer, scenario components/data/helpers, original audio/video and repository logo |

Browser tests cover login failure/password visibility, avatar persistence, confirmation-required signup without unauthenticated profile writes, notebook history/Escape close, lock changes at launch, denied student teacher access without teacher data queries, preserved teacher tools, rank ordering/current-user highlighting, empty/error states, upload validation/private storage gating/signed rendering, own rank outside the visible page, responsive overflow, and homepage style regression. Live login/signup/reset/OAuth, RLS writes, real bucket uploads and live teacher operations were not tested, per owner choice. Keyboard-only coverage is limited to native controls, accessible names/focus styling and notebook Escape behavior; a full accessibility audit is still outstanding.

Run tests with the provided Node 24 runtime and system Chromium:

```sh
npm ci
npm run test:unit
npm run test:ui
npm run build
npm run lint
npm run typecheck
```

Set `CHROMIUM_PATH` if Chromium is elsewhere. Playwright is a pinned development dependency; browser binaries are not included. Test outputs/reports are ignored.

## External verification and release blockers

No production account or table writes were performed during implementation/QA. Owner explicitly chose fixture QA rather than staging credentials.

- Read-only anonymous count checks on the current Supabase project returned visible rows from `profiles`, `scenario_settings` and `leaderboard_view`. This confirms existing anonymous access; it does not prove school-approved visibility or teacher/owner write authorization. **Verify/correct backend RLS, profile role provisioning, view visibility and storage policy before production release.** Frontend hiding cannot repair these policies. No backend migration or policy edit was made.
- Anonymous avatar bucket metadata could not be obtained (HTTP 400). Authenticated private bucket metadata/read/write policies remain unverified. Production photo upload intentionally rejects an unverified/public bucket; presets remain available.
- Auth settings advertised email but neither Google nor Microsoft. OAuth buttons are only shown when the live Auth settings advertise enabled providers; redirect configuration still needs live verification if enabled later.
- Real class rosters/schedules, streaks, scientific-role leaderboard fields, time-scoped point ledgers and durable chapter checkpoints are not established in the repository. Their screenshot values are not fabricated; appropriate empty/disabled states replace them.
- Other students' preset/photo visibility on the leaderboard needs a school-authorized backend contract. Only the current user's private picture is resolved by this UI.
- Image composition and independent institutional brand assets need owner review before release. The public homepage and accepted media were preserved exactly in source.

## Separate unapproved backlog

No redesigns to role selection/hubs, gameplay chapters, final journal page, completion/certificate, LearningPath, Our Story, or teacher subpages. No merge of mission PR #1, no main push, no deployment and no environment publication. ProfileSettings changes are restricted to required picture compatibility; its remaining name/password/account functions remain.
