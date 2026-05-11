# SPEC.md — Project Specification

> **Status**: `FINALIZED`

## Vision
HackMatch is a hackathon team-finding platform that solves the chaotic, scattered nature of team formation by using a Tinder-style swipe mechanic to match users based on skill complementarity. It transforms the journey from "I want to participate" to "I have a full team and a group chat" into a structured five-minute experience.

## Goals
1. **Frictionless Profile Creation**: Build user profiles showcasing skills, bio, LinkedIn, GitHub (optional), college, and city.
2. **Structured Discovery**: Provide a hackathon listing where users can register for events and signal interest independently.
3. **Swipe-to-Match Loop**: Implement a Tinder-style interface for users with shared interests in a specific hackathon or for global networking (Explore).
4. **Instant Team & Chat**: Automatically form teams and open real-time group chats (or 1:1 DMs for Explore matches) upon mutual matches.
5. **Team Growth through Signaling**: Allow teams to grow by allowing members to swipe for solo participants with transparent "Looking for" tags.
6. **Robust Filtering**: Ensure the swipe deck is high-quality by filtering out inactive users (7+ days), full teams, ineligible colleagues, and already-swiped profiles.

## Non-Goals (Out of Scope for V1)
- **Role Request Board**: No public bulletin board for team needs.
- **Hard Technical Verification**: No automated GitHub/Devpost history scraping.
- **Organizer Management Portal**: No interface for hackathon organizers to manage their own events.
- **Advanced Chat Features**: No read receipts, typing indicators, or file sharing.

## Users
- **Hackathon Participants**: Students (Developers, Designers, ML Engineers) looking for teammates with complementary skills.
- **Admins**: Project creators who manually curate and register hackathons.

## Constraints
- **Main Stack**:
  - **Frontend**: Next.js 15 (App Router), Tailwind CSS, shadcn/ui.
  - **Backend**: Node.js + Express v4 + TypeScript. **NO HONO.**
  - **Database**: Neon (Postgres) via Prisma v5.
  - **Authentication**: Better Auth v1.
  - **Realtime**: Supabase Realtime helpers.
- **State & Data**:
  - **Global State**: Zustand v4.
  - **Data Fetching**: TanStack Query v5 (React Query).
  - **Animations**: `react-spring` + `@use-gesture/react` for swipe mechanics.
- **Deployment**: Vercel (Frontend), Render (Backend), Neon (DB).
- **CI/CD**: GitHub Actions for type checking and automated deployment.
- **Data Integrity**: 
  - User `lastActiveAt` updated on every request; 7-day cutoff for swipe decks.
  - Team naming is mandatory for the leader before the group chat can be accessed.
  - Hackathons include `mode` (Online/In-Person/Hybrid), `city`, `eligibilityType`, and `eligibleCollegesList`.

## Success Criteria
- [ ] User can register, log in, and create a full profile with college, city, and skills (LinkedIn required, GitHub optional).
- [ ] Admin can create a hackathon with mode, city, eligibility type, and eligible colleges list.
- [ ] User can mark interest and register for a hackathon independently (HackathonRegistration vs Interest record).
- [ ] User sees a filtered swipe deck respecting all filtering rules (inactive, full teams, college eligibility, already swiped).
- [ ] Mutual right-swipe atomically creates team, chat, and match (or 1:1 DM for Explore matches).
- [ ] Leader is prompted to name the team before chat is accessible.
- [ ] Leader can set and update "Looking for" tags.
- [ ] Team member can swipe and add solo users to an existing team (Individual-led growth).
- [ ] Real-time notifications delivered for swipe (match prompt), mutual match, join invite, and new message events.
- [ ] Explore swipe creates a 1:1 DM on mutual match.
- [ ] CI/CD pipeline passes type check and deploys on merge to main.

## Functional Requirements
| ID | Requirement | Target | Status |
|----|-------------|--------|--------|
| REQ-01 | User registration and profile management | Goal 1 | Pending |
| REQ-02 | Detailed profiles (College, City, Skills, Bio) | Goal 1 | Pending |
| REQ-03 | Hackathon discovery with multi-level filtering | Goal 2 | Pending |
| REQ-04 | Separate actions for "Mark Interest" and "Register" | Goal 2 | Pending |
| REQ-05 | Tinder-style swipe UI for hackathon-specific interest pools | Goal 3 | Pending |
| REQ-06 | Multi-factor filtering (Inactive, Full teams, Eligibility) | Goal 6 | Pending |
| REQ-07 | Atomic Team/Chat/Match creation on mutual right-swipe | Goal 4 | Pending |
| REQ-08 | Transition from mutual match to 1:1 DM for "Explore" loop | Goal 3 | Pending |
| REQ-09 | Individual-led team growth (Invite solo users via swipe) | Goal 5 | Pending |
| REQ-10 | Leader-only team naming and "Looking for" tag management | Goal 5 | Pending |
| REQ-11 | Real-time messaging via Supabase Realtime helpers | Goal 4 | Pending |
| REQ-12 | Real-time system notifications (Matches, Invites, Messages) | Success Criteria | Pending |

## Technical Requirements
| ID | Requirement | Target | Status |
|----|-------------|--------|--------|
| TR-01 | Setup Neon Postgres database with Prisma v5 singleton | Neon/Prisma | Pending |
| TR-02 | Implement Better Auth v1 with Express middleware | Better Auth | Pending |
| TR-03 | Configure Supabase Realtime client + broadcast helpers | Supabase | Pending |
| TR-04 | Express Middleware to update `lastActiveAt` on User profile | Spec Constraint | Pending |
| TR-05 | GitHub Actions for TypeScript strict check and deployment | CI/CD | Pending |
| TR-06 | Express Application Structure (apps/api/src/) architecture | Backend | Pending |
| TR-07 | Custom Express.Request type extension for userId and user | TypeScript | Pending |
| TR-08 | Global Error Handler with registration as last middleware | Express | Pending |
| TR-09 | Morgan logging and CORS configuration | Express | Pending |

