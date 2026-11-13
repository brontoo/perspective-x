# The Final Dessert — interactive investigation revision

13 November 2026. Existing scenario `ionic_dessert_mystery`, existing PR #24 and review branch `feature/dessert-cinematic-rebuild`. Main and production are unchanged.

## Screenshot corrections

1. **Clear story artwork.** The old lower-foreground blur mask is removed from the live illustrations, cinematic movies and Previous Scene metadata. Dialogue panels no longer apply backdrop blur. Story scenes retain the original image brightness. Background defocus is applied while an investigation, decision or assessment panel is presented.
2. **Contained activity panels.** Questions and laboratories use naturally sized, opaque cinematic cards, capped at 780px and 900px respectively. They sit over the defocused scene rather than stretching to fill the display. Larger content scrolls within its card; essential scene controls and captions remain in the viewport. Native fullscreen styling applies immediately to the fullscreen pseudo-class, including before React's fullscreen event updates.
3. **One scientific model.** Scene 15 uses the clean approved IMAGE_11 laboratory environment behind its interactive electron-transfer model. The decorative IMAGE_15 diagram is no longer rendered underneath. No source artwork was regenerated or edited. The foreground diagram is opaque and scientifically accurate.
4. **Random assessment and enrichment.** Each new attempt receives a saved shuffle of all five original questions and each question's four options. The current question chooses its own original recorded prompt; stable question/option IDs remain the basis for grading. Reloading, editing a response, replay and old draft migration preserve the appropriate order and answers. No question or explanation is revealed early.

## Tools students control

Calibration, conductivity and pH use movable virtual probes. The isolated virtual reaction uses a movable dropper. Students can hold and drag the instrument to the highlighted beaker, or select the tool and then the beaker. Existing labelled measurement buttons provide a simple keyboard alternative. Arrow keys can reposition the selected tool. Touch users can pick up and place without a precision drag.

A valid placement records the same existing reference observation; a missed drop records nothing. The probe visibly moves from its tray into the solution. Selecting another sample returns to an untested instrument and hides its measurement until operated. pH and conductivity readouts, recorded-observation logs, and visible carbon-dioxide bubbles in the bicarbonate aliquot make the change observable. The original unknown containers remain outside these isolated virtual tests.

The Na/Cl activity now allows dragging sodium's outer electron to chlorine, with an accessible Transfer one electron alternative. Electron counts change from 11/17 to 10/18; proton counts remain 11/17. The positive and negative ions use distinct gold and cyan treatments, explicit charge signs and text. Reset remains available. Dissolving an existing salt is explicitly distinguished from forming the ions from elements.

Scientific values and learning gates are unchanged: water-only calibration, all nine observations, electron transfer, evidence-supported identification, two cited observations in the final justification, reflection and the five-question assessment remain required. Narration, dropping outside the target or merely viewing an instrument cannot grant an observation.

## Before Start

The same cinematic welcome now includes:

- The main problem: identify three unlabelled powders and recommend how the fictional competition can continue safely.
- Learning objectives: ions and bonding; complementary conductivity, pH and reaction evidence; identity versus food suitability.
- Success criteria: calibrated investigation, nine observations, electron transfer, supported identification, justified decision, reflection and at least 80% on the original assessment.
- An **estimated 20–30 minutes**, with about nine minutes of recorded story. The fictional competition's 12-minute deadline is clearly distinguished from untimed student work.

Nothing plays before Start. The educational briefing may scroll internally in a small fullscreen viewport; Start remains reachable.

## The 10-point enrichment

The owner specified **10** bonus points. An optional advanced question combines Mg²⁺/Cl⁻/O²⁻ charge balance with the mobile-ion explanation for molten conductivity. It appears on the final response-review screen, expanded in Challenge mode and available to other students as optional enrichment.

A correct submitted answer receives **10 mission bonus points**; incorrect or skipped responses receive zero. Grading happens once with the existing final submission. Correct answers and explanation appear only in optional review after submission. The bonus answer, outcome and value persist in the existing attempt JSON, and teacher answer review displays them.

The bonus is explicitly separate from the five-question percentage, unchanged 80% threshold and badge conditions. A 60% result plus 10 bonus points remains a failing 60% result. Cumulative **Total Points** remains the verified value from `leaderboard_view`; this revision does not write to or fabricate a cumulative points ledger. Teacher preview shows a potential bonus outcome and performs no student progress or award writes. Saved badge/bonus presentation waits for confirmed saving.

## Tests and actual screenshots

Final executed totals are recorded in [VALIDATION.md](../VALIDATION.md). The native 1× route passed in **531.040 seconds (8:51.040)** with **69 original recordings, three original videos and exactly one saved 100% result**. Calibration and the first sample were operated by pointer drag. The final layout/interaction suite passed all **33** checks; **84** unit checks passed. The full portal regression completed with **258 passed**, with its one opt-in native case skipped there and executed separately above. New coverage includes missed and successful pointer drops at desktop/mobile sizes, keyboard pH testing, touch pickup/placement, observable bicarbonate reaction, dragged electron transfer with unchanged nuclei, briefing before playback, clean model background, per-attempt randomization and reload stability, matching prompt recordings, wrong/skipped enrichment, exact-once bonus persistence and teacher zero-write preview.

- [Clear story artwork without a lower blur mask](screenshots/clear-story-artwork.png).
- [Desktop briefing](screenshots/briefing-desktop.png), [mobile briefing](screenshots/briefing-mobile.png).
- [Calibration desktop](screenshots/calibration-1440.png), [mobile](screenshots/calibration-390.png).
- [Conductivity probe](screenshots/conductivity.png), [virtual reaction](screenshots/virtual-reaction.png).
- [Single interactive electron-transfer model](screenshots/electron-transfer.png).
- [Shuffled question and options](screenshots/randomized-question.png).
- [Saved enrichment result](screenshots/enrichment-result.png).
- [Native full-route event log](native-walkthrough.json), [native result](screenshots/native-completion.png), [source/runtime audit](runtime-audit.json).

These screenshots are actual local production-build captures using synthetic accounts. Fixture cumulative totals are responses from the mocked existing API, not hardcoded product numbers. The full native walkthrough uses original media at 1× and operates calibration and the first sample by pointer drag; the remaining activities use the accessible controls. Elapsed automation time is not a student-thinking-time estimate.

Reproduction:

```sh
npm run lint
npm run typecheck
npm run test:unit
npm run build
npx playwright test --config playwright.built.config.js
DESSERT_NATIVE_WALKTHROUGH=1 npx playwright test --config playwright.built.config.js tests/dessert-native-route.spec.js
python scripts/audit-dessert-editorial.py --investigation
```

## Scope and limits

Implementation changes are confined to Dessert components, `dessertFlow.mjs`, the new `dessertAssessment.mjs`, safe Dessert review metadata, the Dessert-only enrichment block in `StudentAnswersModal.jsx`, the audit script and related tests/reports. The attempt writer, original five MCQs, scientific values, shared ionic models, authentication and database schema are unchanged. All original image, MP3, MP4 and source-script bytes remain intact; the 100 KEEP / 117 CUT editorial partition remains enforced. No new video or voice was generated.

The author's original IMAGE_03/V02 FLOUR label is now visible as supplied because the owner explicitly requested removal of all lower blur masks. It is not used as scientific evidence by the investigation or grading. Scene 15's original decorative diagram is preserved in the archive but not used behind the new model. Some supplied recorded quiz prompts paraphrase the original question cards; each plays with its matching canonical question.

Live Supabase/RLS and cumulative-point freshness remain unverified. Browser testing uses Chromium and synthetic records; native Safari/iOS fullscreen is not claimed. The existing Vercel Preview sign-in protection remains in place; local rendered verification is distinguished from anonymous deployed-page access.
