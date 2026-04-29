# DECISIONS.md — Architecture Decision Records

| ID | Date | Decision | Rationale |
|----|------|----------|-----------|
| ADR-01 | 2026-04-18 | Use Neon + Better Auth + Supabase Realtime | Optimized for speed, type-safety, and real-time capabilities. |
| ADR-02 | 2026-04-18 | Strict Node.js + Express v4 + TypeScript | Preference for standard Express conventions over Hono for familiarity and ecosystem compatibility. |
| ADR-03 | 2026-04-18 | Apps/API Internal Structure | Logical separation of routes, middleware, and library singletons for better maintainability. |
| ADR-04 | 2026-04-18 | Prisma v5 Singleton | Ensures efficient database connection pooling via Neon. |

## Phase 1 Decisions

**Date:** 2026-04-21

### Scope
- **Auth**: Email/Password only for Phase 1. No Social OAuth (v2).
- **UI**: Minimal Auth UI (Login/Register) + Bare Dashboard shell to verify end-to-end wiring.

### Approach
- **Structure**: npm workspaces (Monorepo).
  - `apps/api`: Express backend.
  - `apps/web`: Next.js 15 frontend.
  - `packages/types`: Shared TypeScript interfaces.
- **Communication**: Separate processes (Port 3000/3001) communicating via HTTP + CORS.
- **Shared Types**: `@hackmatch/types` as a workspace dependency. Prisma stays server-side.
- **Deployment**: Local-first for Phase 1. GitHub Actions configured but not triggered for Render/Vercel until Phase 2 is complete.

### Constraints
- **Security**: No hardcoded keys. Use `.env.example` templates for all credentials.
- **CORS**: One-time configuration in `apps/api/src/index.ts` allowing `FRONTEND_URL` with credentials.

## Phase 2 Decisions

**Date:** 2026-04-29

### Scope
- **Profile Skills**: Free-text input with a predefined seed list. Users can type any skill and hit Enter to add it, but the following seed list of ~30 common hackathon skills appears as suggestions in the combobox dropdown. New skills entered will be automatically upserted to the database.
  - **Seed Skills List**: React, Python, Machine Learning, UI/UX Design, Node.js, Flutter, Django, FastAPI, Figma, Docker, AWS, TypeScript, Vue, Angular, Swift, Kotlin, Unity, Blockchain, GraphQL, PostgreSQL, MongoDB, Redis, TensorFlow, PyTorch, OpenCV, Rust, Go, Java, C++, Arduino
- **Hackathon Sorting**: Default sort by nearest start date first, secondary sort by newly added. No city/college-based personalized sorting for V1.
- **Admin Hackathon Creation**: Hidden route `/admin/hackathons/new` protected by `requireAdmin` middleware. The admin role is assigned manually in the database (`UPDATE users SET role = 'ADMIN'`). No database seeder required.

### Approach
- **Hackathon Actions (Interest vs. Register)**: Both are purely internal states to indicate commitment level. Internal registration allows enforcing team sizes and keeps the swipe pool based on verified internal signals rather than external un-trackable links.
- **Image Uploads**:
  - **Avatars**: Handled via Supabase Storage for profile cards. Add `SUPABASE_STORAGE_URL` and a helper `uploadAvatar(file, userId)` in `apps/api/src/lib/storage.ts`.
  - **Hackathon Banners**: Deferred to V2. Use a styled placeholder with the hackathon title instead.

### Constraints
- Supabase bucket must be named `avatars` with public read access and authenticated write access.
