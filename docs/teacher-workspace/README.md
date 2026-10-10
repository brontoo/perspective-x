# Organized teacher workspace

Teacher tasks now live in one accessible navigation: Overview, Students, Missions, Feedback, Analytics, and Class Debate. The global header contains portal destinations rather than another copy of task navigation.

Overview shows the existing live metrics, recent assessed work with individual review actions, and six learning resources. Duplicate quick actions, the review/support menu, the decorative teaching journey, and the nested teaching-tools disclosure are removed. A single active panel provides a title and purpose for each section. CSV reporting lives in Students and Analytics.

Mission controls retain difficulty, required status, locks, teaching guides, interactive teacher previews, and learning-path recommendations. Mission title/subject search and access filtering narrow the existing controls without changing scientific content or stored settings. Teaching guides and interactive previews have distinct labels.

The existing Supabase reads/writes, role checks, student-answer review, feedback forms, analytics, debate presentation, and export logic remain in place. Homepage, Sign-In, Student Dashboard, and Leaderboard source files and shared portal styling are unchanged by this change. CSS additions are scoped to the teacher workspace.

Validation: production build, lint, typecheck, 9 unit tests, and 35 browser checks against compiled output. Browser checks include teacher operations, the missing-avatar-column regression, student record integrity, keyboard navigation, CSV export, mission filtering, and 1440/768/390px teacher layouts. Teacher UI captures use synthetic browser identities and records; authenticated production Supabase QA is unverified. No production accounts or educational records were changed for testing.
