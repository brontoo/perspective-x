# Perspective X remaining portal review

Feature branch: `feature/remaining-portal-redesign`  
Pull request: https://github.com/brontoo/perspective-x/pull/4  
Preview: https://perspective-x-git-feature-rema-1a809b-elavukatoo-7058s-projects.vercel.app  
Code and tests: [PR #4 commit history](https://github.com/brontoo/perspective-x/pull/4/commits)  
Protected production/main baseline: `2b3a2f7e4b9a5eb0e5282e76e44c77a51480e01f`

**Preview review only. Production is unchanged. The user must approve the preview before any merge.** Vercel reported the Preview deployment successful. Direct access returns HTTP 302 to Vercel SSO; the owner must sign in. The screenshots here are actual local Chromium renders using synthetic Supabase browser fixtures, not screenshots of an authenticated deployed preview.

## Redesigned interfaces

| Interface | Result |
| --- | --- |
| Roles | Nine responsive profession cards with distinct fictional role mentors, optimized artwork, actual mission counts and saved progress. |
| RoleHub | Cinematic role header, mentor, progression strip, grid/path views, original mission imagery, availability/teacher-lock states, and preserved notebook review. |
| ScenarioPlayer | Five visible chapters around the original video, scientific evidence, decisions, consequences, reflection questions, and final assessment. |
| Mission Notebook | Captured scientific responses plus personal notes; explicit backend save status; read-only review of graded/historical attempts; native keyboard-accessible dialog. |
| Completion | Actual final-check score, original badge tier, formative reasoning feedback, failed-check guidance, notebook, replay, next eligible mission, dashboard and reflection links. |
| Certificate | Confirmed passing-result eligibility; actual student name/result; PNG and PDF export. |
| LearningPath | Six subject-specific overview cards, mission timelines, academic objectives/skills, actual progress and teacher recommendations. |
| RoleReflection | Meaningful professional reflection, local draft retention, actual Supabase append/readback instead of the prior Base44 placeholder. |
| ProfileSettings | Approved avatar collection, private-photo checks, own profile name/password updates, clear validation and account support. |
| Additional teacher tools | Scoped plum/ivory styling for existing assignments, locking, difficulty, feedback and analytics; redesigned student-answer review. Main TeacherDashboard is unchanged. |
| Missing page | Consistent Supabase-backed navigation and useful Home/dashboard/role links. |

## Preserved work and PR #1

The five approved page files—Home, SignIn, Dashboard, TeacherDashboard and LeaderboardPage—are byte-identical to main. Shared approved header/footer/CSS and original scenario data, answer keys, scoring helpers, learning-path relationships and intro-player source remain identical. Original audio/video files were not changed. `preservation.json` contains the hashes and checks.

PR #1 is still open and unmerged. Only its contextual `missionBlueprints.js` data and five chapter labels were adopted. Its replacement reflection activity and player/persistence code were not merged. The original scientific scene components, original reflection prompts, original MCQs/additional questions, 80% passing threshold and badge calculations remain in use for all sixteen missions. Minimal compatibility additions are `/Roles`, the legacy `/role-hub` route alias, the chapter-label correction in ExitTicket, accessible form labels and a typewriter fix that displays the exact source text instead of reading a mutable character index. Unused imports were removed so repository lint passes.

All nine original role IDs and all sixteen original scenario IDs are retained. The six original learning paths and their academic scenario relationships are unchanged.

## Saving and permissions

A notebook save inserts a new owned unassessed attempt. Subsequent updates apply only to that newly inserted ID, its owner, a null score and the expected revision. A graded result finalizes that attempt. Earlier graded records are never chosen for editing. Writes are queued to avoid overlapping saves. A failed write shows an error, retains current/local work, and does not award a recorded certificate or unlock the next mission. Reopening an earlier draft copies its responses into a separate new attempt for further edits.

Teacher preview is based on the authenticated profile role, never a URL flag. It makes no student-progress writes. Student launches recheck teacher settings and prerequisites. Historical notebook review is scoped to records loaded for the current user. Reflection submissions append unassessed `role_reflection` records and cannot count as passed missions.

The previous browser-only account deletion removed educational rows without deleting the authentication user. That incomplete destructive workflow is unavailable; Profile Settings directs the user to school administrator support. No production records were deleted or written during QA.

## Backend limitations requiring staging verification

Live authenticated Supabase QA is **unverified**, per the user's instruction to use synthetic browser fixtures. No migration was created. The existing backend's multi-attempt constraints, update/insert RLS and JSON revision filtering need staging verification. Role reflections use a nullable `scenario_id`; rejection by the actual schema is reported visibly and retains the local draft. Private avatar upload remains unavailable unless the existing helper can verify the bucket is private. Real account deletion needs a verified server-side workflow.

The browser checks validate application behavior against explicit synthetic contracts. They do not establish production RLS, real private-storage configuration or live database compatibility. Vercel SSO also prevents direct automated authenticated-preview visual verification from this environment.

## Validation and screenshots

Build, type check and repository lint pass. All **9 unit tests** pass. The combined browser suite completed **55 passed, 0 failed, 0 skipped** (4.1 minutes), including all **16 missions** through all five chapters and the original final assessments, all nine role journeys, all six learning pathways, all 23 existing UI tests, saving/reopening, failure states, locks, preview permissions, certificate PNG/PDF exports, profile updates, professional reflections, and teacher submission review. A final review check also exercises the assessment flow after a guard against double submission.

Remaining pages were checked at 1440, 1024, 768, 390 and 375 pixels without horizontal overflow. The approved pages were checked at their desktop reference sizes and 1024, 768, 430, 390 and 375 pixels. Native dialogs support Escape and focus handling. Screenshots were visually inspected for role artwork, mission workspaces, completion and mobile composition.

Open [the screenshot gallery](gallery.html) for each main interface, or select a PNG file in this directory. Screenshots use synthetic identities, results and feedback; application screens use actual authenticated application data. Original scientific inputs, answer keys and scoring were not replaced with demonstration values.

Cloud environment startup instructions were refreshed in the reusable configuration draft. Saving those instructions does not publish an environment snapshot.
