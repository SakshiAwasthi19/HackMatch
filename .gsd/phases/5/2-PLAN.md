---
phase: 5
plan: 2
wave: 1
---

# Plan 5.2: Explore UI & SwipeDeck Mode

## Objective
Integrate the Explore loop into the frontend by making the SwipeDeck component reusable for both hackathon-specific and global pools.

## Context
- apps/web/src/components/dashboard/ExploreView.tsx
- apps/web/src/components/dashboard/SwipeView.tsx
- apps/web/src/components/swipe/SwipeDeck.tsx

## Tasks

<task type="auto">
  <name>Add Mode Prop to SwipeDeck</name>
  <files>apps/web/src/components/swipe/SwipeDeck.tsx</files>
  <action>
    - Add `mode: 'hackathon' | 'explore'` to `SwipeDeckProps`.
    - Update `fetchCards` and `handleSwipe` to use the correct API endpoints based on mode:
      - `explore`: `/api/explore/swipe-deck` and `/api/explore/swipe`
      - `hackathon`: `/api/hackathons/${id}/swipe-deck` and `/api/swipes`
  </action>
  <verify>Check that SwipeDeck correctly calls explore endpoints when mode is 'explore'.</verify>
  <done>SwipeDeck is polymorphic and handles both use cases.</done>
</task>

<task type="auto">
  <name>Implement ExploreView UI</name>
  <files>apps/web/src/app/dashboard/page.tsx, apps/web/src/components/dashboard/ExploreView.tsx</files>
  <action>
    - Update `ExploreView.tsx` to render the `SwipeDeck` in `explore` mode.
    - Ensure it handles the `onMatch` callback to show the `MatchOverlay`.
  </action>
  <verify>Navigate to Explore tab and verify cards load and swiping works.</verify>
  <done>Users can swipe on the global pool via the Explore tab.</done>
</task>

## Success Criteria
- [ ] Explore tab shows a functional swipe deck.
- [ ] Swiping in Explore mode calls global API endpoints.
