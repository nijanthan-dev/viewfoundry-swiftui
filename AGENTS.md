# Agent Guidance

## Mandatory Codex Baseline

These rules are self-contained. Do not depend on or assume `~/.codex/AGENTS.md` was loaded.

- Read this file before planning, tool use, edits, or Git/GitHub actions.
- Be extremely concise in interactions and commit messages.
- Diagnose first. Once cause is clear, stop broad exploration and execute.
- Batch independent reads/searches. Prefer `rg`, filenames, counts, selected lines, summaries, or scripts over full dumps.
- Default each tool result to 100 lines or 20 KB maximum. Expand only relevant sections. Store noisy logs in temporary files and return summaries plus exceptions.
- Request only needed API/CLI fields. If output truncates, narrow the query; never rerun unchanged with a larger cap.
- Exceed output limits when required for correctness, security, or debugging.
- Do not reread unchanged files, logs, PR state, or tool output. Recheck only when state may have changed or a required gate demands it.
- Start with zero skills. Load exactly one only when clearly applicable, explicitly requested, or required. Prefer the narrowest skill; never load precautionary or overlapping skills.
- Before loading a second skill, state the distinct missing capability and why current tools/skill cannot cover it. Maximum two unless user or higher-priority instructions require more.
- At first skill use, report `Skills: <name> — <reason>`. In normal prose finals, report every skill used; report `Skills: none` if none. Omit this line when higher-priority instructions or an exact machine-readable output format forbids extra text.
- Use subagents only for independent work. Give narrow briefs and minimal history. Skip delegation when coordination costs exceed the work.
- Prefer deterministic scripts for repeated audits, polling, parsing, and verification. Return aggregates plus exceptions, not raw records.
- Keep the strongest model for ambiguous, high-risk, architecture, debugging, and review work. Use cheaper/faster models only for bounded mechanical work with deterministic validation.
- Never reduce required checks, security review, test coverage, or live-state verification to save tokens.
- Before editing, verify cwd, branch, and worktree match the task. Preserve unrelated user changes.
- Use standard branch prefixes. For parallel/automation work, prefer a fresh worktree from current `origin/main`.
- Use GitHub CLI for GitHub. Never run `gh auth refresh` unless explicitly requested. If a scope is missing, report it and stop.
- Before acting on PR review state, recheck head, latest reviews, unresolved threads, and checks live. Eyes/ack reactions are not approval.
- Fix valid review comments, reply with the fix, resolve the thread, and scan for the same bug class before re-review.
- Before merge, run Gitleaks on local history/current tree and PR diff; inspect remote PR state for secrets. If a secret reached remote Git, stop and remove it from branch history.
- Squash merge only. After merge, verify PR/issue closure and relevant main CI, update main, and clean safe merged branches/worktrees.
- Planning/issue-only requests stop at planning/issues unless implementation is explicit. End plans with extremely concise unresolved questions, if any.
- Fix issues introduced by current work and failures blocking required validation. Report unrelated pre-existing failures clearly; do not expand scope to fix them unless the user authorizes it.
- Never print, log, commit, screenshot, or comment secrets. Do not ask users to paste raw secrets.

## Scope

- Use `plugins/viewfoundry-swiftui/skills/viewfoundry/SKILL.md` for repo work.
- Work one issue at a time in a child worktree.
- Do not start the next issue while the current PR is unmerged.
- Treat `origin/main` and live GitHub PR/issue state as source of truth.
- Stop if local `main` cannot sync to `origin/main`; do not start issue work
  from a stale baseline.
- Keep docs and learnings concise, reusable, and repo-specific.
- Never add co-author or generated-by attribution.

## Skill Process

- Create a repo skill when repeat work needs local rules, assets, or workflow memory.
- Update a repo skill when a reviewed PR changes workflow, architecture, checks, or scope.
- Prefer updating `references/` over long notes in the skill entrypoint.
- Keep skills plugin-first and TypeScript-first later.
- Treat `ios-app-intents` as optional unless Siri, Shortcuts, Spotlight, widgets, or Control Center actions are in scope.

## PR Flow

1. Branch from current `origin/main`.
2. Implement only the issue in scope.
3. Run local checks and Docker checks when available.
4. Open a PR with required body sections.
5. Ask `@Codex` for review once checks pass.
6. If review is only an eyes reaction, wait; do not merge.
7. If review feedback appears, verify it against current code before changing
   files.
8. Fix every valid actionable item.
9. Rerun relevant checks serially.
10. Re-request `@Codex` review once after fixes.
11. Resolve addressed review threads; minimize stale/outdated threads when the
    PR surface is noisy.
12. Run Gitleaks on local history/current tree and inspect remote PR diff/state
    for leaks.
13. If a secret reaches remote Git, stop and remove it from branch history
    before merge.
14. Merge only after latest-head clean review, green checks, and secret scan.
15. Squash merge only.
16. Verify issue closure; comment with PR link and close manually if needed.
17. Delete branch, clean child worktree, and archive/handoff.

## Review Lessons

- Use `plugins/viewfoundry-swiftui/skills/viewfoundry/references/review-learnings.md` before PR fixes,
  release/CI edits, screenshot-runner edits, report/schema edits, or mocked
  pipeline changes.
- Do not blindly implement reviewer text. Confirm the finding is still present
  on the current PR head and not an outdated thread.
- Keep `package.json` and `package-lock.json` metadata in sync, including `bin`
  entries.
- Keep runtime reports and `schemas/runtime-contract.schema.json` in sync.
- Screenshot-only or simulator-skipped paths must not report `passed`.
- Do not run `npm run check` in parallel with scripts that run `npm ci` or
  mutate `node_modules`.
- If `@Codex` returns an explicit usage-limit or setup error, report the
  blocker and do not merge.

## GitHub Auth

- Never run `gh auth refresh` unless the user explicitly asks in the current turn.
- If GitHub auth lacks a scope, report the missing scope and stop; do not start device-login polling.

## Child Threads

- Stop child work before the orchestrator edits the same worktree.
- Do not let child threads keep polling when the orchestrator is active.
