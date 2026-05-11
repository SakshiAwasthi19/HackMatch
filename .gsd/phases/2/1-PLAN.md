---
phase: 2
plan: 1
wave: 1
---

# Plan 2.1: Profile Editor & Avatar Storage

## Objective
Allow users to build a detailed profile with skills, college, city, and upload an avatar to Supabase Storage.

## Context
- .gsd/SPEC.md
- apps/api/prisma/schema.prisma

## Tasks

<task type="auto">
  <name>Backend Profile & Storage API</name>
  <files>
    apps/api/.env
    apps/api/src/lib/storage.ts
    apps/api/src/routes/profile.ts
    apps/api/src/index.ts
  </files>
  <action>
    - Add SUPABASE_STORAGE_URL="https://qghedphicvdbeafcosrv.supabase.co/storage/v1/object/public/" to the local environment and documentation.
    - Create `apps/api/src/lib/storage.ts` using the Supabase client (install `@supabase/supabase-js` in `apps/api` if necessary).
    - It should export a helper function `uploadAvatar(fileBuffer: Buffer, userId: string)` that uploads to the `avatars` bucket and returns the public URL.
    - Create `apps/api/src/routes/profile.ts` with a `PUT /api/profile` endpoint (protected by authentication).
    - The endpoint must update the `User` model (bio, college, city, linkedinUrl, githubUrl, image).
    - It must also upsert `UserSkill` connections based on an array of string skills (creating new `Skill` records if they don't exist).
    - Mount the `/api/profile` route in `apps/api/src/index.ts`.
  </action>
  <verify>curl -X OPTIONS http://localhost:3001/api/profile</verify>
  <done>API successfully handles avatar uploads and updates a user profile with skills.</done>
</task>

<task type="auto">
  <name>Frontend Profile Page</name>
  <files>
    apps/web/src/app/dashboard/profile/page.tsx
  </files>
  <action>
    - Create a Profile Editor form at `apps/web/src/app/dashboard/profile/page.tsx`.
    - Implement a Combobox for Skills using the exact Seed List: React, Python, Machine Learning, UI/UX Design, Node.js, Flutter, Django, FastAPI, Figma, Docker, AWS, TypeScript, Vue, Angular, Swift, Kotlin, Unity, Blockchain, GraphQL, PostgreSQL, MongoDB, Redis, TensorFlow, PyTorch, OpenCV, Rust, Go, Java, C++, Arduino.
    - The form must allow users to select an image file for their avatar, which is sent to the backend.
    - Add all standard text fields: college, city, bio, linkedinUrl, githubUrl.
  </action>
  <verify>npm run build --prefix apps/web</verify>
  <done>Next.js builds successfully and the profile page renders the form correctly.</done>
</task>

## Success Criteria
- [ ] User can upload an avatar that is saved to Supabase Storage.
- [ ] User can select skills from the predefined seed list or add new ones.
- [ ] User profile updates successfully save to the Neon database.
