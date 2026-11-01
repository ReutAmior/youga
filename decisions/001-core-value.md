# 001 — Core value: habit first, then personalization, then guidance

- **Status:** Accepted
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
