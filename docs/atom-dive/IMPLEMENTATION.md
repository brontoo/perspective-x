# ATOM DIVE implementation and review

Scenario: `atom_dive` — **ATOM DIVE: Lost in the Invisible**.

## Latest user follow-up

The metallic model now has a brief themed introduction. The user cancelled the scored Model A/B activity: S09 keeps both models as a narrated comparison, then advances directly to recovery. Both reconstructions and the five-question exit ticket remain required. Old comparison drafts resume safely, without creating a scored answer or extra evidence. See the latest section of [EXPERIENCE_CORRECTIONS.md](EXPERIENCE_CORRECTIONS.md); earlier descriptions of a required comparison submission below are historical.

## Current experience corrections

The latest behavior and media policy are documented in [EXPERIENCE_CORRECTIONS.md](EXPERIENCE_CORRECTIONS.md), with actual checks in [VALIDATION.md](VALIDATION.md). These corrections supersede the earlier playback/presentation descriptions below: narrative is automatic after Start, Previous scene is shared across players, scientific views use accurate 3D geometry, S09 models persist during feedback, and V01–V05 are withheld pending corrected compositions. Two localized still edits are candidates for review. V06, the source recordings, assessment rules and existing progress ownership are preserved. Main/production are not promoted.

## Where to play

In an authorized student session, open **Roles → Atomic Bonding Investigator → ATOM DIVE**. The new role is appended to the catalog; every existing role, mission order and prerequisite is preserved.

- Student route: `/ScenarioPlayer?scenario=atom_dive`
- Teacher preview route: `/ScenarioPlayer?scenario=atom_dive&preview=true`
- Role route: `/RoleHub?role=atomic_bonding_investigator`

Authentication and existing teacher locks still apply. A student cannot bypass a teacher lock by adding `preview=true`. Teachers use the same complete investigations, without student progress writes. Press **Start ATOM DIVE** to permit recorded speech. **Resume mission** opens a saved checkpoint. **Full screen** expands the stage; Escape exits the fallback where the native API is unavailable.

This change is prepared on `feature/atom-dive-implementation`, starting from uploaded asset commit `15eb615ae67341e7dedfbeba4123580d898a0fa5`, then fast-forwarded to its merge on main, `23dc8ff`. It is for PR and Preview review only; production is not deployed or reconfigured.

## Authored story and scientific gates

`src/data/atomDive.mjs` implements S01–S12 as explicit dialogue and scientific checkpoints. All supplied dialogue, speakers, normal sequences, conditional feedback, question reads and assessment feedback are retained. Twelve misconception conditions play only after the corresponding incorrect action. Both investigation orders are supported.

1. Inspect the four positive monovalent metal ion cores and all four valence electrons; reconstruct delocalization, identify core/electron attraction and verify net neutrality. Cores include the nucleus and inner electrons. Electrons remain inside the specimen.
2. Transfer one electron from sodium to chlorine using drag/drop or equivalent buttons. Verify Na: 11 protons/10 electrons/1+; Cl: 17 protons/18 electrons/1−; unchanged nuclei; opposite-ion attraction; then expand a repeating lattice. The formation diagram is distinct from the precise three-dimensional rock-salt fragment now used for inspection.
3. Only after both verified models, compare unfamiliar grayscale structures. A/B placement is randomized once per attempt and stored on resume. Location, particles, attraction and both formation matches must agree before ORBIT recovery is available.

Reflection and the exact supplied five MCQs follow recovery. Submission requires all five responses. Explanations and supported answers appear only after submission; at least four correct responses (80%) earn a pass. A 60% result receives review and no badge/certificate. Common platform replay creates a fresh attempt, preserving the earlier result.

Media playback, elapsed time, Continue, video skips and conversation replay cannot grant scientific credit. Model validation is deterministic. No out-of-scope material-properties activities or additional endings were added.

## Original media audit and preparation (historical)

The machine-readable [asset audit](asset-audit.json) inventories paths, actual formats, dimensions, checksums, dialogue IDs, speaker/scene/condition mapping, duration, embedded audio, relocated production files and unresolved findings. The generated [runtime manifest](../../src/data/atomDiveMedia.json) is the single source of resolved URLs.

- Eight original story JPGs were resolved during initial implementation. The current presentation policy uses two edited stills and code-rendered scientific views where specified above. Original authored PNG names remain documented as `authoredImage`; no extension was merely renamed.
- Four approved character references retain their real nested paths and formats (three JPGs and Rashid PNG). They appear in a collapsible research-team panel; portraits are not duplicated over scenes containing the same character.
- All 61 unique ElevenLabs MP3s retain their uploaded bytes. Each dialogue ID is matched against the source audio manifest and archived transcript sidecar. All files decode successfully.
- All six uploaded MP4 containers measured 6.016 seconds, with 6.0 seconds of video and an embedded AAC track. The six runtime derivatives retain the **last five seconds**, at normal speed, without any audio track. Leading 1.0 second is trimmed; no footage is generated, slowed or looped. Original MP4 bytes are preserved in `production-archive/original-videos/`.
- Each clip has a lossless WebP extracted from its actual last decoded runtime frame. This frame stays visible while longer recorded speech continues; it is not an invented END illustration. Failed media falls back to the approved scene and readable captions.
- V03 is associated only with metallic-success dialogue. V05 is associated only with supported-comparison recovery dialogue. Stored playback state prevents unexpected replay on resume. Reduced-motion mode makes clips optional and disables electron motion.
- Production-only TXT/JSON/MD files formerly mixed into the public trees are preserved under `production-archive/`; `relocations.json` maps every old path to its archive path. Source handoff files remain intact.

Revalidate with Python 3 and FFmpeg/ffprobe:

```sh
python scripts/audit-atom-dive.py
```

`--prepare` is the one-time relocation/derivative preparation option. Revalidation decodes the media, checks source transcript/manifest agreement and rewrites deterministic reports. Run it before browser testing so development hot reload does not restart a recording mid-test.

**Original-file unresolved assets: none. Duplicate MP3 recordings: none. Five revised MP4 compositions remain pending; see the current presentation policy.** No acoustic speech-to-text verification or human listening review of all 61 recordings is claimed; speaker and transcript attribution follows the supplied authoritative manifest and matching text sidecars. Native browser MP3 playback is tested separately.

## Persistence and platform integration

`AtomDiveMission` is mounted once for an attempt, keeping one illustrated stage and one native speech player. Dialogue text is the exact text for the current recording. A user gesture starts audio; playback permission failures offer Resume or captions-only. Hidden tabs pause media, and navigation releases/reset sources. Only the current and next applicable speech files are requested, rather than preloading every error branch.

Mission styling uses the `px-atom-` namespace. The earlier `ad-primary` class collided with an EasyList advertising selector and hid Start and other primary actions in the user's browser. The review fix reproduces those cosmetic rules in browser tests and renames the mission classes without changing its appearance or state. The application-manifest link sends existing credentials so protected Preview manifest requests can use the existing Vercel session; protection settings are unchanged.

The existing `ScenarioPlayer` attempt writer and notebook remain responsible for authenticated saves. The new nested `atomDive` record stores scene/cursor, order, visited dialogue, video status, model choices, evidence, timestamped misconceptions and verified corrections, stable A/B placement, reflection, all five responses and grade. Notebook personal notes are merged independently and survive refresh. Teacher evidence/response review includes the scientific action history and all five MCQs.

No migrations, security-policy changes, credentials, unrelated page redesigns or changes to original mission media are included.

## Changed code

| Files | Purpose |
| --- | --- |
| `src/data/atomDive.mjs`, `atomDiveMedia.json` | Catalog entries, authored state machine, deterministic science/assessment checks, notebook mapping and validated media |
| `src/components/scenario/atom/AtomDiveMission.jsx` | Persistent scene, dialogue/history, investigations, reflection, assessment and fullscreen |
| `AtomMedia.jsx`, `AtomModels.jsx`, `atom-dive.css` | Speech/film lifecycle, accessible HTML/SVG models and isolated responsive styling |
| `scenarioData.jsx`, `roleIdentity.js`, `PortalShell.jsx`, `missionBlueprints.js` | Additive registration, role art/identity and learning objectives |
| `ScenarioPlayer.jsx`, `MissionNotebook.jsx`, `StudentAnswersModal.jsx` | Existing persistence, notebook and teacher review integration |
| `scripts/audit-atom-dive.py`, `tests/atom-dive*`, `tests/support/atom-*` | Reproducible asset audit, state/unit tests and browser fixtures |

## Verification

Final command results and Preview details are recorded in [VALIDATION.md](VALIDATION.md). Screenshots in [screenshots/](screenshots/) are captured from the working browser implementation using synthetic student/teacher data. Desktop, tablet and mobile layouts are inspected. Synthetic fixtures test the application save requests, teacher locks and zero-write previews; live authenticated Supabase/RLS behavior is unverified because no authorized staging accounts/project are configured.

The preview uses the existing Vercel project and its normal GitHub workflow. Any Vercel team authentication gate remains in place; no protection settings are changed.
