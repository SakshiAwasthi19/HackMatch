---
phase: 5
plan: fix-missing-teams-endpoint
wave: 1
gap_closure: true
---

# Fix Plan: Missing Teams Endpoint

## Problem
The `TeamManager.tsx` component attempts to fetch user teams via `GET /api/profile/teams`, but this endpoint is not implemented in the backend.

## Tasks

<task type="auto">
  <name>Implement /api/profile/teams</name>
  <files>apps/api/src/routes/profile.ts</files>
  <action>Add a GET route to profile.ts that returns all teams the user is a member of, including hackathon names and member roles.</action>
  <verify>Call the endpoint via curl or verify TeamManager loads teams in the UI.</verify>
  <done>Endpoint returns 200 OK with team array.</done>
</task>
