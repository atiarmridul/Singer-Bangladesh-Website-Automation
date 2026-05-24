# Agent Guide

This file defines how API agents are used in the **Full Framework version** of the regression suite.

**Note:** API agents are only available in the Full Framework version. The simplified versions (All-in-One and Framework-Lite) focus on UI testing only.

## Purpose

API agents provide backend truth for UI regression checks.  
They reduce flaky or weak UI-only assertions by validating UI behavior against API responses.

This is an optional feature - use only if you need to cross-validate UI data with backend APIs.

## Current Agent

- `CatalogApiAgent` (`framework/api/agents/catalog_agent.py`)
- Available only in Full Framework version
- Supports:
  - Healthcheck via `/api/global-setting`
  - Top-level category retrieval via `/api/categories`
  - Product listing retrieval via `/api/products`

## Agent Architecture Rules

These rules apply to the Full Framework version. Simplified versions use direct requests instead.

1. Keep HTTP logic inside `framework/api/client.py` only.
2. Keep endpoint/domain logic inside agent classes under `framework/api/agents/`.
3. Parse responses into typed models in `framework/api/models.py`.
4. Do not call raw APIs directly inside tests when an agent exists.
5. Agent methods should return clean objects (`Category`, `Product`) rather than raw JSON when possible.
6. Use type hints in agent methods for all parameters and return types.
7. Validate API responses - use custom exceptions (`ApiResponseError`) for invalid data and provide context in error messages.
8. Handle exceptions gracefully - catch `ApiClientError` and transform to domain-specific errors in agent methods.

**For simplified versions:** Call requests library directly in fixtures if needed.

## How Tests Should Use Agents

**Full Framework version only:**

1. Use pytest fixture `api_agent` from `tests/conftest.py`.
2. Pull API data from the agent.
3. Pull UI data from page objects.
4. Compare UI and API at business level (slug/order/presence/price rules), not only CSS text.
5. Attach relevant API/UI payload snippets to Allure for debugging.

**Simplified versions:**

See `tests_simple/test_regression_simple.py` for examples of how to use requests library directly in fixtures.

## Error Handling in Agents

Agents in the Full Framework use a custom exception hierarchy to distinguish between different failure modes:

### Exception Types (Full Framework Only)

- **`ApiClientError`**: Wraps low-level HTTP/networking errors (connection failures, timeouts, network issues). Raised by `framework/api/client.py` when underlying `requests.RequestException` occurs.
- **`ApiResponseError`**: Raised when API returns a valid HTTP response (200, 400, etc.) but the response data is invalid or unexpected (missing required fields, invalid format, unexpected status values).
- **`PageLoadError`**: Raised when UI page fails to load or reach expected state.
- **`ConfigurationError`**: Raised when required configuration (API URL, timeout, credentials) is missing or invalid.

### When to Use Each Exception

| Exception            | Scenario                     | Example                                                                    |
| -------------------- | ---------------------------- | -------------------------------------------------------------------------- |
| `ApiClientError`     | Network/HTTP layer failures  | Connection timeout, DNS resolution failure, 500 Internal Server Error      |
| `ApiResponseError`   | Valid response, invalid data | Missing required field, invalid product slug format, unexpected enum value |
| `PageLoadError`      | UI state issues              | Page selector not found, navigation timeout                                |
| `ConfigurationError` | Setup issues                 | `api_base_url` not set, invalid timeout value                              |

**Simplified versions use standard Python exceptions (ValueError, RuntimeError, etc.)**

### Example: Transforming Low-Level Exceptions

```python
from framework.api.exceptions import ApiClientError, ApiResponseError
import requests

class CatalogApiAgent:
    def get_products(self, category: str, page: int = 1, limit: int = 20) -> list:
        try:
            response = self.client.get('/api/products', params={
                'category': category,
                'page': page,
                'limit': limit
            })
            return [Product.from_json(item) for item in response['products']]
        except requests.RequestException as e:
            # Transform low-level HTTP error to domain-level error
            raise ApiClientError(
                f"Failed to fetch products from category '{category}': {str(e)}"
            ) from e
        except (KeyError, ValueError) as e:
            # Transform data parsing error to response validation error
            raise ApiResponseError(
                f"Invalid product response structure: {str(e)}"
            ) from e
```

### Best Practice

Let agents act as the translation layer: catch low-level exceptions from the client and re-raise as domain-specific exceptions. This keeps test code clean and error handling focused on business logic, not HTTP details.

**Full Framework version only.** Simplified versions use direct requests with basic error handling.

## Type Hints & Validation

Type hints improve code clarity, enable IDE support, and catch errors early through type checkers.

**Full Framework version:** All agent methods use complete type hints  
**Simplified versions:** Optional type hints for clarity

### Why Type Hints Matter (Full Framework)

- **IDE Support**: Auto-completion and inline documentation in IDEs
- **Type Checking**: Tools like `mypy` catch incompatible assignments before runtime
- **Documentation**: Method signatures are self-documenting and more readable
- **Refactoring**: Type checkers catch breaking changes automatically

### Example: Proper Type Hints in Agent Methods (Full Framework)

```python
from typing import List, Optional
from framework.api.models import Product, Category

class CatalogApiAgent:
    def get_products(
        self,
        category: str,
        page: int = 1,
        limit: int = 20
    ) -> List[Product]:
        """Fetch products for a category with pagination."""
        response = self.client.get('/api/products', params={
            'category': category, 'page': page, 'limit': limit
        })
        return [Product.from_json(item) for item in response['products']]

    def get_category_by_slug(self, slug: str) -> Optional[Category]:
        """Fetch a category by slug, or None if not found."""
        categories = self.get_categories()
        return next((c for c in categories if c.slug == slug), None)
```

See `framework_simple/pages.py` for simplified type hint examples.

### Validating Model Data in from_json() (Full Framework)

Models in the Full Framework should validate data early using `from_json()` methods. Raise `ApiResponseError` with field context if validation fails:

```python
from framework.api.exceptions import ApiResponseError

class Product:
    def __init__(self, id: str, slug: str, name: str, price: float):
        self.id = id
        self.slug = slug
        self.name = name
        self.price = price

    @classmethod
    def from_json(cls, data: dict) -> 'Product':
        """Parse and validate product from API response."""
        # Check required fields
        required_fields = ['id', 'slug', 'name', 'price']
        missing = [f for f in required_fields if f not in data]
        if missing:
            raise ApiResponseError(
                f"Product missing required fields: {missing}"
            )

        # Validate field types/values
        try:
            price = float(data['price'])
            if price < 0:
                raise ApiResponseError(
                    f"Product price must be non-negative, got {price}"
                )
        except (ValueError, TypeError) as e:
            raise ApiResponseError(
                f"Product 'price' field invalid: {str(e)}"
            ) from e

        return cls(
            id=str(data['id']),
            slug=str(data['slug']),
            name=str(data['name']),
            price=price
        )
```

**Simplified versions:** Use simple dataclasses or named tuples instead of complex validation.
id=str(data['id']),
slug=str(data['slug']),
name=str(data['name']),
price=price
)

````

**Simplified versions:** Use simple dataclasses or named tuples instead of complex validation.

### Best Practices (Full Framework)

- **Validate early, fail fast**: Check required fields and constraints in `from_json()`, don't assume data is valid.
- **Provide field context**: When raising validation errors, include field name and what was wrong (not just "invalid data").
- **Use type hints everywhere**: Parameters, return types, and class attributes should all have explicit types.
- **Let exceptions bubble appropriately**: `ApiResponseError` during parsing is correct; don't catch and log silently.

## Example Pattern (Full Framework)

```python
def test_category_listing_matches_api_products(page, settings, api_agent):
    # UI data
    ui_slugs = category_page.get_visible_product_slugs(limit=settings.products_limit)

    # API truth
    api_products = api_agent.get_products(settings.default_category, page=1, limit=settings.products_limit)
    api_slugs = [p.slug for p in api_products]

    # Assertion
    assert ui_slugs[0] == api_slugs[0]
````

For simplified versions, see `tests_simple/test_regression_simple.py` for direct requests examples.

## Adding a New Agent (Full Framework Only)

1. Add endpoint methods to an existing agent or create a new agent file under `framework/api/agents/`.
2. Add or extend models in `framework/api/models.py`.
3. Expose fixture in `tests/conftest.py` if needed.
4. Add regression tests under `tests/regression/` using markers:
   - `@pytest.mark.regression`
   - `@pytest.mark.ui_api` for API-assisted UI tests
5. Add Allure attachments for failures and key debug context.

## Environment and Config

### Full Framework

Agents use `Settings.api_base_url` and `Settings.timeout_ms`.

You can switch API environment using:

- `--env dev|staging|prod`
- `--api-base-url <url>`

### Simplified Versions

Check `framework_simple/config.py` for configuration management.

## CI/CD Expectations

### Full Framework

- Regression suite command in pipeline: `pytest -m regression --env <resolved_env>`
- Allure raw results are saved under `allure-results/`
- API-assisted failures should always include enough context (slugs/ids/status) in Allure attachments

### Simplified Versions

- Use: `pytest tests_simple/ -v --env <env>` or `pytest test_all_in_one.py -v --env <env>`
- Results go to standard pytest output
