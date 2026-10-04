# Final challenge: debugging a broken pipeline

[Deutsche Fassung](final-challenge.de.md)

The task's final challenge is a broken Python pipeline with six problems, some functional and
some security-related. keysmith is TypeScript, so the challenge ran in a separate repo (see
[ADR-0007](adr/0007-final-challenge-in-separate-repo.md)):
[GitGitRice/pipeline-challenge](https://github.com/GitGitRice/pipeline-challenge).

- Broken version: commit
  [`600af3c`](https://github.com/GitGitRice/pipeline-challenge/commit/600af3c), the task's YAML
  unchanged.
- Repaired version: commit
  [`31ef621`](https://github.com/GitGitRice/pipeline-challenge/commit/31ef621), run
  [37224758323](https://github.com/GitGitRice/pipeline-challenge/actions/runs/37224758323)
  green, release
  [`v1.0.9`](https://github.com/GitGitRice/pipeline-challenge/releases/tag/v1.0.9) with
  `app.zip`.

## Result table

| #   | Symptom / risk                                                                                      | Cause                                                                                                                      | Fix                                                                                                                                                                                                                                                                                                                                                                                                                                     | Broken rule                                                                            |
| --- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| 1   | `setup-python` looks for version `3.1`, the run fails                                               | `python-version: 3.10` without quotes. YAML reads a number and drops the trailing zero.                                    | `python-version: "3.12"` ([`b31a8ee`](https://github.com/GitGitRice/pipeline-challenge/commit/b31a8ee))                                                                                                                                                                                                                                                                                                                                 | Quote version numbers in YAML (Day 2)                                                  |
| 2   | `No module named pytest`, the run fails                                                             | The test step comes before the install step                                                                                | Install the dependencies first, then run the tests ([`c7b1c56`](https://github.com/GitGitRice/pipeline-challenge/commit/c7b1c56))                                                                                                                                                                                                                                                                                                       | Steps run top to bottom: dependencies, then tests (Day 2)                              |
| 3   | `Could not open requirements file: 'requirement.txt'`, the run fails                                | Typo in the file name (missing `s`)                                                                                        | `requirements.txt` ([`c654eaf`](https://github.com/GitGitRice/pipeline-challenge/commit/c654eaf))                                                                                                                                                                                                                                                                                                                                       | Paths in the workflow must match the repo (Day 2)                                      |
| 4   | `build` cannot find `src/`. It also runs, and a release was published, while the tests were red     | `build` has no `actions/checkout` and no `needs: test`. All jobs start in parallel on empty runners.                       | Checkout and setup-python in `build`; chain the jobs `test → build → deploy → release` with `needs:` ([`7d30715`](https://github.com/GitGitRice/pipeline-challenge/commit/7d30715))                                                                                                                                                                                                                                                     | Each job starts on an empty runner; no build or release without green tests (Days 2–4) |
| 5   | Security: deployment runs on every branch and pull request, without approval, and prints the secret | `deploy` has no `if:` and no `environment:`. `echo "Deploy nach ${{ secrets.DEPLOY_TOKEN }}"` writes the value to the log. | `if: github.ref == 'refs/heads/main'` and `environment: production` (required reviewer, branch rule `main`, `DEPLOY_TOKEN` as environment secret) on `deploy` and `release`. The secret goes in through `env:` and is never printed; an empty value fails with `::error::` ([`b787ae7`](https://github.com/GitGitRice/pipeline-challenge/commit/b787ae7), [`c7d310d`](https://github.com/GitGitRice/pipeline-challenge/commit/c7d310d)) | Use secrets without printing them; protect deployment with an environment (Day 4)      |
| 6   | Quality: the pip cache never updates, installs keep old packages                                    | Static key `pip-cache` without `hashFiles()`. The cache step also sat in `release`, which never runs pip.                  | Move the cache into `test`; key `${{ runner.os }}-pip-${{ hashFiles('**/requirements.txt') }}` ([`99e5ac2`](https://github.com/GitGitRice/pipeline-challenge/commit/99e5ac2), [`b31a8ee`](https://github.com/GitGitRice/pipeline-challenge/commit/b31a8ee))                                                                                                                                                                             | The cache key must change with the dependencies (Day 3)                                |

Problems 5 and 6 never turn a run red. They are found by reading the workflow, not the log.

## Extra finding

The broken `release` job could never work, even after the six fixes:

| Symptom                                          | Cause                                                                                                 | Fix                                                                                                                                                                                                                                      |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `release` has no `build/app.zip`, and `gh` fails | No `download-artifact`, so the package is missing. No checkout, so `gh` does not know the repository. | Download the artifact `app-paket` ([`99e5ac2`](https://github.com/GitGitRice/pipeline-challenge/commit/99e5ac2)); set `GH_REPO: ${{ github.repository }}` ([`b31a8ee`](https://github.com/GitGitRice/pipeline-challenge/commit/b31a8ee)) |

## Secret check

The broken `deploy` job printed `${{ secrets.DEPLOY_TOKEN }}`. The logs of the broken runs show
`Deploy nach` followed by an empty string. The token is an environment secret of `production`,
and a job without `environment:` cannot read it. No value reached a log.
