# Singer Bangladesh Playwright Automation

![Playwright](https://img.shields.io/badge/Playwright-Test%20Automation-2EAD33)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict%20Mode-3178C6)
![ESLint](https://img.shields.io/badge/ESLint-Code%20Quality-4B32C3)
![Prettier](https://img.shields.io/badge/Prettier-Formatting-F7B93E)
![Allure](https://img.shields.io/badge/Allure-Rich%20Reports-FF6A00)
![CI Ready](https://img.shields.io/badge/CI-GitHub%20Actions-1F883D)

Production-style Playwright TypeScript automation framework for the Singer Bangladesh ecommerce website.

The framework covers high-value ecommerce journeys with Page Object Model architecture, reusable sanity case builders,
API-assisted test data, visual regression checks, environment-aware execution, CI workflows, rich reporting, and a local
MCP server for project metadata/tooling.

## Quick Start

Prerequisites:

- Node.js 18+ and npm
- Git

Clone and enter the project:

```bash
git clone <repository-url>
cd Singer_BD_Automation
```

Install dependencies and Playwright browsers:

```bash
npm ci
npx playwright install
```

Set up local environment defaults:

```bash
cp .env.example .env
```

The default `.env.example` targets `https://www.singerbd.com/`. Override values in `.env` or with shell variables when
running against another environment.

Validate the project and run the first smoke test:

```bash
npm run quality
npm run test:tag:smoke
```

Run the full sanity suite:

```bash
npm run test:sanity
```

## At A Glance

| Category  | Details                                                                                       |
| --------- | --------------------------------------------------------------------------------------------- |
| Target    | Singer Bangladesh ecommerce website                                                           |
| Stack     | Playwright Test, TypeScript, Node.js, npm                                                     |
| Pattern   | Page Object Model with reusable case builders                                                 |
| Coverage  | Homepage, categories, search, listing, product details, cart, auth, campaign, footer, support |
| Execution | Chromium-focused CI, tagged sanity tests, regression, visual, and accessibility tests         |
| Reporting | Playwright HTML, JUnit XML, Allure results, Allure HTML                                       |
| Quality   | TypeScript strict mode, ESLint, Prettier, Husky, lint-staged                                  |
| AI Flow   | JSON test definitions, generated Playwright specs, selector repair assistance                 |

## Core Commands

| Goal                   | Command                       |
| ---------------------- | ----------------------------- |
| Run smoke sanity       | `npm run test:tag:smoke`      |
| Run full sanity suite  | `npm run test:sanity`         |
| Run module specs       | `npm run test:sanity:modules` |
| Run regression suite   | `npm run test:regression`     |
| Run visual checks      | `npm run test:visual`         |
| Run accessibility      | `npm run test:a11y`           |
| Generate AI specs      | `npm run ai:generate-tests`   |
| Run AI-generated specs | `npm run test:ai-generated`   |
| Update test catalog    | `npm run docs:test-cases`     |
| Run quality gate       | `npm run quality`             |

See [docs/commands.md](docs/commands.md) for the full command reference.

## Documentation Map

| Need                         | Document                                                     |
| ---------------------------- | ------------------------------------------------------------ |
| Commands, tags, debugging    | [docs/commands.md](docs/commands.md)                         |
| Test case list and execution | [docs/test-cases.md](docs/test-cases.md)                     |
| Engineering standards        | [docs/standards.md](docs/standards.md)                       |
| Architecture diagrams        | [docs/architecture.md](docs/architecture.md)                 |
| Project structure and layers | [docs/project-structure.md](docs/project-structure.md)       |
| Environment switching        | [docs/environments.md](docs/environments.md)                 |
| Reports and artifacts        | [docs/reports.md](docs/reports.md)                           |
| CI workflows                 | [docs/ci.md](docs/ci.md)                                     |
| AI-assisted test workflow    | [docs/ai-assisted-workflow.md](docs/ai-assisted-workflow.md) |
| MCP server                   | [docs/mcp.md](docs/mcp.md)                                   |
| Agent handoff guide          | [agent.md](agent.md)                                         |
| Agent progress history       | [docs/AGENT_PROGRESS.md](docs/AGENT_PROGRESS.md)             |
| Full imported walkthrough    | [docs/walkthrough.md](docs/walkthrough.md)                   |

## Key Features

- Playwright Test with TypeScript strict mode.
- Page Object Model with shared `BasePage` helpers.
- Reusable sanity case builders and standalone module specs.
- API-backed live product data through `CatalogApiAgent` and `dataFactory`.
- Environment validation through Playwright global setup.
- Parallel execution with CI worker control and serial cart coverage where state is shared.
- Self-healing locator strategy with fallback selectors, DOM-similarity recovery, and retry resolution.
- Accessibility checks with axe-core assertions and Lighthouse audit coverage.
- AI-assisted JSON-to-Playwright generation with selector repair scoring.
- Visual regression baselines for the homepage header and hero.
- GitHub Actions for sanity checks and scheduled regression checks.
- Local stdio MCP server exposing project metadata and npm script tooling.

## AI-Assisted Automation Workflow

This project includes experimental AI-assisted automation engineering workflows designed to reduce repetitive test
implementation and improve framework scalability.

### Features

- Structured JSON-driven test definitions
- Automated Playwright spec generation
- Reusable automation scaffolding
- Selector repair and resilience experimentation
- Test-case parsing utilities
- AI-assisted framework acceleration workflows

AI tools were used for framework scaffolding, reusable pattern generation, architecture refinement, documentation
generation, debugging assistance, and CI workflow creation. Human engineering judgment was used for framework design
decisions, automation strategy, maintainability validation, flaky test prevention, and test architecture review.

### Example Structure

```text
ai/
├── definitions/
│   └── homepage-smoke.json
├── generate-test.ts
├── repair-selectors.ts
└── test-case-parser.ts
```

### Example Definition

```json
{
  "feature": "homepage smoke",
  "steps": ["open homepage", "verify hero banner", "verify category visibility", "verify footer links"]
}
```

### Generated Outcome

```ts
test("Homepage Smoke", async ({ page }) => {
  await page.goto("/");
  await expect(home.heroBanner).toBeVisible();
});
```

See [docs/ai-assisted-workflow.md](docs/ai-assisted-workflow.md) for the executable JSON schema, fast feedback strategy,
and day-to-day usage workflow.

## Repository Shape

```text
src/
  api/          Typed API client, models, and catalog agent
  pages/        Page Object Model layer
  mcp/          Local MCP server
tests-ts/
  ai-generated/ Generated specs from ai/definitions
  fixtures/     Playwright fixtures, global setup, data factory
  sanity/       Sanity suite and reusable case builders
  regression/   API/UI regression coverage
  accessibility/ axe-core and Lighthouse accessibility checks
  visual/       Screenshot baseline tests
docs/           Detailed project documentation
```

## Maintenance Rule

When test cases are added, removed, renamed, or materially changed, update the generated catalog:

```bash
npm run docs:test-cases
```
