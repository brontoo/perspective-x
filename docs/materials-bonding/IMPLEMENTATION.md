# Materials & Bonding learning pathway

Route: `/LearningPath?path=materials_bonding`.

Adds one pathway containing, in order:

1. The Final Dessert: 12 Minutes to Disaster — 12 minutes.
2. Ocean Dome: The Water Is Turning White! — 18 minutes.
3. ATOM DIVE: Lost in the Invisible — 13 minutes.

The 43-minute Advanced pathway reuses the existing `LearningPath` page, shared catalogue, approved Ionic Materials Specialist artwork, header/footer, hero, mission timeline, progress bar, skills/objectives sidebar, mission/role links and completion distinction. No new CSS or alternate page layout is introduced. The shared catalogue also supplies the student dashboard and teacher pathway-recommendation options. The catalogue count is derived from its entries instead of retaining the old six-path wording.

Existing role prerequisites, teacher locks and passed-assessment progress rules are unchanged. Ocean Dome requires the earlier Dessert role mission. ATOM DIVE retains its existing independent role access. Only passed missions count; a failed result or unassessed draft does not complete a pathway activity. Completion shows the Materials & Bonding Specialist distinction through the existing pathway UI.

## Validation

- Build, lint and typecheck passed.
- Existing production-bundle all-role/all-pathway browser regression passed, including the added pathway. Its old fixed six-card expectation now uses the shared catalogue count.
- Additional browser inspection with authorized synthetic fixtures verified all three exact mission titles, ordered links, fresh/partial/complete progress, failed/draft exclusion, next-activity routing, completion distinction, teacher locks, original role prerequisites and loaded artwork.
- Visually inspected [desktop](screenshots/pathway-1440.png) and [mobile](screenshots/pathway-390.png). Layout has no horizontal overflow at 1440, 820 and 390 pixels. [Tablet](screenshots/pathway-820.png) and [catalogue card](screenshots/pathway-card.png) are also captured from the built application.

No mission content, scoring, authentication, schema, other pathway definition, production configuration or main branch is modified. Live authenticated Supabase/RLS QA remains unverified; the existing user authorization for synthetic fixtures applies. Changes are delivered through existing PR #22 and a Vercel Preview for review.
