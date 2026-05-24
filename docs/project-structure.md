# Project Structure

This document describes the repository layout and ownership boundaries.

## Tree

```text
Singer_BD_Automation/
├── .github/workflows/                # GitHub Actions workflows
├── docs/                             # Supporting markdown documentation
├── environments/                     # Environment-specific runtime settings
├── scripts/                          # Utility scripts
├── src/                              # Framework source code
│   ├── api/                          # API support layer
│   ├── mcp/                          # Local MCP server
│   ├── pages/                        # Page Object Model files
│   └── utils/                        # Shared utilities
├── tests-ts/                         # Playwright test code
│   ├── data/                         # Test data sources
│   ├── fixtures/                     # Shared fixtures and global setup
│   ├── regression/                   # Regression specs
│   ├── sanity/                       # Sanity specs and case builders
│   └── visual/                       # Visual regression specs and baselines
├── README.md                         # Concise project entry point
├── package.json                      # npm scripts and dependencies
├── playwright.config.ts              # Playwright configuration
└── tsconfig.json                     # TypeScript configuration
```

## Layer Responsibilities

| Layer        | Location                     | Responsibility                                         |
| ------------ | ---------------------------- | ------------------------------------------------------ |
| Specs        | `tests-ts/**/*.spec.ts`      | Suite entry points, grouping, and Playwright metadata  |
| Cases        | `tests-ts/sanity/cases/*.ts` | Reusable sanity business flow and assertions           |
| Fixtures     | `tests-ts/fixtures/*.ts`     | Shared Playwright setup, cleanup, and live test data   |
| Visual specs | `tests-ts/visual/*.spec.ts`  | Screenshot baseline checks for critical UI components  |
| Page objects | `src/pages/*.ts`             | Locators and reusable UI actions                       |
| Base helpers | `src/pages/basePage.ts`      | Navigation, waits, modal handling, robust clicks       |
| API client   | `src/api/client.ts`          | HTTP transport, retry, status validation, JSON parsing |
| API agents   | `src/api/agents/*.ts`        | Domain-level API wrappers                              |
| Config       | `src/config.ts`              | Environment loading and validation                     |
| MCP          | `src/mcp/server.ts`          | Local MCP metadata and tooling surface                 |

## Adding A Sanity Test

1. Add or update a page object in `src/pages/`.
2. Add or update a case file in `tests-ts/sanity/cases/`.
3. Export new case builders from `tests-ts/sanity/cases/index.ts`.
4. Add the case builder to `tests-ts/sanity/sanity.spec.ts`.
5. Optionally add a standalone module spec.
6. Add meaningful tags such as `@smoke`, `@cart`, or `@search`.
7. Refresh the test case catalog.
8. Run the quality gate and targeted test.

```bash
npm run docs:test-cases
npm run quality
npx playwright test tests-ts/sanity/sanity.spec.ts --project=chromium --grep @smoke
```

## Maintenance Notes

- If a selector breaks, update the matching page object in `src/pages/`.
- If a modal blocks clicks, check `BasePage.dismissBlockingModals()`.
- If a click is flaky, check `BasePage.clickWhenReady()`.
- If a network wait is needed, use `BasePage.waitForNetworkResponse()`.
- If cart behavior changes, update `CartPage.getCartState()`.
- If search behavior changes, update `HomePage.searchFor()` and `SearchPage`.
- If environment selection fails, check `src/config.ts` and `environments/*.env`.
- If API response shape changes, update `src/api/models.ts` and `src/api/agents/catalogAgent.ts`.
