# Homepage soundtrack review

Baseline: latest main, `61b1e0c7a0d9483178126a999efaca896a0bd107`.
Branch: `feat/homepage-soundtrack`. The separate Our Story PR #11 is not included or merged by this work.

## Implemented behavior

One homepage-owned audio element attempts playback on `/`, unless the visitor has manually muted music. A successful play fades to 15% over three seconds. The play request is unmuted at the intended audible level, so a zero-volume request is never used to evade the browser's autoplay decision. After permission succeeds, volume is reset to zero for the fade.

When playback is denied, the next trusted homepage pointer/keyboard interaction retries it. The speaker button starts or immediately mutes playback, persists the manual mute preference, and exposes actual playback state to assistive technology. Multiple attempts never create another player.

Native Web Locks provide exclusive ownership across same-origin tabs in the same browser profile. If another tab owns playback, this tab stays quiet. Browsers without Web Locks fail closed with an accessible unavailable state rather than risk overlapping sound. Mute preference changes propagate through local storage when available.

Hiding the tab pauses playback and releases ownership; returning attempts to resume only if manually unmuted and permitted by the browser. Navigation/unmount and pagehide immediately pause, silence and reset the element, cancel the fade, release ownership and abort/remove the media source. Pending play promises cannot leak sound onto another route or relinquish the lock while still starting.

The track loops natively with one stream. Its final second tapers toward silence, and the next loop fades in. Opening Our Story keeps the same player. There is no global sound provider and no change to mission audio, narration or videos.

The current user request supersedes the older ZIP's initially-off and 18% recommendations. No main merge or production publication is authorized by this delivery.

## Files

- `src/pages/Home.jsx`: import and mount one control before Enter Portal.
- `src/components/landing/HomepageSoundtrack.jsx`: ownership, lifecycle and playback.
- `src/components/landing/homepage-soundtrack.css`: homepage-scoped icon control and accessible status.
- `public/audio/homepage/hopeful-cinematic-journey.mp3`: exact original downloaded asset, not re-encoded.
- `docs/homepage-music-license.md`, retrieval metadata and license excerpt: creator/source/licensing record.
- `tests/homepage-soundtrack*.spec.js`, `tests/support/homepageAudio.js`: playback coverage.
- `tests/approved-ui.spec.js`: existing style comparison waits for UI/font readiness and uses a manual mute preference to keep dynamic music status deterministic; its style assertions remain intact.

## Verification

- `npm run build`, `npm run lint`, `npm run typecheck`: passed, no lint failures.
- `npm run test:unit`: 9 passed.
- Initial full `npm run test:ui`: 82 passed, one old style-only test timed out waiting for network idle after audio was introduced. The readiness assumption was corrected and the affected test passed on rerun.
- Final production-build verification: 25 passed, including all nine soundtrack tests, the corrected style comparison, homepage guest/authenticated routing, statistics, and ten viewport-fit checks.
- The exact bundled MP3 was probed at 113.580406 seconds and decoded by the browser. Native playback, nonzero PCM samples, 15% fade target and a real end-of-track loop were checked; no substitute or silent placeholder is used.
- Policy rejection and pending-play races use controlled failures/delays; successful playback and loops use the real MP3. Tab hiding is simulated through the visibility event, while cross-tab exclusivity uses real browser pages and Web Locks.
- Unsupported media, an actual missing-asset response, rapid toggles, preference persistence, late startup cancellation and immediate navigation reset were checked.
- Desktop/tablet/mobile screenshots reviewed at 1440 × 900, 768 × 1024 and 390 × 844.

Physical-device listening quality, native mobile-browser autoplay behavior and authenticated live Supabase QA remain unverified. Preview listening is the requested review step. The homepage artwork, original typography and layout, existing Our Story implementation on main, dashboards, sign-in, scientific assessments and mission media remain unchanged apart from the discreet new speaker control.

## Screenshots from the compiled app

![Desktop](screenshots/home-1440x900.png)
![Tablet](screenshots/home-768x1024.png)
![Mobile](screenshots/home-390x844.png)

See [license and original asset checksum](../homepage-music-license.md).
