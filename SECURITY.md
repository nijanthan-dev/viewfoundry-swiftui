# Security

## Supported Versions

Only the current `main` branch is in scope. The project is scaffold-stage and
does not publish production packages, binaries, or hosted services.

## Reporting A Vulnerability

Do not open a public issue with exploit details, credentials, or private data.

Use GitHub private vulnerability reporting if it is available for this repo. If
it is not available, open a minimal public issue asking for a private security
contact and omit sensitive details.

## Secrets

Before pushing security-sensitive changes, run:

```sh
npm run secrets
pre-commit run --all-files
```

If a secret reaches remote Git, stop and remove it from branch history before
merge. Rotate exposed credentials outside this repo.

## Scope

Useful reports include leaked credentials, unsafe workflow permissions,
dependency supply-chain issues, and generated artifact paths that could expose
local secrets.

Out of scope: production SLA requests, social engineering, spam, and reports
against future features that are not implemented.
