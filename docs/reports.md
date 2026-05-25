# Reports And Artifacts

Each Playwright run can produce multiple report formats depending on the reporter configuration.

## Report Types

| Report          | Output                           | Purpose                                                       |
| --------------- | -------------------------------- | ------------------------------------------------------------- |
| Playwright HTML | `playwright-report/`             | Local debugging, traces, screenshots, and demo screenshots    |
| JUnit XML       | `test-results/junit/results.xml` | CI test result publishing and build integrations              |
| Allure results  | `allure-results/`                | Raw Allure result files generated during test execution       |
| Allure HTML     | `allure-report/`                 | Rich shareable execution report generated from Allure results |

Accessibility runs attach axe violation JSON to Playwright results so serious findings can be reviewed even when the
default gate only fails on critical violations.

## Commands

```bash
npm run test:sanity
npm run test:a11y
npm run report:html
npm run report:allure
npm run report:allure:open
```

## Demo Screenshots

For portfolio/demo use, generate reports and capture:

- Playwright HTML report summary.
- A failed-test trace view, when available.
- Allure overview dashboard.
- Allure suite or test-case detail page.

Recommended location for committed demo images:

```text
docs/assets/
```

Keep generated report folders ignored. Commit only curated screenshots that are useful for documentation.
