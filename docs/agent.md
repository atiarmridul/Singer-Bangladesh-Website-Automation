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

## Architecture Rules

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
