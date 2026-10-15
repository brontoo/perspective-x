# Homepage strand cleanup

The active homepage image is `public/images/perspective/home-hijab-clean.png`. It removes the remaining fine curls and shiny hair-like lines above the crown, beside the forehead and temple, over the back of the hijab, and across the lower scarf. The earlier broad flyaway cleanup is retained. Continuous light along actual fabric edges and the original cloth folds remain visible.

## Before and after

- [Head before](before-head-detail.png) / [head after](after-head-detail.png)
- [Original broad flyaways](before-detail.png) / [current scarf detail](after-detail.png)
- Homepage: [desktop before](before-home-desktop.png) / [after](../homepage-reference/home-1672x941.png), [tablet before](before-home-tablet.png) / [after](../homepage-reference/home-768x1024.png), [mobile before](before-home-mobile.png) / [after](../homepage-reference/home-390x844.png).
- [All current homepage screenshots](../homepage-reference/README.md)

## Exact preservation

The image tool retouched close-ups of the head and scarf. Only selected corrections were composited onto the previous full photograph. The result remains a lossless **1888 × 833** PNG. In this correction, **88,055 of 1,572,704** pixels change relative to `home-hijab-retouched.png`. There are **zero** changes outside the selected areas and **zero** changes within the protected original face. The body and tablet are also protected by the regression checks.

The face protection follows its actual outline; the earlier rectangular protection had also excluded nearby background containing faint strands. All original facial pixels are retained, while the nearby hair artifacts can now be cleaned. Additional selections remove fine lines lying over dark fabric without replacing the whole portrait.

- [Current correction selections](remaining-strands-selection-mask.png)
- [Protected original face](protected-face-mask.png)
- [Head selections](head-selection-mask.png)
- [Scarf selections](scarf-selection-mask.png)
- [Earlier broad cleanup selections](selection-mask.png)

Original images remain unchanged, including the previous masters and `public/images/perspective/home-cinematic.webp`. A new active filename prevents old cached artwork from hiding this correction. Both the CSS scene and existing cloud renderer use the same corrected photograph. This follow-up does not change cloud masks, animation settings, soundtrack, layout, typography, branding, account details, navigation, or any other page.

## Validation

- Production build, lint, and typecheck passed.
- All 20 unit tests passed, including both pixel-preservation checks, protected face/body/tablet checks, permitted selection bounds, and the original-artwork hash check.
- All 69 browser regression tests passed for cloud motion, viewport fit, navigation, soundtrack, account behavior, Our Story, and approved internal pages.
- Browser screenshots use synthetic accounts; live authenticated Supabase QA remains unverified.

The changes are on the development branch and existing pull request for Preview review. Production is unchanged.
