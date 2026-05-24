# Full Codebase Walkthrough

## Purpose of This Document

This walkthrough explains how the Singer Bangladesh Playwright automation framework is structured, how data flows through the project, and how new contributors should work with the codebase.

The framework is designed for:

- scalable Playwright TypeScript automation
- reusable Page Object Model architecture
- modular sanity testing
- easier maintenance when UI changes
- future API + UI hybrid automation

---

# High-Level Architecture

The framework follows this flow:

```text
Spec File
   ↓
Case Builder
   ↓
Page Object
   ↓
Playwright Browser Actions
   ↓
Singer Bangladesh Website
```

Each layer has a dedicated responsibility.

| Layer       | Responsibility                       |
| ----------- | ------------------------------------ |
| `*.spec.ts` | Test execution entry point           |
| `cases/`    | Business test flow                   |
| `pages/`    | UI locators and reusable actions     |
| `fixtures/` | Shared browser lifecycle and cleanup |
| `config.ts` | Runtime configuration                |
| `api/`      | Optional API interaction layer       |

---

# Root-Level Files

## `package.json`

Contains:

- npm scripts
- framework dependencies
- Playwright dependency
- TypeScript dependency

Main commands:

```bash
npm run test:sanity
npm run test:sanity:modules
npm run test:headed
npm run typecheck
npm run report:allure
npm run mcp:server
```

---

## `playwright.config.ts`

This is the central Playwright runner configuration.

Controls:

- browser settings
- retries
- timeouts
- trace collection
- screenshots
- video recording
- viewport size
- test directory
- reporters

Typical flow:

```ts
export default defineConfig({
  testDir: "./tests-ts",
  use: {
    trace: "retain-on-failure"
  }
});
```

---

## `tsconfig.json`

Controls TypeScript behavior:

- module resolution
- strict typing
- compile target
- path handling

---

## Test case registry

This repository does not use `test_case.json`. Test workflows are defined directly in `tests-ts/sanity/cases/` and composed by `tests-ts/sanity/sanity.spec.ts`.

---

# Environment Management

Folder:

```text
environments/
```

Files:

```text
dev.env
staging.env
prod.env
```

Purpose:

- switch environments without changing test code
- support CI/CD deployment pipelines
- isolate environment-specific URLs and credentials

Example:

```env
BASE_URL=https://www.singerbd.com
HEADED=false
TIMEOUT_MS=30000
```

Run against production:

```bash
TEST_ENV=prod npm run test:sanity
```

---

# Source Code Structure

```text
src/
```

This contains the reusable framework implementation.

---

# `src/pages/` — Page Object Model Layer

This is the most important layer in the framework.

Each file represents one page or functional area.

## Why POM Exists

Instead of putting selectors directly inside tests:

❌ Bad:

```ts
await page.locator(".search-box").fill("tv");
```

Use reusable page objects:

✅ Good:

```ts
await homePage.searchForProduct("tv");
```

Benefits:

- centralized selector maintenance
- cleaner tests
- reusable actions
- lower duplication
- easier debugging

---

## `basePage.ts`

Foundation for all pages.

Contains shared utilities:

- navigation
- waits
- click helpers
- modal dismissal
- visibility assertions
- safe interaction wrappers

Example responsibilities:

```ts
await this.clickWhenReady(locator);
await this.dismissBlockingModals();
```

Every other page extends this class.

---

## `homePage.ts`

Handles:

- homepage loading
- search bar
- homepage validations
- navigation entry checks

Typical methods:

```ts
open();
searchProduct();
```

---

## `categoryPage.ts`

Handles:

- category listing pages
- product cards
- category navigation

Used heavily in category sanity checks.

---

## `productPage.ts`

Handles:

- product details page
- add-to-cart action
- price visibility
- product title validation

Critical business area.

---

## `cartPage.ts`

Handles:

- cart page validation
- cart item presence
- cart count checks

---

## `loginPage.ts`

Handles:

- login modal
- authentication panel visibility
- login field interaction

---

## `campaignPage.ts`

Handles promotional or campaign pages.

Useful when homepage banners redirect to campaign landing pages.

---

## `footerPage.ts`

Contains footer link locators.

Used for:

- Terms and Conditions
- Privacy Policy
- footer navigation validation

---

## `searchPage.ts`

Handles:

- search result pages
- result validation
- product visibility after search

---

# `src/api/` — API Support Layer

Optional backend interaction layer.

This allows:

- API-driven test setup
- API validation
- hybrid UI + API testing
- faster preconditions

---

## `client.ts`

Low-level HTTP client wrapper.

Features:

- timeout handling
- JSON parsing
- status validation

Note: this wrapper does not implement automatic retries; retries are handled by Playwright or CI reruns.

---

## `models.ts`

Maps raw API responses into typed objects.

Example:

```ts
Product;
Category;
```

Benefits:

- safer automation
- predictable data structures
- better IntelliSense

---

## `agents/catalogAgent.ts`

Business/domain wrapper.

Instead of:

```ts
fetch("/api/catalog");
```

Tests call:

```ts
catalogAgent.getProducts();
```

This separates API logic from tests.

---

# `src/utils/`

Reusable utility functions.

Current usage:

- URL parsing
- slug extraction
- reusable helper logic

Utilities should remain framework-agnostic.

---

# `src/config.ts`

Loads runtime configuration.

Load priority:

1. `.env`
2. `environments/*.env`
3. shell environment variables

This makes CI overrides easy.

---

# `src/exceptions.ts`

Contains custom error classes.

Purpose:

- clearer failures
- easier debugging
- meaningful logs

Examples:

```ts
PageLoadError;
ApiResponseError;
ConfigurationError;
```

---

# Test Layer

```text
tests-ts/
```

This contains all executable automation.

---

# `tests-ts/fixtures/`

Shared Playwright fixture layer.

Main file:

```text
singerTest.ts
```

Responsibilities:

- browser cleanup
- storage cleanup
- shared imports
- cookie cleanup
- common hooks

Always import:

```ts
import { test, expect } from "../fixtures/singerTest";
```

Instead of importing directly from Playwright.

---

# `tests-ts/sanity/`

Contains sanity suite entry points.

---

## Standalone Spec Files

Examples:

```text
homepage.spec.ts
footer.spec.ts
cart.spec.ts
```

Purpose:

- run one module independently
- easier debugging
- targeted CI execution

Example:

```bash
npx playwright test tests-ts/sanity/cart.spec.ts
```

---

## `sanity.spec.ts`

Central combined sanity suite.

Usually executed in serial mode.

Purpose:

- validate critical user journeys
- provide quick regression confidence
- support smoke testing

---

# `tests-ts/sanity/cases/`

This is the business-flow layer.

The most important testing logic lives here.

Each file defines reusable workflows.

Example:

```text
homepage.ts
search.ts
cart.ts
```

These files should:

- describe user behavior
- contain assertions
- call reusable page methods

Avoid raw selectors here.

---

# Example End-to-End Flow

## Search Flow

### Step 1 — Spec File

```ts
search.spec.ts;
```

Calls:

```ts
runSearchSanity();
```

---

### Step 2 — Case Layer

```ts
cases / search.ts;
```

Business flow:

```ts
await homePage.searchProduct("television");
await searchPage.expectResults();
```

---

### Step 3 — Page Layer

```ts
homePage.ts;
```

Actual browser interaction:

```ts
await this.searchInput.fill(keyword);
```

---

### Step 4 — Playwright Engine

Browser performs UI actions.

---

# Generated Output Folders

## `test-results/`

Contains:

- screenshots
- traces
- videos
- failure artifacts

Generated automatically.

Do not manually edit.

---

## `playwright-report/`

Contains Playwright HTML reports.

Open report:

```bash
npx playwright show-report
```

---

# Debugging Workflow

## Run Headed Mode

```bash
npm run test:headed
```

Useful for:

- watching browser actions
- debugging flaky tests
- inspecting selectors

---

## Open Trace Viewer

```bash
npx playwright show-trace trace.zip
```

Useful for:

- timeline analysis
- DOM snapshots
- network analysis
- action replay

---

# Recommended Contributor Workflow

## Adding New Automation

### 1. Create or update a page object

Location:

```text
src/pages/
```

---

### 2. Create a reusable case

Location:

```text
tests-ts/sanity/cases/
```

---

### 3. Add spec entry point

Location:

```text
tests-ts/sanity/
```

---

### 4. Export case if necessary

Update:

```text
cases/index.ts
```

---

### 5. Run validation

```bash
npm run typecheck
npm run test:sanity
```

---

# Design Principles Used in This Framework

## Separation of Concerns

Each layer has one responsibility.

| Layer        | Responsibility        |
| ------------ | --------------------- |
| Page Objects | UI interaction        |
| Cases        | Business flow         |
| Specs        | Execution grouping    |
| Fixtures     | Shared lifecycle      |
| Config       | Runtime configuration |

---

## Maintainability

Selectors stay centralized.

When Singer UI changes:

- update one page object
- avoid changing many tests

---

## Reusability

Business flows are reusable across:

- sanity tests
- regression suites
- future API tests

---

## Scalability

The structure supports future additions:

- visual testing
- mobile emulation
- API testing
- parallel execution
- CI/CD pipelines
- data-driven testing

---

# Current Automation Coverage

The framework currently validates:

- homepage
- categories
- product search
- product listing
- product details
- cart
- authentication panel
- campaign pages
- footer links

---

# Recommended Future Improvements

Potential next upgrades:

- Allure reporting
- test tagging
- retry-aware utilities
- network mocking
- API schema validation
- data factories
- Playwright projects for multi-browser testing
- GitHub Actions CI pipeline
- accessibility testing
- visual regression testing
- MCP-assisted autonomous debugging

---

# Summary

This framework is organized around:

- reusable page objects
- modular business flows
- centralized configuration
- maintainable Playwright architecture
- scalable sanity automation

The key idea is:

```text
Specs execute
Cases describe
Pages interact
Fixtures support
Configs control
```

---

# Legacy Imported Reference

The bottom section previously contained legacy content from an older WebdriverIO + Mocha repository import. It is not part of the active Playwright Test framework.

Use the current repository sources as the source of truth:

- `README.md`
- `playwright.config.ts`
- `src/`
- `tests-ts/`
