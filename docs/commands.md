# Command Reference

This document keeps operational commands out of the root README.

## Setup

```bash
npm ci
npx playwright install
```

## Run Tests

| Goal                   | Command                       |
| ---------------------- | ----------------------------- |
| Default test command   | `npm test`                    |
| Full sanity suite      | `npm run test:sanity`         |
| Standalone modules     | `npm run test:sanity:modules` |
| Regression suite       | `npm run test:regression`     |
| Visual regression      | `npm run test:visual`         |
| Update visual baseline | `npm run test:visual:update`  |
| Headed mode            | `npm run test:headed`         |
| Playwright UI mode     | `npm run test:ui`             |

Use `test:visual:update` only when an intentional UI change should become the committed screenshot baseline.

## Run By Tag

```bash
npm run test:tag:smoke
npm run test:tag:cart
npm run test:tag:search
```

Equivalent direct Playwright commands:

```bash
npx playwright test tests-ts/sanity/sanity.spec.ts --project=chromium --grep @smoke
npx playwright test tests-ts/sanity/sanity.spec.ts --project=chromium --grep @cart
npx playwright test tests-ts/sanity/sanity.spec.ts --project=chromium --grep "@sanity|@search"
```

Use the central suite path with `--grep` when you want one execution path. Running `--grep` across the whole repository
also includes standalone module specs.

## Run One Module

```bash
npx playwright test tests-ts/sanity/footer.spec.ts --project=chromium
npx playwright test tests-ts/sanity/cart.spec.ts --project=chromium
```

## Run By Browser

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

CI commands are Chromium-focused. Keep `--project=chromium` on CI scripts unless the browser matrix is intentionally
expanded.

## Quality

```bash
npm run typecheck
npm run lint
npm run lint:fix
npm run format
npm run format:check
npm run quality
```

`npm run quality` runs TypeScript checking, ESLint, and Prettier validation together.

## Documentation

```bash
npm run docs:test-cases
```

Run this after adding, removing, renaming, or materially changing tests. The generated output is
[docs/test-cases.md](test-cases.md).

Avoid `npm run docs:update` unless you intend to regenerate `README.md` and `docs/agent.md`; that generator is broad and
can overwrite hand-written sections.

## Debugging

```bash
npm run report:html
npx playwright show-trace test-results/<trace-file>/trace.zip
HEADED=true npx playwright test tests-ts/sanity/authentication.spec.ts --project=chromium
```

Generated artifacts:

- `test-results/`: screenshots, videos, traces, JUnit XML, error context
- `playwright-report/`: Playwright HTML report
- `allure-results/`: raw Allure result files
- `allure-report/`: generated Allure HTML report

## Test Tags

| Tag         | Purpose                          |
| ----------- | -------------------------------- |
| `@sanity`   | All sanity tests                 |
| `@smoke`    | Smallest high-signal smoke check |
| `@homepage` | Homepage checks                  |
| `@category` | Category page checks             |
| `@search`   | Product search checks            |
| `@listing`  | Product listing checks           |
| `@product`  | Product details checks           |
| `@cart`     | Add-to-cart and cart page checks |
| `@auth`     | Login/authentication UI checks   |
| `@campaign` | Campaign page checks             |
| `@footer`   | Footer navigation checks         |
| `@support`  | FAQ and store locator checks     |
| `@api`      | API-assisted regression checks   |
| `@visual`   | Screenshot baseline checks       |
