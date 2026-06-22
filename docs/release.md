# Release Process

ViewFoundry SwiftUI releases are GitHub Releases created from version tags.

## Tag Format

Use semantic version tags:

```sh
v0.1.0
v1.2.3
```

Only tags matching `v*.*.*` trigger the release workflow.

## Create A Release

1. Make sure `main` is green.
2. Create and push a version tag:

```sh
git fetch origin main
git switch main
git pull --ff-only origin main
git tag v0.1.0
git push origin v0.1.0
```

The `Release` workflow publishes a GitHub Release for the tag using GitHub
generated release notes.

## Local Checks

Before tagging, run the current scaffold checks:

```sh
npm run plugin:validate
npm run plugin:smoke
npm run check
npm run secrets
```

Optional Docker check:

```sh
docker build -t viewfoundry-swiftui-check .
docker run --rm viewfoundry-swiftui-check
```

There is no local dry-run that proves GitHub Release publishing end to end. The
workflow can be syntax-checked locally, but a real release is only tested after a
version tag is pushed.

## Not Published Yet

This repo is still scaffold-only. Releases do not publish npm packages, Swift
packages, binaries, archives, Docker images, app builds, or external plugin
artifacts.

The Codex plugin is packaged in-repo at `plugins/viewfoundry-swiftui/` and
represented in `.agents/plugins/marketplace.json`. CI validates that package and
runs a local package/install smoke test, but #54 owns any future release artifact
publishing.
