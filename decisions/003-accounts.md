# 003 — Accounts: guest first, sign in to save

- **Status:** Accepted
- **Date:** 2026-11-01

## Context
Habit first (001) means the app has to remember the user between visits. But most launch traffic will be LinkedIn visitors who only want a quick look (002). A sign-up wall would lose them.

## Options considered
1. **No accounts:** history lives in the browser only. No friction, but it's lost when you switch device or clear the browser, and there's no way to send reminders.
2. **Sign in from the start:** data is safe from day one and reminders work, but it drives away visitors who only came to look.
3. **Guest first, sign in to save:** anyone can try the app and the demo. Sign-in is offered when there's something worth keeping (a streak, reminders).

## Decision
Option 3. Sign-in uses **Google or an email magic link. No passwords.**

## Why
It serves both audiences: visitors get in without friction, and practitioners get data that lasts. Asking at the moment of value ("don't lose your 3-day streak") converts better than asking at the door. Passwordless sign-in removes the most friction, and it means we never store passwords, build reset flows, or carry that security risk.

## Consequences
- **Guests keep history in the browser.** The "save your streak" prompt only works if a guest's practices are recorded before they sign in.
- **Guest history moves into the account on sign-in.** This is a small but real piece of logic to build and test.
- **Requires an auth provider** that supports Google and magic links (feeds into 004).
- **Reminders are for signed-in users only**, because we need an email address or a device to reach them. This gives guests a concrete reason to sign in.
- **Metric to watch:** the share of guests who sign in after their first or second practice.
- **Revisit if:** almost no guests sign in (the prompt or its timing is wrong), or users ask for Apple sign-in (likely once there's a mobile or PWA audience).
