# Architecture

This project is organized as a Playwright TypeScript automation framework with clear separation between specs, reusable test cases, page objects, fixtures, configuration, and optional API helpers.

## POM Flow

Page Object Model keeps locators and reusable browser actions out of test assertions.

```mermaid
flowchart TD
  Spec["Spec file<br/>tests-ts/sanity/*.spec.ts"] --> Case["Reusable case<br/>tests-ts/sanity/cases/*.ts"]
  Case --> PageObject["Page object<br/>src/pages/*.ts"]
  PageObject --> BasePage["BasePage helpers<br/>navigation, waits, clicks, modals"]
  BasePage --> Playwright["Playwright Page and Locator APIs"]
  Playwright --> Website["Singer Bangladesh website"]
```

## Self-Healing Locator Flow

Critical page objects can resolve locators through a resilience layer before failing a test.

```mermaid
flowchart TD
  PageObject["Page object locator definition"] --> Primary["Primary selector"]
  Primary --> Visible{"Visible?"}
  Visible -->|Yes| Locator["Use locator"]
  Visible -->|No| Fallbacks["Try ranked fallback selectors"]
  Fallbacks --> FallbackVisible{"Fallback visible?"}
  FallbackVisible -->|Yes| Locator
  FallbackVisible -->|No| Similarity["DOM similarity scoring<br/>text + attributes + element type"]
  Similarity --> Candidate["Recovered CSS path"]
  Candidate --> Locator
  Locator --> Assertion["Assertion or action"]
```

The default implementation lives in `BasePage` and is currently used by homepage header, search, and category
navigation checks. It keeps recovery explicit and reviewable instead of silently changing committed selectors.

## Fixture Flow

All tests import the shared fixture instead of importing directly from Playwright.

```mermaid
flowchart TD
  TestFile["Test/spec file"] --> Fixture["tests-ts/fixtures/singerTest.ts"]
  TestFile --> GlobalSetup["tests-ts/fixtures/globalSetup.ts"]
  GlobalSetup --> Settings["src/config.ts"]
  GlobalSetup --> BaseUrlCheck["BASE_URL reachability check"]
  Fixture --> PlaywrightTest["Playwright test"]
  Fixture --> DataFactory["tests-ts/fixtures/dataFactory.ts"]
  DataFactory --> CatalogAgent["CatalogApiAgent"]
  CatalogAgent --> LiveProduct["liveProduct fixture"]
  Fixture --> Routing["Static asset routing"]
  Fixture --> Cleanup["Storage, cookies, permissions cleanup"]
  PlaywrightTest --> BrowserContext["Browser context"]
  BrowserContext --> Page["Page instance"]
  Page --> TestCase["Sanity test case"]
```

## Execution Flow

Runtime settings are resolved before Playwright starts the selected browser projects.

```mermaid
flowchart TD
  Command["npm script or npx playwright test"] --> Config["playwright.config.ts"]
  Config --> Settings["src/config.ts"]
  Settings --> EnvFiles[".env and environments/TEST_ENV.env"]
  Settings --> ShellEnv["Shell or CI variables"]
  Config --> GlobalSetup["Global setup<br/>environment smoke check"]
  Config --> Workers["Parallel execution<br/>CI capped at 2 workers"]
  Config --> Projects["Browser projects<br/>chromium, firefox, webkit"]
  Projects --> Specs["tests-ts/**/*.spec.ts"]
  Specs --> Cases["Reusable case builders"]
  Cases --> Pages["Page objects"]
  Pages --> Report["HTML report, traces, screenshots, videos"]
```

## API/UI Flow

The framework can combine UI checks with typed API helpers when a test needs faster setup or backend validation.

```mermaid
flowchart LR
  TestCase["Test case"] --> UIPath["UI path"]
  UIPath --> PageObjects["Page objects"]
  PageObjects --> Browser["Browser"]
  Browser --> WebApp["Singer BD web app"]

  TestCase --> APIPath["API path"]
  APIPath --> Agent["CatalogApiAgent"]
  Agent --> Client["ApiClient"]
  Client --> API["Singer BD API"]

  API --> Models["Typed models<br/>Category, Product"]
  Models --> DataFactory["Data factory<br/>live in-stock product"]
  DataFactory --> Assertions
  Models --> Assertions["Playwright assertions"]
  WebApp --> Assertions
```

## Visual Flow

Critical storefront UI can be checked against committed screenshots.

```mermaid
flowchart TD
  VisualSpec["tests-ts/visual/homepage.visual.spec.ts"] --> Prepare["Disable animations and transient overlays"]
  Prepare --> Header["Homepage header screenshot"]
  Prepare --> Hero["Homepage hero screenshot"]
  Header --> Baselines["Committed snapshot baselines"]
  Hero --> Baselines
```

## Accessibility Flow

Accessibility checks combine page-level axe assertions with a Lighthouse accessibility audit.

```mermaid
flowchart TD
  A11ySpec["tests-ts/accessibility/*.spec.ts"] --> SharedFixture["Singer fixture"]
  SharedFixture --> HydratedPage["Hydrated storefront page"]
  HydratedPage --> Axe["checkA11y(page)<br/>axe-core WCAG scan"]
  A11ySpec --> Lighthouse["Lighthouse snapshot audit"]
  Axe --> A11yReport["Attached violation report"]
  Lighthouse --> ScoreGate["Accessibility score threshold"]
```

## AI Test Generation Flow

Structured definitions can generate reviewable Playwright specs while keeping the framework fixture conventions intact.

```mermaid
flowchart LR
  Definition["ai/definitions/*.json"] --> Parser["test-case-parser.ts<br/>zod validation"]
  Parser --> Generator["generate-test.ts"]
  Generator --> GeneratedSpec["tests-ts/ai-generated/*.spec.ts"]
  GeneratedSpec --> Fixture["Singer fixture"]
  FailureContext["Playwright failure context"] --> Repair["repair-selectors.ts"]
  Repair --> SelectorHints["ranked selector candidates"]
  SelectorHints --> Definition
```

## Responsibility Map

| Layer              | Location                      | Responsibility                                         |
| ------------------ | ----------------------------- | ------------------------------------------------------ |
| Specs              | `tests-ts/sanity/*.spec.ts`   | Suite entry points and grouping.                       |
| AI Workflow        | `ai/*.ts`                     | Generate specs and rank selector repair candidates.    |
| Cases              | `tests-ts/sanity/cases/*.ts`  | Business test flow and assertions.                     |
| Fixtures           | `tests-ts/fixtures/*.ts`      | Shared setup, cleanup, global checks, live data.       |
| Locator Resilience | `src/pages/basePage.ts`       | Fallback selector and DOM-similarity locator recovery. |
| Visual Specs       | `tests-ts/visual/*.spec.ts`   | Screenshot baselines for critical UI components.       |
| A11y Specs         | `tests-ts/accessibility/*.ts` | axe-core and Lighthouse accessibility checks.          |
| Page Objects       | `src/pages/*.ts`              | Locators and reusable UI actions.                      |
| Base Helpers       | `src/pages/basePage.ts`       | Navigation, waits, modal handling, robust clicks.      |
| API Client         | `src/api/client.ts`           | HTTP transport, timeout, retry, JSON parsing.          |
| API Agents         | `src/api/agents/*.ts`         | Domain-specific API operations.                        |
| Config             | `src/config.ts`               | Environment loading and validation.                    |
| MCP                | `src/mcp/server.ts`           | Local MCP metadata and automation tooling surface.     |
