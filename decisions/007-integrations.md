# 007 — Integrations by phase, and pose images

- **Status:** Accepted
- **Date:** 2026-11-01

## Context
Supabase (004) and Vercel (006) cover the core. This decision is about which extra services come in, and **when**: each one adds setup and upkeep, so it should arrive only when a phase needs it.

Youga is a **portfolio and learning project**, shared on LinkedIn, not a business. Costs should stay at or near zero.

Beginners who have never practiced need to *see* the poses, so pose images move up from the guidance phase to **version 2**. The library has about 80 unique poses, and they need one consistent style.

## Options considered for pose images
1. **Stock illustration set** (one set of about 100 poses): fast and consistent. Costs about $70, and needs a license tier that covers apps. Poses it doesn't cover can be swapped for similar ones in the sequences.
2. **Hire an illustrator:** a unique style and full ownership, but the most expensive and slowest option.
3. **Photograph myself:** free and anatomically correct, but it needs a good location and I don't want to be photographed.
4. **AI-generated images:** fast, but image models often get yoga anatomy wrong (a safety issue for beginners), and the images may not be copyrightable.
5. **Tummee:** the images I used as a teacher. Most likely licensed for use only inside Tummee, so not an option unless they offer a commercial license.

## Decision
**Integrations by phase:**

| Phase | Integration | Purpose |
|---|---|---|
| 1 — Habit MVP + launch | PostHog (free) | Visitor-to-practitioner funnel: click → demo → practice → sign in → return |
| 1 | In-app feedback form → Supabase table | Structured feedback instead of scattered comments |
| 1 | Sentry (free) | Catch errors on phones I don't own during the launch spike |
| 2 — Habit loop + images | Resend + a scheduled Supabase function | Email reminders for signed-in users |
| 2 | Pose images | See below |
| PWA phase | Web push | Upgrade on email reminders for users who install the app |
| Personalization | Claude API via a Supabase function | Constrained LLM generation (005) |
| Later, if ever | Stripe | Only if a premium layer becomes worth charging for |

**Pose images:** the image source is **deferred**. Each pose card shows a **placeholder with the pose name** in the image slot, so adding real images later changes only the data, not the design. The leading candidate is a single stock set (option 1), if and when the cost feels worth it.

Deliberately left out: a CMS (edit the pose library in Supabase directly), email-marketing tools, and Apple Health.

## Why
Each integration answers a phase-specific question. Phase 1 needs to know what launch visitors actually do and whether anything breaks. Phase 2 needs to bring signed-in users back. For images, a placeholder keeps v2 polished and unblocked while the cost and source question stays open. For a portfolio project, $70 and a day of photography both need a reason.

## Consequences
- **The image slot already exists in the prototype.** Each pose card shows its name as a placeholder. Adding an `image` path to a pose replaces it with no other changes.
- **When images arrive, they belong in the pose library** (Supabase Storage plus a field on each pose), next to the tags from 005.
- **If a stock set is chosen:** buy the license that covers apps, check that one set covers most of the library, and adjust the sequences for any missing poses rather than mixing styles.
- **Revisit if:** testers say they can't follow a sequence without pictures. That makes images a v1 blocker rather than a v2 feature.
