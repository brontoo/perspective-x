# ATOM DIVE — S06 models and ionic color distinction

Follow-up branch: `fix/atom-dive-evidence-models`, based on current main `02e7d4b62a10d0b10f736c7dd7119ab197eb8670` after PR #22 was merged. This follow-up is for a new PR and Vercel Preview; it does not merge or promote production.

## Corrected presentation

S06 / Keep the evidence previously had only its illustrated background: `atomVisual` supplied no model descriptor, and the player mounted paired models only for S09. The empty display areas now receive the same precise application-rendered metallic and ionic structures used in the comparison. Both remain visible throughout S06's two recordings. The verified metallic explanation is identified as evidence, while the upcoming ionic structure is explicitly a preview until its investigation is verified. Displaying it does not add evidence, score a response or complete that investigation.

The shared lattice renderer now keeps ionic species in distinct colors even when an older caller requests a grayscale comparison: sodium cations are blue and chloride anions are amber. Positive/negative signs, exact geometry, particle sizes and six-neighbor inspection remain intact. A color key names both species and explains that colors are diagram conventions. This applies to entry/investigation views, S06, S09, Previous scene and completed-assessment model review. Metallic monochrome comparison styling remains unchanged.

The atom-to-ion formation diagram uses matching sodium/chlorine colors for its shells, soft surrounds and labels. Its nuclei and proton counts stay unchanged; its existing charge-reveal and grading rules are preserved.

S06 descriptors also include both models for scene review. A compatibility fallback supplies them for old saved S06 history entries that lack the new visual descriptor. The separate narrated comparison remains free of Model A/B selection/dropdown/verification tasks, as previously requested.

## Validation

Build, lint, typecheck and all 41 unit tests passed. The production-bundle browser run exercises S06 during both lines, reload and Previous scene at 1440px and 390px; it verifies that ionic credit/evidence are unchanged. Color checks cover ionic entry, S06, S09, replay and completed review. Existing complete routes, assessment, native media, teacher controls and responsive checks are included in the affected suites. All **46 affected production-bundle browser tests passed** (20 correction cases, 24 Atom cases and 2 native-media/ad-filter cases), as recorded in VALIDATION.md.

Actual built-application screenshots, using authorized synthetic fixtures:

- [S06 desktop](screenshots/corrections/s06-model-evidence-1440.png)
- [S06 mobile](screenshots/corrections/s06-model-evidence-390.png)
- [Colored ionic comparison](screenshots/corrections/s09-colored-ions.png)
- [Colored ionic entry view](screenshots/corrections/ionic-view-colored-ions.png)

Desktop and mobile S06 captures were visually inspected for model visibility, readable dialogue/charges, distinct colors, stacked layouts and safe margins. No artwork, video, recordings, mission sequence, learning gates, score rule, authentication, platform settings or other page design is changed. Earlier five-video replacement dependencies remain outside this fix. Live authenticated Supabase/RLS QA remains unverified; existing user authorization for synthetic fixtures applies.
