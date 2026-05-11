---
phase: 1
plan: 2
wave: 2
---

# 02-api-db-PLAN.md

Scaffold the Express backend and initialize the Prisma schema with 17 tables.

## Tasks
- [ ] Initialize `apps/api` with `package.json`, `tsconfig.json`, and `src/index.ts`.
- [ ] Install API dependencies (express, prisma, better-auth, cors, morgan, etc.).
- [ ] Create `apps/api/prisma/schema.prisma` with all 17 tables.
- [ ] Configure foundational scaffolding (TR-06, TR-07, TR-08, TR-09).
- [ ] Setup `apps/api/.env.example`.

## Verification
- `npx prisma validate` in `apps/api`.
- `npm run build` (or `tsc`) in `apps/api`.
