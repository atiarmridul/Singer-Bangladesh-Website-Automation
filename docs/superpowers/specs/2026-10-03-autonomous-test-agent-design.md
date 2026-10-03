# Autonomous Test Agent Design

## Objective

Add an unattended test-engineering controller that runs for at most five hours. It discovers a coverage gap, asks a Codex worker to create one test definition or focused test change, generates and validates the test, executes it, classifies failures, performs bounded selector-only healing when justified, reruns the test, and records an auditable result before starting another iteration.

## Safety and Scope

- Default runtime is exactly 18,000 seconds; `--duration-seconds` may lower it but may not exceed 18,000.
- Each iteration adds at most one test case and gets at most three repair attempts.
- The controller never checks out, purchases, pays, creates an account, sends messages, deletes existing tests, changes production application code, commits, pushes, or opens a pull request.
- Generated work is restricted to `ai/definitions/`, `tests-ts/ai-generated/`, the test catalog, and run artifacts.
- Existing uncommitted work is protected. The controller records the initial changed paths and refuses any worker result that modifies paths outside its allowlist or overwrites an initially changed path.
- A generated test is accepted only after static validation and two consecutive passing executions.
- Assertions may not be removed or weakened during healing. Healing may change selector fields and candidate ordering only.

## Architecture

The orchestrator is a small Node.js program under `scripts/autonomous/`. It owns time limits, process execution, filesystem snapshots, state transitions, retries, and report generation. Codex is invoked once per bounded task through a pinned local CLI and must return JSON that validates against a Zod schema.

The existing `ai/generate-test.ts`, `ai/test-case-parser.ts`, `ai/repair-selectors.ts`, Playwright configuration, and `docs:test-cases` generator remain the source of truth for generated-test behavior. The controller composes them through child processes instead of duplicating their logic.

## Iteration Flow

1. Preflight verifies Node, npm, the pinned Codex CLI, credentials, Chromium, website reachability, writable directories, and the initial Git state.
2. Discovery builds a compact manifest from existing definitions and the generated test catalog.
3. Codex proposes exactly one JSON test definition and explains the risk it covers.
4. The controller validates schema, stable ID uniqueness, allowed actions, non-destructive routes, and path boundaries before writing.
5. Existing generation and formatting commands create the Playwright spec.
6. TypeScript and targeted lint checks run before browser execution.
7. The new test runs once. Its exit code, stderr, Playwright context, screenshots, and trace metadata feed deterministic failure classification.
8. Product failures are preserved without healing. Environment failures receive bounded exponential backoff. Selector/test-code failures may invoke one Codex repair proposal, constrained to selector-only JSON changes.
9. A candidate that passes runs again. Only two consecutive passes mark it accepted.
10. The controller updates the catalog, writes atomic state/report files, and starts the next iteration if time remains.

## Failure Classification

- `product`: the page loaded and a business assertion failed; keep evidence and do not self-heal.
- `selector`: the expected surface loaded but a locator was absent or ambiguous; eligible for selector repair.
- `test-code`: compilation, schema, import, or syntax failure; eligible for one bounded agent correction within the current attempt budget.
- `environment`: access denied, DNS/TLS/network failure, missing browser, unreachable base URL, authentication failure, or widespread blank/error pages; retry with backoff and never rewrite assertions.
- `unknown`: preserve evidence, stop healing that iteration, and continue only when the failure budget permits.

Singer CDN “Access Denied” content is explicitly classified as `environment`, not `selector`.

## Persistence and Recovery

Each run gets `artifacts/autonomous-runs/<run-id>/` containing `state.json`, `events.jsonl`, `summary.md`, Codex outputs, and pointers to Playwright artifacts. State is written atomically after every transition. A lock file prevents overlapping controllers. `--resume <run-id>` continues only when configuration and repository fingerprints match.

## Operator Interface

```bash
npm run agent:test:auto:dry-run
npm run agent:test:auto -- --duration-seconds=18000
npm run agent:test:auto:resume -- --run-id=<run-id>
```

Dry-run performs preflight, discovery, prompt construction, and validation without invoking Codex or changing test definitions.

## Completion Criteria

- The controller stops by the deadline even when child processes hang.
- Interruptions leave readable state and a resumable report.
- Tests prove deadline enforcement, allowlist protection, duplicate rejection, failure classification, repair limits, consecutive-pass acceptance, locking, and resume validation.
- A short smoke run demonstrates the complete loop without destructive website actions.
