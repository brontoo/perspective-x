# Perspective X — Approved "Our Story" modal implementation

**STATUS: APPROVED VISUAL DESIGN — implement exactly, not a new design proposal.**

## Project and target

- Existing repository: https://github.com/brontoo/perspective-x
- Page: homepage (`/`), opened by the **Our Story** item in the existing homepage navigation.
- Reference: `assets/OUR_STORY_APPROVED_REFERENCE.png` (1536 × 1024; see `APPROVAL_MANIFEST.json`).
- The file is the approved *visual reference*, not an interactive HTML page or a suitable full-UI background image.
- Work against the latest `main` branch; create a new feature branch and preview for review. Do not merge or deploy to production without approval.

## Scope — change ONLY the Our Story dialog

Replace the existing small white/pink Our Story text dialog with a faithful responsive recreation of the approved cinematic modal. The reference's overall composition, visual hierarchy, and written content are approved. Do not redesign or change any unrelated homepage feature, hero art, character, navigation, role selection, live statistics, school/UAE footer, or other internal pages.

Currently the homepage already implements an accessible native `<dialog>` via `storyDialog.current.showModal()` in `src/pages/Home.jsx`, with styles in `src/components/landing/homepage.css`. Retain this working open/close behavior and adapt its modal content and styles. Prefer a dedicated `OurStoryDialog` component if that reduces complexity, but keep it local to the homepage and do not introduce a new general modal library.

## Exact composition to recreate

1. **Wide, landscape cinematic dialog** with rounded corners, elegant fine rose-gold border, subtle outer glow and shadow; presented over a dark plum blurred backdrop. The approved 1536×1024 image includes some backdrop around the dialog. The main panel visually occupies most of the center.
2. **Left storytelling zone: the larger readable zone**, with restrained dark plum translucent overlay so text remains legible. Oversized elegant serif title: two lines: `Real science.` and `Meaningful choices.` The second line uses a subtle rose-to-champagne gradient. Top-left small overline `OUR STORY` and a thin decorative rule.
3. **Copy, preserve verbatim:** `Perspective X invites learners to explore immersive scientific roles, tackle real-world challenges, and shape a more sustainable future for the UAE and beyond.` Give it generous horizontal room, readable line height, no crowding and no obstruction from the scenery.
4. **Right scenic zone: only Dubai's Museum of the Future** as the unmistakable architectural landmark, displayed within a captivating cinematic peach/pink/plum/gold sunset. A calm reflecting waterscape, restrained palms and atmospheric lighting are permissible as environmental context. **NO Burj Khalifa, no extra landmarks, and NO characters or people anywhere.** Do not reinstate any of the earlier globe, scientific orbit icons, busy mission cards, or other rejected decoration.
5. **Bottom journey illustration**: four small, elegant glass cards linked by a thin glowing path. Their labels, in order, are **Choose a Role → Enter a Mission → Make a Decision → See Your Impact**. Preserve their restrained scale, spacing, recognizable icons, and the clean, educational role-play message. They are informational cards, not extra navigation actions unless existing functionality explicitly requires otherwise.
6. **Creator credit:** `Um Al Emarat School · Riham Saleh — Portal Creator` inside the dialog. Use an existing verified school emblem only if supplied by the repository. Do not invent or misrepresent an institutional logo.
7. **Bottom-left `Close` button** using the approved outlined plum/rose luminous style and arrow. It must close the modal. The reference does not authorize replacing it with `Explore Roles`, creating extra buttons, or adding another character.
8. **Background emphasis:** the Museum of the Future should be clearly visible while **the story title and body text remain the visual priority**. Give the copy at least roughly half of the panel's practical width. Avoid the crowded right side from previously rejected variations.

### Content details

Keep the display text in English as approved. Preserve exact title, story paragraph, four role-play journey labels, creator credit, and Close label. Avoid invented slogans or metrics within the dialog.

### Color and visual treatment

Follow the approved image rather than an unrelated design system: cinematic deep plum/aubergine, dusky rose, warm champagne gold, soft peach sunset, translucent glass, discreet luminous edges. Ensure text remains readable against overlays, avoid strong bloom on small text, and avoid garish neon or new gradients outside the approved palette.

## Important asset instructions

- `OUR_STORY_APPROVED_REFERENCE.png` is a **flattened mockup** that contains baked-in text, journey cards, and button graphics. **Do not place this whole image behind live DOM text**; that would duplicate labels and make a nonfunctional UI.
- Build text, title, journey cards, button, and dialog behavior as real accessible HTML/React elements and CSS.
- You may use or derive a museum-only background image from appropriate local/authorized visual assets; ensure it contains **no baked-in UI text**. If no suitable source asset exists and accurate reconstruction is blocked, report this explicitly rather than inserting an unrelated landmark or generating a cluttered replacement.
- Optimize all added artwork (e.g., modern image format, suitable resolutions), and keep the source/design screenshot in docs or the review bundle, not as the production full-screen page image.

## Responsive behavior and accessibility

- Desktop: wide two-zone immersive composition, museum to the right, copy comfortable on the left, journey cards along the bottom.
- Tablet: reduce decorative spacing and possibly use two rows for the journey cards while retaining readable text.
- Mobile: stack the content and the museum scenery without obscuring the story; the dialog should fit viewport width and provide internal vertical scrolling where needed. No horizontal overflow.
- Preserve native dialog semantics (`<dialog>`, `showModal()`, Escape-to-close, keyboard focus). Restore focus to the `Our Story` trigger after closing. Give the dialog a clear accessible name via `aria-labelledby` and accessible Close control.
- Respect reduced-motion settings; keep animations brief and subtle. Provide meaningful contrast, readable typography, and visible focus styles.
- Do not alter the app's existing sign-in, auth, Supabase, role navigation, or progress functions.

## Relevant files to inspect

- `src/pages/Home.jsx` (current nav item and native `<dialog>`)
- `src/components/landing/homepage.css` (existing `.px-home .home-story-dialog` styling)
- Existing artwork and institutional branding under `public/images/` and other current public assets.

Use scoped `.px-home .home-story-*` selectors (or a scoped modal module) so the approved homepage and the four approved internal pages remain untouched. Avoid global CSS changes.

## Verification before handoff

1. Start from the latest `main`, implement in a new branch, and record the baseline commit.
2. Run the available `npm run build`, `npm run lint`, `npm run typecheck`, `npm run test:unit`, `npm run test:ui` (distinguish pre-existing failures from introduced regressions).
3. Confirm opening Our Story from `/` shows the updated dialog and no other homepage appearance changes.
4. Confirm text fidelity, four journey steps, Museum-of-the-Future-only backdrop, creator credit, and working Close / Escape behavior.
5. Capture and inspect screenshots at desktop (1440×900), tablet (768×1024) and mobile (390×844); check no clipped story text and no horizontal overflow.
6. Check overlay layering, keyboard focus, button contrast, and reduced-motion behavior.
7. Create a pull request and provide the URL, preview deployment URL, file diff, screenshots, and actual test results for approval. Do not declare the website deployed if it has not been deployed.

**Success condition:** pressing `Our Story` on the existing, unchanged Perspective X homepage opens a real, functioning modal whose visual appearance closely matches `assets/OUR_STORY_APPROVED_REFERENCE.png`, with the Museum of the Future as its only identifiable landmark, a larger elegant text region, and a four-step role-play journey.
