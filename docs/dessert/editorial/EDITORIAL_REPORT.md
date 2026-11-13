# The Final Dessert — approved editorial optimization

Historical editorial delivery. The subsequent [presentation refinement](../presentation/PRESENTATION_REPORT.md) preserves the 100 KEEP / 117 CUT inventory but makes graded feedback and completion announcements optional explicit review. Its default successful route is 69 recordings / 8:33.149 of speech. The timings below describe the earlier 76-recording delivery.

12 November 2026. Scenario `ionic_dessert_mystery`; review branch `feature/dessert-cinematic-rebuild`. The existing cinematic interface, artwork, original MP3/MP4 bytes, scientific activities, routes, role, pathway and persistence infrastructure are preserved. No production promotion is authorized by this change.

## Editorial compliance

The supplied four-file package is archived byte-for-byte under `production-archive/dessert/EDITORIAL`. Its 100 KEEP and 117 CUT records partition the entire 217-recording original inventory without omissions, duplicates or transcript mismatches. `.txt` source identifiers resolve to the existing MP3 with the same stem and speaker. No replacement dialogue, voices or media were generated.

`src/data/dessertEditorial.json` stores the approved selection and source hashes. The node factory and feedback-queue builder remove CUT beats from their actual sequences. Empty notification queues complete immediately to their real target; they create no audio element source, blank dialogue card, reading timeout or unresolved completion gate. Retained source ordinals are matched by identifier, rather than by positions in a newly shortened array.

`CH03_SC21` and its node are completely absent from the active story, teacher scene selector and resumed Previous Scene history. IMAGE_21 and all original recordings remain physically available for archival/rollback purposes. After the three identities are accepted, three short confirmations lead to IMAGE_20's two retained lines, then directly to IMAGE_22's two retained lines and the four-choice justification form. No scene 21 image is requested during this path.

The decision text retains the necessary distinction: identifying an unknown is not permission to return unlabelled original containers to food preparation. The extended lecture is not relocated elsewhere.

## Scientific and playback integrity

No mandatory scientific action or numeric reading changed. Students still calibrate with 2 μS/cm water, collect three conductivity readings (4/1100/1930 μS/cm), actively transfer the Na/Cl electron, collect three pH readings (7.0/8.3/7.0) and complete three separate virtual acid tests. Nine observations plus the formation model are required for identification. Incorrect identifications retain the observations and play only the approved corrective clip.

The final decision still needs at least 60 justification characters and two real evidence citations. Reflection still requires 40 characters. The same five approved assessment questions/options, 80% threshold, conditional feedback, badge rules, immutable attempts and existing backend writer remain in use. No student, teacher, authentication, dashboard, Supabase schema or RLS implementation was changed.

The 18 routine SYSTEM-folder spoken notifications are now silent visible live-region status/validation messages. Measurement recordings remain conditional on actual results. The existing visible safety/fictional-simulation information remains in the interface. The four cut option-narration buttons are removed; the four text choices remain accessible. No browser speech synthesis substitutes for removed speech.

Single-click Start, automatic/manual progression, original muted video playback, independent video/audio completion, final-frame holding, pause/resume, replay, captions, hidden-tab suspension, notebook interruption, fullscreen and reduced-motion support are retained. V01 now begins with retained `CH01_SC01_002_NARRATOR`; V02 still starts at the falling-label line. Videos never select the professional branch.

The only ordering adjustment needed was moving retained `CH02_SC12_003_HAMAD` ("Correct. The water-only control…") to feedback after the actual calibration, so it cannot praise an action before it occurs. No extra KEEP clip or replacement wording was needed.

## Four endings

| Submitted decision | Consequence | Image/video | Retained ending speech |
|---|---|---|---:|
| A | `verify-replace` | IMAGE_23 / V03 | 4 clips, 31.922 s |
| B | `conductivity-only` | IMAGE_24 / V04 | 4 clips, 29.283 s |
| C | `taste` | IMAGE_25 / V05 | 4 clips, 27.820 s |
| D | `appearance` | IMAGE_26 / V06 | 4 clips, 27.664 s |

Each committed decision plays only its own ending and records the existing consequence key. Tasting/mixing proposals remain prevented. A failed professional decision remains unsuccessful even when the student subsequently passes the scientific assessment.

## Measured recorded duration

These are sums of actual original MP3 durations at **1×**, using an explicit complete route: correct first approach, all required scientific actions, correct identification, selected ending, reflection, five correct assessment answers and pass completion. No optional replays or misconception retries are included. Each shortened route schedules 76 recordings; the 100 KEEP clips cover mutually exclusive alternatives across all paths.

| Ending | Previous implemented speech | Shortened speech | Speech saved |
|---|---:|---:|---:|
| A | 20:13.727 | **9:31.899** | **10:41.828 (52.88%)** |
| B | 20:10.723 | 9:29.260 | 10:41.463 (52.98%) |
| C | 20:00.980 | 9:27.798 | 10:33.182 (52.72%) |
| D | 19:58.054 | 9:27.641 | 10:30.413 (52.62%) |

The supplied editorial estimate of 9:32 is confirmed. Its 19:05 original reference omits repeated UI notifications present in the actual earlier implementation; the directly comparable implemented baseline is 20:14. `baseline-runtime.json` preserves that previous route and its clip occurrences at commit `aaf34e3`.

Videos overlap speech: route A uses 15.434 seconds of MP4 content, but only V02 requires an additional 1.249 seconds after its shorter narration. Additional video holds for B/C/D are 1.249/1.610/2.543 seconds. There is no new mandatory transition timer. Student activity/reading/thinking time remains unlimited and is excluded from the spoken-duration table.

The complete native-browser successful walkthrough finished in **588.722 seconds (9:48.722)** at **1×**. All 76 native recordings ended, all three relevant original MP4s ended, all required activities were operated, and exactly one 100% assessment record was saved. `native-walkthrough.json` contains the actual media event log and elapsed measurement. This includes decoding, buffering, video overlap and browser-operated activities; it is not an estimate of a real student's thinking time.

## Saved progress

New snapshots use version 3 and stable beat identifiers. The preserved original beat table maps old numeric cursors to the next retained beat. A draft paused in removed scene 21 resumes in scene 22, with the same measurements, decisions, assessment state and notes. Pending feedback containing only CUT records moves immediately to its legitimate target. Existing activity gates remain unanswered until operated.

Previously heard CUT dialogue is retained as archived draft history rather than scheduled in the live player. Previous Scene filters old metadata as well, preventing a saved lecture or removed MP3 from re-entering playback. Exact native position is restored only when its retained recording still matches the active checkpoint. Existing assessed records remain read-only and unchanged.

## Files modified

- `src/data/dessertFlow.mjs`: shortened actual beat sequences, scene-21 removal, silent notification transitions, stable ordinal selection and version-2 migration.
- `src/data/dessertEditorial.{json,mjs}`: exact approved partition, hash provenance and read-only-history filtering.
- `src/data/dessertLegacyBeats.json`: original ordered beat IDs for compatible cursor migration.
- `src/components/scenario/dessert/DessertMission.jsx`: accessible silent status messages while preserving playback status on pause.
- `src/components/scenario/dessert/DessertTasks.jsx`: removal of cut option-reading controls; all four choices remain visible.
- `src/pages/ScenarioPlayer.jsx`: Dessert-only filtering of legacy scene-review metadata.
- `scripts/audit-dessert-editorial.py`: reproducible source, hash, route and duration audit.
- Dessert unit/browser specs, new editorial/migration tests, opt-in native full-route test and the existing Dessert assertion in `atom-corrections.spec.js`.
- Source editorial archive, regenerated active audio/scene maps, report and actual built-app screenshots.

No CSS, scientific data/model implementation, original media, ATOM DIVE, Ocean Dome or unrelated page implementation changed.

## Validation and review

- Lint, typecheck and production build pass.
- Unit tests: 72 passed, including malformed historical review metadata.
- Focused production-bundle Dessert tests: 37 passed.
- Full production-bundle portal regression: **225 passed, 1 skipped** in 9.7 minutes. The skipped case is the opt-in long native walkthrough, which was executed separately and **passed** in 9.9 minutes. No failed cases remain.
- After the malformed-metadata guard, the final production build and the complete 37-case Dessert suite were revalidated separately; no audiovisual or scientific logic changed in that guard.
- Actual desktop/tablet/mobile screenshots and the new scene-20 exchange were visually inspected. The approved design, background treatment and scientific instruments remain consistent.

Reproduce the asset/selection/timing audit with `python scripts/audit-dessert-editorial.py`. Normal regression: `npm run test:built`. Full native speech walkthrough: `DESSERT_NATIVE_WALKTHROUGH=1 npx playwright test --config playwright.built.config.js tests/dessert-native-route.spec.js`. The executed long walkthrough uses a separate temporary preview port and identical copied production output to avoid interfering with the parallel regression server.

Remaining limitations are unchanged: supplied IMAGE_03/V02's conflicting FLOUR label is masked, IMAGE_15's decorative shells are covered by the accurate renderer, and some supplied quiz prompts paraphrase the unchanged approved question text. Captions match retained author scripts at recording level. Live authenticated Supabase/RLS QA and native Safari/iOS remain unverified; browser checks use Chromium and synthetic accounts. No new unresolved editorial dependency or transcript mismatch was found.

The pull request description and completion report provide the final Git commit and Vercel Preview. Production requires the owner's explicit approval.
