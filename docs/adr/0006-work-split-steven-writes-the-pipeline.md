# 6. Work split: Steven writes the pipeline, Claude builds the app

Date: 2026-10-03 · Status: accepted

## Context

The pipeline is the graded part of the task. Steven has built a workflow only once before
(meine-app) and wants to learn by doing it.

## Decision

| Steven | Claude |
|---|---|
| `.github/workflows/pipeline.yml` | `src/`, `tests/`, `index.html` |
| `.github/dependabot.yml` | `package.json` and its scripts, all tool configs, `.nvmrc`, `LICENSE` |
| Repo settings: secret, environment, branch protection | The full `README.md` |
| Fixes for the final challenge | The final-challenge app and its result table (ADR-0007) |

- The `package.json` scripts are the contract: `lint`, `format:check`, `typecheck`, `test`,
  `build`, and `ci` (all checks in order, for local runs).
- Guide style: Steven writes every YAML line. Claude explains concepts, points to building blocks
  (the task PDF's "Bausteine" table, the meine-app workflow) and reviews diffs. When Steven is stuck,
  Claude shows a small snippet from a different context for him to adapt.
- Git: one feature branch and one PR per phase, Conventional Commits, squash-merge.
