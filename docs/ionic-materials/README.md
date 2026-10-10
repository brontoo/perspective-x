# Ionic Materials Specialist

This additive role contains two fictional five-chapter missions featuring one shared Hamad Al Zaabi portrait and identity: Emirati, age 27, Applied Chemistry Field Investigator. Only his assignment and venue change. Existing roles, missions, assessments, homepage, soundtrack and introduction videos are retained.

## Review

- `/Roles` → Ionic Materials Specialist → Mission 1.
- `/RoleHub?role=ionic_materials_specialist`
- `/ScenarioPlayer?scenario=ionic_dessert_mystery`
- `/ScenarioPlayer?scenario=ionic_aquarium_mystery` (student must first have a saved Mission 1 assessment of at least 80%; teacher locks take priority).
- An authenticated teacher can preview both through Teacher Dashboard → Missions and set their existing access/difficulty controls. Preview does not write student progress. Synthetic fixtures test these paths; live authenticated Supabase QA is unverified.

No video was generated. The static briefing is immediately playable. Upload the user's introductions to these reserved files in a future change:

```
public/videos/scenarios/ionic_dessert_mystery.mp4
public/videos/scenarios/ionic_aquarium_mystery.mp4
```

The briefing checks the exact video path and content type; an absent file or SPA fallback does not block the mission. A later available MP4 appears with native controls, a static poster and a briefing text alternative. It pauses when the document is hidden and stops on leaving the briefing.

## Textbook alignment

Reviewed the user-supplied scanned `10 advanced - chapter3.pdf` (18 pages), UAE Inspire Science Chemistry, Student Edition 2025–26, printed pp. 63–80. The textbook is not republished in this repository.

| Printed pages | Core content | Mission use |
| --- | --- | --- |
| 63–67 | Valence electrons; electron loss/gain; cations/anions; stable outer levels | Na/Cl and Mg/O transfer models; nuclei and total electrons are conserved |
| 68–74 | Ionic attraction; repeating lattice; properties; fixed versus mobile ions; brittleness | Solid/solution conductivity; six neighbours in NaCl; shear demonstration; crystal explorer |
| 75–80 | Neutral formula units in the simplest ratio; ionic charges; polyatomic ions; naming | Charge/count builder, parentheses, CaCO₃, NaHCO₃ and Al₂(SO₄)₃; final assessments |

Table 9 (p. 78) includes carbonate, hydrogen carbonate, sulfate, ammonium and hydroxide. The textbook's illustrated CaCO₃ form is **aragonite**. The explorer explicitly labels **calcite as an extension reference**, a different CaCO₃ polymorph.

Independent pH/gas tests, mineral fingerprints and qualitative water trends are scenario extensions, not claims that those techniques appear in Chapter 3. All measurements are fictional, illustrative reference evidence. Conductivity alone cannot identify a compound. Identification does not certify food safety: unknowns remain quarantined and fresh sealed, labelled food-grade replacements are used. Aquarium tests concern separate virtual samples and an isolated fictional educational loop, with no animal-system dosing.

## Model definitions and limits

- **Ion transfer:** Na (11 protons/electrons) → Na⁺ (10 electrons), Cl (17) → Cl⁻ (18); Mg loses two and O gains two. Protons remain unchanged. Dissolution separates pre-existing ions.
- **NaCl:** 6 × 6 × 6 alternating sites, 2.82 Å nearest-neighbour spacing (5.64 Å conventional cubic cell); equal Na/Cl counts and six opposite-charge neighbours at an interior site. Shear shifts upper layers by one ion spacing and demonstrates like-charge alignment across a slip plane, not a molecular-dynamics fracture calculation.
- **Calcite:** rounded conventional hexagonal cell for trigonal R−3c, a = 4.99 Å, c = 17.061 Å, oxygen x = 0.2578. R centering, Ca sites z = 0/½, carbonate carbon z = ¼/¾, and alternating planar oxygen triads. The cell contains six Ca, six C and eighteen O atoms; C–O bonds ≈ 1.286 Å and six nearest Ca–O distances ≈ 2.357 Å. Periodic neighbours are added when coordination is displayed. Carbonate is an intact polyatomic ion; C/O are not rendered as independent free ions. Sphere radii are illustrative. This is an educational coordinate model, not a diffraction/refinement application.
- **Rotation:** real 3D coordinates projected after yaw/tilt; pointer/touch drag, full 360° slider and keyboard controls. No static crystal screenshot is used as the interaction.
- **Formula builder:** real HTML drag/drop plus equivalent touch/keyboard buttons; integer counts, total charge, simplest ratio, and intact polyatomic subscripts/parentheses.
- **Water trend:** `(calcium / 420) × (alkalinity / 2.4) × 10^(pH − 8.1)`, relative to the fictional starting sample. Explicitly qualitative; not Ksp, seawater saturation, real aquarium data or chemical dosing guidance.
- **Powders:** equal 0.10 g / 100 mL at 25°C; A 4 μS/cm, pH 7, no gas; B 1100 μS/cm, pH 8.3, CO₂; C 1930 μS/cm, pH 7, no gas. Real readings depend on concentration, background ions and instrument conditions.
- **Assessment:** exactly five MCQs per mission, 4/5 (80%) required. Identification feedback appears only after committing a hypothesis; MCQ answer/explanation feedback only after submitting all five. Four choices lead to four authored consequences per mission.

## Persistence and isolation

The new renderer is lazy-loaded only for `interactiveIonic` missions inside the existing ScenarioPlayer. It uses the existing five chapter navigation, attempt writer, assessment result, completion/badge/certificate and sequential unlock logic. Investigation observations and instrument states are captured in `answers.investigation`; final responses retain the existing `scene1`, `scene2`, `reflection` and `exitTicket` fields. Personal notebook notes remain separate. Current evidence appears in Mission Notebook before the investigation is completed. Drafts restore in the investigation; failed saves cannot unlock the next mission; prior assessed records are preserved.

Artwork is original generated still artwork for these fictional scenarios. The same `hamad-al-zaabi.webp` is used in both briefings; the role thumbnail is a byte-identical copy. Environment plates are venue-inspired fictional settings, not documentary photographs or endorsed depictions. Generated videos, audio components and production database migrations are absent.

## Validation

```sh
npm run build
npm run lint
npm run typecheck
npm run test:unit
npx playwright test --config playwright.built.config.js
```

Browser tests use only synthetic student/teacher fixtures. The new tests cover both full journeys, 80% and 100% passes, 60% failure, distinct decision outcomes, notebook/draft restoration, failed saving, teacher preview, prerequisites, real drag/drop, keyboard formula controls, crystal rotation/coordination/shear, water trends, no premature feedback, and 1440/820/390 px layouts. Existing mission tests continue to run for all sixteen original missions; the two new missions have their own complete interaction tests. Catalog counts are now eighteen missions and ten roles; the six existing learning pathways are unchanged.

Actual built UI screenshots are in [screenshots/](screenshots/). Production and main are not changed by this feature branch.
