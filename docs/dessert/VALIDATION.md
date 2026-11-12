# Validation — Dessert cinematic rebuild

Executed against production-mode Vite output using Chromium and synthetic browser fixtures. No live student records were created. Final results and publication links are recorded in the delivery report.

## Executed results — shortened editorial edition

| Check | Result |
|---|---|
| `npm run lint` | Passed |
| `npm run typecheck` | Passed |
| `npm run test:unit` | 72 passed, 0 failed |
| `npm run build` | Passed |
| Focused Dessert browser suite | 37 passed, 0 failed |
| Full portal regression suite | 225 passed, 1 opt-in native case skipped; executed separately and passed |
| Complete native 1x successful route | Passed: 76 recordings, 3 original videos, 588.722 s elapsed, one 100% result |
| Editorial intake | Exactly 100 KEEP / 117 CUT; all 217 originals retained with unchanged hashes and matching scripts |

The final editorial validation uses production-mode Vite output. The long native walkthrough is opt-in (`DESSERT_NATIVE_WALKTHROUGH=1`) so ordinary browser regression runs do not spend ten minutes listening to the entire route. It exercises real audio/video clocks and actually operates every required interaction; it does not dispatch synthetic media completion events.

See [EDITORIAL_REPORT.md](editorial/EDITORIAL_REPORT.md) for measured duration, final regression results, reproduction commands and the scope of verification. Earlier rebuild validation is preserved in Git history.

## Automated coverage

- Unit checks cover source hashes, original assessment integrity, 217 source-recording hashes, the exact 100-recording active set, 117 excluded clips and valid saved-beat migration, scientific gates, all four immutable outcome mappings, incorrect identification/revision, 80% and 60% grading, exact-once submission and old-draft normalization.
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
- [Shortened scene 20 exchange](screenshots/editorial-scene20.png) and [native complete-route result](screenshots/editorial-native-completion.png)

Visual inspection checked layout, readable captions and controls, isolated dark cinematic styling, instrument values, four distinct ending treatments and achievement state. Mobile fullscreen permits vertical workspace scrolling so instruments and controls remain reachable; it does not shrink a complete laboratory onto a single unreadable screen.

## Scope of verification

Live authenticated Supabase/RLS behavior remains unverified, as requested. Fixture coverage exercises existing persistence APIs, role guards and error handling. Browser testing is Chromium-based; no claim is made of native Safari/iOS fullscreen validation. Review the artwork and question-narration findings in [IMPLEMENTATION.md](IMPLEMENTATION.md) before approving a production release.
