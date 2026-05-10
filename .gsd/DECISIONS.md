# Phase 3 Decisions

**Date:** 2026-04-29

### Scope
- **Swipe Pools**: Hackathon-specific swiping only. Global "Explore" pool deferred to Phase 5.
- **Skill Filtering**: No complementary skill filtering in V1. Show all eligible users for the specific hackathon.

### Approach
- **Matching**: Atomic Transaction. A mutual right-swipe will atomically create:
  - `Match`
  - If neither user is in a team: Create `Team` (sender as LEADER), `Chat` (GROUP), and memberships.
  - If one or both already in teams: Still create a `Match` and `Chat` (DM), but do NOT auto-merge into existing teams (Phase 5 feature).
- **Notifications**: 
  - On a single RIGHT swipe: Create a `Notification` for the receiver ("Someone is interested in teaming up with you...").
  - On a MUTUAL match: Create a `Notification` for both ("You have a new match for [Hackathon]!").
- **Rationale**: Keeps Phase 3 focused on the core matching mechanic while satisfying REQ-12 (Notifications).

### Filtering Rules (Swipe Deck)
The swipe deck fetcher will exclude:
1. Current user.
2. Users already swiped on by the current user for this specific hackathon.
3. Users inactive for 7+ days (`lastActiveAt < now - 7d`).
4. Users already in a full team for this hackathon (Note: V1 default team size is 4).
5. Users ineligible due to college restrictions.

### Swipe State
- **LEFT Swipes**: Stored permanently. Users who are rejected will not reappear in the deck.
- **Rationale**: Simpler implementation and more predictable user experience for V1.

## Phase 4 Decisions

**Date:** 2026-05-10

### Scope
- **Notifications**: In-app only for V1. Delivered via Supabase Broadcast. No email/web push.
- **Chat**: Text only. No editing, no read receipts, no typing indicators.

### Approach
- **Realtime**: Supabase Broadcast instead of CDC. Backend receives message, saves to DB via Prisma, and publishes to Broadcast channel using service key. Frontend subscribes to channel using anon key.
- **Auth Integration**: No Supabase Auth/RLS needed. Better Auth handles authorization for posting messages (Express middleware). Channel subscriptions are scoped by chatId, and frontend subscribes only after loading the chat with backend permission check.

### Dependencies/Constraints
- Must verify @supabase/supabase-js is installed in apps/web and env vars are set in both apps/web/.env.local and apps/api/.env before starting Phase 4.

## Phase 5 Decisions

**Date:** 2026-05-11

### Scope
- **"Looking for" Tags**: Free-text using existing skill seed list. Reuse existing skill combobox component.
- **Explore Pool**: Includes everyone on the platform (no opt-in/out for V1).
- **Team Invitations**: "Invite to join my team" flow. Solo users get a specific invitation notification. Acceptance atomically adds them to the Team and Group Chat.

### Approach
- **Invitation Authority**: **Leader Only**. Only team leaders can swipe on solo users to invite them. Verified via `requireTeamLeader` middleware.
- **Team Merging**: **No team merging**. Matches between members of two different teams result in a standard 1:1 DM chat only.
- **Inactive Cleanup**: Teams are filtered out in UI/decks if the associated Hackathon `endDate` has passed.

### Component Architecture
- **SwipeDeck**: Add `mode: "hackathon" | "explore"` prop to handle different endpoints and UI context.
- **MatchOverlay**: Add `matchType: "team" | "dm" | "teamInvite"` to handle different CTA flows.

### Production Deployment
- **Domains**: `hackmatch.vercel.app` (Frontend) and `hackmatch-api.onrender.com` (Backend).
- **Environment Variables**:
  - Web: `NEXT_PUBLIC_API_URL`
  - API: `FRONTEND_URL`
  - Both: Neon DB string, Supabase keys, Better Auth secret.
