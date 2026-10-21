# Ocean Dome media integration

Development branch: `feature/ionic-illustrated-visual-novels`.
Approved media source: `ada72da1ee13730918d8e4a02caadaabe35fedc6`.
Only the four Ocean Dome media directories were imported from that commit; its separate story engine was not merged.

## Inventory and verified mappings

- [Complete inventory](asset-inventory.json): every media path, actual format, dimensions, duration, codec, size and SHA-256.
- [Recording verification](audio-verification.json): all 92 resolved dialogue mappings, exact captions, independent speech transcripts and conditional branches. No unresolved recording mappings.
- [Runtime audio manifest](../../src/data/oceanDialogue.json): unique dialogue ID, scene, speaker, exact spoken caption, actual MP3 path, sequence order, branch and measured duration.
- [Story/media manifest](../../src/data/oceanDome.mjs): all 16 screenplay scenes across five chapters, six video bindings, portraits, investigation sequencing and conditional feedback.
- The supplied production sheet is preserved at `public/audio/scenarios/ionic_aquarium_mystery/00_Voice_References/voice_settings.txt.txt`.

| Supplied assets | Actual media | Integration |
| --- | --- | --- |
| 12 story illustrations | JPEG, despite `.webp.jpg` names; 2752×1536, except decision/outcome at 1376×768 | Every dedicated scene mapping, including aquarium, preparation, incident, staff and Hamad’s arrival |
| 3 character portraits | JPEG, 2752×1536 | Hamad, Noora and Khalid’s active speaker panel |
| 6 films | H.264/AAC MP4, 1280×720, **10.005 seconds each** | Incident, controlled sample reaction and exactly one selected ending |
| 92 voice recordings | MP3 | Scenes 01–16, including revision, outcome and graded assessment branches |

Original filenames, directory structure, file bytes and audio identities are preserved, including spaces, Unicode scene names and double extensions. The website references their actual paths. Nothing was regenerated, transcoded or stretched. The older `/cinematic/` placeholder directory with dessert/park filenames is not used by this integration.

Reproduce the inventory with `python scripts/audit-ocean-media.py` (requires FFprobe). The unit suite also verifies SHA-256 and every runtime media reference.

All 92 recordings were independently decoded with FFmpeg and transcribed locally with faster-whisper `base.en`, then compared with the supplied script and speaker-coded IDs. Scene 14 was checked by spoken content and consequence key, never alphabetical filename order. Two short ad-libs in Scene 05 are reflected in captions: Noora’s “help us!” and Hamad’s “Hmm, I see.” The audit retains the source wording for comparison.

## Experience and scientific safeguards

A single Ocean Dome viewport carries the illustrated story, active speaker, HTML captions, current scientific instrument and dialogue controls. The existing mission shell, notebook, draft writer, teacher permissions, sequential unlocking, decision evidence requirements, MCQs, 80% threshold and badge recording remain in use. The original `ionicMissions.mjs` and `ionicScience.mjs` data are unchanged.

The first unsupported investigation choices receive their matching recordings and require revision. Calcium, solubility and fingerprint observations are collected through the original instrument. The carbonate film is reachable only after performing the isolated controlled virtual test; interpretation is required. The formula challenge distinguishes incorrect charge, nonminimal ratio and supported composition. Students compare both crystal references and run adjustable water simulations before recording their conclusions. Unsupported mineral identification can be revised before proceeding.

Final platform option letters differ from the screenplay’s letters. Bindings use `consequence` keys:

| Consequence key | Scene 14 recordings | Selected film |
| --- | --- | --- |
| `add-salt` | NAR 05 → KHA 06 → HAM 07 | `ending-add-salt.mp4.mp4` |
| `isolate-review` | NAR 08 → NOO 09 → HAM 10 | `ending-isolate-review.mp4.mp4` |
| `acid-tank` | HAM 11 → KHA 12 → NAR 13 | `ending-acid-tank.mp4.mp4` |
| `appearance-only` | NAR 14 → KHA 15 → HAM 16 | `ending-appearance-only.mp4.mp4` |

Fictional incidents at a real venue are labeled explicitly. The educational loop remains separate from animal exhibits. Generated film scenery and incidental markings never replace the HTML scientific readings; the acid proposal is explicitly prevented.

## Playback and loading

- **Start scenario** is the explicit playback gesture. It starts approved recorded narration and synchronized HTML captions; no sound plays before Start.
- Dialogue advances automatically on the current recording’s `ended` event, including chapter transitions. There is no Next dialogue button or artificial transition timer. The story stops for scientific activities, decisions, justification, reflection and the assessment.
- A single audio element survives chapter changes. Previous recordings are stopped and reset before changing lines; only the next known recording and scene image are prefetched. No speculative answer/outcome recordings are preloaded.
- Controls use **Mute / Unmute** and **Pause / Resume**, with playback speed and a captions-only option. Pause freezes narration, automatic progression and scene films. Hidden tabs pause until Resume is selected.
- Missing recordings continue automatically with a readable caption interval. A blocked browser request offers Resume or captions only; no browser-generated voice substitutes the approved recordings.
- **Full screen** uses the browser Fullscreen API, with a fixed-viewport fallback when unsupported. The host persists across chapters; Exit full screen/Escape restores the page. Notebook access remains available, and desktop/tablet/mobile layouts keep controls within the immersive view.
- Student inputs survive pause/resume. Interactive activities, evidence capture, 80% passing, teacher restrictions and assessment saving retain their existing scientific rules.
- Current artwork, the active portrait and required film load on demand. Films keep their original speed/duration and remain muted behind the approved dialogue. Still-image and missing-film fallbacks preserve the story.
- Reduced-motion mode removes camera movement and leaves films available for manual playback.

## Remaining media limitations

The supplied films are ten seconds, although the request estimated five seconds. Their original duration is preserved. The Scene 16 production sheet requests on-demand question/individual-option recordings, but those recordings were not supplied: Scene 16 contains only its introduction, pass, badge and retry recordings. The five original questions and all answer options remain accessible as text; no substitute voice was generated.

Live authenticated Supabase QA remains unverified. Browser QA uses the authorized synthetic identities and records. Chromium desktop/tablet/mobile layouts are covered; physical Safari/iOS playback is unverified.

The development branch is published for review through [PR #20](https://github.com/brontoo/perspective-x/pull/20) and its linked Vercel Preview. Main and production require separate user approval; these playback changes are published only to the review branch.

## Validation and screenshots

See [validation report](VALIDATION.md) for current command results. Latest captures: [desktop full screen](screenshots/fullscreen-desktop.png), [tablet](screenshots/fullscreen-820.png), [mobile](screenshots/fullscreen-390.png), and [Start screen](screenshots/start-390.png). Earlier manual-dialogue screenshots are retained as initial-integration evidence. Browser captures are in [screenshots](screenshots/), covering the opening, incident, formula/crystal workbench, each ending, assessment feedback, tablet and mobile.
