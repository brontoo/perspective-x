# The Final Dessert — presentation refinement

Review delivery, 13 November 2026. Existing scenario `ionic_dessert_mystery`, branch `feature/dessert-cinematic-rebuild`, PR #24. This is a preview release; production is unchanged.

## Visible changes

Fullscreen and presentation fallback now use a viewport-sized grid: compact header, five chapters, flexible cinematic stage and persistent playback controls. The dialogue sits within the stage. Teacher Preview and playback settings collapse to small disclosure controls in fullscreen. They retain the existing scene selector, manual progression, voice speed and captions controls. Mission record opens the original history and evidence in an internally scrolling dialog. The notebook remains available.

Ordinary scenes fit without vertical or horizontal root scrolling at 1920×1080, 1440×900, 1366×768, 820×1180 and 390×844. The longest retained caption was also tested at 1366×768 and 390×844. Experiments receive an internally scrolling workspace with reachable instruments; controls are not clipped to disguise overflow. Native fullscreen and the existing focus-trapped presentation fallback remain supported. Safe-area insets and dynamic viewport height are respected. Artwork is contained in fullscreen to preserve characters and instruments rather than cropping it to fill a different aspect ratio.

The stage-wide lower gradient and image brightness filter are removed. Original media files are unchanged. Readability comes from the contained translucent dialogue panel; no replacement image-wide gradient was added. Light platform disclosure-card defaults are explicitly excluded from Dessert's cinematic controls.

## Results and verified points

Submitting the existing five questions immediately displays IMAGE_28, the actual assessment percentage and the actual eligible badge. The original `gradeIonic` calculation, 80% threshold, badge-level helper and attempt writer are unchanged. A successful save must be confirmed before displaying an earned badge or certificate. Failed saves expose Retry saving; a failed assessment and a teacher preview cannot falsely award a badge. The same fullscreen root remains mounted through completion.

There is no reliable per-mission points mechanism in the repository. Following the owner's clarification, the results optionally read the signed-in student's `total_points` from the existing `leaderboard_view`, filtered by that user's ID, after the assessment save succeeds. It is labelled **Total Points**. An absent, invalid or failed response hides the section entirely. Zero remains a valid total. Percentages never become points, no formula is invented, and no backend/schema/scoring change was made. The read is asynchronous and does not delay completion. Navigation/retry invalidates old requests.

No question, answer explanation or pass/retry announcement plays automatically after submission. All five questions, selected responses, correct answers and explanations remain available in an optional answer-review dialog. Playback requires an explicit Play explanation or Play completion message action. Teacher reporting and exact-once assessment persistence remain intact.

## Media continuity and ownership

- A two-layer artwork component retains the previous decoded illustration until its actual replacement has decoded. The previous caption stays paired with that retained frame during loading; unrelated next-scene narration cannot begin early.
- The shared recorded-playback hook gains an opt-in visual-readiness gate. Existing callers retain the ready-by-default behavior. Completion events during pause, notebook/review suspension or visual preparation cannot advance the story. Autoplay rejection correctly exposes Resume instead of silently moving the video.
- Dessert's movie component preloads paused, announces first-frame readiness, and starts with authorized narration/captions. Once started, a longer movie continues after shorter narration. Independent movie/audio completion gates determine advancement. Muted embedded MP4 audio cannot duplicate character speech.
- The real final video frame remains mounted until the separately decoded final-frame image is ready. Slow end-artwork delivery cannot replace it with black.
- Next-recording preparation crosses known non-interactive scene boundaries. Image prefetch uses the actual responsive source; an undecided branch is not guessed. Current/previous/next assets are prepared rather than downloading all 217 recordings.
- Existing playback generation and beat identities, cleanup, saved position, pause/resume, hidden-tab suspension, notebook interruption and Previous Scene are preserved. Dessert review waits for its own illustration/movie readiness; ATOM DIVE and Ocean Dome retain their defaults.

No fixed transition delay is introduced. Network/decoder delays and intentional scientific gates still exist: slow assets retain the loaded frame and pause new narration. This does not claim that network buffering or intentional student decision time can be eliminated.

## Narrative inventory and runtime

The approved inventory remains exactly **100 KEEP / 117 CUT**, with all 217 original MP3s, captions and hashes preserved. Graded feedback and completion announcements are now optional review routes, so the representative successful default route contains **69 recordings / 513.149 seconds of speech (8:33.149)**. The seven removed automatic post-submit clips remain in the approved inventory for explicit review. This is the latest presentation override of the historical 76-recording editorial route; the earlier editorial report remains historical evidence.

[Runtime and original hash audit](runtime-audit.json) records all four endings and all source hashes. [Actual native walkthrough](native-walkthrough.json) records native audio/video events, elapsed time, displayed-scene ownership and the saved result. The native successful route completed in **530.630 seconds (8:50.630)** at 1×, with **69 ended MP3s, three ended original MP4s and one 100% saved assessment**. Every playing recording had its own decoded scene illustration. Student tasks remain required; automated interaction time is not an estimate of student thinking time.

## Actual screenshots

- Scene 7 fullscreen: [1920×1080](screenshots/scene07-1920.png), [1440×900](screenshots/scene07-1440.png), [1366×768](screenshots/scene07-1366.png), [820×1180](screenshots/scene07-820.png), [390×844](screenshots/scene07-390.png).
- Internal experiment workspace: [1366px](screenshots/workspace-1366.png), [390px](screenshots/workspace-390.png).
- Concise actual assessment results: [100%](screenshots/result-100.png), [80% with verified fixture Total Points](screenshots/result-80.png), [60% retry](screenshots/result-60.png).
- [Native completed route](screenshots/native-completion.png).

These are captures of the actual local production build with synthetic accounts and records, not design mockups or live student data. The displayed fixture total of 150 is a mocked response from the existing leaderboard API, never a hardcoded product value.

## Validation

Final executed results are recorded in [VALIDATION.md](../VALIDATION.md). Coverage includes the five requested viewports; native and fallback fullscreen; long captions and internally scrolling scientific controls; direct 100/80/60 results; missing cumulative points; failed saves; optional answer review; zero-write teacher results; delayed scene images and delayed video end artwork; blocked narration; displayed-scene/recording pairing; all four endings; scientific gates; exact-once persistence; and the wider portal regression suite.

Reproduce against production output:

```sh
npm run lint
npm run typecheck
npm run test:unit
npm run build
npx playwright test --config playwright.built.config.js
DESSERT_NATIVE_WALKTHROUGH=1 npx playwright test --config playwright.built.config.js tests/dessert-native-route.spec.js
python scripts/audit-dessert-editorial.py --presentation
```

## Changed implementation files

- `src/components/scenario/dessert/DessertMission.jsx`: stable viewport/result owner, readiness orchestration, teacher disclosure and record dialog.
- `src/components/scenario/dessert/DessertArtwork.jsx`: decoded-frame retention.
- `src/components/scenario/dessert/DessertFilm.jsx`: independent native movie readiness, completion and final-frame retention.
- `src/components/scenario/dessert/DessertResultReview.jsx`: concise verified result and optional answer/audio review.
- `src/components/scenario/dessert/dessert.css`: isolated presentation composition and results.
- `src/components/scenario/playback/useRecordedPlayback.jsx`: opt-in visual gate and paused/stale playback safeguards.
- `src/components/scenario/playback/ScenarioReview.jsx` and `scene-review.css`: opt-in Dessert artwork/movie synchronization.
- `src/data/dessertFlow.mjs`: direct results, migration and known-boundary next-recording preparation.
- `src/data/dessertEditorial.mjs`: safe Dessert review metadata.
- `src/data/dessertAwards.mjs`: validated existing cumulative total; no scoring formula.
- `src/pages/ScenarioPlayer.jsx`: completion integration and read-only cumulative points retrieval.
- `scripts/audit-dessert-editorial.py`: separate presentation audit output without overwriting historical audit.
- Dessert unit/browser/native tests, fixture helpers, the affected Dessert completion assertions in `ionic-missions.spec.js`, current route map, screenshots and reports.

No source artwork/audio/video bytes, scientific model implementation, five-question content, attempt writer, authentication setup or database definitions changed in this refinement.

## Limits of verification

Live authenticated Supabase/RLS behavior and live cumulative-point freshness remain **unverified**, as requested; browser records are synthetic. Browser QA uses Chromium, not native Safari/iOS. Captions synchronize at recording level, not word-level lip timing. Existing supplied FLOUR-label and decorative-shell artwork limitations and quiz-prompt paraphrases remain documented in [IMPLEMENTATION.md](../IMPLEMENTATION.md). The Vercel Preview retains the project's existing sign-in protection; local production-bundle verification is distinguished from deployed-page verification. No production deployment is authorized by this delivery.
