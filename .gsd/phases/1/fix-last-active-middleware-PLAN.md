---
phase: 1
plan: fix-last-active-middleware
wave: 1
gap_closure: true
---

# Fix Plan: lastActiveAt Middleware

## Problem
The requirement to update a user's `lastActiveAt` field on every authenticated request was not implemented in the Express app.

## Tasks

<task type="auto">
  <name>Implement lastActiveAt middleware</name>
  <files>apps/api/src/middlewares/lastActive.ts, apps/api/src/index.ts</files>
  <action>
    Create the middleware in `apps/api/src/middlewares/lastActive.ts`.
    It should check if `req.user` exists, and if so, fire an async Prisma update to set `lastActiveAt` to `new Date()`.
    Import and use this middleware in `apps/api/src/index.ts`.
  </action>
  <verify>Check that the middleware file is created and mounted in `index.ts`.</verify>
  <done>User activity is automatically tracked.</done>
</task>
