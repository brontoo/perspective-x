# Localized homepage flyaway cleanup

Removed the thin golden flyaway hair lines from the approved hijab artwork. The edit uses the image tool's cleaned result only inside two small, feathered selections beside the scarf and above/alongside the head. All pixels outside those selections are copied from the original photograph without alteration. The face, body, and tablet have additional explicit protection from the selections.

- [Before detail](before-detail.png)
- [After detail](after-detail.png)
- [Retouch selection mask](selection-mask.png) — white permits editing; black preserves the original.
- Homepage comparisons: [desktop before](before-home-desktop.png) / [after](../homepage-reference/home-1672x941.png), [tablet before](before-home-tablet.png) / [after](../homepage-reference/home-768x1024.png), [mobile before](before-home-mobile.png) / [after](../homepage-reference/home-390x844.png).
- [All updated homepage screenshots](../homepage-reference/README.md)

The final image remains a lossless **1888 × 833** PNG. Exactly **70,569 of 1,572,704** pixels differ, all within the two selected areas. There are **zero** changed pixels outside the selections. The face, body, and tablet protection areas are pixel-identical. The new unit regression checks these constraints and bounds the permitted mask regions so that expanding a mask across the portrait or scene cannot silently pass.

The previous master and `public/images/perspective/home-cinematic.webp` remain unchanged. The new asset has a new filename so cached versions of the old artwork cannot hide the cleanup. Both the CSS background and existing cloud renderer use the same retouched image. Cloud masks, animation settings, soundtrack, layout, typography, branding, account details, navigation, and every other page are unchanged by this follow-up.

## Validation

- Production build, lint, and typecheck passed.
- All 19 unit tests passed, including exact pixel preservation and the existing original-artwork hash check.
- All 69 existing browser regression tests passed for cloud motion, viewport fit, navigation, soundtrack, account behavior, Our Story, and approved internal pages.
- Browser screenshots use synthetic account fixtures; live authenticated Supabase QA remains unverified.

Changes remain on the existing development branch and pull request for Preview review. No production deployment is authorized by this follow-up.
