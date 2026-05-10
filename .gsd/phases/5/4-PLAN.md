---
phase: 5
plan: 4
wave: 2
---

# Plan 5.4: Invitation Acceptance & UI

## Objective
Complete the team invitation loop by allowing solo users to accept invitations and join teams atomically.

## Context
- apps/api/src/routes/teams.ts
- apps/web/src/components/match/MatchOverlay.tsx

## Tasks

<task type="auto">
  <name>Implement Invite Acceptance</name>
  <files>apps/api/src/routes/teams.ts</files>
  <action>
    - Add `POST /api/teams/invites/:matchId/accept` endpoint.
    - Logic (Atomic Transaction):
      - Verify `matchId` exists and involves the current user.
      - Add user to the `TeamMember` table.
      - Add user to the `ChatMember` table for the team's group chat.
      - Notify the team leader of the new member.
  </action>
  <verify>Call acceptance endpoint and verify user is added to Team/Chat in DB.</verify>
  <done>Solo users can successfully join teams upon accepting invites.</done>
</task>

<task type="auto">
  <name>Update MatchOverlay UI</name>
  <files>apps/web/src/components/match/MatchOverlay.tsx</files>
  <action>
    - Add `matchType: 'team' | 'dm' | 'teamInvite'` prop.
    - Implement the `teamInvite` state:
      - Display "You've been invited to join [Team Name]".
      - Provide "Accept Invite" and "Decline" buttons.
      - Call the acceptance API on click.
  </action>
  <verify>Open MatchOverlay with 'teamInvite' type and verify buttons work.</verify>
  <done>User-friendly flow for joining teams after a mutual match/invite.</done>
</task>

## Success Criteria
- [ ] Users can join teams through the MatchOverlay UI.
- [ ] Joining a team atomically updates both Team and Chat memberships.
