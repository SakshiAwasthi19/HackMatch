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
- apps/web/src/components/dashboard/ProfileView.tsx (or wherever team management is)

## Tasks

<task type="auto">
  <name>Implement Tag Management</name>
  <files>apps/api/src/routes/teams.ts, apps/web/src/components/dashboard/TeamManager.tsx</files>
  <action>
    - Add `PUT /api/teams/:teamId/tags` endpoint with `requireTeamLeader` middleware.
    - Create/Update a component in the dashboard to allow leaders to add/remove tags from the `lookingFor` array.
    - Reuse the existing Skill combobox for tag selection as per DECISIONS.md.
  </action>
  <verify>Update team tags and verify they persist in the database.</verify>
  <done>Leaders can signal what skills their team needs.</done>
</task>

<task type="auto">
  <name>Handle Team Invites in Swipes</name>
  <files>apps/api/src/routes/swipes.ts</files>
  <action>
    - Update `POST /api/swipes` logic:
      - If `sender` is a `LEADER` of a team for this `hackathonId`.
      - And `receiver` is a solo user (no team for this hackathon).
      - If `sender` swipes RIGHT: 
        - Instead of just a Match, record it as a `PENDING_INVITE` (or use existing Match/Notification flow).
        - Send a notification: "[Name] from [Team Name] wants you to join...".
  </action>
  <verify>Swipe on a solo user as a leader and verify the invite notification is sent.</verify>
  <done>Leaders can invite potential teammates via swiping (REQ-09).</done>
</task>

## Success Criteria
- [ ] Leaders can set "Looking for" tags.
- [ ] Swiping on solo users as a leader triggers an invitation flow.
