# Homepage cinematic micro-motion review

This work is on `feat/cinematic-home-micro-motion`. It is for pull-request and Vercel Preview review. It does not replace the production deployment.

## Stage 1 — source inspection and cloud motion

The approved source is `public/images/perspective/home-cinematic.webp`, **1448 × 1086** intrinsic pixels. It is a flattened scene, with no separate cloud, hair, or clean-background layers. Its unchanged SHA-256 is:

```text
12f045eca29760bdddcb4bf6bdd6310d2378b52127f3c569b581fe55d3bc3203
```

Three conservative polygon masks select the western sunset clouds, high central clouds, and eastern cloud bank. Their exact source coordinates are in `cinematicMotionGeometry.js` and `validation.json`. Their bounding rectangles are:

| Region | Left | Top | Right | Bottom |
| --- | ---: | ---: | ---: | ---: |
| Western clouds | 20 | 24 | 628 | 382 |
| High central clouds | 648 | 18 | 1110 | 199 |
| Eastern clouds | 993 | 198 | 1430 | 413 |

These rectangles are rendering bounds, not rectangular masks. Inward feathering follows the actual polygon edges over 24 source pixels. The eastern polygon cuts away from the Burj Khalifa; all masks stop above the sun and landscape. The head, loose hair, face, neck and clothing receive no displacement. Everything below source y=413 remains static.

The component reads the scene's real dimensions and computed background position. It maps the original image using CSS cover scaling and the percentage remaining-space rule. Current crop positions remain **50% 50%** on desktop, **59% 50%** at tablet width, and **60% 50%** at mobile width. A ResizeObserver and resize listener update registration without changing the background CSS.

One transparent WebGL canvas samples the original artwork through the masks. A continuous 48-second texture field drifts at most **1.4 horizontal / 0.18 vertical CSS pixels**, with different cloud phases and a three-second entry fade. Only the cloud bounding boxes are shaded. The source is neither duplicated into moving rectangles nor edited, recompressed, replaced, or regenerated. There are no new runtime dependencies.

The canvas sits above the original CSS background and below existing interface content. Home.jsx adds only an import and a mount. Original hero markup, text, colors, navigation dimensions, typography, statistics, footer and soundtrack code are unchanged.

## Stage 2 — hair assessment and verification

Inspection found fine crown flyaways and loose curls on both sides of the head. Their edges contain a baked mixture of hair and sunset colors; some curls overlap the face and main hair volume. No separated strands or background plate was supplied. Moving an extracted strand would require reconstructing hidden sky and removing its original trace. That risks double edges, halos, gaps and changes to the character.

**Hair remains static**, as permitted by the brief's quality fallback. No head rotation, body motion, replacement character, inpainting, or hair asset was introduced.

Reduced-motion mode and unsupported/lost graphics show the exact existing CSS image. Hidden tabs stop animation updates and resume the retained timeline. Unmounting cancels the frame, disconnects observers, removes listeners and deletes GPU textures, shaders, program and buffer. Repeated preference changes and route returns retain one renderer. Pending image loads cannot initialize it after navigation. It mounts only at `/` and does not use any audio APIs.

Desktop rendering caps DPR at 1.25 and allocation at about 2.4 million canvas pixels; mobile caps DPR at 1 and redraws at 30 FPS. The two intrinsic textures occupy approximately 12.6 MB; the canvas buffer is at most approximately 9.6 MB, excluding browser-managed buffers. Geometry is measured only at initialization/resizing. Cloud bounds are precomputed. There are no animated blur filters.

## Review evidence

- [Before, from production source commit 4eddcd1](before-1440x900.png)
- [After, with actual localized motion](active-1440x900.png)
- [Screen recording of a complete natural cycle](cinematic-preview.mp4)
- [Source hashes, polygons, baseline comparisons and measured performance](validation.json)

Original-source and motion-disabled screenshots at 1920 × 1080, 1440 × 900, 768 × 1024, 390 × 844 and 1366 × 600 match **exactly**, including all interface coordinates and text. Baselines were captured before implementation and independently checked against a checkout of the original commit. The retained before/disabled-after artifacts live in `test-results/cinematic-motion/`.

Consecutive active frames change only inside the registered cloud polygons, using a one-RGB-level screenshot tolerance. Activating a GPU layer can change browser rasterization of existing text shadows and subpixel edges; screenshot comparisons therefore distinguish switching compositor paths from movement. Interface styles and positions remain unchanged, and returning to reduced motion restores the exact original pixels. Hair, face and landscape are static throughout the active cycle.

The GPU loop test compares actual rendered phases separated by 48 seconds. Additional checks cover crop registration during live resizing, reduced-motion toggling, hidden-tab continuity, unavailable graphics, context loss, allocation at DPR 3, unmounting and late image-load cancellation. Existing soundtrack tests still cover decoding, volume/fade, looping, tab ownership, mute persistence and mission-route resets. Authenticated portal checks use synthetic fixtures; live account QA remains unverified.

## Changed files

- `src/pages/Home.jsx` — isolated import and mount.
- `src/components/landing/CinematicHeroMotion.jsx` — homepage-only lifecycle and reduced-motion handling.
- `src/components/landing/cinematic-motion.css` — scoped, non-interactive layer.
- `src/components/landing/cinematicCloudRenderer.js` — masked renderer and resource ownership.
- `src/components/landing/cinematicMotionGeometry.js` — source geometry, polygons and registration.
- `tests/cinematic-motion.spec.js` — browser rendering/lifecycle/crop/loop checks.
- `tests/cinematic-motion.test.mjs` — source hash, registration and protected-region checks.
- `tests/our-story.spec.js` — explicitly selects reduced motion for static screenshot comparisons.
- `docs/cinematic-motion/README.md`, `validation.json`, the two review PNGs and `cinematic-preview.mp4` — review evidence.

Build and test counts, cloud-loop recording timings and performance observations are recorded in `validation.json`. Performance measurements come from headless software WebGL in the cloud; physical-device GPU performance is unverified. Review subtle motion at normal speed and 100% zoom; the recording does not exaggerate displacement.
