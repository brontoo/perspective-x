# Approved cinematic homepage

The owner explicitly superseded the original homepage freeze and authorized implementing, merging and deploying only the approved cinematic homepage. Original reference: `assets/approved/01_HOMEPAGE_LOCKED.png` in handoff 2026-10-10.1.

The pink/plum/gold sunset plate preserves the reference's tablet-holding explorer, skyline, mountains and flowers. Image editing removed interface overlays from a copy; original handoff PNG remains untouched. Text, links, buttons, translucent frame, footer and statistics are React/CSS, not a full-screen screenshot. The branding source is an optimized copy of the approved reference used only for the logo and official footer mark crops via cropped SVG image viewboxes with a luminance filter removing the dark screenshot backdrop; institutional marks were not invented. Homepage CSS is scoped to `.px-home`. The cinematic desktop composition is adapted at tablet/mobile sizes; catalogue sections below it keep role discovery and Our Story accessible.

Enter Portal and Start Your Mission route guests to SignIn, students to Dashboard and teachers to TeacherDashboard based on the actual profile role. Authenticated account name/avatar comes from the user profile and existing shared avatar renderer. Creator attribution remains in the footer. Auth changes refresh the account, and only the owner's profile is queried.

Scenario/role counts derive from the existing SCENARIOS and ROLES catalogues (currently 16 and 9). Registered Students uses the backend exact profile count with student filter and HEAD query; it retrieves no student records. The approved screenshot's sample 10+/6/41+ is not hardcoded. A denied/failed/unavailable count displays an em dash with an unavailable label. Count visibility depends on existing RLS; this patch does not change backend policies or claim registered users are recently active.

Protected files: the four deployed pages, ProfileSettings, all shared internal-page components/styles/adapters, Supabase client/configuration, mission data/components/player, scoring, media, routing and global styling have zero changes against main 2d2245a. No database changes. PR #1 is excluded.

Validation includes build/type checking, changed-file lint, five unit tests, and the existing internal-page browser suite plus guest/authed homepage routing, identity, unavailable counts, desktop/tablet/mobile overflow, screenshots and stylesheet isolation. Browser identities and all mutation requests are synthetic fixtures, never production writes. Full lint has existing unrelated unused-import failures, documented in the earlier UI review.

Local verification: build and typecheck passed; 5 unit tests, 23 browser tests passed; final homepage/stylesheet focus tests passed; changed React files pass lint. Desktop 1448×1086, tablet 1024/768 and mobile 390/375 were inspected and checked for overflow.
