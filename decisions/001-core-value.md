# 001 — Core value: habit first, then personalization, then guidance

- **Status:** Accepted, order updated 2026-11-09 (see Update below)
- **Date:** 2026-11-01

## Context
Youga can grow in three directions, and each needs a different backend:
- **Habit:** saving practices, history, streaks, reminders
- **Personalization:** practices shaped around the user's body, needs and history
- **Guidance:** timer and cues during practice, for people new to yoga

From running a yoga studio: practitioners' biggest problem isn't motivation or knowledge. They struggle to **build a habit**. Even with good intentions they drop off, and that drop-off is churn.

## Options considered
1. **Habit first:** solve the retention problem directly. Needs stored data and a reason to come back.
2. **Personalization first:** an impressive "wow" from day one, but it adds little if the user never comes back, and it's the most complex to build (LLM, safety).
3. **Guidance first:** the widest audience (beginners), but beginners have the lowest intent and are the hardest to retain without a habit loop underneath.

## Decision
Build in this order: **Habit → Personalization → Guidance.**

## Why
Habit is the problem I've seen first-hand as a teacher, and retention is what makes every later layer worth building. Personalization is worth more once there's a returning user and history to personalize from. A practice that adapts to *your* past sessions beats one built from a single form. Guidance opens the app to people new to yoga. It's the right move once the product is mature enough to turn low-intent visitors into customers.

## Consequences
- **Easier:** a clear MVP scope and a clear primary metric (return visits and practices per week).
- **Requires:** data that lasts between visits, so the app has to remember the user. This drives the accounts decision (003). Reminders become part of the habit loop, so they move earlier than "later".
- **Harder:** the first version is less flashy than an AI-first one. It has to be polished to make up for that (see 002).
- **Revisit if:** testers come back without any habit features, or say a personalized practice would make them return. Either would mean personalization is the real hook.

## Update — 2026-11-09: the phase order
The roadmap now runs in six phases, and each one opens when the phase before it reaches its bar of 20:

| Phase | What | Success bar (20 of each) |
|---|---|---|
| 0 | Discovery and content model | — |
| 1 | MVP: press play | 20 finished practices rated as meeting the user's goal |
| 2 | Habit creation: accounts, history, streaks, reminders | 20 users created an account |
| 3 | Personalisation | 20 users save poses and use plain-language requests weekly, 3 weeks in a row |
| 4 | Progress (big bet) | 20 users uploaded at least 2 videos for each of 5 poses |
| 5 | Pose feedback (big bet) | 20 users requested feedback and rated it useful |

**What changed:** a playable class comes before the habit features, because there has to be a practice worth returning to. Habit is still the problem we solve first among the retention layers, and it stays ahead of personalisation: an account is the first step to personalising.

**Guidance** isn't a separate phase any more. Its basics (pictures, cues, Play mode) ship in Phase 1, and Pose feedback (Phase 5) is its advanced form. Progress and Pose feedback are the planned differentiators against Down Dog.
