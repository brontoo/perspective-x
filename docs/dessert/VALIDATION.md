# Validation — Dessert cinematic rebuild

Executed against production-mode Vite output using Chromium and synthetic browser fixtures. No live student records were created. Final results and publication links are recorded in the delivery report.

## Executed results

| Check | Result |
|---|---|
| `npm run lint` | Passed |
| `npm run typecheck` | Passed |
| `npm run test:unit` | 57 passed, 0 failed |
| `npm run build` and final isolated production build | Passed |
| Existing browser regressions | 188 passed |
| Final Dessert browser suite | 32 passed, 0 failed, 1.4 minutes |
| `git diff --check` | Passed |
| Source media integrity/inventory | 28 JPEGs, 6 MP4s, 217 MP3s, 217 matching author scripts; no unresolved references or duplicate MP3 hashes |

The full production-bundle run (`npx playwright test --config playwright.built.config.js`) exercised 218 tests: 217 passed and one newly added assessed-record test timed out because it attempted to click behind the automatically opened notebook dialog. The test now checks that dialog, closes it, then verifies reopening and immutable records. No product change was needed for that failure.

After the final legacy-MgO presentation fix, the complete Dessert suite was revalidated against fresh production output: 32/32 passed, including the corrected assessed-record case and an added slow-loading check. Together with the 188 passing existing regressions, this covers all 220 distinct browser cases in the final suite. This is coverage across the full regression and final targeted runs, not a claim that one 220-case command was executed.

The final build used `npm run build -- --outDir /tmp/dessert-final-dist`. A temporary Playwright configuration extended the repository config with that preview directory on port 4174, the two Dessert spec files, and separate report/artifact directories, allowing it to run without changing the broader regression server on port 4173. Production code, dependencies and browser settings were otherwise the same. The committed specs also run through the normal `test:built` command.

## Automated coverage

- Unit checks cover source hashes, original assessment integrity, complete 217-recording routing, scientific gates, all four immutable outcome mappings, incorrect identification/revision, 80% and 60% grading, exact-once submission and old-draft normalization.
- Dessert browser checks cover the opening and three misconception retries; actual calibration and all nine observations; active electron transfer; supported identification; justified four-way decision; each ending; reflection; all five questions; pass/retry recording isolation; one saved result; notes, restoration, old assessed records and teacher zero-write preview.
- Native browser media checks use the real MP3 and original muted MP4. They verify advancing audio/video clocks, independent completion, final-frame holding, scoped callbacks, accurate paused position, notebook interruption, Previous Scene, reload restoration, blocked playback, hidden-tab suspension, missing-media captions fallback, slow recording loading, source-label treatment and cleanup on navigation.
- Existing regressions cover Ocean Dome, ATOM DIVE, original mission assessments, role/path relationships, sequential unlocking, failed saves, access locks, teacher operations, homepage, sign-in/profile setup, dashboards, leaderboard, soundtrack and Our Story.
- Responsive and fullscreen checks run at 1440px, 820px and 390px. Keyboard/focus behavior and reduced-motion presentation use the existing platform facilities.

Some narrative-path tests dispatch media completion events to exercise lengthy paths deterministically; the separate native-media tests prove actual local decoding and playback rather than relying solely on those events. Captions match supplied author text at recording level; there is no claim of word-level lip synchronization.

## Visual evidence

These are captures from the built app with synthetic accounts, not design mockups or production student data:

- [Opening and Start Experience](screenshots/opening.png)
- [Real native opening playback](screenshots/native-opening-playback.png)
- [Appearance misconception](screenshots/initial-appearance.png), [tasting prevented](screenshots/initial-taste.png), [mixing prevented](screenshots/initial-mix.png)
- [Desktop laboratory](screenshots/laboratory-1440.png), [tablet](screenshots/laboratory-820.png), [mobile](screenshots/laboratory-390.png)
- [Na/Cl formation renderer](screenshots/electron-formation.png), [pH investigation](screenshots/ph-investigation.png), [controlled acid response](screenshots/controlled-acid-reaction.png)
- [Evidence-based professional decision](screenshots/professional-decision.png)
- [Ending A](screenshots/ending-A.png), [Ending B](screenshots/ending-B.png), [Ending C](screenshots/ending-C.png), [Ending D](screenshots/ending-D.png)
- [Passing assessment](screenshots/achievement-pass.png), [retry without badge](screenshots/assessment-retry.png)
- [Treatment of conflicting supplied label artwork](screenshots/three-powders-label-treatment.png)

Visual inspection checked layout, readable captions and controls, isolated dark cinematic styling, instrument values, four distinct ending treatments and achievement state. Mobile fullscreen permits vertical workspace scrolling so instruments and controls remain reachable; it does not shrink a complete laboratory onto a single unreadable screen.

## Scope of verification

Live authenticated Supabase/RLS behavior remains unverified, as requested. Fixture coverage exercises existing persistence APIs, role guards and error handling. Browser testing is Chromium-based; no claim is made of native Safari/iOS fullscreen validation. Review the artwork and question-narration findings in [IMPLEMENTATION.md](IMPLEMENTATION.md) before approving a production release.
