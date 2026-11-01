# 004 — Backend approach: Supabase

- **Status:** Accepted
- **Date:** 2026-11-01

## Context
The backend has to:
- Sign users in with Google or an email magic link (003)
- Store each user's practices, history and streak (001)
- Send reminders, soon (001)
- Later, call an LLM for personalization while keeping the API key secret

Each phase has to ship polished and fast (002). Effort should go into user value, not infrastructure.

## Options considered
1. **Our own server** (Node or Python API, a database, an auth library): full control, but a lot of setup, upkeep and security work before any user value.
2. **Supabase:** a hosted Postgres database, built-in auth (Google and magic link included), server functions and file storage. Free tier, standard SQL.
3. **Firebase:** a mature hosted document database, auth and functions. Strong for mobile, but a weaker fit for history and streak queries, and more lock-in to Google's ecosystem.

## Decision
Option 2: **Supabase** for the database, auth and server functions.

## Why
It covers almost everything we need out of the box, including both sign-in methods from 003. Habit data is naturally relational (a user has many practices, each on a date), and Postgres handles it well. Server functions give us a safe place for the LLM key when personalization arrives. Because it's standard SQL, the skills transfer and moving off it later is realistic. Building our own server would spend effort on infrastructure instead of polish.

## Consequences
- **The browser talks to the database directly.** Security comes from **Row Level Security (RLS)**: rules such as "a user can only read and write their own rows." Every table must have RLS enabled and tested before launch. This is the most important technical detail of this decision.
- **Secrets stay server-side.** Only the public "anon" key goes in the front end. The service key and the future LLM key live only in Supabase server functions or secrets.
- **Free tier limits:** inactive free projects get paused, so a launch-day post needs the project to be awake. Paid starts at about $25/month if needed.
- **Reminders** will run as a scheduled server function plus an email provider (decided in 007).
- **Revisit if:** we need complex backend logic that doesn't fit server functions, or costs grow past what a small server would cost.
