# Homepage reference implementation

The homepage follows the supplied hijab explorer reference: a separate plum navigation bar, sunset landscape, pink foreground flowers, live account area, left-aligned introduction, interactive buttons, restored Um Al Emarat School footer branding, and a compact statistics panel. The interface is composed of React elements over photographic artwork; it is not a flattened screenshot.

The photographic background is a detail-enhanced restoration of the supplied reference. The school mark is restored directly from the original approved artwork, using its lossless PNG rather than a lossy WebP copy. No substitute logo is drawn or generated. The original artwork remains in the repository. The new cloud masks use the new photograph's pixel coordinates and keep movement away from the explorer, sun, mountains, skyline, and interface. The existing soundtrack, its browser restrictions and mute preference, and the Our Story dialog remain intact.

Account names and avatars still come from the signed-in account. Counts still come from application roles/scenarios and the existing Supabase student-count query. The screenshots below use authorized synthetic browser fixtures with the name Riham and a student count of 41 for comparison with the reference; these are not live student records. Live authenticated Supabase QA remains unverified.

## Actual browser screenshots

Captured from the production build at 100% browser zoom, with reduced motion and music muted for reproducible still images. All four captures have document dimensions equal to the viewport, with no page errors.

- [Desktop — 1672 × 941](home-1672x941.png)
- [Desktop — 1440 × 900](home-1440x900.png)
- [Tablet — 768 × 1024](home-768x1024.png)
- [Phone — 390 × 844](home-390x844.png)
- [Retina — 1920 × 1080 at 2× pixel density](home-1920x1080-retina.png)
- [4K viewport — 3840 × 2160](home-3840x2160.png)

## Artwork quality and display resolution

The restored scenic master is a lossless 1888 × 833 PNG with refined cloud, landscape, cloth, and flower detail. The active version also includes a [localized flyaway cleanup](../homepage-retouch/README.md) that preserves every pixel outside the localized head/scarf corrections, with explicit protection for the original face, body, and tablet. This is the image tool's output resolution; it is not a native 4K photograph. Text, controls, and layout remain native browser elements that render at the display's pixel density. The original 1448 × 1086 approved PNG supplies the exact branding marks without additional lossy compression. Original artwork files remain available.

The cloud layer now uses up to 2× desktop pixel density instead of the previous 1.25× cap, with an 8.3-million-pixel limit. This avoids a softer animated overlay on Retina displays while keeping allocations bounded. The 4K screenshot demonstrates viewport fit and interface rendering, not additional native photographic pixels.

## Validation

- Production build, ESLint, and TypeScript checks passed.
- 20 unit tests passed.
- 69 affected browser tests passed, covering viewport fit, signed-in account details, soundtrack playback and cross-tab ownership, cinematic motion and static fallbacks, Our Story, and the four previously approved internal pages.
- The high-DPR regression verifies a 2× desktop animation buffer with a bounded 8.3-million-pixel allocation and safe graphics fallback. Mobile keeps its existing 1× animation budget.
- Desktop, tablet, phone, Retina, and 4K viewport captures passed with no scrolling or page errors.

This change is limited to the homepage, its artwork, artwork-specific cloud masks, and corresponding tests. Dashboard, leaderboard, mission, assessment, and authentication logic are unchanged. A subsequent [sign-in character update](../signin-reference/README.md) changes only that page’s scenic background artwork. The separate ionic cinematic mission PR is not included. Publication is for pull request and Vercel Preview review; production is not changed by this branch.
