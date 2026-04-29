# ROADMAP.md

> **Current Phase**: Phase 1: Foundation
> **Milestone**: v1.0 (MVP)

## Must-Haves (from SPEC)
- [x] Profile with Skills/College/City (REQ-02)
- [x] Hackathon Discovery with Filtering (REQ-03, REQ-04)
- [ ] Swipe-to-Match Logic (REQ-05, REQ-07)
- [ ] Real-time Group Chat & DMs (REQ-11, REQ-12)
- [ ] Explore Loop for Networking (REQ-08)

## Phases

### Phase 1: Foundation
**Status**: ✅ Complete
**Objective**: Setup infrastructure and core identity.
**Requirements**: REQ-01, TR-01, TR-02, TR-03, TR-04, TR-05, TR-06, TR-07, TR-08, TR-09

- [x] Setup Neon Database and Schema migrations.
- [x] Implement Better Auth (Signup/Login/Profile base).
- [x] Configure Supabase Realtime client.
- [x] Setup Express Application Structure (`apps/api/src/`).
- [x] Implement custom `Express.Request` type extensions.
- [x] Implement Global Error Handler and registration middleware.
- [x] Configure Morgan logging and CORS.
- [x] Implement `lastActiveAt` middleware for User profiles.
- [x] Setup CI/CD pipeline (GitHub Actions).

### Phase 2: Core Discovery
**Status**: ✅ Complete
**Objective**: Enable users to browse profile and hackathons.
**Requirements**: REQ-02, REQ-03, REQ-04

- [x] Build Profile Editor (Skills, College, Socials).
- [x] Build Admin Hackathon creation flow.
- [x] Build Hackathon Discovery view with Register/Interest buttons.

### Phase 3: The Engine (Swiping & Matching)
**Status**: ⬜ Not Started
**Objective**: The core "tinder" mechanic and team formation.
**Requirements**: REQ-05, REQ-06, REQ-07

- [ ] Implement Swipe Deck UI (react-spring + @use-gesture/react).
- [ ] Logic for 7-day activity filtering & eligibility checks.
- [ ] Atomic match transaction (Create Team + Chat + Match record).
- [ ] Team Naming gate for leaders.

### Phase 4: Communication
**Status**: ⬜ Not Started
**Objective**: Real-time collaboration.
**Requirements**: REQ-11, REQ-12

- [ ] Real-time text-only group chat implementation.
- [ ] Real-time DMs for Explore matches.
- [ ] Notification system for matches and messages.

### Phase 5: Team Growth & Polish
**Status**: ⬜ Not Started
**Objective**: Networking loop and production readiness.
**Requirements**: REQ-08, REQ-09, REQ-10

- [ ] "Looking for" tags and individual-led swipe-to-invite.
- [ ] Global Explore loop integration.
- [ ] Final deployment configuration (Vercel/Render).
