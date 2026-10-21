# Cinematic choice panels — 2026-10-21

Ocean Dome's introductory responses, evidence interpretation, professional decisions and final assessment now share deep teal panels, restrained gold trim and explicit hover/focus/selection states. Numbered story choices retain their exact accessible answer names. Only Ocean Dome presentation files changed; handlers, science, scoring, media, timing and platform configuration are untouched. Reduced motion disables the short panel entrance.

Validation: build and lint passed; **27 unit tests** and **28 focused browser tests** passed. Browser checks cover original narration/fullscreen, all four consequences, saved progress, teacher permissions, scientific models and 80%/60% assessment outcomes, including decision/assessment contrast checks. Desktop 1440px, tablet 820px and mobile 390px choice panels were visually inspected, with no horizontal overflow and visible keyboard focus.

Screenshots: [desktop](screenshots/choices-1440.png), [tablet](screenshots/choices-820.png), [mobile](screenshots/choices-390.png), [keyboard focus detail](screenshots/choices-detail.png). These use synthetic browser fixtures. Live authenticated QA and physical Safari/iOS remain unverified. Preview only; no production publication.

---

# Playback validation — 2026-10-20

| Command | Result | Evidence |
| --- | --- | --- |
| `npm run test:unit` | **27 passed**, 0 failed | [Output](validation/auto-unit.txt) |
| `npm run lint` | Passed | [Output](validation/auto-lint.txt) |
| `npm run build` | Passed | [Output](validation/auto-build.txt) |
| `npm run test:ui` | **136 passed**, 0 failed/skipped | [Output](validation/auto-ui.txt) |

The current tests exercise Start-triggered **real MP3** playback and automatic ordered captions with no Next dialogue button. Controlled media events cover activity/decision gates, pause/resume, preserving typed input, hidden-tab pause, source cleanup, all four endings and automatic graded feedback. The full mission still saves evidence and passes/fails at the existing 80% threshold.

Native full screen is tested across a chapter transition, with notebook access and explicit exit. A denied Fullscreen API uses a viewport fallback with Escape and scroll restoration. Desktop/tablet/mobile captures verify readable controls without horizontal overflow. Blocked playback, missing recordings, missing illustrations and missing films retain accessible continuation.

Current captures: [desktop full screen](screenshots/fullscreen-desktop.png), [tablet full screen](screenshots/fullscreen-820.png), [mobile full screen](screenshots/fullscreen-390.png), [mobile Start](screenshots/start-390.png). Earlier manual-dialogue captures below are retained as historical integration evidence.

The review branch and Vercel Preview are published for review only. No merge or production deployment. Live authenticated Supabase QA and physical Safari/iOS playback remain unverified. Approved media files and scientific source data remain unchanged.

---

## Initial media integration — 2026-10-19

| Command | Result | Evidence |
| --- | --- | --- |
| `python scripts/audit-ocean-media.py` | Passed: 15 JPEGs, 6 MP4s, 92 MP3s; no decode/probe errors | [Inventory](asset-inventory.json) |
| `npm run test:unit` | **27 passed**, 0 failed/skipped | [Full output](validation/unit.txt) |
| `npm run lint` | Passed | [Full output](validation/lint.txt) |
| `npm run build` | Passed, production bundle generated | [Full output](validation/build.txt) |
| `npm run test:ui` | **134 passed**, 0 failed/skipped | [Full output](validation/ui-full.txt) |
| `npx playwright test tests/ocean-media.spec.js tests/ionic-missions.spec.js` | **26 passed** after the final workbench contrast adjustments | [Full output](validation/ui-focused.txt) |

The full mission and graded assessment captures were refreshed afterwards: [3 passed](validation/ui-captures.txt), followed by [2 assessment captures passed](validation/ui-assessment-captures.txt).

The full browser regression covers the existing homepage, soundtrack, sign-in/profile, student/teacher dashboards, leaderboard, other missions and teacher controls. Final focused checks additionally measure readable foreground/background contrast inside formula trays, decision choices and MCQs.

Ocean Dome coverage includes:

- Only active image/media requests; no voice recording before student permission.
- Actual approved MP3 decoding/playback and next-caption gating on its `ended` event.
- Deterministic synthetic media-event tests for pause, replay, mute, rate, history replay, visibility changes and releasing the previous source on navigation. These complement the real-file playback test; they do not substitute for it.
- Missing artwork, recording and film fallbacks with accessible caption continuation.
- All four committed decisions selecting exactly one corresponding video and matching Scene 14 dialogue.
- Unsupported first choices, unbalanced/nonminimal formulas and unsupported mineral identification requiring revision.
- The native HTML5 `DataTransfer` drop handler plus touch/keyboard ion-selection alternatives. Cross-scroll pointer drag emulation is not claimed as hardware touch validation.
- Real crystal-coordinate rotation/coordination and adjustable water chemistry; scientific instruments remain interactive.
- Notebook evidence, draft restoration, saved assessments, sequential unlocking, teacher locks and teacher-preview write protection.
- Five original MCQs, 80% badge success and 60% retry, with only the graded feedback recordings available after submission.
- Desktop (1440px), tablet (820px) and mobile (390px) layouts without horizontal overflow; reduced-motion video behaviour and camera fallback.
- SHA-256 preservation, all 12 image mappings, 92 unique speaker/scene/sequence mappings and six film paths.

Browser screenshots are captured from the implemented application using synthetic records. See [the screenshot gallery](screenshots/), including each ending and the 80%/60% assessment feedback. They are not reference mockups.

Production was not deployed or modified. Live authenticated Supabase QA and physical Safari/iOS playback remain unverified. The supplied ten-second film durations and missing question/option voice recordings are documented in [README](README.md#remaining-media-limitations).

Build/test output includes pre-existing Browserslist freshness and Node colour-environment notices; these did not fail the checks. No dependencies or lockfiles were changed.
