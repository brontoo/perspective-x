# The Final Dessert — cinematic rebuild

Review delivery, 12 November 2026. Existing scenario: `ionic_dessert_mystery`.

The existing Dessert entry now launches a five-chapter recorded cinematic investigation. Its role, Materials & Bonding pathway, catalogue registration, route, assessment questions and scoring are retained. No second scenario, database table, authentication flow or production deployment is introduced.

## Media intake

The supplied production RAR contains 28 JPEGs, six MP4s and 217 MP3s, plus its inventory and README. The separately supplied ElevenLabs script ZIP contains all 217 original TXT scripts and a matching text manifest. Every recording identifier, speaker and script was cross-checked. Captions use those supplied scripts, not older mission dialogue or generated speech.

`asset-audit.json` records original SHA-256 hashes, codec/duration inspection, complete media decoding, inventory counts and findings. There are no missing script references or duplicate recording hashes. `audio-routes.json` accounts for all 217 recordings and their narrative/conditional routes. `scene-map.json` maps the 38 state-machine nodes to physical scenes, media and task gates. Source photographs, inventories and scripts are retained under `production-archive/dessert`; original MP3 and MP4 bytes are served unchanged from `public`.

Images have 1376px and 768px WebP derivatives. No new video, voice or replacement artwork was generated. Each original video has embedded AAC audio; the player mutes it so supplied character recordings remain authoritative. A decoded final-frame WebP holds after each clip, independently of ongoing speech.

| Video | Actual duration | Trigger |
|---|---:|---|
| V01 | 3.500 s | Scene 01 opening narration, after safety disclaimer |
| V02 | 4.958 s | Scene 04 falling-label line |
| V03 | 6.976 s | Submitted A / `verify-replace`, image 23 |
| V04 | 5.970 s | Submitted B / `conductivity-only`, image 24 |
| V05 | 4.958 s | Submitted C / `taste`, image 25 |
| V06 | 5.970 s | Submitted D / `appearance`, image 26 |

## Narrative and interaction

The pure reducer in `src/data/dessertFlow.mjs` separates physical scene, dialogue ID, action gate, evidence, feedback queue, committed branch and assessment state. One Start Experience action begins recorded automatic narration. Manual progression and captions-only reading remain available. Audio completion and video completion are independent prerequisites; playback cannot complete a scientific task.

Scenes 01–07 establish the fictional competition. The first investigation decision sends appearance, tasting and mixing misconceptions to their own recorded reaction and safe retry. Controlled investigation requires actual water calibration, three conductivity readings, active Na/Cl electron transfer, three pH readings and three isolated virtual acid tests. Wrong identifications retain evidence and proposed answers and play conditional corrective feedback. Only the nine observations and completed formation model support accepted identification.

Scenes 20–22 distinguish chemical identity from food-grade origin and traceability. The final decision requires a 60-character justification and two collected evidence citations. The committed decision selects one ending permanently for that attempt; unselected ending video and recordings are never queued. No unknown powder is tasted or mixed. A successful professional outcome requires isolating unknowns and using traceable replacements.

Scene 27 requires a 40-character reflection. Chapter 5 retains the original five questions/options and `gradeIonic` 80% threshold. Feedback is released after final assessment submission. A failed scientific assessment receives retry recordings without pass announcements or badge. A passing assessment can follow a poor professional decision, but the separately displayed professional outcome remains the actual consequence.

## Platform and playback

The player reuses recorded-playback, previous-scene review, fullscreen, scientific functions and existing attempt persistence. Draft snapshots include measurements, attempted approaches, identification revisions, notes, final decision/citations, reflection, answers and current playback position. Old incomplete drafts resume at the earliest missing meaningful station; assessed records remain read-only and unchanged. Teacher preview uses existing authorization and performs no progress writes. A teacher scene selector does not fabricate evidence or expose pass/retry achievement states.

Pause/resume, notebook interruption, hidden-tab suspension, mute, replay, playback speed, adjustable captions reading pace, manual progression and read-only visited-scene review retain the current task. Scoped playback callbacks prevent late media events from advancing a different beat. Native pause and resumed audio position were tested. Only the next relevant image/audio and chosen branch movie are loaded; the full soundtrack inventory is never eagerly downloaded.

## Asset and narration limitations

1. **Supplied IMAGE_03 and V02 contain a FLOUR label**, inconsistent with the required sucrose/bicarbonate/sodium-chloride set. Their label-bearing lower foreground is softly masked in live presentation and scene review. Source pixels remain unchanged. This is a presentation treatment, not a corrected production master; a corrected supplied original would remove the need for masking.
2. **IMAGE_15 contains misleading decorative shell counts.** Its background is blurred/dimmed and the existing accurate Na/Cl interactive formation model covers the diagram throughout the scene. Previous-scene review renders an accurate read-only model instead of that image.
3. **Some supplied quiz question recordings paraphrase the retained approved question text.** Dialogue captions accurately follow the author scripts; assessment cards retain the original question/options, correct answer and scientific explanation. No assessment content was silently rewritten to match a voiceover.
4. All 217 caption files match the supplied text inventory. A local ASR cross-check was also performed, including an independent tail check where an initial transcription omitted a closing phrase. This is not a claim of human word-by-word listening or manually timed word-level captions. Captions synchronize at recording level.
5. Live Supabase account/RLS QA remains unverified. Browser checks use authorized synthetic fixtures and do not write to student accounts.

## Changed files

- Added `src/components/scenario/dessert/{DessertMission,DessertTasks,DessertResultReview}.jsx` and isolated `dessert.css`.
- Added `src/data/dessertFlow.mjs`, generated `dessertMedia.json`, original media, source archive and audit/mapping reports.
- Added `scripts/audit-dessert.py` for repeatable inventory verification and derivative generation; requires Python Pillow and FFmpeg/ffprobe.
- Updated `ScenarioPlayer.jsx` to mount this player only for the existing Dessert ID.
- Added an optional reference-pair restriction to `IonicModels.jsx`; defaults for other missions remain the same.
- Added opt-in formation/masking review presentation and controlled-audio ownership handling in shared scene review.
- Added Dessert attempt/revision details to `StudentAnswersModal.jsx` without changing other mission displays.
- Added Dessert unit/browser tests and fixture helpers; adapted existing Dessert regression steps to the new UI. Existing Ocean Dome and ATOM DIVE assertions remain in the regression suite.

See [VALIDATION.md](VALIDATION.md) for executed checks and screenshots. The pull request description and completion report provide the Git commit and Vercel Preview identifiers.
