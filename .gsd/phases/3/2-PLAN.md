---
phase: 3
plan: 2
wave: 1
---

# Plan 3.2: Swipe Deck UI

## Objective
Build the premium Tinder-style swipe card interface. Users see a stack of profile cards for a specific hackathon and can swipe left (reject) or right (interested). This is the defining UX of HackMatch.

## Context
- .gsd/SPEC.md (REQ-05 — Tinder-style swipe UI)
- .gsd/DECISIONS.md (hackathon-specific pools only, no skill filtering)
- apps/web/src/app/dashboard/hackathons/page.tsx (existing hackathon listing — links will navigate here)
- apps/web/src/lib/auth-client.ts (useSession hook)
- apps/web/src/lib/utils.ts (cn utility)

## Tasks

<task type="auto">
  <name>Install Swipe Dependencies</name>
  <files>apps/web/package.json</files>
  <action>
    Install the animation and gesture libraries:
    ```
    cd apps/web && npm install @react-spring/web @use-gesture/react
    ```
    Do NOT install `react-spring` (that's the legacy package). Use `@react-spring/web` which is the v9+ modular package.
  </action>
  <verify>cd apps/web && npm list @react-spring/web @use-gesture/react</verify>
  <done>Both packages appear in package.json dependencies and are installed.</done>
</task>

<task type="auto">
  <name>Build SwipeDeck Component and Page</name>
  <files>
    apps/web/src/components/swipe/SwipeCard.tsx,
    apps/web/src/components/swipe/SwipeDeck.tsx,
    apps/web/src/app/dashboard/hackathons/[id]/swipe/page.tsx
  </files>
  <action>
    **1. Create `apps/web/src/components/swipe/SwipeCard.tsx`**
    A single profile card component:
    - Props: `{ user: { id, name, image, bio, college, city, skills: { skill: { name } }[], linkedinUrl?, githubUrl? }, style: any, bind: any }`
    - Renders a premium dark card (bg-zinc-900/80, border-zinc-800, rounded-3xl) with:
      - Avatar (large, centered at top, fallback to initials)
      - Name + College + City
      - Bio text (truncated to 3 lines)
      - Skills as styled chips/badges (indigo-500/10 bg, indigo-400 text)
      - LinkedIn/GitHub links as small icons at the bottom
    - Apply `animated.div` from `@react-spring/web` with the `style` prop for spring-driven transforms.
    - Apply `{...bind()}` spread for gesture handling.
    - Show directional indicators: Green "✓" overlay when swiping right, Red "✗" overlay when swiping left, with opacity tied to swipe distance.

    **2. Create `apps/web/src/components/swipe/SwipeDeck.tsx`**
    The card stack manager:
    - Props: `{ users: SwipeDeckUser[], onSwipe: (userId: string, type: 'LEFT' | 'RIGHT') => Promise<SwipeResult>, onEmpty: () => void }`
    - Use `useSprings` from `@react-spring/web` to manage spring state for ALL cards.
    - Use `useDrag` from `@use-gesture/react` to detect swipe gestures.
    - Gesture logic:
      - On drag: rotate card proportional to horizontal movement. Transform: `x: mx, rotate: mx / 10, scale: active ? 1.05 : 1`.
      - On release: if `|velocity| > 0.3` OR `|movement| > 150px`, trigger card exit animation (fly off screen in swipe direction). Otherwise, spring back to center.
      - On exit: call `onSwipe(userId, direction === 'right' ? 'RIGHT' : 'LEFT')`.
    - Show only top 3 cards (stacked with slight y-offset and scale reduction for depth effect).
    - Include two large buttons below the card stack: ✗ (red, skip) and ✓ (green, like) for users who prefer clicking over swiping.
    - When all cards are consumed, call `onEmpty()`.
    - Make the component responsive — full-width on mobile, max-w-md centered on desktop.

    **3. Create `apps/web/src/app/dashboard/hackathons/[id]/swipe/page.tsx`**
    The swipe page for a specific hackathon:
    - `'use client'` directive.
    - Extract `params.id` as hackathonId.
    - Use `useSession()` to verify auth. Redirect to login if not authenticated.
    - Fetch the hackathon name: `GET /api/hackathons/${id}` for the header.
    - Fetch swipe deck: `GET /api/hackathons/${id}/swipe-deck` with credentials.
    - Loading state: Show skeleton/spinner.
    - Empty state: Premium card with "No more people to discover right now. Check back later!" message.
    - Error state: Show error message with retry button.
    - Render `<SwipeDeck>` with fetched users.
    - `onSwipe` handler: POST to `/api/swipes` with `{ receiverId, hackathonId, type }`.
      - If response has `matched: true`, trigger match overlay (placeholder for Plan 3.3 — for now, show a simple `alert('It's a Match!')` or set a `matchedUser` state).
    - Header: Show hackathon name + back button to `/dashboard/hackathons`.
    - Use `framer-motion` for page entry animation (consistent with existing pages).
    
    Design aesthetic requirements:
    - Dark theme consistent with existing pages (bg-black, text-white).
    - Card stack should feel physical — shadows, depth, subtle spring physics.
    - Swipe indicators (✓/✗) should be translucent overlays that intensify with swipe distance.
    - Use glassmorphism on the card (backdrop-blur, semi-transparent bg).
    - Action buttons should have hover animations and be clearly distinguishable.
  </action>
  <verify>cd apps/web && npx tsc --noEmit</verify>
  <done>
    - SwipeCard renders user profile data with animated spring styles.
    - SwipeDeck manages card stack with gesture-driven swipe and button-based swipe.
    - Swipe page fetches deck, renders cards, and sends swipe results to API.
    - `tsc --noEmit` passes.
  </done>
</task>

## Success Criteria
- [ ] `@react-spring/web` and `@use-gesture/react` installed
- [ ] SwipeCard displays user profile with skills, bio, social links
- [ ] SwipeDeck handles drag gestures and button clicks for LEFT/RIGHT swipes
- [ ] Swipe page at `/dashboard/hackathons/[id]/swipe` fetches deck and sends swipe actions
- [ ] Directional overlays (✓/✗) respond to swipe distance
- [ ] Type check passes
