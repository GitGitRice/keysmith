# 5. Pipeline layout and release scheme

Date: 2026-10-03 · Status: accepted

## Decision

One workflow, `.github/workflows/pipeline.yml`, starts on `push` and `pull_request`.

| Job       | Purpose                                                | Condition      | needs          | Environment  | Artifact |
| --------- | ------------------------------------------------------ | -------------- | -------------- | ------------ | -------- |
| `lint`    | ESLint, Prettier check, `tsc --noEmit`, actionlint     | always         | –              | –            | –        |
| `test`    | Vitest                                                 | always         | –              | –            | –        |
| `build`   | single-file build, zip                                 | always         | `lint`, `test` | –            | upload   |
| `release` | `gh release create v0.1.<run_number> --generate-notes` | push to `main` | `build`        | `production` | download |

- Node version comes from `.nvmrc` (`24`) through `setup-node` with `node-version-file`.
- npm cache key uses `hashFiles('package-lock.json')`.
- Permissions: `contents: read` for the workflow. Only `release` adds `contents: write` and
  `actions: read`.
- Secrets: `GITHUB_TOKEN` for the release. An environment secret `DEPLOY_TOKEN` exists as a course
  demonstration. Only its length is printed. The README marks it as a demonstration.
- Environment `production`: Steven as required reviewer, deployment branch `main` only.
  "Prevent self-review" stays off.

Toolchain: Node 24 (`engines >=24`), npm, TypeScript strict, ESLint + Prettier, actionlint.
No super-linter (too slow in meine-app). No Node version matrix (Node only builds; the app runs
in the browser).

Extras after the 10 minimum requirements: SHA-pinned actions, branch protection with required
checks, Dependabot (npm and github-actions). If time is left: CodeQL, `SECURITY.md`.

## Consequences

- `lint` and `test` run in parallel. The build runs once, and `release` reuses its artifact.
- Each merge to `main` waits for Steven's approval before it releases.
- Later upgrade: release-please (version from Conventional Commits) in place of the run number.
