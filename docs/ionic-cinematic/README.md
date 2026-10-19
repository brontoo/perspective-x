# Ionic mission cinema mode

This change replaces the two ionic missions' student presentation with one persistent cinematic stage. It does not change the original sixteen missions, their answer keys, the homepage, music, roles, teacher dashboard or database schema. Publication is **PR + Preview only**; production requires the user's approval.

## Play the story

Open `/ScenarioPlayer?scenario=ionic_dessert_mystery` from the Ionic Materials Specialist journey. Start the cinematic mission to enable permitted device audio. The eight opening scenes play to the supplied 75-second directing reference, extending a scene when its actual dialogue takes longer. “Continue story” skips **only the current narrative scene** and always stops at the next required science checkpoint.

1. Photograph 08 freezes for water-control calibration and A/B/C conductivity measurements.
2. Photographs 09–10 resume; photograph 10 freezes for the sodium/chlorine electron-transfer model. Magnesium/oxygen remains an optional reference extension.
3. Photograph 11 freezes for all pH and isolated acid tests, sample hypotheses and confidence. Submission saves the hypothesis without showing the compound answer key. Revising it retains each committed mapping and confidence in the attempt.
4. Photograph 12 freezes for the existing four choices, two evidence citations and a minimum 60-character justification (existing teacher preview accommodation retained).
5. Only the chosen outcome photograph 13, 14, 15 or 16 plays. All branches return to photograph 07 for consequence feedback and evidence-linked reflection, then the five original MCQs inside the same stage. Feedback appears after submission; the passing threshold remains 80%.

The 12-minute deadline is a fictional story device, not a timer limiting student work. Every named venue incident is explicitly fictional. In the tasting branch Hamad prevents tasting; no tasting or consumption is enacted.

## Assets and performance

All sixteen supplied files arrived in PR #17 under `public/images/scenarios/ionic_aquarium_mystery/cinematic/*.webp.jpg`. They are **JPEGs**, 2752 × 1536, and depict the dessert mission. They remain byte-for-byte intact in that original location. [ASSETS.json](ASSETS.json) records each original hash and real format.

Full-composition WebP derivatives are under the requested dessert directory, with 1920-pixel desktop and 960-pixel mobile variants. No image was generated, recoloured or permanently cropped. The complete derivative set is about 4.1 MiB, compared with about 45 MiB of originals. The player loads the current picture and preloads only its likely successor. It never preloads the four possible outcome photographs together. Mobile framing uses scene-specific subject positions; the originals remain unchanged. A failed image explicitly reports the problem and uses the **existing** mission artwork temporarily, preserving playability.

No videos were generated. The reserved MP4 paths are untouched; cinema mode uses the photographs directly.

## Architecture and saving

- `InteractiveCinematicMissionPlayer.jsx`: mounted once per mission/attempt, including completion; no chapter key unmounts the cinematic environment.
- `CinematicSceneRenderer.jsx`: restrained push/pan/detail motion, layered dissolves and scene-specific framing; camera movement freezes at checkpoints. Reduced-motion mode shows the same photographs without animation.
- `CinematicMissionControls.jsx` / `CinematicInteractionOverlay.jsx`: secondary transport controls, notebook access, readable navy/plum glass overlays, keyboard focus and a bounded mobile scroll area.
- `CinematicDialogueEngine.mjs`: a pausable narrative clock, explicit event IDs, speech-completion gates and caption-reading fallback. It does not advance simply because a fixed scene timer expired.
- `CinematicAudioController.mjs`: device voice availability, deterministic per-session voice assignments, owned utterance cancellation, replay and optional recorded-line support.
- `ionicDessertTimeline.mjs`: the exact supplied script, directing timings, checkpoint IDs and four branches.
- `ionicAquariumTimeline.mjs`: separate, expandable Ocean Dome manifest using its existing approved aquarium artwork only.
- `runtime.mjs`: explicit scene/checkpoint state and resume validation against the retained scientific observations.

The existing `ScenarioPlayer` attempt writer saves `answers.cinematic`, the original investigation/decision/reflection/assessment fields and notebook. A scene/checkpoint identifier is stored instead of an elapsed film clock. A reload restores the last meaningful scene or science gate, starts paused, and retains measurements, proposed identities, confidence, partial decision justification and reflection drafts. Existing pre-cinema drafts remain readable; no stored record is migrated or overwritten. Teacher preview still performs no student writes. Existing saved attempts remain read-only. Failed saves cannot award a saved achievement or unlock the next mission.

The existing conductivity/pH/acid data, electron model, formula builder, actual 3D NaCl/calcite exploration, water trend simulator and five-question answer keys are reused. Investigation presentation is partitioned by checkpoint; it is not a new chemistry simulation. Outcome keys, badges, reporting and certificates retain their existing meaning.

## Free audio and honest fallbacks

Character profiles are consistent within a session. The device's available English voices are preferred and reused gracefully if fewer than five exist. Gender/age/accent quality depends on the operating system; the application does **not** claim a voice is Emirati. Browser speech cannot guarantee studio narration. Captions and all science remain usable without speech support or permitted audio.

No licensed park/crowd/kitchen ambience was supplied or available in the repository. The mission therefore uses quiet abstract harmonic motifs, instrument chimes and restrained ticks through the existing Web Audio hook. These do not imitate a mixer or crowd. There are no paid voice, music, video or audio APIs and no new dependency.

Audio starts only after a story/play/continue gesture. Pausing, hidden tabs, notebook interruption, scene changes and exit cancel owned speech and stop owned effects. Returning to a visible tab requires explicit resume. Dialogue and effects have independent volume controls; manual mission mute is remembered separately from the unchanged homepage preference. The cinematic player shares the existing homepage Web Lock: if another tab owns audio, the mission stays caption-only and does not start effects. Mute/unmute retries ownership. This also prevents multiple cinematic mission tabs from speaking at once where Web Locks are supported; the existing homepage itself fails closed without Web Locks.

Each dialogue event has a `recordedAudio` field (currently `null`). A future supplied local MP3 is checked for an audio MIME type and preferred over device speech; missing/unplayable recordings fall back to speech, then captions. No absent recording is requested now.

## Validation and review

See [VALIDATION.md](VALIDATION.md), [SCREENSHOTS.md](SCREENSHOTS.md) and [OCEAN_DOME_ASSETS.md](OCEAN_DOME_ASSETS.md). Browser persistence and authentication checks use synthetic student/teacher fixtures as previously authorized. Live authenticated Supabase QA remains unverified; no live student records were changed.
