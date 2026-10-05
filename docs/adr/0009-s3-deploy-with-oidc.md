# 9. S3 deploy with OIDC

Date: 2026-10-05 · Status: accepted

## Context

The Tag 6 task ("GitHub Actions mit AWS") adds a cloud target: static files in Amazon S3. The
pipeline must log in to AWS without long-lived access keys. GitHub sends an OIDC token, and AWS
gives the job temporary rights for one role. The task also has a challenge: a broken AWS
workflow with six errors.

## Decision

- **Content:** the S3 deploy uploads the single-file build (`dist/index.html`), not the PDF's
  sample `site/` folder.
- **Workflow:** a separate file `.github/workflows/deploy-aws.yml`, as the hand-in asks. It runs
  on push to `main` and on `workflow_dispatch`. It builds by itself (`npm ci`, `npm run build`)
  and does not use the pipeline's artifact. Steven writes it (ADR-0006). Actions are pinned to a
  commit SHA, like in `pipeline.yml`.
- **Environment:** the deploy job uses the existing environment `production` (required reviewer,
  branch `main` only).
- **Trust policy:** `aud` must equal `sts.amazonaws.com`. `sub` must equal
  `repo:GitGitRice@160424208/keysmith@1401356166:environment:production`. A job with an
  environment gets only this `sub`, so the PDF's second value `ref:refs/heads/main` is not needed
  and is left out.
- **Immutable subject:** the repo uses GitHub's immutable OIDC subject. The `sub` holds the owner
  ID and the repo ID next to the names, so the PDF's format `repo:<OWNER>/<REPO>:...` never
  matches. Read the prefix with `gh api repos/<owner>/<repo>/actions/oidc/customization/sub`. A
  new repo with the same name gets a new ID, so it cannot assume the role.
- **Role policy:** `s3:ListBucket` on the bucket, `s3:PutObject` and `s3:DeleteObject` on
  `<bucket>/*`. Nothing else.
- **Bucket:** region `eu-central-1`, Block Public Access on. To view the page, use
  `aws s3 presign`. CloudFront (the PDF's optional extension) is not part of this decision.
- **Settings:** the secret `AWS_ROLE_ARN` lives in the environment `production`, not at repo
  level. The variables `AWS_REGION` and `S3_BUCKET` are repo variables.
- **Challenge:** runs in the separate repo `pipeline-challenge` (same pattern as ADR-0007), with
  its own bucket and its own role. Its trust policy names only that repo. Claude adds the broken
  workflow verbatim; Steven fixes it; Claude writes the result table in
  `docs/aws-challenge.md` in keysmith.
- **Costs and cleanup:** a 1 USD budget alarm in AWS Billing. After the hand-in, Steven deletes
  both buckets, both roles and the OIDC provider, and disables `deploy-aws.yml`.

## Consequences

No AWS key is stored in GitHub. A run from a PR, another branch or another repo cannot assume
the keysmith role. The two buckets never share files, so `s3 sync --delete` in one repo cannot
delete files of the other. The build runs twice on a merge to `main` (pipeline and deploy).
This is accepted: the deploy workflow stays one file that the trainer can read alone.
