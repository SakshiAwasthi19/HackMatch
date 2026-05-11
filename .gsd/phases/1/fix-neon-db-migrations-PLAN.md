---
phase: 1
plan: fix-neon-db-migrations
wave: 2
gap_closure: true
---

# Fix Plan: Neon DB Migrations

## Problem
Prisma schema was created but never migrated against a database instance.

## Tasks

<task type="auto">
  <name>Run Prisma Migrations</name>
  <files>apps/api/.env, apps/api/prisma/schema.prisma</files>
  <action>
    Instruct the user to provide a real Neon Database URL in `.env`.
    Once provided, run `npx prisma migrate dev --name init`.
  </action>
  <verify>Check `prisma/migrations` folder exists and `npx prisma studio` works.</verify>
  <done>Database schema is successfully applied to a real Neon instance.</done>
</task>
