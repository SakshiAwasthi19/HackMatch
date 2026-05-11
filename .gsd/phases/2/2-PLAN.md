---
phase: 2
plan: 2
wave: 2
---

# Plan 2.2: Admin Hackathon Creation

## Objective
Allow designated admins to create hackathons securely from a hidden frontend route.

## Context
- .gsd/SPEC.md
- apps/api/prisma/schema.prisma

## Tasks

<task type="auto">
  <name>Schema & Shared Types Update</name>
  <files>
    apps/api/prisma/schema.prisma
    packages/types/src/index.ts
    apps/api/src/middlewares/requireAdmin.ts
  </files>
  <action>
    - Rename `Role` enum to `TeamRole` in `apps/api/prisma/schema.prisma` (used by `TeamMember`).
    - Add `enum UserRole { USER, ADMIN }` to the schema.
    - Add `role UserRole @default(USER)` to the `User` model.
    - Update `packages/types/src/index.ts`:
      - `export type UserRole = 'USER' | 'ADMIN';`
      - `export type TeamRole = 'LEADER' | 'MEMBER';`
      - Add `role: UserRole` to the `User` interface.
    - Run `npx prisma db push` inside `apps/api` to apply changes.
    - Create `apps/api/src/middlewares/requireAdmin.ts` that checks `req.user.role === "ADMIN"`.
  </action>
  <verify>npx prisma generate</verify>
  <done>Schema successfully pushed and UserRole is available in the codebase.</done>
</task>

<task type="auto">
  <name>Hackathon Admin API & UI</name>
  <files>
    apps/api/src/routes/admin.ts
    apps/api/src/index.ts
    apps/web/src/app/admin/hackathons/new/page.tsx
  </files>
  <action>
    - Create Admin endpoints in `routes/admin.ts`:
      - `POST /api/admin/hackathons` (Create)
      - `PUT /api/admin/hackathons/:id` (Update)
      - `DELETE /api/admin/hackathons/:id` (Delete)
    - All routes protected by `requireAdmin`.
    - Mount `/api/admin` in `index.ts`.
    - Build a hidden frontend route `apps/web/src/app/admin/hackathons/new/page.tsx` with a form for creation/editing.
  </action>
  <verify>curl -X OPTIONS http://localhost:3001/api/admin/hackathons</verify>
  <done>Admin API endpoints (CRUD) exist and frontend form builds.</done>
</task>

## Success Criteria
- [ ] Prisma schema updated with isAdmin boolean.
- [ ] Admin route requires isAdmin = true.
- [ ] Frontend form for hackathon creation exists at `/admin/hackathons/new`.
