# Approved portal release — October 10, 2026

The user authorized publication of all approved pending changes to the existing GitHub main branch and https://perspective-x-two.vercel.app/.

This release combines:

- PR #11: the approved cinematic Our Story dialog, responsive content, Close/Escape and focus restoration.
- PR #12: the exact licensed homepage soundtrack, 15% volume, three-second fade, mute persistence, homepage-only playback and cross-tab ownership; removal of Worlds & Missions and replacement of Enter Portal with the visitor's own name/avatar.
- PR #13: the teacher banner's date followed by Today's focus, with the panel lowered to reveal more of the museum dome.

The separately excluded five-chapter mission PR #1 is not part of this release. Scientific content, assessment logic, original mission media and authentication connections are unchanged by the release.

The homepage import conflict was resolved by preserving both OurStoryDialog and HomepageSoundtrack. Our Story's existing visual-restoration test now waits for the replacement guest Sign In link and mutes music for its screenshot comparison; playback remains covered separately.

Pre-publication validation of the combined production build:

- Build, lint and typecheck passed.
- All 9 unit tests passed.
- All 88 browser tests passed, including original assessment and record flows, teacher controls, access restrictions, profile-schema compatibility, homepage/dialog responsiveness and native MP3 playback/lifecycle checks.
- Bundled MP3 SHA-256: `8a1cb88ac223b9dea1369c8db6374bc6a142e32518c992c25f430e726b1b4256`.

Authenticated browser tests use the user's authorized synthetic Supabase fixtures. Live authenticated account QA, physical-device listening and native mobile-browser autoplay behavior remain unverified. Vercel deployment readiness and public production checks are verified after publication and reported separately.
