---
phase: 2
plan: 3
wave: 3
---

# Plan 2.3: Hackathon Discovery View

## Objective
Allow users to view upcoming hackathons and mark their interest or formally register using distinct internal states.

## Context
- .gsd/SPEC.md
- apps/api/prisma/schema.prisma

## Tasks

<task type="auto">
  <name>Hackathon APIs</name>
  <files>
    apps/api/src/routes/hackathons.ts
    apps/api/src/index.ts
  </files>
  <action>
    - Create endpoints in `routes/hackathons.ts`:
      - `GET /api/hackathons` (List - sorted by `startDate` asc, then `createdAt` desc)
      - `GET /api/hackathons/:id` (Detail - return single hackathon)
      - `POST /api/hackathons/:id/interest` (Mark Interest)
      - `POST /api/hackathons/:id/register` (Register)
    - Mount `/api/hackathons` in `index.ts`.
  </action>
  <verify>curl -X OPTIONS http://localhost:3001/api/hackathons</verify>
  <done>Endpoints exist for fetching hackathons and marking interest/registration.</done>
</task>

<task type="auto">
  <name>Frontend Discovery UI</name>
  <files>
    apps/web/src/app/dashboard/hackathons/page.tsx
  </files>
  <action>
    - Build `apps/web/src/app/dashboard/hackathons/page.tsx` to fetch and list hackathons (e.g., via standard fetch or TanStack Query if set up).
    - Display hackathons as cards showing dates, location/mode, and description.
    - Include "Mark Interest" and "Register" buttons that call the respective APIs.
    - Show appropriate loading and success states when interacting with the buttons.
  </action>
  <verify>npm run build --prefix apps/web</verify>
  <done>Discovery page renders hackathon cards with functioning action buttons.</done>
</task>

## Success Criteria
- [ ] Hackathons are sorted by nearest start date first.
- [ ] Users can click Register or Mark Interest to update internal database state independently.
