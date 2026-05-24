# Agent Guide

## Session Handoff Tracking

At the start of every session, run:

```bash
npm run agent:start -- --owner codex --sync-doc
```

During work, update progress with:

```bash
npm run agent:progress -- --completed "<summary>" --sync-doc
```

Use `agent_progress.json` as the source of truth. `docs/AGENT_PROGRESS.md` is generated from it.

## Project Context

This repository is a Playwright TypeScript automation framework for the Singer Bangladesh ecommerce website.

Primary test areas:

- Sanity UI coverage under `tests-ts/sanity/`
- API-assisted regression coverage under `tests-ts/regression/`
- Visual regression coverage under `tests-ts/visual/`

## Core Commands

```bash
npm run typecheck
npm run test:sanity
npm run test:regression
npm run test:visual
npm run test:visual:update
npm run docs:test-cases
```

Use `test:visual:update` only when an intentional UI change should become the new screenshot baseline.
Run `docs:test-cases` after adding, removing, renaming, or materially changing test cases.

## Current Architecture

- Page objects live in `src/pages/`.
- API client, models, and agents live in `src/api/`.
- Shared Playwright fixtures live in `tests-ts/fixtures/`.
- `tests-ts/fixtures/globalSetup.ts` validates the selected environment and checks `BASE_URL` reachability before tests run.
- `tests-ts/fixtures/dataFactory.ts` uses `CatalogApiAgent` to provide live API-backed test data.
- `tests-ts/fixtures/singerTest.ts` exposes `dataFactory` and `liveProduct` fixtures.

## Execution Rules

- `playwright.config.ts` enables fully parallel execution.
- CI is capped at 2 workers with `workers: process.env.CI ? 2 : undefined`.
- Cart sanity cases remain serial because they mutate guest cart state.
- Sanity scripts run Chromium by default to match CI browser installation.

## CI

- `.github/workflows/sanity.yml` runs sanity checks on push to `main`, pull request, and manual dispatch.
- `.github/workflows/regression.yml` runs regression checks on a daily cron schedule and manual dispatch.
- Workflow artifacts include `test-results/`, `playwright-report/`, and `allure-results/` where applicable.

## Documentation

Keep these docs aligned when changing framework behavior:

- `README.md`
- `docs/agent.md`
- `docs/architecture.md`
- `docs/commands.md`
- `docs/ci.md`
- `docs/environments.md`
- `docs/mcp.md`
- `docs/project-structure.md`
- `docs/reports.md`
- `docs/walkthrough.md`
- `docs/AGENT_PROGRESS.md`
- `docs/test-cases.md`

Keep `README.md` concise and wire detailed guidance into focused files under `docs/`.
Avoid running `npm run docs:update` unless you intend to regenerate `README.md` and `docs/agent.md`; the generator is intentionally broad and may overwrite hand-written README sections.
