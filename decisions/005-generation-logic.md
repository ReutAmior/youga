# 005 — Practice generation: lookup in phase 1, a constrained LLM in phase 2

- **Status:** Accepted
- **Date:** 2026-11-01

## Context
Today a practice comes from three dropdowns (level, duration, goal): 36 combinations, each mapped to a sequence I curated as a yoga teacher. Phase 1 is about habit (001), not personalization.

The test for using an LLM: does this step need **judgment** (interpreting messy input, weighing trade-offs, adapting), or is it a **deterministic lookup**?

## Options considered
1. **Lookup in phase 1, LLM in phase 2:** predictable, free and instant. Every practice is teacher-approved, and effort goes into the habit loop.
2. **Add an LLM now:** gives the first post an "AI-powered" label, but solves a problem phase 1 doesn't have, adds cost, delay and safety risk, and pushes back the habit features.

## Decision
Option 1. Phase 1 generation stays a **deterministic lookup**. An LLM comes in with personalization (phase 2), when the input becomes free text and history.

## Why
Three dropdowns need no judgment, so an LLM would add risk without value the user can notice. Phase 2 changes the input ("my lower back is tight," "I keep skipping twists"), and that's a problem only judgment can solve. We add AI when the product has a problem that needs it, not to make the first post look impressive.

## Consequences
- **The pose library moves into Supabase as structured data:** each pose's level, goals, body areas, intensity and contraindications. The phase 1 lookup reads from it.
- **In phase 2, the LLM chooses and orders poses from this library. It never invents poses.** My curation as a teacher becomes the AI's safety boundary, and every output can be checked against known poses.
- **The library schema is the real investment now.** Tagging poses well (body areas, contraindications) is what makes phase 2 personalization safe and good.
- **Phase 1 posts tell a product-judgment story** ("no AI until it's needed") rather than an AI-features story.
- **Revisit if:** testers ask for practices the dropdowns can't express. That's the signal to bring personalization forward.
