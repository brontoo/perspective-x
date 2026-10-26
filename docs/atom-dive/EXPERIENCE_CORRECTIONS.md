# ATOM DIVE experience corrections

Working branch: `feature/atom-dive-experience-corrections`, created from the latest implemented `feature/atom-dive-implementation` at `831fe7bacbfeec3510f6475f8ad4e68b1a1709e2`. PR #22 was still open and unmerged; main remained `23dc8ffa15dc0a6bbfd82d14c63bbd1aefd49673`. Work is for branch/Preview review, without production promotion.

The two latest pasted correction requests are identical. The supplied ZIP contains seven issue screenshots and seven visual references, including stock-watermarked references. It contains no revised runtime artwork or MP4s. Those reference files are inspection material only and are not embedded in the application or stripped of watermarks.

## Latest follow-up — 27 October 2026

The user requested an introductory title before the metallic model and then explicitly cancelled the pictured scored Model A/B comparison activity. These instructions supersede the earlier S09 response-form requirements below.

- Before the metallic entry model appears, a four-second title uses the existing navy/gold palette and scenario typography: **Metallic structure model**. Its supporting line introduces ORBIT’s atomic lens. The model and its recording start afterward; no extra click is required. Explicit pause, hidden-tab pause, notebook and Previous scene suspend the title’s remaining time.
- S09 retains the side-by-side metallic and ionic models with explanatory labels. Model-selection buttons, evidence/matching dropdowns and the verification submission are removed. The default automatic story proceeds directly from the narrated comparison to recovery.
- The comparison reuses two existing explanatory recordings (metallic-bonding and ionic-attraction explanations). The two old instructions asking students to choose and justify a model are omitted from the active sequence. Original source files and transcripts are preserved; no replacement voice is synthesized.
- Both reconstruction investigations are still required. Narrative review records `comparison.reviewed`, not a scored `supported` answer, comparison evidence, correction or achievement. New runs retain two genuinely verified evidence records. The notebook explicitly identifies this as a narrative review without a submitted response.
- Old drafts on the cancelled form return to the comparison explanation, preserving their prior choices, evidence, notes and attempts. Old genuinely supported comparison records and completed results remain readable. The reflection, five exit-ticket questions, 80% threshold and teacher controls are unchanged.

Current captures: [Metallic introduction](screenshots/corrections/metallic-model-introduction.png), [narrated comparison](screenshots/corrections/s09-narrated-comparison.png), [mobile fullscreen](screenshots/corrections/s09-review-fullscreen-390.png), [tablet fullscreen](screenshots/corrections/s09-review-fullscreen-820.png). Earlier screenshots of the cancelled form are historical.

## Corrected experience

- One Start authorizes the recorded narrative. Audio completion advances lines and scenes automatically; scientific tasks, route choices, reflection and assessment remain explicit student actions. Correct and incorrect feedback return to the appropriate checkpoint automatically. An optional Manual reading mode remains available; Automatic is the default.
- One recorded-speech controller identifies the physical scene/checkpoint, dialogue and playback instance. It rejects cancelled-source completions. Speech and required video finish independently; both must finish before advancing a beat. A short recording cannot cut off a longer clip, and final frames remain while longer speech continues. Captions-only and unavailable-recording fallback use adjustable reading duration and preserve remaining reading time on pause.
- Notebook, hidden-tab and explicit pause suspend automatic progress. Browser playback permission failures offer Resume or captions. Current media is released on navigation. No browser speech replaces ATOM DIVE's supplied ElevenLabs recordings.
- Previous scene is a shared toolbar control across ATOM DIVE, Ocean Dome, Dessert and the standard players. It replays the actual preceding visited scene in a separate read-only dialog, with only observed lines and applicable media. It suspends the current scene without unmounting its task, preserves audio time, model/input state and comparison positions, then returns automatically or through Return to current scene. It does not submit answers, add evidence, award achievements or create assessment attempts.
- `meta.sceneTrail` stores normal visited-scene history with the existing draft. Atom visit records also retain physical-scene IDs. Prior Atom drafts can reconstruct visited history from their existing dialogue records. Replay itself emits no trail or learning updates. Existing writer ownership, teacher preview and access checks remain in force.
- Selecting metallic or ionic first now traces to an explicit scene/view, corresponding recorded sequence and video ID. Old held frames are not reused over another world. Ionic failure never substitutes a metallic illustration: the correct application-rendered ionic view remains available.
- Microscopic views are from ORBIT's camera. The FCC metal fragment uses identical positive monovalent cores; the four-core reconstruction retains the original neutrality exercise. Delocalized electrons are distributed inside the specimen, rather than fixed to individual cores or escaping. Core labels identify nucleus plus inner electrons.
- The NaCl view is a three-dimensional rock-salt fragment: 32 cations and 32 anions, with six nearest opposite-type neighbours around an interior ion and twelve same-type next-nearest neighbours. The sublattices are FCC. Drag/button rotation and interior-neighbour inspection are viewing operations, not scoring events. Colours and sizes are diagram conventions. The existing one-electron Na/Cl formation task and unchanged nuclei remain distinct from attraction in the resulting lattice.
- S09's two grayscale models appear during introduction and remain mounted through choice, correction and revision. A/B positions stay fixed for the attempt. Submission is disabled during narration/feedback; the response section folds during feedback to keep models and dialogue together, without clearing selections. No answer is earned by displaying a model.
- S02 now uses a targeted still edit showing the complete pearl-white ORBIT hovering above the specimen dishes. The tabletop screen containing ORBIT is removed. S03 uses a targeted still edit with a closed silver-gray mirror, without a visible world. These are candidate edited stills for this review, not a claim of previous approval.
- The five-question wording, options, explanation text and 80% threshold are unchanged. Submission plays the existing graded feedback and saves the result once. A read-only completed-assessment review preserves access to all explanations and both structures after the automatic ending.
- Production-facing final-frame diagnostics were removed. Source artwork, recordings and original MP4s are preserved. Opening, neutral comparison room, homecoming and original character references are retained.

## Visual scope and pending media

**No MP4 has been regenerated or visually edited.** Five existing compositions conflict with the requested corrections and are intentionally withheld from playback, poster display and held-frame display. Exactly six video IDs remain registered. V06 remains active and unchanged. All six retained runtime MP4s still measure five seconds and contain no audio track.

| Video ID needing a replacement | Required composition | Interim presentation |
| --- | --- | --- |
| `AD_V01_last_signal.mp4` | Complete approved ORBIT hovering above the samples; no tabletop screen containing it | Edited S02 still and original recorded lines |
| `AD_V02_enter_metallic.mp4` | ORBIT's first-person entry into the revised FCC metallic fragment | Accurate code-rendered metal view |
| `AD_V03_metallic_route.mp4` | Same camera/material, matching the verified metallic explanation | Verified metal model and original success recordings |
| `AD_V04_enter_ionic.mp4` | Distinct ORBIT-view rock-salt lattice, without a metal electron sea | Accurate code-rendered NaCl view |
| `AD_V05_find_orbit.mp4` | External recovery shot in the same revised metallic environment | Same metallic renderer with a clearly virtual code-rendered ORBIT |

Future replacement intake paths should preserve the old originals:

```text
public/videos/scenarios/atom_dive/revisions/AD_V01_last_signal.mp4
public/videos/scenarios/atom_dive/revisions/AD_V02_enter_metallic.mp4
public/videos/scenarios/atom_dive/revisions/AD_V03_metallic_route.mp4
public/videos/scenarios/atom_dive/revisions/AD_V04_enter_ionic.mp4
public/videos/scenarios/atom_dive/revisions/AD_V05_find_orbit.mp4
public/images/scenarios/atom_dive/revisions/AD_V01_last_signal_end.webp
public/images/scenarios/atom_dive/revisions/AD_V02_enter_metallic_end.webp
public/images/scenarios/atom_dive/revisions/AD_V03_metallic_route_end.webp
public/images/scenarios/atom_dive/revisions/AD_V04_enter_ionic_end.webp
public/images/scenarios/atom_dive/revisions/AD_V05_find_orbit_end.webp
```

Each new clip must be at most five seconds, at normal speed, silent, and have a newly extracted actual final frame and matching poster. Validate it before updating its existing video ID and removing its withholding entry. Do not overwrite the archived original MP4s or merely rename a file extension.

The original pixels of `AD_I04_metallic_world`, `AD_I05_ionic_world` and `AD_I07_orbit_found` are also unchanged and no longer used as the investigation/recovery environments. The accurate application-rendered views are explicitly interim visual replacements. Revised illustrative files, if supplied later, should match these camera/structure compositions; they must not replace exact labels, particle geometry or scoring logic. The new still edits are at:

```text
public/images/scenarios/atom_dive/revisions/AD_I02_lost_signal.png
public/images/scenarios/atom_dive/revisions/AD_I03_launch.png
```

[Presentation policy](presentation-policy.json) and the generated runtime manifest explicitly distinguish revised stills, scientific views and withheld videos. [Asset audit](asset-audit.json) records dimensions, actual formats, checksums, original media preservation and the five pending replacements. An empty original-file `unresolved` list does not mean replacement MP4s were supplied.

## Shared player implementation

| Files | Responsibility |
| --- | --- |
| `playback/useRecordedPlayback.jsx` | Recorded line lifecycle, instance guards, timed captions, pause/resume and automatic beat completion |
| `playback/ScenarioReview.jsx`, `scene-review.css`, `sceneTrail.mjs` | Shared visited-route review, read-only dialog, suspended current state and consistent toolbar action |
| `playback/LegacySceneVisit.jsx`, `usePausableTimers.jsx` | Standard chapter adapter and remaining-delay preservation for legacy narration/quiz timers |
| `ScenarioPlayer.jsx` | Existing save/assessment integration and persisted scene trail; review blocks learning handlers |
| `OceanDomeNovel.jsx`, `OceanMedia.jsx`, `IonicStory.jsx` | Compatible Ocean/Dessert adapters using their existing source content and media |
| `CinematicVideoIntro.jsx`, `KenBurnsSlideshow.jsx`, `ExitTicket.jsx` | Original-player history adapters and suspension of current playback/timers |
| `AtomDiveMission.jsx`, `AtomMedia.jsx`, `AtomModels.jsx`, `CrystalView.jsx`, `AtomResultReview.jsx` | Automatic Atom film, persistent models, precise crystal views and completed-result explanations |
| `atomPresentation.mjs`, `atomCrystal.mjs`, `atomDive.mjs`, `atomDiveMedia.json` | Geometry, effective media policy, physical-scene visits and validated source mapping |

## Verification record

Targeted development checks: all **45 browser tests passed**, including both complete automatic routes, the existing manual-reading science/assessment tests, all misconception conditions, exact native MP3/V06 playback, stale completion rejection, saved notes and immutable results. Shared review was exercised on all four player types. A real-audio test verified pause and restoration of the same recording at the retained playback position. All **41 unit tests passed**, including six-neighbour rock-salt geometry and actual visited-route history checks.

The final production-bundle regression, lint/type/build results and review deployment are recorded in `VALIDATION.md`. Screenshots under `screenshots/corrections/` show the revised stills, both first-person routes, persistent S09 correction models, mobile/fullscreen and shared previous-scene review. No live authenticated Supabase/RLS verification or authenticated Vercel-session QA is claimed; browser data uses the authorized synthetic fixtures.
