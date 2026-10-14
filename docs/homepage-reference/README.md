# Homepage reference implementation

The homepage follows the supplied hijab explorer reference: a separate plum navigation bar, sunset landscape, pink foreground flowers, live account area, left-aligned introduction, interactive buttons, Emirates Foundation footer branding, and a compact statistics panel. The interface is composed of React elements over photographic artwork; it is not a flattened screenshot.

The photographic background and foundation mark are image-edited reconstructions from the supplied reference. The original artwork remains in the repository. The new cloud masks use the new photograph's pixel coordinates and keep movement away from the explorer, sun, mountains, skyline, and interface. The existing soundtrack, its browser restrictions and mute preference, and the Our Story dialog remain intact.

Account names and avatars still come from the signed-in account. Counts still come from application roles/scenarios and the existing Supabase student-count query. The screenshots below use authorized synthetic browser fixtures with the name Riham and a student count of 41 for comparison with the reference; these are not live student records. Live authenticated Supabase QA remains unverified.

## Actual browser screenshots

Captured from the production build at 100% browser zoom, with reduced motion and music muted for reproducible still images. All four captures have document dimensions equal to the viewport, with no page errors.

- [Desktop — 1672 × 941](home-1672x941.png)
- [Desktop — 1440 × 900](home-1440x900.png)
- [Tablet — 768 × 1024](home-768x1024.png)
- [Phone — 390 × 844](home-390x844.png)

## Validation

- Production build, ESLint, and TypeScript checks passed.
- 18 unit tests passed.
- 68 affected browser tests passed, covering viewport fit, signed-in account details, soundtrack playback and cross-tab ownership, cinematic motion and static fallbacks, Our Story, and the four previously approved internal pages.
- A final build and screenshot capture passed after adjusting the footer mark contrast.

This change is limited to the homepage, its artwork, artwork-specific cloud masks, and corresponding tests. Dashboard, leaderboard, mission, assessment, and authentication logic are unchanged. A subsequent [sign-in character update](../signin-reference/README.md) changes only that page’s scenic background artwork. The separate ionic cinematic mission PR is not included. Publication is for pull request and Vercel Preview review; production is not changed by this branch.
