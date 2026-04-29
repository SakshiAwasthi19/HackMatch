---
phase: 1
plan: fix-better-auth
wave: 1
gap_closure: true
---

# Fix Plan: Better Auth Backend Initialization

## Problem
Better Auth dependencies and schema exist, but the Express backend has not initialized the Better Auth instance or mounted its router, meaning authentication is non-functional.

## Tasks

<task type="auto">
  <name>Initialize Better Auth in Backend</name>
  <files>apps/api/src/auth.ts, apps/api/src/index.ts</files>
  <action>
    Create `apps/api/src/auth.ts` to initialize `better-auth` with Prisma adapter.
    Update `apps/api/src/index.ts` to import `auth` and mount `app.use('/api/auth/*', toNodeHandler(auth))`.
  </action>
  <verify>Check that `auth.ts` exists and `index.ts` contains the auth routes.</verify>
  <done>Backend can handle Better Auth requests.</done>
</task>
