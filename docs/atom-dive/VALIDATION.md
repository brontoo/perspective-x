# ATOM DIVE corrections validation — 25 October 2026

Current correction work: `feature/atom-dive-experience-corrections`, based on implementation commit `831fe7bacbfeec3510f6475f8ad4e68b1a1709e2`. It updates the existing implementation PR #22 for Preview review. Main/production are not promoted. See [EXPERIENCE_CORRECTIONS.md](EXPERIENCE_CORRECTIONS.md) for the final behavior, changed-file map, media policy and exact pending replacement paths.

## Latest title and comparison follow-up — 27 October 2026

The user added a themed metallic-model introduction and cancelled only the scored S09 comparison activity. The two-model comparison remains as narration and advances directly to recovery. This supersedes earlier tests/screenshots of the removed form.

- Build, lint and type checks passed.
- All **41 unit tests passed**, including migration from the old comparison form, both required reconstruction routes and unchanged 80%/60% assessment behavior.
- **44 production-bundle browser tests passed** (18 correction cases, 24 current Atom cases and 2 native-media cases). Four cases for the cancelled comparison submissions were replaced by coverage of the narrated review and legacy-draft migration. Browser validation checks the paused four-second title before any metallic model/audio appears, automatic narrated comparison with no choice/verification controls, safe resume of old drafts, retained two-model geometry, Previous scene, mobile/fullscreen, both complete routes and unchanged five-question results.
- Current screenshots were visually inspected: [title](screenshots/corrections/metallic-model-introduction.png), [comparison](screenshots/corrections/s09-narrated-comparison.png), [mobile](screenshots/corrections/s09-review-fullscreen-390.png), [tablet](screenshots/corrections/s09-review-fullscreen-820.png).
- Existing media replacement dependencies and synthetic/live-QA limits below still apply. No main merge or production promotion is included.

## Final correction checks

| Check | Result |
| --- | --- |
| `npm run lint` | Passed |
| `npm run typecheck` | Passed |
| `npm run build` | Passed |
| `npm run test:unit` | **41 passed** |
| Full production-bundle browser regression | **187 passed**, before the final replay-audio/mobile refinements |
| Final production-bundle affected suites | **65 passed** after those refinements; command below |
| Media audit | 8 original story images, 4 character references, 61 decoded original MP3s, 6 retained five-second silent runtime clips, 2 edited still candidates, 5 explicitly withheld clips awaiting replacements |

```sh
npx playwright test --config playwright.built.config.js   tests/atom-corrections.spec.js tests/atom-dive.spec.js   tests/atom-start.spec.js tests/ocean-media.spec.js
```

The final 65 comprise 18 correction cases, 28 existing ATOM DIVE cases, 2 native-media/ad-filter cases and 17 Ocean Dome cases. The complete regression run also exercised original mission assessments, Dessert, teacher/student controls, profile/authentication, homepage/Our Story/music and existing portal navigation. The final refinements were followed by the affected-suite run, not a second full regression run.

Demonstrated correction coverage includes:

- Automatic opening and both complete investigation orders, through all five unchanged exit-ticket questions and a single saved result.
- Real native MP3 playback, actual V06 completion/final-frame handling, independent audio/video gates and rejection of stale completion callbacks. V01–V05 are withheld rather than falsely claimed as corrected.
- Incorrect feedback retains the same mounted scientific models and inputs; editing returns automatically. S09 models appear during introduction and feedback, with stable grayscale A/B ordering and neutral labels.
- Correct selected route, scene, recording sequence, effective video policy and first-person model after fresh selection and reload.
- Timed captions, remaining-duration preservation, explicit/tab/notebook pause, blocked playback, reduced motion and appropriate missing-media fallback.
- Previous scene on Atom, Ocean Dome, Dessert and original scenario players: actual visited history, read-only response review, early/automatic return, preserved inputs/notes/current voice position, no extra learning events or duplicate attempts.
- Native embedded audio in original MP4 review, including Mute; original video content is unchanged.
- Mobile original-player toolbar fit; desktop/tablet/mobile and fullscreen investigation layouts; source controls remain visible under the reproduced EasyList cosmetic selectors.
- Rock-salt geometry has six nearest opposite-ion neighbors and twelve next-nearest same-type neighbors. Metallic fragments use identical positive ion cores and neutral delocalized electrons within the specimen.

## Current screenshots

Captured from the actual built React application using authorized synthetic fixtures:

- [S02 hovering ORBIT](screenshots/corrections/s02-hovering-orbit.png)
- [S03 neutral mirror](screenshots/corrections/s03-neutral-mirror.png)
- [Metallic first-person route](screenshots/corrections/metallic-first-orbit-view.png)
- [Ionic first-person route](screenshots/corrections/ionic-first-orbit-view.png)
- [S09 models during corrective feedback](screenshots/corrections/s09-models-during-correction.png)
- [Mobile fullscreen comparison](screenshots/corrections/s09-feedback-fullscreen-390.png)
- [Tablet fullscreen comparison](screenshots/corrections/s09-feedback-fullscreen-820.png)
- [Atom Previous scene](screenshots/corrections/atom-previous-scene.png)
- [Ocean Dome Previous scene](screenshots/corrections/ocean-previous-scene.png)
- [Dessert Previous scene](screenshots/corrections/dessert-previous-scene.png)
- [Original player Previous scene](screenshots/corrections/legacy-previous-scene.png)

Desktop S09, mobile fullscreen and shared-review screenshots were visually inspected for charge visibility, retained models, readable safe margins and scoped styling. Small screens stack models at readable sizes in the mission scroll region. Historical screenshot files below are preserved as historical captures rather than presented as the corrected UI.

## Remaining dependencies and verification limits

The review ZIP contains references and issue screenshots, not revised production media. Two localized still edits are included as review candidates. The incorrect I04/I05/I07 investigation/recovery artwork is replaced at runtime by explicit accurate code-rendered interim views. Five old compositions (V01–V05) and their old posters/held frames are withheld; no MP4 pixels were edited or regenerated. V06 is unchanged. [The replacement list](EXPERIENCE_CORRECTIONS.md#visual-scope-and-pending-media) names all five required clips and matching new final frames. The source audit's empty original-file unresolved list is separate from these five pending replacements.

All 61 uploaded recording bytes, original scripts/voices, source videos, exact five MCQs and 80% pass rule are preserved. Audit attribution follows supplied manifests and sidecars; independent acoustic transcription/human listening review of every recording is not claimed.

Live authenticated Supabase/RLS QA remains unverified; the user authorized synthetic browser fixtures. Production student data and deployment protection settings were not changed. The exact new Preview URL and commit will appear in PR #22 and the completion report; existing Vercel team authentication may be required. No main merge or production promotion is performed.

---

The sections below document earlier implementation checks; they do not override the automatic playback, revised media policy or current screenshots above.

# Historical implementation validation

Implementation: `feature/atom-dive-implementation`. Existing main at start of review: `23dc8ffa15dc0a6bbfd82d14c63bbd1aefd49673`.

## Preview follow-up: invisible Start button

The user's preview screenshot showed a rendered briefing without its Start action. EasyList's actual generic cosmetic rules include `##.ad-primary` and `##.ad-footer`; applying those rules reproduced the missing Start button before the fix. This was missed by the initial extension-free browser checks.

All ATOM DIVE DOM classes, CSS selectors and keyframes now use the project-specific `px-atom-` namespace. Start, Continue, scientific verification, assessment and footer elements remain visible under those rules. No advertising-filter override or browser-extension detection is used. Layout, dialogue pacing, source media, science validation, saved state and Ocean Dome behavior are preserved.

The HTML manifest link also uses `crossorigin="use-credentials"`, allowing the browser to send existing Vercel cookies on the protected Preview's manifest request. This does not change authentication or deployment protection settings; an authenticated live Vercel session was not available to independently verify that request.

Executed follow-up checks:

- Confirmed the desktop Start test failed under the cosmetic rules before the fix.
- New desktop (1227px, matching the narrowed screenshot viewport) and mobile (390px) tests passed with those rules. They use native, unmocked MP3 and MP4 playback: Start enables recorded speech, all three S01 lines finish, S02 starts the first approved clip, its playback clock advances, and its actual final frame is held. The clip is silent, normal speed and not looping. S01 deliberately remains the authored static briefing; no extra video was invented.
- Both complete investigation-route tests now run with those rules, covering later scientific and assessment actions as well as Start.
- Build, lint, typecheck and all 37 unit tests passed again.
- `npx playwright test --config playwright.built.config.js tests/atom-dive.spec.js tests/atom-start.spec.js tests/ocean-media.spec.js`: **47 passed** (30 ATOM DIVE and 17 Ocean Dome cases).
- Fresh native-playback screenshots inspected: [Desktop Start](screenshots/start-filters-1227.png), [mobile Start](screenshots/start-filters-390.png), [desktop playing clip](screenshots/playing-filters-1227.png), [mobile playing clip](screenshots/playing-filters-390.png).

## Initial implementation checks

| Check | Result |
| --- | --- |
| `python scripts/audit-atom-dive.py` | Passed: 8 story images, 4 references, 6 runtime clips, 61 decoded MP3s; no unresolved assets or duplicate public-media hashes |
| `npm run lint` | Passed |
| `npm run typecheck` | Passed |
| `npm run build` | Passed |
| `npm run test:unit` | 37 passed, including 8 new ATOM DIVE tests |
| Production-bundle browser regression | All 170 applicable checks passed across the full run and affected-suite reruns, as explained below |
| New mission browser coverage | All 28 ATOM DIVE cases passed against the production bundle |
| `git diff --check` | Passed |

The full `npx playwright test --config playwright.built.config.js` run initially discovered 171 cases: 168 passed and three test-assumption failures occurred. Two dashboard assertions still expected the previous catalog total of 18; they were updated to 19 and both passed their production-bundle rerun. The conventional five-chapter test generator also included the new cinematic mission; its filter now excludes dedicated cinematic adapters, which have separate complete-flow suites. All 25 cases in that affected legacy file passed on rerun. The corrected suite has 170 applicable cases; no application failures remain from these runs. This is not a claim that a second full 170-case run was performed.

Affected-suite reruns:

```sh
npx playwright test --config playwright.built.config.js tests/approved-ui.spec.js \
  --grep 'draft notebook|empty and backend-failure' --reporter=list --output=/tmp/atom-stat-rerun

npx playwright test --config playwright.built.config.js tests/remaining-portal.spec.js \
  --reporter=list --output=/tmp/atom-legacy-rerun
```

## New mission coverage

- Metallic-first and ionic-first complete routes, reflection, five-question grading, 80% saved result and completed notebook.
- All twelve exact misconception recordings, preserved evidence, revision, repeated same-error replay and stored corrections.
- Real MP3 decoding/playback after Start, exact current captions, manual Continue, mute, pause/resume, replay, blocked audio permission, captions-only and hidden-tab pause.
- Navigation source cleanup, actual final video frame holding without truncating speech, fixed speed/no looping/silent clips, no unexpected replay on resume, V03/V05 scientific gates and clip-skip independence.
- All actual media URLs, four appropriately placed approved character references, original source hashes and verified five-second clip metadata.
- Electron drag/drop and equivalent keyboard/button controls; precise particle counts and unchanged nuclei; extended lattice; grayscale comparison and stable A/B resume placement.
- Reloaded checkpoint/evidence, personal notebook notes, visited-dialogue replay without progress changes, teacher locks, zero-write teacher preview and teacher review of all five responses.
- 60% does not earn a badge/certificate; replay preserves the earlier assessed attempt.
- Missing artwork/audio/video fallback, reduced motion, native/fallback fullscreen, notebook Escape behavior and no horizontal overflow at desktop/tablet/mobile sizes.

Existing Ocean Dome and dessert complete-flow, media, audio, teacher controls, notes, failed saves, sequential unlock and assessment cases passed. Existing original mission assessment flows also passed. Homepage/sign-in artwork, Our Story, music, navigation, account, profile-schema and teacher workspace checks passed; those page implementations are not changed.

## Screenshots inspected

The browser-generated screenshots use synthetic accounts against the built application:

- [Opening](screenshots/opening.png)
- [Desktop metallic reconstruction](screenshots/metallic-1440.png)
- [Tablet reconstruction](screenshots/metallic-820.png)
- [Mobile reconstruction](screenshots/metallic-390.png)
- [Mobile fullscreen](screenshots/fullscreen-390.png)
- [Ionic electron-count verification](screenshots/ionic-transfer.png)
- [Grayscale evidence gate](screenshots/comparison-metallic.png)
- [Assessment review](screenshots/assessment-review.png)

Desktop and mobile images were visually inspected for scene composition, readable charge signs, unclipped controls, background-only blur and contrast. An inherited light-panel style found in the history area was corrected with isolated ATOM DIVE styling.

## Limits and review deployment

The audit verifies encoded files, hashes, metadata, exact authored transcript-sidecar agreement and deterministic dialogue attribution. It does not claim independent acoustic transcription or human listening verification of every recording.

Authenticated application behavior is exercised using synthetic browser fixtures. Live authenticated Supabase access/RLS is unverified; no staging credentials were supplied and no production student records were changed. A Vercel Preview is requested through the existing repository integration; its exact URL is provided in the pull request deployment check and completion report. Vercel team sign-in may be required. No preview protection, production environment settings, main-branch merge or production promotion is authorized by this change.
