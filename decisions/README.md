# Youga — Decision Log

Every meaningful product or technical decision gets a short record here, so we can always explain **why** Youga is built the way it is.

## How it works

- One file per decision, numbered in order: `001-core-value.md`, `002-accounts.md`, …
- Copy `000-template.md` to start a new one.
- A decision is **Proposed** while we discuss it, **Accepted** once you make the call, and **Superseded** if a later decision replaces it. Decisions are never deleted, only superseded, so the history stays readable.
- Keep each record short: someone should understand it in two minutes.

## Decisions

| # | Decision | Status | Date |
|---|---|---|---|
| [001](001-core-value.md) | Core value: habit → personalization → guidance | Accepted | 2026-11-01 |
| [002](002-first-users-and-launch.md) | First users: me, then polished public phases on LinkedIn | Accepted | 2026-11-01 |
| [003](003-accounts.md) | Accounts: guest first, sign in to save (Google / magic link) | Accepted | 2026-11-01 |
| [004](004-backend-approach.md) | Backend approach: Supabase (Postgres, auth, server functions) | Accepted | 2026-11-01 |
| [005](005-generation-logic.md) | Generation: lookup in phase 1, constrained LLM in phase 2 | Accepted | 2026-11-01 |
| [006](006-hosting-and-platform.md) | Hosting & platform: Vercel, web app first, PWA later | Accepted | 2026-11-01 |
| [007](007-integrations.md) | Integrations by phase; pose images deferred behind a placeholder | Accepted | 2026-11-01 |
| [008](008-content-in-airtable.md) | Content authoring: Airtable, exported to JSON | Accepted | 2026-11-03 |

## Technical reference

How the app is built today (screens, components, data flow) lives in [docs/architecture.md](../docs/architecture.md). Decisions explain *why*; that doc explains *what* and *how*.

## Open questions

- **Pose image source:** stock set (leading candidate), illustrator, or photos. Deferred; see 007.
