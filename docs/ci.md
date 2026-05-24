# CI Integration

The project uses GitHub Actions for pull request confidence and scheduled regression coverage.

## Workflows

| Workflow                           | Trigger                                       | Main command              |
| ---------------------------------- | --------------------------------------------- | ------------------------- |
| `.github/workflows/sanity.yml`     | Push to `main`, pull request, manual dispatch | `npm run test:sanity`     |
| `.github/workflows/regression.yml` | Daily cron, manual dispatch                   | `npm run test:regression` |

Both workflows install dependencies, install Chromium, run TypeScript checking, execute the target suite, and upload
artifacts when available.

## Parallel Execution

`playwright.config.ts` enables fully parallel execution. CI is capped at 2 workers:

```ts
workers: process.env.CI ? 2 : undefined;
```

Cart sanity tests remain serial because they mutate guest cart state.

## Recommended CI Steps

```bash
npm ci
npx playwright install --with-deps chromium
npm run typecheck
npm run test:sanity
```

## Artifacts

Useful uploaded artifacts:

- `test-results/`
- `playwright-report/`
- `allure-results/`
- `allure-report/`
- `test-results/junit/results.xml`

See [reports.md](reports.md) for report details.
