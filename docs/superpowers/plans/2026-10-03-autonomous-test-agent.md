# Autonomous Test Agent Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a restartable, safety-bounded controller that autonomously generates, runs, classifies, selector-heals, and reruns Singer Bangladesh tests for up to five hours.

**Architecture:** A Node.js orchestrator invokes a pinned Codex CLI once per narrowly scoped proposal or repair, validates every structured response with Zod, and composes the repository’s existing generator and Playwright commands. Pure modules own policy and classification; a process runner and atomic run store isolate side effects, making deadline, safety, and recovery behavior unit-testable.

**Tech Stack:** Node.js ESM, TypeScript test definitions, Zod, Playwright Test, Codex CLI, Node’s built-in test runner.

**Spec:** `docs/superpowers/specs/2026-10-03-autonomous-test-agent-design.md`

## Global Constraints

- Default and maximum runtime: `18_000` seconds.
- Maximum repair attempts per test: `3`.
- Acceptance requires `2` consecutive passing executions.
- Never perform checkout, payment, account creation, communication, deletion of existing tests, commits, pushes, or PR creation.
- Writable generated paths: `ai/definitions/`, `tests-ts/ai-generated/`, `docs/test-cases.md`, and `artifacts/autonomous-runs/` only.
- Never modify a path that was already dirty when the controller started.
- Treat Singer CDN “Access Denied” as an environment failure and never as a selector failure.
- Heal selectors only; never remove or weaken an assertion.

## Review Focus

- A child process exceeds the remaining deadline: terminate it and persist a timed-out iteration.
- The repo starts dirty in an allowed path: protect that path and choose a different test ID/file.
- Codex returns malformed JSON or an out-of-scope path: reject it without writing files.
- Playwright returns Access Denied while API calls work: classify as environment and preserve assertions.
- The controller crashes after writing a definition but before reporting: atomic state must permit safe resume without duplication.

---

### Task 1: Pure configuration, policy, and failure classification

**Files:**

- Create: `scripts/autonomous/config.mjs`
- Create: `scripts/autonomous/policy.mjs`
- Create: `scripts/autonomous/classify-failure.mjs`
- Create: `tests-unit/autonomous-policy.test.mjs`
- Modify: `package.json`

**Interfaces:**

- Produces: `parseAutonomousArgs(argv, env) -> AutonomousConfig`, `assertAllowedChanges(initialDirty, changedPaths)`, and `classifyFailure({ exitCode, stdout, stderr, errorContexts }) -> FailureKind`.
- `FailureKind` is one of `product | selector | test-code | environment | unknown`.

- [ ] **Step 1: Write failing unit tests** for the 18,000-second default/cap, three-attempt default, two-pass requirement, allowed-path enforcement, initially-dirty protection, destructive-route rejection, Access Denied classification, selector timeout classification, assertion failure classification, and unknown fallback.
- [ ] **Step 2: Run `node --test tests-unit/autonomous-policy.test.mjs`** and verify failures report missing modules/exports.
- [ ] **Step 3: Implement the three pure modules** with constants `MAX_DURATION_SECONDS = 18_000`, `MAX_REPAIR_ATTEMPTS = 3`, and `REQUIRED_CONSECUTIVE_PASSES = 2`; use normalized repository-relative paths and explicit route/action deny lists.
- [ ] **Step 4: Add `test:unit` to `package.json`** as `node --test tests-unit/*.test.mjs`.
- [ ] **Step 5: Run `npm run test:unit`** and verify all policy/classification tests pass.
- [ ] **Step 6: Commit** with `git commit -m "test: define autonomous agent safety policy"`.

### Task 2: Deadline-aware process execution and atomic run storage

**Files:**

- Create: `scripts/autonomous/process-runner.mjs`
- Create: `scripts/autonomous/run-store.mjs`
- Create: `tests-unit/autonomous-runtime.test.mjs`
- Modify: `.gitignore`

**Interfaces:**

- Consumes: `AutonomousConfig` from Task 1.
- Produces: `runProcess(command, args, { cwd, env, deadlineMs, outputDir }) -> ProcessResult`; `createRunStore(root, runId)`, `acquireLock()`, `appendEvent(event)`, `writeState(state)`, `loadState()`, and `releaseLock()`.

- [ ] **Step 1: Write failing tests** proving stdout/stderr capture, non-zero exit preservation, forced termination at deadline, atomic `state.json`, append-only `events.jsonl`, exclusive locking, stale-lock diagnostics, and recovery from a partial temporary file.
- [ ] **Step 2: Run `npm run test:unit`** and verify the new runtime tests fail for missing implementations.
- [ ] **Step 3: Implement the process runner** using `spawn`, remaining-deadline timeouts, `SIGTERM` followed by bounded `SIGKILL`, and per-command log files.
- [ ] **Step 4: Implement the run store** using write-to-temp plus rename, and create `artifacts/autonomous-runs/.gitkeep` while ignoring run contents.
- [ ] **Step 5: Run `npm run test:unit`** and verify runtime and policy tests pass.
- [ ] **Step 6: Commit** with `git commit -m "feat: add autonomous run lifecycle"`.

### Task 3: Structured Codex worker boundary

**Files:**

- Create: `ai/autonomous-agent.schema.json`
- Create: `ai/autonomous-agent-prompt.md`
- Create: `scripts/autonomous/codex-worker.mjs`
- Create: `tests-unit/autonomous-worker.test.mjs`
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**

- Consumes: `runProcess` from Task 2 and the existing JSON definition contract in `ai/test-case-parser.ts`.
- Produces: `requestTestProposal(context, options) -> TestProposal` and `requestSelectorRepair(context, options) -> RepairProposal`.

- [ ] **Step 1: Write failing tests** using a fake executable to cover valid proposal parsing, malformed JSON, duplicate IDs, prose surrounding JSON, forbidden file paths, forbidden user journeys, assertion deletion, selector-only repair acceptance, CLI timeout, and missing-auth diagnostics.
- [ ] **Step 2: Run `npm run test:unit`** and verify worker tests fail for the missing module.
- [ ] **Step 3: Add a pinned `@openai/codex` development dependency** and confirm `npx codex exec --help` works without installing global software.
- [ ] **Step 4: Define the JSON schema and prompt** so proposals contain one complete definition, rationale, covered risk, changed paths, and no shell commands; repair proposals contain only selector replacements plus evidence.
- [ ] **Step 5: Implement the worker boundary** using `npx codex exec --full-auto --output-schema ai/autonomous-agent.schema.json`, capture the final JSON, validate again with Zod, and reject every policy violation before returning.
- [ ] **Step 6: Run `npm run test:unit`** and verify all worker tests pass.
- [ ] **Step 7: Commit** with `git commit -m "feat: add structured Codex test worker"`.

### Task 4: Discovery, definition validation, and generation pipeline

**Files:**

- Create: `scripts/autonomous/discovery.mjs`
- Create: `scripts/autonomous/test-pipeline.mjs`
- Create: `tests-unit/autonomous-pipeline.test.mjs`
- Modify: `ai/test-case-parser.ts`
- Modify: `ai/generate-test.ts`

**Interfaces:**

- Consumes: validated `TestProposal`, process runner, existing definitions, and existing generator.
- Produces: `buildCoverageManifest() -> CoverageManifest`, `validateProposalAgainstManifest(proposal, manifest)`, and `materializeCandidate(proposal, runContext) -> CandidateResult`.

- [ ] **Step 1: Write failing tests** for deterministic manifests, duplicate semantic coverage, duplicate IDs, safe filename calculation, single-definition generation, generation rollback, unused generated-helper prevention, and protection of initially dirty files.
- [ ] **Step 2: Run `npm run test:unit`** and verify pipeline tests fail for missing behavior.
- [ ] **Step 3: Export the existing Zod schema and renderer seams** from `ai/test-case-parser.ts` and `ai/generate-test.ts` without changing generated-test semantics.
- [ ] **Step 4: Update generation to emit only helpers used by a definition**, eliminating the repository’s current unused-helper lint failures in regenerated specs.
- [ ] **Step 5: Implement discovery and candidate materialization** with one-definition generation, Prettier, TypeScript, targeted ESLint, Git path checks, and rollback from byte-for-byte snapshots on rejection.
- [ ] **Step 6: Run `npm run test:unit`, `npm run ai:generate-tests`, and `npm run quality`**; verify unit tests pass and generated output is deterministic and lint-clean.
- [ ] **Step 7: Commit** with `git commit -m "feat: add autonomous test generation pipeline"`.

### Task 5: Execution, evidence collection, and bounded healing

**Files:**

- Create: `scripts/autonomous/test-executor.mjs`
- Create: `scripts/autonomous/healing-loop.mjs`
- Create: `tests-unit/autonomous-healing.test.mjs`
- Modify: `ai/repair-selectors.ts`

**Interfaces:**

- Consumes: `CandidateResult`, `classifyFailure`, `requestSelectorRepair`, `runProcess`, and `RunStore`.
- Produces: `executeCandidate(candidate, context) -> TestRunResult` and `healUntilTerminal(candidate, context) -> IterationResult`.

- [ ] **Step 1: Write failing tests** for first-pass success followed by confirmation success, pass-then-fail rejection, product failure without healing, Access Denied environment retry with bounded backoff, selector repair capped at three attempts, invalid repair rollback, and deadline expiration during retry.
- [ ] **Step 2: Run `npm run test:unit`** and verify healing tests fail for missing modules.
- [ ] **Step 3: Refactor selector scoring** to export structured candidate results while retaining the current CLI output contract.
- [ ] **Step 4: Implement focused Playwright execution** using the generated spec path and test ID, preserving trace/screenshot/video paths and collecting `error-context.md` text.
- [ ] **Step 5: Implement the state machine** `proposed -> generated -> running -> classifying -> repairing | confirming -> accepted | failed | deferred`, with three total repair attempts and two consecutive passes.
- [ ] **Step 6: Run `npm run test:unit`** and verify all healing scenarios pass without contacting the live website.
- [ ] **Step 7: Commit** with `git commit -m "feat: add bounded test healing loop"`.

### Task 6: Five-hour controller, resume, and operator reports

**Files:**

- Create: `scripts/autonomous-test-agent.mjs`
- Create: `scripts/autonomous/report.mjs`
- Create: `tests-unit/autonomous-controller.test.mjs`
- Modify: `package.json`
- Modify: `README.md`
- Modify: `docs/commands.md`
- Modify: `docs/ai-assisted-workflow.md`

**Interfaces:**

- Consumes: all Task 1–5 interfaces.
- Produces: CLI commands `agent:test:auto`, `agent:test:auto:dry-run`, and `agent:test:auto:resume`; final `summary.md` and machine-readable `state.json`.

- [ ] **Step 1: Write failing controller tests** with a fake clock/worker/executor for five-hour termination, zero remaining time, iteration budget exhaustion, no-useful-coverage stop, crash/resume, fingerprint mismatch, lock contention, and final report totals.
- [ ] **Step 2: Run `npm run test:unit`** and verify controller tests fail for missing behavior.
- [ ] **Step 3: Implement preflight and orchestration** with dependency/auth/browser/network checks, monotonic deadline calculation, one-test iterations, event persistence after each transition, signal handling, and guaranteed lock release.
- [ ] **Step 4: Implement dry-run and resume modes**; dry-run must invoke neither Codex nor Playwright and must write no definitions.
- [ ] **Step 5: Implement Markdown/JSON summaries** listing accepted, product-failing, environment-deferred, rejected, and timed-out candidates with artifact paths and elapsed time.
- [ ] **Step 6: Add npm commands and operator documentation**, including prerequisites, safe defaults, cost implications, artifact cleanup, resume behavior, and the known Singer CDN restriction.
- [ ] **Step 7: Run `npm run test:unit`, `npm run quality`, and `npm run agent:test:auto:dry-run`**; verify all pass and dry-run reports zero repository mutations.
- [ ] **Step 8: Commit** with `git commit -m "feat: orchestrate autonomous test agent"`.

### Task 7: Controlled end-to-end validation

**Files:**

- Modify only if defects are found: files introduced in Tasks 1–6.
- Generate: `artifacts/autonomous-runs/<run-id>/` (ignored runtime evidence).

**Interfaces:**

- Consumes: completed operator CLI.
- Produces: evidence that the real controller stops safely and classifies the current Singer environment correctly.

- [ ] **Step 1: Record the initial Git status** and verify all pre-existing dirty paths are protected.
- [ ] **Step 2: Run a 10-minute capped validation** with `npm run agent:test:auto -- --duration-seconds=600 --max-iterations=1`.
- [ ] **Step 3: Verify current Access Denied behavior is classified `environment`**, no assertion is rewritten, no destructive route is visited, and the controller exits within 660 seconds.
- [ ] **Step 4: Run `npm run test:unit`, `npm run quality`, `npm run docs:test-cases`, and `git diff --check`**; record exact pass/fail counts and distinguish pre-existing failures.
- [ ] **Step 5: Inspect the final run report and Git diff** to confirm changes remain inside the allowlist and initially dirty files were untouched.
- [ ] **Step 6: Commit any validation-only fixes** with `git commit -m "fix: harden autonomous test agent validation"`.
