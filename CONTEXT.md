# keysmith

keysmith is a local web page that generates passwords and secret tokens in the browser. It is also
the test case for a CI/CD pipeline (Syntax Modul 4, Tag 5 project "Eigene CI/CD-Pipeline").

## Language

### App

**Generator**:
One of the two functions that make a value: the password generator or the secret-token generator.

**Password**:
A random string of characters for a human to type or store in a password manager.
_Avoid_: passphrase (out of scope, see ADR-0002), passcode

**Character class**:
One group of characters a password can use: lowercase, uppercase, digits, symbols. Each enabled
class appears at least once in a password.

**Secret token**:
N random bytes, encoded as hex or base64url, for machine use: `.env` values, API keys, session
secrets.
_Avoid_: key, API key, secret (alone)

**Entropy**:
The estimated strength of a value in bits. The UI shows it next to each result.

**Uniform sampling**:
Choosing each character or byte with exactly equal chance, by rejection sampling over
`crypto.getRandomValues`.
_Avoid_: `Math.random`, `random % n` (both are wrong here)

**Single-file build**:
The build output: one `index.html` with all JS and CSS inlined. It opens by double-click from
`file://` and makes no network requests.

### Pipeline

**Pipeline**:
The GitHub Actions workflow `.github/workflows/pipeline.yml` and its four jobs: `lint`, `test`,
`build`, `release`.
_Avoid_: CI (alone), workflow (when the four-job pipeline is meant)

**Artifact**:
The single-file build, uploaded by `build` and downloaded by `release`. It is built once.

**Environment**:
The GitHub environment `production`: Steven as required reviewer, deployment branch `main` only.
It holds the `DEPLOY_TOKEN` and `AWS_ROLE_ARN` secrets.

**Release**:
A GitHub Release `v0.1.<run_number>` with the zipped single-file build as its asset. Created by the
`release` job of the pipeline.
_Avoid_: publish

**S3 deploy**:
The workflow `.github/workflows/deploy-aws.yml`: it builds the single-file build and syncs it to the
S3 bucket. It logs in to AWS with OIDC (ADR-0009). Removed from `main` after the AWS cleanup on
2026-10-05; the last version is in commit `a323518`.
_Avoid_: pipeline (for this workflow), upload (alone)

**OIDC role**:
The IAM role `github-actions-deploy` that the S3 deploy assumes. Its trust policy allows only
`environment:production` of this repo. Its policy allows only the keysmith bucket. Deleted on
2026-10-05.
_Avoid_: AWS user, access key

**Phase**:
One of the steps of the task PDF (Phase 1–5 plus the final challenge). Each phase maps to one
GitHub issue and one PR.

**Final challenge**:
The Tag 5 task PDF's broken Python pipeline with six problems. It runs in the separate repo
`pipeline-challenge`.
_Avoid_: Abschluss-Challenge (in English text)
