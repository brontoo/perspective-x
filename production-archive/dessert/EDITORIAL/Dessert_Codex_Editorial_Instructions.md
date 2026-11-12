# The Final Dessert: 12 Minutes to Disaster
## Condensed screenplay — precise implementation instructions

### Scope
Edit the EXISTING Perspective X scenario `ionic_dessert_mystery` in place. Do not create a new scenario, change its ID, or alter ATOM DIVE, Ocean Dome, authentication, assessment or persistence.

### Authoritative files
- `Dessert_Shortened_Manifest.csv`: the 100 approved dialogue records. Its `file_name` column retains `.txt` source-script identifiers; the corresponding original MP3 has the **same stem** with `.mp3` in the existing audio speaker folder.
- `Dessert_Cut_List.csv`: 117 excluded spoken lines, with audio durations and reasons.
- `Dessert_Full_Editorial_Audit.csv`: all 217 original records, editorial status and rationale.
- The original media RAR archive: source MP3, image, video assets. Preserve all physical asset files for rollback; a CUT row means "do not schedule this audio", NOT "delete the source file".

### Editorial goals
- Halve spoken running time on a representative successful route, without shortening required scientific activities or bypassing learner decisions.
- Remove the long post-identification provenance/contamination lecture entirely.
- Eliminate repeated narration that merely describes what images, measurements, or UI already convey.
- Maintain the scientific narrative: lost labels -> safe investigation decision -> conductivity/calibration -> electron transfer -> pH/virtual acid tests -> correct sample identification -> professional recommendation -> one of four endings -> reflection/quiz.

### CRITICAL SCENE REMAPPING

1. **CH01 SC01**: play only `CH01_SC01_002_NARRATOR`; render venue name as on-screen subtitle (`Umm Al Emarat Park, Abu Dhabi`) because the trimmed audio does not explicitly name the park.
2. **CH02 DEC01**: play intro and only the reaction(s) of the actual selected option. Correct choice flows to investigation. Incorrect choices may show IMAGE_08, IMAGE_09, IMAGE_10 respectively; use the retained `CH02_DEC01_APPEARANCE_*`, `CH02_DEC01_TASTE_1_*`, and `CH02_DEC01_MIX_1_*` responses. Do not play the verbose old `CH02_SC08`, `SC09` or `SC10` recordings again. An incorrect initial choice returns to the checkpoint; do not actually taste or mix powders.
3. **CH02 SC11–SC18**: retain the interactive stations, measurements, models and evidence conditions. Recorded measurements (`..._SYSTEM.mp3`) should play only on the corresponding actual scientific result. No auto-completion just because narration ends. Render the virtual-test caveats and exact laboratory conditions in the UI without repeating excluded voiceover.
4. **CH02 SC19**: present the identification interaction. Play `CH02_SC19_003_HAMAD`; conditionally play the three short A/B/C confirmation recordings only after the corresponding correct identification. Play `CH02_SC19_WRONG_HAMAD` only for an incorrect submission. Do not play the three long `*_OK_HAMAD` explanations. Keep the mapping A=sucrose, B=sodium hydrogen carbonate, C=sodium chloride.
5. **CH03 SC20 → SC22**: after completed sample identification, skip `CH03_SC21` ENTIRELY, including its narration and its standalone IMAGE_21 lecture beat. Play the two retained SC20 lines and then the two retained SC22 lines. The four final choices must remain VISIBLE and ACCESSIBLE as text; do not auto-narrate all four option audio files. Display the unchanged justification rule (>=60 characters and >=2 evidence observations) in the form without voice instructions.
6. **CH04**: play precisely ONE ending matching the submitted decision: A=IMAGE_23/V03/END_A, B=IMAGE_24/V04/END_B, C=IMAGE_25/V05/END_C, D=IMAGE_26/V06/END_D. Each ending now includes four retained spoken lines. Do not play excluded outcome recaps or narration from other endings. Preserve the real story consequence from current mission data and the safety prohibition on tasting unknowns.
7. **CH05**: retain short reflection prompt, short science-only Hamad conclusion, quiz intro, all five scientific questions and their CORRECT/INCORRECT audio as **conditional alternatives**, and an appropriate PASS or RETRY ending. Do not play both quiz feedback branches or both completion outcomes. Keep 80% assessment threshold and all existing data writes.
8. **SYSTEM folder**: replace the 18 frequently repeated spoken UI notifications with silent visible status/accessible live-region feedback; keep the safety disclaimer visible in the mission interface. Do not omit necessary validation or safety messaging — remove only the routine voice interruptions.

### Audio/visual sync
Preserve source MP3s unchanged. Use the existing ATOM DIVE quality playback mechanism for audio lifecycle, scene/instance guards, correct pause/resume and automatic progression. Do not invoke browser TTS for deleted lines; avoid stale audio events. Finish required videos and narration before moving to the next story beat. Visual transitions must use the supplied images and matching video only. IMAGE_21 should not become a separate slow transition.

### IMPORTANT: Do not change the meaning of retained recordings
The shortened CSV uses verbatim spoken transcripts. Never edit the text of a retained row unless a matching replacement MP3 is explicitly supplied. If wording changes are indispensable, flag them for author approval rather than silently playing mismatched audio/captions.

### Testing/acceptance
- Check 217 originals accounted for: 100 KEEP and 117 CUT; every KEEP stem resolves to the correct MP3.
- Student can complete conductivity, pH, virtual reaction, electron-transfer and identification correctly.
- All incorrect choices and retries still work without playing duplicate feedback.
- After A/B/C identification, CH03_SC21 lecture is not shown or spoken; scene immediately reaches the final decision.
- All four final decisions play only their own 4-line audio ending and relevant image/video.
- Quiz correctly plays only recorded feedback for the student's actual answers.
- Student/teacher access, notebook, saving, past attempts, progress and 80% badge rule work.
- Run unit tests, Playwright relevant mission tests, build, lint and typecheck, then inspect desktop and mobile.
- Do not deploy to production without approval.

### Timing comparison (MP3 running time only)
Based on actual archived MP3 metadata, one modeled route with the correct first investigation decision, correct sample identification, Ending A, and five correct quiz answers:
- Original selected-route recordings: 1,144.5 seconds (~19 min 05 sec).
- Shortened selected-route recordings: 571.9 seconds (~9 min 32 sec).
- Saved spoken time: ~572.6 seconds (~9 min 33 sec, ~50.0%).

These values exclude video and learner-controlled activity time. They are an authored-route estimate, not a measured browser-session duration. The all-path inventory contains mutually exclusive alternatives; do not play all 100 KEEP clips in one run.
