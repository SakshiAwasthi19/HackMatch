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
      - Have NOT been swiped on by the current user with `hackathonId: null`.
    - Register the route in `apps/api/src/index.ts`.
  </action>
  <verify>curl -X GET http://localhost:3001/api/explore/swipe-deck -H "Authorization: Bearer [TOKEN]"</verify>
  <done>Returns a list of users eligible for global networking.</done>
</task>

<task type="auto">
  <name>Implement Global Swipe Logic</name>
  <files>apps/api/src/routes/explore.ts</files>
  <action>
    - Implement `POST /swipe` in the same file.
    - Logic:
      - Record swipe with `hackathonId: null`.
      - If mutual RIGHT swipe:
        - Create a `Match` record with `hackathonId: null`.
        - Create a `Chat` record of type `DM`.
        - Create `ChatMember` records for both users.
        - Send "New Explore Match" notifications.
  </action>
  <verify>Submit a RIGHT swipe and verify Match/Chat creation in DB.</verify>
  <done>Mutual global swipes create 1:1 DMs as per REQ-08.</done>
</task>

## Success Criteria
- [ ] Users can fetch a global swipe deck.
- [ ] Mutual right-swipes in Explore mode create 1:1 DMs.
