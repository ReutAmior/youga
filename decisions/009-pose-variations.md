# 009 — Poses have variations, and the level lives on the variation

- **Status:** Accepted (content model). The Airtable change is drafted in [docs/content-model-variations.md](../docs/content-model-variations.md) and not applied yet.
- **Date:** 2026-11-18

## Context
Today each pose has one **Level**, so a pose is either "Beginner" or "Intermediate". Real students don't work that way:
- An Intermediate student may still need the strap version of Extended Hand-to-Big-Toe.
- An Advanced student may still need an easier version of two or three poses.

Pre-built sequences have the same problem. An Advanced sequence shouldn't be closed to a student who can do the flow but needs an easier version of a few poses. Discovery ideas 1 (level check), 2 (body check-in), 7 (swap a pose) and 8 (after-practice check) all need a way to choose **which version** of a pose a student gets.

The library already holds variations as separate poses, for example "Wide-Legged Forward Fold, hands on blocks / on floor / clasped" and Plank as the beginner option for Four-Limbed Staff. Nothing links them together yet.

## Options considered
1. **Keep one level per pose; build separate sequences per level.** Simple, but you'd write every sequence three times, and it still fails the student who is "Intermediate except for two poses".
2. **A pose is a family of variations, each with its own level.** Sequences point to the pose and name a default variation. The app picks the variation for each student. One sequence serves several levels.
3. **Fine-grained difficulty only (1–10 per variation), no B/I/A.** Flexible, but harder to author consistently across about 80 poses, and it doesn't match how you think as a teacher.

## Decision
Option 2.
- **Pose** = the shape and the job it does in the flow.
- **Variation** = one way to do it, with its own Level (B/I/A), Order within the pose (1 = easiest), props, contraindications, cues and picture.
- **Sub-sequence steps** link to a **default variation**: the version you'd cue in class. The pose follows from it.
- **A sequence's Level** describes how demanding the *flow* is (pace, holds, number of poses, transitions). It no longer limits which pose versions a student can do.

**Picking the variation for each step:**
1. Remove variations whose contraindications match the body check-in.
2. Use the student's saved **"my version"** of this pose, if there is one.
3. Otherwise use the default. If the default is above the student's level, step down to the hardest variation at or below their level. Never step up automatically.
4. If nothing safe is left, use a linked **alternative pose** (for example Dolphin for Headstand, Legs Up the Wall for Shoulder Stand).

**Swapping:**
- The swap sheet lists the pose's variations by Order, with level and props.
- Unsafe ones are greyed out with the reason rather than hidden.
- "Use this every time" saves "my version".
- In a protected (non-editable) sub-sequence, only variations marked **Fits the flow** can be swapped in. So a protected pose can't be removed, but it can be swapped.

## Why
It matches how a teacher actually adapts a class: same flow, different versions per student. One sequence can serve every level, which shrinks the content you need to write. It also gives the level check, body check-in and after-practice check something concrete to act on.

## Consequences
- **Easier:** fewer sequences to write. Personalization (phase 3) becomes "choose variations", which stays inside your teacher-approved library, as decision 005 requires.
- **Harder:** every pose needs its variations written and ordered. Start with the poses in vetted sequences.
- **Content model change:** a new Poses table holds the families. The current Poses table becomes Variations, so cues, pictures and links are kept. The export and app need updating; see the draft.
- **The current "can't remove" rule changes:** protected poses can still be swapped for a variation that fits the flow.
- **Revisit if:** students mostly keep the defaults and never swap. That would mean the extra content isn't paying off.
