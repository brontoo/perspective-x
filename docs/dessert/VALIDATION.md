# Validation — Dessert cinematic rebuild

Executed against production-mode Vite output using Chromium and synthetic browser fixtures. No live student records were created. Final results and publication links are recorded in the delivery report.

## Executed results — interactive investigation revision, 13 November 2026

| Check | Result |
|---|---|
| `npm run lint` | Passed |
| `npm run typecheck` | Passed |
| `npm run test:unit` | 84 passed, 0 failed |
| `npm run build` | Passed |
| Final Dessert layout/interaction suite | 33 passed, 0 failed |
| Full portal regression suite | 258 passed, 1 opt-in native case skipped; executed separately and passed |
| Complete native 1x successful route | Passed: 69 recordings, 3 original videos, 531.040 s elapsed, one 100% result |
| Editorial intake | Exactly 100 KEEP / 117 CUT; all 217 originals retained with unchanged hashes and matching scripts |

The final editorial validation uses production-mode Vite output. The long native walkthrough is opt-in (`DESSERT_NATIVE_WALKTHROUGH=1`) so ordinary browser regression runs do not spend ten minutes listening to the entire route. It exercises real audio/video clocks and actually operates every required interaction; it does not dispatch synthetic media completion events.

See [INVESTIGATION_REPORT.md](investigation/INVESTIGATION_REPORT.md) for the latest implementation, changed files, measured duration, screenshots, reproduction commands and limits of verification. The prior [presentation report](presentation/PRESENTATION_REPORT.md) is historical. The prior [editorial report](editorial/EDITORIAL_REPORT.md) is historical: its default 76-clip route included post-assessment announcements that now play only on explicit review.

## Automated coverage

- Unit checks cover source hashes, original assessment integrity, 217 source-recording hashes, the exact 100-recording active set, 117 excluded clips and valid saved-beat migration, scientific gates, all four immutable outcome mappings, incorrect identification/revision, 80% and 60% grading, exact-once submission and old-draft normalization.
- Dessert browser checks cover the opening and three misconception retries; actual calibration and all nine observations; active electron transfer; supported identification; justified four-way decision; each ending; reflection; all five questions; pass/retry recording isolation; one saved result; notes, restoration, old assessed records and teacher zero-write preview.
- Native browser media checks use the real MP3 and original muted MP4. They verify advancing audio/video clocks, independent completion, final-frame holding, scoped callbacks, accurate paused position, notebook interruption, Previous Scene, reload restoration, blocked playback, hidden-tab suspension, missing-media captions fallback, slow recording loading, source-label treatment and cleanup on navigation.
- Existing regressions cover Ocean Dome, ATOM DIVE, original mission assessments, role/path relationships, sequential unlocking, failed saves, access locks, teacher operations, homepage, sign-in/profile setup, dashboards, leaderboard, soundtrack and Our Story.
- Responsive fullscreen checks cover 1920×1080, 1440×900, 1366×768, 820×1180 and 390×844. Long captions and internally scrolling scientific workspaces are checked at 1366×768 and 390×844. Keyboard/focus behavior and reduced-motion presentation use the existing platform facilities.
- New tests cover missed/successful tool drops, keyboard and touch access, draggable electrons and unchanged nuclei, observable bicarbonate bubbles, randomized question/option order with reload stability and matching narration, the 10-point enrichment with unchanged 80% threshold, saved bonus JSON and teacher zero-write preview.
- Direct results cover 100%, 80% and 60%; one saved result; no automatic question-feedback playback; confirmed eligible badge; optional answer review; missing cumulative totals; failed saving; and teacher results with no awards or writes. The verified fixture cumulative total is labelled Total Points, never a per-mission award.
- Delayed illustration and video-end artwork checks prove retained visible frames. Blocked speech prevents silent movie progression before Resume. Every played native recording is checked against the actual loaded illustration for its physical scene.

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

Visual inspection checked layout, readable captions and controls, bright original artwork, isolated cinematic styling, instrument values, four distinct ending treatments and achievement state. Ordinary fullscreen scenes have no root/page scrolling. Experiments and expanded educational dialogs may scroll internally so all controls remain reachable.

Latest investigation revision evidence:

- [Educational briefing](investigation/screenshots/briefing-desktop.png), [mobile](investigation/screenshots/briefing-mobile.png).
- [Clear story artwork](investigation/screenshots/clear-story-artwork.png), [movable conductivity probe](investigation/screenshots/conductivity.png), [observable reaction](investigation/screenshots/virtual-reaction.png).
- [Single interactive ion model](investigation/screenshots/electron-transfer.png), [shuffled compact MCQ](investigation/screenshots/randomized-question.png), [separate saved enrichment bonus](investigation/screenshots/enrichment-result.png).
- [Latest real native result](investigation/screenshots/native-completion.png), [latest native event log](investigation/native-walkthrough.json).

Earlier fullscreen and concise-results evidence:

- [Scene 7 desktop](presentation/screenshots/scene07-1920.png), [1366×768](presentation/screenshots/scene07-1366.png), [tablet](presentation/screenshots/scene07-820.png), [mobile](presentation/screenshots/scene07-390.png).
- [Internally scrolling mobile experiment](presentation/screenshots/workspace-390.png).
- [80% result with verified Total Points](presentation/screenshots/result-80.png), [60% retry](presentation/screenshots/result-60.png).
- [Real native complete-route result](presentation/screenshots/native-completion.png), [event log](presentation/native-walkthrough.json).

## Scope of verification

Live authenticated Supabase/RLS behavior and live cumulative-point freshness remain unverified, as requested. Fixture coverage exercises existing persistence APIs, role guards and error handling. Browser testing is Chromium-based; no claim is made of native Safari/iOS fullscreen validation. Review the artwork and question-narration findings in [IMPLEMENTATION.md](IMPLEMENTATION.md) before approving a production release.
