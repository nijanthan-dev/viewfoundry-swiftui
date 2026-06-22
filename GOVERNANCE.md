# Governance

ViewFoundry SwiftUI is maintainer-led.

## Decision Process

- Use GitHub issues for scoped work.
- Use one pull request per issue.
- Keep architecture and workflow decisions in repo docs or
  `plugins/viewfoundry-swiftui/skills/viewfoundry/references/`.
- Prefer small, reversible decisions while the project is scaffold-stage.

## Merge Policy

Maintainers merge after:

- CI passes.
- Local checks and secret scans pass.
- `@Codex` review is clean.
- The PR stays within its issue scope.

All merges to `main` are squash merges.

## Scope Control

Do not add production SwiftUI generation, real imagegen provider calls, broad
runtime APIs, or design-tool plugins unless the current issue explicitly asks
for them.

## Releases

Releases use version tags and GitHub Releases only. See
[docs/release.md](docs/release.md).
