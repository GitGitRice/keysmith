# 4. Single-file build, no external requests

Date: 2026-10-03 · Status: accepted

## Context

Steven wants to run keysmith locally after the hand-in, without cloning the repo or starting a
server.

## Decision

- The build makes one `index.html` with all JS and CSS inlined (`vite-plugin-singlefile`).
  It opens by double-click from `file://`.
- The release asset is this file, zipped as `keysmith-<version>.zip`.
- The page makes no external requests: no CDN, no web fonts, no analytics. A
  Content-Security-Policy `<meta>` tag enforces this.
- The UI is vanilla TypeScript with no framework. It supports light and dark mode.

## Consequences

- The release asset is directly usable. This makes the release a real deployment.
- The clipboard API can need a fallback on `file://`. Check this in the UI phase.
- The UI code lives only in `src/main.ts` and `index.html`. A later switch to a framework (for
  example Svelte) does not touch `src/lib/` or the tests.
