# Perspective X — two illustrated cinematic visual novels

This branch adds a dialogue-first, illustrated storytelling player to the existing **Ionic Materials Specialist** missions:

- `ionic_dessert_mystery` — **The Final Dessert: 12 Minutes to Disaster**, Umm Al Emarat Park, Abu Dhabi.
- `ionic_aquarium_mystery` — **Ocean Dome: The Water Is Turning White!**, a fictional educational demonstration at **The National Aquarium Abu Dhabi, Al Qana**. Its loop is isolated. No actual incident or animal-exhibit impact is implied.

## What's implemented

- Reusable illustrated visual-novel stage and authored narrator/character scripts.
- Sequential speaker-name/dialogue panel; separate narration treatment; collapsible conversation log.
- Optional, user-initiated browser speech with voice on/off, replay and adjustable speed; actual voices depend on the browser. **No recorded character voice assets are bundled**.
- A branching introductory investigation choice in Chapter 2 for each mission. Unsafe choices are prevented; wrong guesses return to evidence-based reasoning.
- Four distinctive outcomes and scripted reactions per mission, keyed to the **existing** saved final decision.
- Every existing scientific instrument stays interactive: calibrated conductivity and electron transfer in dessert; isolated mineral tests, ion formula builder, 360-degree crystal structure, and water-chemistry model in aquarium.
- Existing mission access restrictions, teacher preview, evidence citations, notebook, autosaved attempts, reflection, five-question exit ticket, 80% passing rule, and badges are unchanged.
- Separate visually styled and responsive layout, reduced-motion support, semantic controls, and text transcript regardless of audio.
- Existing approved scene art is used as a fallback while dedicated imagery is being produced.

## Art production manifest — Google Flow

Each scene is **one 16:9 premium hand-drawn cinematic 2D illustration**. Match the approved reference of detailed visual-novel interior, expressive semi-realistic characters, dark fine ink outlines, sophisticated soft cel shading and painterly lighting. Never bake text/dialogue bubbles, scientific measurements, or interface elements into the artwork: React owns them.

Save the files to:

`public/images/scenarios/ionic_dessert_mystery/story/`

| Filename | Content |
|---|---|
| 01_park.webp | Golden-hour aerial/wide view of fictional Great Lawn dessert competition |
| 02_finalists.webp | Mariam (dark teal hijab) and Saeed (white chef jackets) preparing dessert |
| 03_labels.webp | Three **sealed, upright**, unlabelled white-powder jars; blank paper labels falling |
| 04_fatima.webp | Fatima (black hijab, beige blazer) halting preparation |
| 05_hamad.webp | Hamad, approved exact portrait identity, navy vest/tablet at the station |
| 06_laboratory.webp | Separate samples and controlled virtual conductivity investigation table |
| 07_ions.webp | Hamad beside an **empty** dark-blue display; website adds ionic model |
| 08_second_test.webp | Beakers, pH and virtual acid setup **before** revealing results |
| 09_decision.webp | Hamad, Fatima, Mariam, Saeed await the student decision |
| 10_outcome.webp | Relief at confirmed safe food-grade replacements; original jars quarantined |

Save Ocean Dome scenes to:

`public/images/scenarios/ionic_aquarium_mystery/story/`

| Filename | Content |
|---|---|
| 01_aquarium.webp | Wide cinematic marine educational gallery at Al Qana |
| 02_preparations.webp | Noora and Khalid preparing a **separate isolated** demonstration loop |
| 03_clouding.webp | Milky isolated demo loop with white panel deposits; **no animal distress** |
| 04_staff.webp | Noora halts demonstration; Khalid checks equipment |
| 05_hamad.webp | Approved Hamad faces sample with research tablet; aqua/teal lighting |
| 06_evidence.webp | Scientific mineral analysis bench; only isolated mineral samples |
| 07_carbonate.webp | Controlled isolated virtual carbonate gas-reaction close-up |
| 08_formula.webp | Hamad gestures toward blank display, ready for charge-balancing UI |
| 09_crystal.webp | Hamad beside space for interactive crystal explorers (no baked-in models) |
| 10_water.webp | Virtual pH/calcium/alkalinity investigation panel background |
| 11_decision.webp | Noora, Khalid, Hamad weigh isolated loop evidence |
| 12_outcome.webp | Calm team with isolated apparatus still under professional review |

**Important:** The filenames in this table are a future production manifest. Files have **not** been generated in this branch. Until they exist, the player uses the existing `dessert-park.webp` or `aquarium-lab.webp` artwork.

## Optional MiniMax H3 consequence clips

Save each 14-second 16:9 clip after it has been produced. The player gracefully omits missing clips and always shows the text-script outcome.

**Dessert:** `public/videos/scenarios/ionic_dessert_mystery/` with:

- `ending-verify-replace.mp4`: isolated unknowns, sealed verified food-grade replacements.
- `ending-conductivity-only.mp4`: unverified ingredient held, preparation delayed.
- `ending-taste.mp4`: Hamad stops tasting before any jar opens.
- `ending-appearance.mp4`: identical powders fail visual identification.

**Ocean Dome:** `public/videos/scenarios/ionic_aquarium_mystery/` with:

- `ending-isolate-review.mp4`: isolated demo, qualified monitoring review, animal exhibits untouched.
- `ending-add-salt.mp4`: simulated dissolved-ion load rises, deposit persists.
- `ending-acid-tank.mp4`: Hamad blocks an unsafe animal-exhibit dosing proposal.
- `ending-appearance-only.mp4`: visible deposit clears then recurs without source control.

Use the corresponding ending illustration as starting and ending keyframe reference, maintaining the *same* 2D art direction and exact recurring-character portraits. Keep numerical evidence and speech bubble text out of generated video.

## Scientific source of truth

Never change the educational simulation output to fit generated media. `src/data/ionicScience.mjs` controls dessert A (sucrose), B (sodium hydrogen carbonate), C (sodium chloride) as well as the calcium/carbonate mineral formula and virtual water model. `src/data/ionicMissions.mjs` defines all final professional decisions, educational consequences and the five assessment questions.

## Review checks

- `npm run test:unit`
- `npm run build`
- `npx playwright test tests/ionic-missions.spec.js` (or configured UI test command)
- Verify desktop, tablet, phone, reduced-motion, audio-disabled, and teacher-preview experiences.
- Inspect for missing-image or optional-video requests. Nonexistent files must never block the scientific mission.

**Do not merge/deploy without teacher approval.**
