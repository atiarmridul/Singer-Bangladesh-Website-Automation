# Environment Switching

This framework supports local and CI environment switching through `.env`, files in `environments/`, and shell variables.

## Profiles

Environment profile files live in:

```text
environments/
├── dev.env
├── staging.env
└── prod.env
```

Select a profile with `TEST_ENV`:

```bash
TEST_ENV=dev npm test
TEST_ENV=staging npm run test:sanity
TEST_ENV=prod npm run test:prod
```

If `TEST_ENV` is not set, the framework uses built-in defaults from `src/config.ts`.

## Load Order

Settings are loaded in this order:

1. `.env`
2. `environments/<TEST_ENV>.env`
3. shell or CI environment variables

Later values override earlier values. This means CI variables take precedence over committed environment files.

## Supported Variables

| Variable           | Purpose                                             | Example                     |
| ------------------ | --------------------------------------------------- | --------------------------- |
| `TEST_ENV`         | Selects `dev`, `staging`, or `prod` profile file.   | `staging`                   |
| `BASE_URL`         | Browser base URL for Playwright navigation.         | `https://www.singerbd.com/` |
| `API_BASE_URL`     | Base URL for API helper calls.                      | `https://www.singerbd.com/` |
| `BROWSER`          | Browser name used by config validation.             | `chromium`                  |
| `HEADED`           | Runs browser visibly when true.                     | `true`                      |
| `SLOW_MO`          | Adds delay between browser actions in milliseconds. | `100`                       |
| `TIMEOUT_MS`       | Action and navigation timeout.                      | `30000`                     |
| `DEFAULT_CATEGORY` | Default category slug for reusable tests/helpers.   | `television`                |
| `PRODUCTS_LIMIT`   | Default product API/listing limit.                  | `12`                        |

## Dev

Use `dev` for local development and debugging:

```bash
TEST_ENV=dev npm run test:sanity
HEADED=true TEST_ENV=dev npm run test:headed
```

Default file:

```text
environments/dev.env
```

## Staging

Use `staging` for pre-release validation:

```bash
TEST_ENV=staging npm run test:sanity:modules
```

Default file:

```text
environments/staging.env
```

## Prod

Use `prod` for production smoke/sanity checks:

```bash
TEST_ENV=prod npm run test:prod
```

Default file:

```text
environments/prod.env
```

Keep production runs focused and stable. Avoid destructive flows or test data assumptions that can affect real customers.

## CI Variables

In CI, prefer setting variables through the CI provider rather than editing committed `.env` files.

Common CI variables:

```bash
TEST_ENV=staging
BASE_URL=https://www.singerbd.com/
API_BASE_URL=https://www.singerbd.com/
HEADED=false
TIMEOUT_MS=30000
PRODUCTS_LIMIT=12
```

For GitHub Actions, define them under workflow `env` or repository/environment secrets and variables:

```yaml
env:
  TEST_ENV: staging
  BASE_URL: https://www.singerbd.com/
  API_BASE_URL: https://www.singerbd.com/
  HEADED: "false"
  TIMEOUT_MS: "30000"
```

Do not commit secrets into `.env`, `.env.example`, or `environments/*.env`.
