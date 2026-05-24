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

```bash
npm ci
npx playwright install
npm run quality
npm run test:tag:smoke
```

## At A Glance

| Category  | Details                                                                                       |
| --------- | --------------------------------------------------------------------------------------------- |
| Target    | Singer Bangladesh ecommerce website                                                           |
| Stack     | Playwright Test, TypeScript, Node.js, npm                                                     |
| Pattern   | Page Object Model with reusable case builders                                                 |
| Coverage  | Homepage, categories, search, listing, product details, cart, auth, campaign, footer, support |
| Execution | Chromium-focused CI, tagged sanity tests, regression tests, visual tests                      |
| Reporting | Playwright HTML, JUnit XML, Allure results, Allure HTML                                       |
| Quality   | TypeScript strict mode, ESLint, Prettier, Husky, lint-staged                                  |

## Core Commands

| Goal                  | Command                       |
| --------------------- | ----------------------------- |
| Run smoke sanity      | `npm run test:tag:smoke`      |
| Run full sanity suite | `npm run test:sanity`         |
| Run module specs      | `npm run test:sanity:modules` |
| Run regression suite  | `npm run test:regression`     |
| Run visual checks     | `npm run test:visual`         |
| Update test catalog   | `npm run docs:test-cases`     |
| Run quality gate      | `npm run quality`             |

See [docs/commands.md](docs/commands.md) for the full command reference.

## Documentation Map

| Need                         | Document                                               |
| ---------------------------- | ------------------------------------------------------ |
| Commands, tags, debugging    | [docs/commands.md](docs/commands.md)                   |
| Test case list and execution | [docs/test-cases.md](docs/test-cases.md)               |
| Architecture diagrams        | [docs/architecture.md](docs/architecture.md)           |
| Project structure and layers | [docs/project-structure.md](docs/project-structure.md) |
| Environment switching        | [docs/environments.md](docs/environments.md)           |
| Reports and artifacts        | [docs/reports.md](docs/reports.md)                     |
| CI workflows                 | [docs/ci.md](docs/ci.md)                               |
| MCP server                   | [docs/mcp.md](docs/mcp.md)                             |
| Agent handoff guide          | [agent.md](agent.md)                                   |
| Agent progress history       | [docs/AGENT_PROGRESS.md](docs/AGENT_PROGRESS.md)       |
| Full imported walkthrough    | [docs/walkthrough.md](docs/walkthrough.md)             |

## Key Features

- Playwright Test with TypeScript strict mode.
- Page Object Model with shared `BasePage` helpers.
- Reusable sanity case builders and standalone module specs.
- API-backed live product data through `CatalogApiAgent` and `dataFactory`.
- Environment validation through Playwright global setup.
- Parallel execution with CI worker control and serial cart coverage where state is shared.
- Visual regression baselines for the homepage header and hero.
- GitHub Actions for sanity checks and scheduled regression checks.
- Local stdio MCP server exposing project metadata and npm script tooling.

## Repository Shape

```text
src/
  api/          Typed API client, models, and catalog agent
  pages/        Page Object Model layer
  mcp/          Local MCP server
tests-ts/
  fixtures/     Playwright fixtures, global setup, data factory
  sanity/       Sanity suite and reusable case builders
  regression/   API/UI regression coverage
  visual/       Screenshot baseline tests
docs/           Detailed project documentation
```

## Maintenance Rule

When test cases are added, removed, renamed, or materially changed, update the generated catalog:

```bash
npm run docs:test-cases
```
