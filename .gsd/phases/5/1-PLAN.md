---
phase: 5
plan: 1
wave: 1
---

# Plan 5.1: Explore Loop Backend

## Objective
Enable global networking by implementing the Explore swipe pool. This allows users to find connections outside of specific hackathons.

## Context
- .gsd/SPEC.md
- .gsd/DECISIONS.md
- apps/api/src/routes/swipes.ts (for reference)
- apps/api/src/index.ts (to register new route)

## Tasks

<task type="auto">
  <name>Implement Explore Swipe Deck</name>
  <files>apps/api/src/routes/explore.ts, apps/api/src/index.ts</files>
  <action>
    - Create `apps/api/src/routes/explore.ts` with a `GET /swipe-deck` endpoint.
    - Logic: Fetch users who:
      - Are not the current user.
      - Are active in the last 7 days.
      - Have NOT been swiped on by the current user with `hackathonId: null` (global).
    - Register the route in `apps/api/src/index.ts`.
    - Note: Swiping will be handled by the existing `POST /api/swipes` endpoint by passing `hackathonId: null`.
  </action>
  <verify>curl -X GET http://localhost:3001/api/explore/swipe-deck -H "Authorization: Bearer [TOKEN]"</verify>
  <done>Returns a list of users eligible for global networking.</done>
</task>

## Success Criteria
- [ ] Users can fetch a global swipe deck from a dedicated endpoint.
