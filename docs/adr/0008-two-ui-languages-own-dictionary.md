# 8. Two UI languages with an own dictionary

Date: 2026-10-05 · Status: accepted

## Context

Steven wants the user interface in German and English. The page is a single file with no
external requests (ADR-0004) and has about 30 texts.

## Decision

- The UI has two languages: German (`de`) and English (`en`).
- The texts live in one dictionary, `src/i18n.ts`. No i18n library.
- The English list has the type `Record<MessageKey, string>`, so a missing text is a type error.
- `index.html` marks each text with a `data-i18n` key. `main.ts` replaces the texts at start and
  on each language change.
- First language: the saved choice, else the first browser language that keysmith has, else
  German. A DE/EN switch in the top bar saves the choice in `localStorage`.
- `formatDuration` in `src/lib/crack-time.ts` takes the language, because it builds the text
  from numbers and units.

## Consequences

- No new dependency and no extra bytes for features we do not use (plural rules, lazy loading).
- A third language means one more dictionary and one more `formatDuration` word list.
- The static HTML holds the German texts. Before `main.ts` runs, an English user can see German
  for a moment.
