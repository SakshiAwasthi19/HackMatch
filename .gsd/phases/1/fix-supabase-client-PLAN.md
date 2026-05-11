---
phase: 1
plan: fix-supabase-client
wave: 1
gap_closure: true
---

# Fix Plan: Supabase Realtime Client

## Problem
Supabase Realtime client was specified in Phase 1 must-haves but never configured.

## Tasks

<task type="auto">
  <name>Install and configure Supabase Client</name>
  <files>apps/web/package.json, apps/web/src/lib/supabase.ts</files>
  <action>
    Install `@supabase/supabase-js` in `apps/web`.
    Create `apps/web/src/lib/supabase.ts` with Supabase client initialization.
    Add placeholder environment variables `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local.example`.
  </action>
  <verify>Check `package.json` for supabase dependency and verify `supabase.ts` exists.</verify>
  <done>Supabase client is ready for realtime features in future phases.</done>
</task>
