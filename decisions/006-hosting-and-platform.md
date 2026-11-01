# 006 — Hosting & platform: Vercel, web app first, PWA later

- **Status:** Accepted
- **Date:** 2026-11-01

## Context
Supabase is the backend (004). The front end needs a public home, and the product needs a form on users' phones. LinkedIn visitors must be able to click a link and see the app instantly (002). Habit-building users will eventually need reminders and a home-screen presence (001).

## Options considered
**Hosting**
1. **Vercel:** deploys on push to GitHub, a preview link for every change, a free tier (non-commercial), server functions if needed.
2. **Netlify:** nearly the same workflow, and its free tier allows commercial use.
3. **Cloudflare Pages:** generous and fast, but more setup.

**Platform**
1. **Web app:** one link, no store, but easy to forget.
2. **PWA:** installable, with a home-screen icon and push. On iPhone, push needs the user to add the app to the home screen first.
3. **Native app:** best reminders, but weeks of work and store review, and visitors can't just click and look.

## Decision
Host on **Vercel**. Ship a **mobile-friendly web app** in phase 1, and turn it into a **PWA** in a later habit phase.

## Why
A LinkedIn link has to open instantly in any browser, which rules out native for now. Vercel's per-change preview links support the "every version is polished" rule: check the preview, then publish. A PWA adds the home-screen presence a habit app needs, without an app store, once the core loop is proven.

## Consequences
- **Youga moves into a GitHub repository.** Every push to the main branch deploys to production, and every other branch gets a preview URL.
- **Release flow:** build → preview link → I check it on my phone → merge → live. Nothing reaches the public URL without a check.
- **Email comes first for reminders** (in 007), because iPhone push only works for installed PWAs.
- **Vercel's free tier is non-commercial.** Move to Pro (about $20/month) when Youga starts charging.
- **Mobile-first design:** most LinkedIn clicks come from phones.
- **Revisit if:** users ask for an app-store app, or PWA install rates are too low for push reminders to matter. Either would make native worth the cost.
