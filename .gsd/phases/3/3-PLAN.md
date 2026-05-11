---
phase: 3
plan: 3
wave: 2
---

# Plan 3.3: Match Overlay & Team Naming Gate

## Objective
When a mutual match occurs, show a premium "It's a Match!" celebration overlay. If the matched users formed a new team, enforce the team naming gate — the leader MUST name the team before the group chat becomes accessible. This completes the match-to-team pipeline.

## Context
- .gsd/SPEC.md (REQ-07 — Atomic match, REQ-10 — Team naming mandatory before chat)
- .gsd/DECISIONS.md (team naming gate, notification triggers)
- apps/web/src/components/swipe/SwipeDeck.tsx (calls onSwipe which returns match result)
- apps/web/src/app/dashboard/hackathons/[id]/swipe/page.tsx (swipe page where overlay appears)
- apps/api/src/routes/swipes.ts (POST /api/swipes response includes matched, teamId, chatId)

## Tasks

<task type="auto">
  <name>Build Match Overlay Component</name>
  <files>apps/web/src/components/match/MatchOverlay.tsx</files>
  <action>
    Create `apps/web/src/components/match/MatchOverlay.tsx`:
    - Props: `{ isOpen: boolean, matchedUser: { id, name, image }, teamId?: string, chatId: string, hackathonName: string, onClose: () => void }`
    - Full-screen overlay with backdrop-blur and dark semi-transparent bg.
    - Use `framer-motion` for entrance animation:
      - Scale from 0 to 1 with spring physics.
      - Confetti-like particle burst animation (use CSS keyframes for floating colored dots — no external library needed).
    - Content (centered):
      - Large "It's a Match! 🎉" heading with gradient text (indigo to purple).
      - Both user avatars side by side (current user + matched user) with a connecting line/spark animation.
      - Hackathon name below.
      - If `teamId` exists: "You've formed a new team!" message + "Name Your Team" button (primary, indigo).
      - If no `teamId` (DM match): "You matched! Start a conversation." message + "Open Chat" button.
    - "Name Your Team" button navigates to a team naming flow (inline input or navigates to `/dashboard/teams/${teamId}`).
    - "Open Chat" navigates to `/dashboard/chats/${chatId}` (placeholder route — Chat UI is Phase 4).
    - "Continue Swiping" secondary button calls `onClose()`.
  </action>
  <verify>cd apps/web && npx tsc --noEmit</verify>
  <done>
    - MatchOverlay renders with celebration animation.
    - Shows correct UI for team match vs DM match.
    - Navigation buttons are functional.
  </done>
</task>

<task type="auto">
  <name>Build Team Naming Gate & API</name>
  <files>
    apps/api/src/routes/teams.ts,
    apps/api/src/index.ts,
    apps/web/src/components/team/TeamNamingGate.tsx
  </files>
  <action>
    **1. Create `apps/api/src/routes/teams.ts`**
    Backend endpoint for team name management:
    - `PUT /api/teams/:teamId/name` — Requires auth.
      - Body: `{ name: string }` (min 2 chars, max 50 chars).
      - Verify the requesting user is the LEADER of this team: `prisma.teamMember.findFirst({ where: { teamId, userId, role: 'LEADER' } })`.
      - If not leader: Return 403 "Only the team leader can name the team".
      - Update: `prisma.team.update({ where: { id: teamId }, data: { name } })`.
      - Return updated team.
    - `GET /api/teams/:teamId` — Requires auth.
      - Verify requesting user is a member of this team.
      - Return team with members (include user profiles) and associated chat.

    Mount in `apps/api/src/index.ts`:
    - `import teamRouter from './routes/teams';`
    - `app.use('/api/teams', teamRouter);`

    **2. Create `apps/web/src/components/team/TeamNamingGate.tsx`**
    A blocking overlay/modal for team naming:
    - Props: `{ teamId: string, isLeader: boolean, onNamed: (name: string) => void }`
    - If `isLeader`:
      - Show a centered modal with "Name your team to unlock the group chat" heading.
      - Text input for team name (styled consistently, dark theme).
      - "Save Team Name" submit button. On submit, PUT to `/api/teams/${teamId}/name`.
      - Validation: non-empty, 2-50 chars.
      - On success: call `onNamed(name)`.
    - If NOT leader:
      - Show a waiting state: "Waiting for your team leader to name the team..."
      - Could optionally poll `/api/teams/${teamId}` every 5 seconds to check if name is set.
    - This component will be used in Phase 4's Chat page as a gate before showing messages.
      For now, it is self-contained and can be rendered standalone.

    **3. Integrate MatchOverlay into Swipe Page**
    Update `apps/web/src/app/dashboard/hackathons/[id]/swipe/page.tsx`:
    - Replace the placeholder `alert('It's a Match!')` with `<MatchOverlay>`.
    - Track state: `matchResult: { matchedUser, teamId?, chatId, hackathonName } | null`.
    - When `onSwipe` returns `{ matched: true, ... }`, set `matchResult`.
    - Render `<MatchOverlay isOpen={!!matchResult} ... onClose={() => setMatchResult(null)} />`.
  </action>
  <verify>cd apps/api && npm run type-check && cd ../../apps/web && npx tsc --noEmit</verify>
  <done>
    - MatchOverlay integrates into swipe page and triggers on mutual match.
    - Team naming API validates leadership and updates team name.
    - TeamNamingGate enforces naming before chat access.
    - Both API and frontend type checks pass.
  </done>
</task>

## Success Criteria
- [ ] MatchOverlay shows celebration UI on mutual match
- [ ] MatchOverlay differentiates team match (with naming CTA) vs DM match (with chat CTA)
- [ ] PUT /api/teams/:id/name validates leadership and updates name
- [ ] TeamNamingGate blocks chat access until team is named
- [ ] Full integration: swipe → match → overlay → team naming flow works end-to-end
- [ ] Type checks pass for both API and web
