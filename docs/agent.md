# Automation Guide

This guide defines the Singer Bangladesh Playwright TypeScript automation structure.

## Page Objects

- `src/pages/basePage.ts`
- `src/pages/campaignPage.ts`
- `src/pages/cartPage.ts`
- `src/pages/categoryPage.ts`
- `src/pages/footerPage.ts`
- `src/pages/homePage.ts`
- `src/pages/loginPage.ts`
- `src/pages/productPage.ts`
- `src/pages/searchPage.ts`
- `src/pages/supportPage.ts`

## Sanity Specs

- `tests-ts/sanity/authentication.spec.ts`
- `tests-ts/sanity/campaign.spec.ts`
- `tests-ts/sanity/cart.spec.ts`
- `tests-ts/sanity/category.spec.ts`
- `tests-ts/sanity/footer.spec.ts`
- `tests-ts/sanity/homepage.spec.ts`
- `tests-ts/sanity/product-details.spec.ts`
- `tests-ts/sanity/product-listing.spec.ts`
- `tests-ts/sanity/sanity.spec.ts`
- `tests-ts/sanity/search.spec.ts`
- `tests-ts/sanity/support.spec.ts`

## Sanity Case Files

- `tests-ts/sanity/cases/authentication.ts`
- `tests-ts/sanity/cases/campaign.ts`
- `tests-ts/sanity/cases/cart.ts`
- `tests-ts/sanity/cases/category.ts`
- `tests-ts/sanity/cases/footer.ts`
- `tests-ts/sanity/cases/homepage.ts`
- `tests-ts/sanity/cases/index.ts`
- `tests-ts/sanity/cases/productDetails.ts`
- `tests-ts/sanity/cases/productListing.ts`
- `tests-ts/sanity/cases/search.ts`
- `tests-ts/sanity/cases/support.ts`

## Visual Specs

- `tests-ts/visual/homepage.visual.spec.ts`
- Baselines live next to the visual spec under `*-snapshots/`.
- Run `npm run test:visual` to compare and `npm run test:visual:update` only for intentional UI changes.

## Accessibility Specs

- `tests-ts/accessibility/homepage.a11y.spec.ts`
- `tests-ts/accessibility/a11y.ts` provides `checkA11y(page)` using axe-core.
- `tests-ts/accessibility/lighthouse.ts` runs a Lighthouse accessibility snapshot audit.
- Run `npm run test:a11y` for the accessibility suite.

## AI-Assisted Specs

- `ai/definitions/*.json` stores structured generated-test definitions.
- `ai/generate-test.ts` writes generated specs to `tests-ts/ai-generated/`.
- `ai/repair-selectors.ts` ranks selector candidates from definitions and optional failure context.
- Run `npm run ai:generate-tests` and `npm run test:ai-generated`.

## Self-Healing Locators

- `src/pages/basePage.ts` defines the self-healing locator strategy.
- Page objects can provide primary selectors, fallbacks, text hints, and attribute hints.
- Homepage header, search, and category navigation currently use the resilience layer.

## Test Case Catalog

- `docs/test-cases.md` is generated from Playwright tests and contains the written test case list plus execution flow.
- Run `npm run docs:test-cases` after adding, removing, renaming, or materially changing test cases.

## Current Agents

- `src/api/agents/catalogAgent.ts`

## Test Data

- `tests-ts/fixtures/dataFactory.ts` uses `CatalogApiAgent` to fetch live catalog data.
- `tests-ts/fixtures/singerTest.ts` exposes `dataFactory` and `liveProduct` fixtures.
- Prefer `liveProduct` for product and cart flows so tests avoid stale or out-of-stock static data.

## Purpose

Page objects keep locators and page actions reusable.
Specs keep assertions explicit and organized with `test.describe` blocks.
API agents provide optional typed access to Singer BD backend endpoints.

## Documentation Map

- `README.md` is the concise GitHub landing page.
- `docs/commands.md` contains commands, tags, and debugging notes.
- `docs/standards.md` contains engineering standards, performance guardrails, and failure triage guidance.
- `docs/project-structure.md` contains repository layout, layer responsibilities, and maintenance notes.
- `docs/reports.md` contains report and artifact guidance.
- `docs/ci.md` contains workflow and CI execution guidance.
- `docs/mcp.md` contains local MCP server usage.

## Architecture Rules

Use `docs/standards.md` for the full operating standard. The short rules below summarize the default architecture boundaries:

1. Keep reusable locators and page actions in `src/pages/`.
2. Keep reusable test bodies in `tests-ts/sanity/cases/`.
3. Keep spec files as suite/group entry points under `tests-ts/sanity/`.
4. Use Playwright `expect` assertions and retry-safe locators.
5. Keep environment-specific settings in `.env` or `environments/*.env`.
6. Keep raw HTTP transport logic in `src/api/client.ts`.
7. Throw domain-meaningful errors from `src/exceptions.ts`.

## API Layer Files

- `src/api/client.ts`
- `src/api/models.ts`

## Example API Agent Usage

```ts
import { CatalogApiAgent } from "../src/api/agents/catalogAgent";
import { ApiClient } from "../src/api/client";
import { getSettings } from "../src/config";

const settings = getSettings(process.env.TEST_ENV);
const agent = new CatalogApiAgent(new ApiClient(settings.apiBaseUrl, settings.timeoutMs));
```

## Environment and CI

- Select environment profile with `TEST_ENV=dev|staging|prod`.
- `tests-ts/fixtures/globalSetup.ts` validates the selected environment and checks `BASE_URL` reachability before tests run.
- `playwright.config.ts` enables fully parallel execution and caps CI at 2 workers; cart sanity cases remain serial.
- `.github/workflows/sanity.yml` runs sanity checks on push, pull request, and manual dispatch.
- `.github/workflows/regression.yml` runs regression checks on a daily cron schedule and manual dispatch.
- Screenshots, videos, and traces are retained on failure by `playwright.config.ts`.
- CI artifacts include `test-results/`, `playwright-report/`, and `allure-results/` where applicable.
