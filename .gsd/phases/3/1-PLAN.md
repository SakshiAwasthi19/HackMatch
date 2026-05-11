---
phase: 3
plan: 1
wave: 1
---

# Plan 3.1: Swipe Engine Backend

## Objective
Build the backend API for the swipe-to-match mechanic — the swipe deck fetcher and the swipe POST handler with atomic match transaction. This is the core business logic of HackMatch.

## Context
- .gsd/SPEC.md (REQ-05, REQ-06, REQ-07, REQ-12)
- .gsd/DECISIONS.md (Phase 3 Decisions — filtering rules, matching logic, notification triggers)
- apps/api/src/routes/hackathons.ts (existing auth pattern with `requiredAuth` middleware)
- apps/api/src/middlewares/requireAdmin.ts (existing `auth.api.getSession` pattern)
- apps/api/prisma/schema.prisma (Swipe, Match, Team, Chat, Notification models)
- packages/types/src/index.ts (existing Swipe, Match, Team, Notification interfaces)

## Tasks

<task type="auto">
  <name>Create Swipe Routes</name>
  <files>apps/api/src/routes/swipes.ts, apps/api/src/index.ts</files>
  <action>
    Create `apps/api/src/routes/swipes.ts` with two endpoints:

    **GET /api/hackathons/:hackathonId/swipe-deck**
    - Requires auth (reuse `requiredAuth` pattern from hackathons.ts).
    - Query the `User` table with these WHERE conditions:
      1. `id: { not: currentUserId }` — exclude self
      2. `lastActiveAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }` — active within 7 days
      3. `receivedSwipes: { none: { senderId: currentUserId, hackathonId } }` — not already swiped
      4. Subquery to exclude users in a full team (4 members) for this hackathon:
         `teamMemberships: { none: { team: { hackathonId, members: { _count: { gte: 4 } } } } }`
         NOTE: Prisma doesn't support `_count` in nested `none` filters directly. Instead, do a two-step approach:
         - First fetch team IDs that are full: `prisma.team.findMany({ where: { hackathonId, members: { some: {} } }, include: { _count: { select: { members: true } } } })` then filter where `_count.members >= 4` to get `fullTeamIds`.
         - Then get userIds in those teams: `prisma.teamMember.findMany({ where: { teamId: { in: fullTeamIds } }, select: { userId: true } })`.
         - Add `id: { notIn: [...fullTeamUserIds, currentUserId] }` to the main query.
      5. College eligibility: Fetch the hackathon first. If `eligibilityType === 'COLLEGE_SPECIFIC'`, add `college: { in: hackathon.eligibleCollegesList }` to the user query.
    - Include `skills: { include: { skill: true } }` in the result so profile cards can show skills.
    - Return array of user profiles (limit 20 per batch).

    **POST /api/swipes**
    - Requires auth.
    - Body: `{ receiverId: string, hackathonId: string, type: 'LEFT' | 'RIGHT' }`
    - Create the Swipe record using `prisma.swipe.create()`.
    - If `type === 'LEFT'`: Return `{ matched: false }`.
    - If `type === 'RIGHT'`:
      a. Create a `Notification` for the receiver: `{ userId: receiverId, type: 'INTEREST', content: 'Someone is interested in teaming up with you for [hackathon name]!', relatedId: hackathonId }`.
      b. Check for reciprocal swipe: `prisma.swipe.findFirst({ where: { senderId: receiverId, receiverId: currentUserId, hackathonId, type: 'RIGHT' } })`.
      c. If NO reciprocal: Return `{ matched: false }`.
      d. If MUTUAL MATCH: Execute `prisma.$transaction(async (tx) => { ... })`:
         - Check if sender is in a team for this hackathon: `tx.teamMember.findFirst({ where: { userId: currentUserId, team: { hackathonId } } })`.
         - Check if receiver is in a team for this hackathon: same query for receiverId.
         - **Case 1 — Neither in a team**:
           1. `tx.team.create({ data: { hackathonId } })` — name is null (naming gate enforced by frontend)
           2. `tx.teamMember.create({ data: { teamId, userId: currentUserId, role: 'LEADER' } })`
           3. `tx.teamMember.create({ data: { teamId, userId: receiverId, role: 'MEMBER' } })`
           4. `tx.chat.create({ data: { type: 'GROUP', teamId } })`
           5. `tx.chatMember.create({ data: { chatId, userId: currentUserId } })`
           6. `tx.chatMember.create({ data: { chatId, userId: receiverId } })`
           7. `tx.match.create({ data: { user1Id: currentUserId, user2Id: receiverId, hackathonId, teamId } })`
         - **Case 2 — One or both already in a team**:
           1. `tx.chat.create({ data: { type: 'DM' } })` — no teamId
           2. `tx.chatMember.create()` for both users
           3. `tx.match.create({ data: { user1Id: currentUserId, user2Id: receiverId, hackathonId } })` — no teamId
         - Create mutual match `Notification` for BOTH users: `{ type: 'MATCH', content: 'You matched with [name] for [hackathon]!' }`.
         - Return `{ matched: true, teamId: team?.id, chatId: chat.id, matchedUser: { id, name, image } }`.

    Mount in `apps/api/src/index.ts`:
    - `import swipeRouter from './routes/swipes';`
    - `app.use('/api', swipeRouter);` — routes are prefixed internally as `/api/hackathons/:hackathonId/swipe-deck` and `/api/swipes`.
    
    IMPORTANT: Do NOT use `app.use('/api/swipes', swipeRouter)` because the GET route is nested under `/api/hackathons/:hackathonId/swipe-deck`.
    Use `app.use('/api', swipeRouter)` and define routes as `router.get('/hackathons/:hackathonId/swipe-deck', ...)` and `router.post('/swipes', ...)`.
  </action>
  <verify>cd apps/api && npm run type-check</verify>
  <done>
    - `tsc --noEmit` passes with 0 errors.
    - GET endpoint returns filtered user list.
    - POST endpoint creates Swipe, checks for mutual, and executes atomic transaction on match.
    - Notifications are created on single RIGHT swipe and on mutual match.
  </done>
</task>

## Success Criteria
- [ ] `GET /api/hackathons/:id/swipe-deck` returns filtered users (all 5 rules applied)
- [ ] `POST /api/swipes` with LEFT creates swipe only
- [ ] `POST /api/swipes` with RIGHT creates swipe + notification for receiver
- [ ] Mutual RIGHT creates Match + Team + Chat atomically (when both solo)
- [ ] Mutual RIGHT creates Match + DM Chat (when one/both in teams)
- [ ] Type check passes
