# 7. Final challenge in a separate repo

Date: 2026-10-03 · Status: accepted

## Context

The task PDF's final challenge is a broken Python pipeline with six problems. keysmith is
TypeScript, so the YAML cannot run here unchanged.

## Decision

- A separate throwaway repo, `pipeline-challenge` (no link to keysmith in its name), holds a tiny Python app (`src/`, `tests/`,
  `requirements.txt`).
- Claude builds the app and pastes the broken pipeline verbatim. Steven finds and fixes the six
  problems.
- After Claude verifies the fixes, Claude fills in the Symptom / Cause / Fix table in
  `docs/final-challenge.md` in keysmith.

## Consequences

The bugs stay exactly as the trainer meant them, including the Python-specific "3.10 becomes 3.1"
bug. keysmith stays free of a broken workflow.
