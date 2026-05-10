---
phase: 5
plan: 5
wave: 3
---

# Plan 5.5: Production & Polish

## Objective
Finalize the application for production deployment, including data cleanup and environment verification.

## Context
- apps/api/src/routes/swipes.ts
- apps/api/src/routes/teams.ts
- .github/workflows/deploy.yml (if exists)

## Tasks

<task type="auto">
  <name>Implement Inactive Filtering</name>
  <files>apps/api/src/routes/swipes.ts, apps/api/src/routes/teams.ts</files>
  <action>
    - Add logic to all swipe deck and team listing queries to exclude records where the associated `hackathon.endDate < now`.
    - This ensures that old hackathons and teams don't clutter the active experience.
  </action>
  <verify>Create an expired hackathon and verify it doesn't appear in the swipe deck.</verify>
  <done>Automatic cleanup of inactive/past events as per DECISIONS.md.</done>
</task>

<task type="auto">
  <name>Production Environment Audit</name>
  <files>apps/web/.env.production, apps/api/.env.production</files>
  <action>
    - Verify that `NEXT_PUBLIC_API_URL` and `FRONTEND_URL` are correctly set for production (Vercel/Render).
    - Ensure CORS configuration in `apps/api/src/index.ts` allows the Vercel domain.
    - Run a final `npm run build` locally to catch any last-minute TS or lint issues.
  </action>
  <verify>Run build and check environment variable injection logic.</verify>
  <done>System is ready for public deployment.</done>
</task>

## Success Criteria
- [ ] Past hackathons are automatically hidden from active decks.
- [ ] Production build passes and environment variables are validated.
