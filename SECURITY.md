# Security policy

## Supported versions

Only the latest [release](https://github.com/GitGitRice/keysmith/releases/latest) gets fixes.
keysmith has no long-term support for older versions.

## Report a vulnerability

Do not open a public issue for a vulnerability.

Report it privately through GitHub:
[Report a vulnerability](https://github.com/GitGitRice/keysmith/security/advisories/new)
(tab **Security**, button **Report a vulnerability**).

Include:

- the version (release tag) or commit you tested,
- the steps to reproduce the problem,
- what an attacker can do with it.

keysmith is a course project with one maintainer. I try to reply within 7 days. When a fix is
ready, I publish it as a new release and credit you in the advisory, if you want that.

## Scope

In scope:

- weak or predictable output from the password or token generator,
- a way to make the built `index.html` load or send data over the network,
- a way to run injected script in the built `index.html`.

Out of scope:

- findings in build-time dependencies that never reach the built `index.html`, unless you show a
  real attack path,
- the dev server (`npm run dev`).
