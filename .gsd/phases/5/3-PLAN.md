---
phase: 5
plan: 3
wave: 2
---

# Plan 5.3: Team Growth & Tags

## Objective
Allow team leaders to manage "Looking for" tags and invite solo users to join their existing team via the swipe interface.

## Context
- apps/api/src/routes/teams.ts
- apps/api/src/routes/swipes.ts
- apps/web/src/components/dashboard/TeamManager.tsx

## Tasks

<task type="auto">
  <name>Implement Tag Management</name>
  <files>apps/api/src/routes/teams.ts, apps/web/src/components/dashboard/TeamManager.tsx</files>
  <action>
    - Add `PUT /api/teams/:teamId/tags` endpoint with `requireTeamLeader` middleware.
    - Update/Create `TeamManager.tsx` to allow leaders to add/remove tags from the `lookingFor` array.
    - Reuse the existing Skill combobox for tag selection (free-text with seed list).
  </action>
  <verify>Update team tags and verify they persist in the database.</verify>
  <done>Leaders can signal what skills their team needs.</done>
</task>

<task type="auto">
  <name>Handle Team Invites in Swipes</name>
  <files>apps/api/src/routes/swipes.ts</files>
  <action>
    - Update `POST /api/swipes` logic:
      - If `sender` is a `LEADER` of a team for this `hackathonId` and `receiver` is solo.
      - If `sender` swipes RIGHT: 
        - Create a `Notification` record for the solo user (type: `TEAM_INVITE`, `relatedId`: `teamId`).
        - Broadcast via `pushNotification` helper.
        - Do NOT create a `Match` record yet (only created upon acceptance).
  </action>
  <verify>Swipe on a solo user as a leader and verify the `TEAM_INVITE` notification is created in DB.</verify>
  <done>Leaders can invite potential teammates via swiping using the Notification flow.</done>
</task>

## Success Criteria
- [ ] Leaders can set "Looking for" tags.
- [ ] Swiping on solo users as a leader triggers a `TEAM_INVITE` notification.
