# 008 — Content authoring: Airtable, exported to JSON

- **Status:** Accepted
- **Date:** 2026-11-03

## Context
Practice content (poses, sub-sequences, sequences, cues, breaths) is now written in an Airtable base, Youga Content. Airtable gives a teacher-friendly editor with linked records, so building sequences out of reusable sub-sequences is easy. Decisions 004 and 005 put the pose library in Supabase, but Supabase isn't set up yet, and the content keeps changing daily.

The app is a static site on Vercel (006). It must never expose a private key in the browser.

## Options considered
1. **Airtable for authoring, exported to `data/content.json` in the repo:** no backend needed, no key in the browser, and every content change is versioned in git. The cost is an export step before content goes live.
2. **The app reads Airtable live:** content updates instantly, but it needs a server function to hide the Airtable key and adds a runtime dependency on Airtable's limits.
3. **Move content to Supabase now (per 005):** one data home, but it means building an editing UI or editing raw tables, and it slows down content work while the schema is still changing.

## Decision
Option 1. Airtable is where content is written. `scripts/export-airtable.mjs` exports vetted sequences to `data/content.json`, which the app reads. Supabase stays the plan for users, history and streaks (004).

## Why
Content is the bottleneck right now, and Airtable is the fastest place to write it. Exporting to a file keeps the app simple and safe, and gives every content change a git history and a Vercel preview, just like code.

## Consequences
- Content goes live only after an export and a push. This is a deliberate review step.
- Partly supersedes 005's "pose library in Supabase" for phase 1. Revisit when phase 2 needs the LLM to query the library from a server function.
- Airtable's free plan limits (records per base, API calls) apply to the export only, not to users.
- **Revisit if:** content changes need to go live without a deploy, or the library moves into Supabase for phase 2.
