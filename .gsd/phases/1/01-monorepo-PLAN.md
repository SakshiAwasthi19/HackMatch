---
phase: 1
plan: 1
wave: 1
---

# 01-monorepo-PLAN.md

Initialize the npm workspaces monorepo and scaffold the shared types package.

## Tasks
- [ ] Initialize root `package.json` with `workspaces`.
- [ ] Create `packages/types` directory and `package.json`.
- [ ] Scaffold core 17-table TypeScript interfaces in `packages/types/src/index.ts`.
- [ ] Install root development dependencies (typescript, prettier, eslint).

## Verification
- `npm run type-check` (if configured) or verifying directory structure.
