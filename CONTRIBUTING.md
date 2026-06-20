# Contributing

ViewFoundry SwiftUI is an early scaffold. Keep changes small, reviewable, and
honest about current maturity.

## Before You Start

- Open or pick one GitHub issue.
- Use one branch and one pull request per issue.
- Branch from current `origin/main`.
- Use standard branch names such as `docs/...`, `feat/...`, `fix/...`, or
  `chore/...`.
- Do not add `Co-authored-by`, `Generated-by`, Codex, OpenAI, Claude,
  ChatGPT, or AI attribution.

## Local Setup

```sh
npm install
pre-commit install
```

## Checks

Run the relevant checks before opening or updating a PR:

```sh
npm run check
npm run secrets
pre-commit run --all-files
sh scripts/docker-check.sh
```

Docs and staged command contracts are in
[docs/testing-strategy.md](docs/testing-strategy.md).

## Pull Requests

- Use the PR template.
- Include why the change is needed, what changed, and testing details.
- Update docs when behavior, commands, reports, or workflow changes.
- Keep public claims accurate; this repo is not production-ready.
- Request `@Codex` review after checks pass.
- Fix all actionable feedback before merge.

Maintainers squash merge after checks, secret scans, and review are clean.

## Security

Do not put secrets, tokens, private keys, provisioning profiles, or credentials
in commits, fixtures, issues, or PR comments. See [SECURITY.md](SECURITY.md)
for vulnerability reporting.
