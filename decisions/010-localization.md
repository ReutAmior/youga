# 010 — Localization: Hebrew, with a column per language in Airtable

- **Status:** Accepted
- **Date:** 2026-11-19

## Context
Every piece of text users see should be available in Hebrew as well as English. That text lives in two places:
- **Content** in Airtable: pose and variation names, cues into and out of poses, transition cues, and sub-sequence and sequence names.
- **Interface text** in the code (`index.html`, `app.js`): buttons, headings, messages, form labels, and the labels for values like Level, Goal and Breath.

The cues are safety guidance, so a wrong translation can hurt someone. I write the content myself and will probably translate it myself too.

## Options considered (for content)
1. **A column per language:** each text field gets a Hebrew twin, for example *Cue into pose (HE)*. Both languages sit side by side in one row and the export stays simple. Each new language adds a column to every text field.
2. **A Translations table:** one row per record, field and language. A new language needs no schema change, but the text is separated from its pose, which makes it hard to edit in Airtable, and the export gets more complex.
3. **A translation platform (Crowdin, Lokalise):** Airtable stays English-only and a tool manages translations. Built for many languages and outside translators, but it adds a service and a sync step. Overkill for one language.

## Decision
Option 1, for Hebrew.

**Content (Airtable):**
- **Hebrew twins** of these fields: Pose name, Variation name, Cue into pose, Cue out of pose, Transition cue to next pose, Transition cue to next sub-sequence, Sub-sequence name and Sequence name. Sanskrit names aren't translated.
- **"Hebrew checked"** checkbox on every table with translated text. The app shows a Hebrew text only after it has been reviewed.
- **Fallback:** if the Hebrew text is missing or not checked, the app shows English rather than an empty card.
- **Export:** text is exported as `{ "en": "…", "he": "…" }`.

**Interface text (code):**
- Every visible string moves into `i18n/en.json` and `i18n/he.json`, and the app looks each one up by key.

**Right-to-left:**
- Hebrew reads right to left, so the page switches to `dir="rtl"` and the CSS uses start/end instead of left/right. The progress bar, the × buttons and the action bars mirror automatically.

**Fonts:**
- Fraunces and Inter have no Hebrew letters. Hebrew headings use **Noto Serif Hebrew** (weights 500 and 600, matching Fraunces), and Hebrew body text uses **Assistant**. Both come from Google Fonts.

**Language picker:**
- **Where:** the top corner of Welcome (opposite the eyebrow) and Builder (next to the logo). Not on Play, so practice stays focused; Exit leads back to the Builder.
- **Button:** plain text with the current language, **EN ▾** or **עב ▾**. Same look as the eyebrow: grey `--muted` (#7a7178), 11px, regular, 0.06em letter spacing, no background. The arrow flips up while the menu is open.
- **Menu:** a small white card under the button, aligned to its end edge, with the cards' thin border and a soft shadow. Two options, each in its own language: **English** and **עברית**, also 11px grey.
- **Highlights:** pale sage (#eff5f3) for the open button and the selected option, which is also bold with a sage check mark. Pale sand (#f9f5ef) on hover.
- **Labels in their own language, not flags:** a flag stands for a country, not a language.
- **Behavior:** the first visit uses Hebrew if the browser language is Hebrew, otherwise English. The choice is saved on the device. Switching changes `<html lang dir>` and the text right away, with no reload. Escape or a click outside closes the menu, and screen readers hear a language menu with one selected option.

## Why
With one extra language and me as the translator, seeing English and Hebrew side by side in the same row matters most. It's the fastest way to write and review. The "checked" box keeps unreviewed safety text out of the app. Building right-to-left support in now costs far less than retrofitting it after more screens exist.

## Consequences
- **Easier:** writing and reviewing translations in Airtable, and a simple export.
- **Harder:** every new text field needs a Hebrew twin, and every new language adds a set of columns.
- **A natural AI step:** Claude can draft the Hebrew translations, with me reviewing them before ticking "Hebrew checked".
- **Order of work:** finish the variations change (009) in the export and app first, then add the Hebrew columns, so the export script is only rewritten once.
- **Revisit if:** we plan a third or fourth language, or bring in outside translators. Then a translation platform (option 3) pays off.
