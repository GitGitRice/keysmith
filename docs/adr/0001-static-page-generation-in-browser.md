# 1. Static page, values are generated in the browser

Date: 2026-10-03 · Status: accepted

## Context

keysmith is the test case for the Tag 5 CI/CD project. Steven will also use it daily after the
hand-in to make passwords and secrets. It must run locally. The task PDF allows any language.

## Decision

keysmith is a static web page in TypeScript, built with Vite. The browser generates every value
with Web Crypto (`crypto.getRandomValues`). There is no backend and no server process.

## Consequences

- Secrets never leave the browser tab.
- Steven knows the stack from his POS project (Next.js, TypeScript).
- The task PDF's final challenge is a Python pipeline, so it cannot run in this repo (see ADR-0007).
- Considered and rejected: Python with a local server (needs a running process), Go with an
  embedded page (a new language inside a one-day task). A Go rebuild is a possible later project.
