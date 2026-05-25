# Test Case Catalog

This file is generated from the Playwright tests under `tests-ts/`. It lists each test case in written form and explains how the test executes at a business-readable level.

When a test case is added, removed, renamed, or materially changed, run:

```bash
npm run docs:test-cases
```

The generator expands data-driven search tests from `tests-ts/data/search-keywords.json` and reads `// Purpose:` plus `// Risk covered:` comments when they exist.

## Summary

| Suite                   | Test cases |
| ----------------------- | ---------- |
| Sanity Tests            | 22         |
| Regression Tests        | 18         |
| Visual Regression Tests | 2          |
| Accessibility Tests     | 2          |
| AI Generated Tests      | 1          |

## Sanity Tests

### SANITY_001 - Homepage - should load header and search controls

- Source: `tests-ts/sanity/cases/homepage.ts`
- Tags: `@sanity`, `@smoke`, `@homepage`
- Purpose: verifies the homepage shell can load enough for a user to start browsing or searching.
- Risk covered: blank page, missing header, or broken search entry point.
- Execution:
  1. Open the homepage.
  2. Verify the page title matches the expected Singer title pattern.
  3. Verify the homepage element is visible.

### SANITY_011 - Homepage - should show category navigation links

- Source: `tests-ts/sanity/cases/homepage.ts`
- Tags: `@sanity`, `@homepage`
- Purpose: verifies users can start category browsing from the homepage.
- Risk covered: missing category navigation, hidden menu links, or selector drift in the browsing entry point.
- Execution:
  1. Open the homepage.
  2. Verify the homepage exposes at least one matching element.

### SANITY_014 - Homepage - should render footer

- Source: `tests-ts/sanity/cases/homepage.ts`
- Tags: `@sanity`, `@homepage`
- Purpose: checks that global footer content is present after homepage load.
- Risk covered: broken layout shell, missing footer render, or hydration hiding footer content.
- Execution:
  1. Open the homepage.
  2. Verify the homepage element is visible.

### SANITY_002 - Category - should open live top-level category page

- Source: `tests-ts/sanity/cases/category.ts`
- Tags: `@sanity`, `@category`
- Purpose: checks a live top-level category route selected from API-backed test data.
- Risk covered: stale hardcoded categories, category route regression, empty body, or category page not rendering.
- Execution:
  1. Open the category page using a live API-provided category slug.
  2. Verify the browser URL contains the expected category slug.
  3. Verify the category page body is visible.

### SANITY_015 - Category - should load live category listing shell

- Source: `tests-ts/sanity/cases/category.ts`
- Tags: `@sanity`, `@category`
- Purpose: validates that a live category with products reaches a hydrated listing surface.
- Risk covered: category page shell loads but listing content never becomes available for current catalog data.
- Execution:
  1. Open the category page using a live API-provided category slug.
  2. Verify the browser URL contains the expected category slug.
  3. Verify the category listing shell is loaded.

### SANITY_003 - Search - should return products for 'television'

- Source: `tests-ts/sanity/cases/search.ts`
- Tags: `@sanity`, `@search`
- Purpose: run the same search journey against representative high-traffic product keywords.
- Risk covered: search form submission, search routing, and empty result listing regressions.
- Execution:
  1. Open the homepage.
  2. Search from the homepage using 'television'.
  3. Verify the search URL contains the normalized keyword slug.
  4. Verify search results contain at least one product card.

### SANITY_003 - Search - should return products for 'refrigerator'

- Source: `tests-ts/sanity/cases/search.ts`
- Tags: `@sanity`, `@search`
- Purpose: run the same search journey against representative high-traffic product keywords.
- Risk covered: search form submission, search routing, and empty result listing regressions.
- Execution:
  1. Open the homepage.
  2. Search from the homepage using 'refrigerator'.
  3. Verify the search URL contains the normalized keyword slug.
  4. Verify search results contain at least one product card.

### SANITY_003 - Search - should return products for 'washing machine'

- Source: `tests-ts/sanity/cases/search.ts`
- Tags: `@sanity`, `@search`
- Purpose: run the same search journey against representative high-traffic product keywords.
- Risk covered: search form submission, search routing, and empty result listing regressions.
- Execution:
  1. Open the homepage.
  2. Search from the homepage using 'washing machine'.
  3. Verify the search URL contains the normalized keyword slug.
  4. Verify search results contain at least one product card.

### SANITY_004 - Listing - should show products for washing machine category

- Source: `tests-ts/sanity/cases/productListing.ts`
- Tags: `@sanity`, `@listing`
- Purpose: validates that a known listing page renders real products.
- Risk covered: broken category listing, no product cards, or product-link selector drift.
- Execution:
  1. Open the washing machine category listing.
  2. Verify the browser URL contains the expected category slug.
  3. Verify the listing exposes at least one matching element.

### SANITY_012 - Listing - should expose product detail links

- Source: `tests-ts/sanity/cases/productListing.ts`
- Tags: `@sanity`, `@listing`
- Purpose: confirms listing cards expose navigable product-detail links.
- Risk covered: product cards render visually but cannot take shoppers to PDPs.
- Execution:
  1. Open the washing machine category listing.
  2. Verify the listing exposes at least one matching element.

### SANITY_005 - Product - should open product details for a live in-stock product

- Source: `tests-ts/sanity/cases/productDetails.ts`
- Tags: `@sanity`, `@product`
- Purpose: opens a live in-stock product from API-backed test data.
- Risk covered: stale hardcoded products, out-of-stock test data, missing PDP title/price, or missing primary action.
- Execution:
  1. Open the product details page using a live or API-provided product slug.
  2. Verify the product detail element is visible.

### SANITY_013 - Product - should show product images

- Source: `tests-ts/sanity/cases/productDetails.ts`
- Tags: `@sanity`, `@product`
- Purpose: validates the PDP media area renders for live API-backed product data.
- Risk covered: broken product image payloads, gallery selector drift, or failed media hydration.
- Execution:
  1. Open the product details page using a live or API-provided product slug.
  2. Verify product media exists on the details page.

### SANITY_006 - Cart - should add live in-stock product to cart

- Source: `tests-ts/sanity/cases/cart.ts`
- Tags: `@sanity`, `@cart`
- Purpose: covers the main guest shopping path using a live in-stock product from API-backed test data.
- Risk covered: stale hardcoded products, disabled add-to-cart action, cart counter failure, or cart item not persisting.
- Execution:
  1. Open the product details page using a live or API-provided product slug.
  2. Click the product add-to-cart action.
  3. Verify the cart counter or cart element is visible.
  4. Open the cart page directly.
  5. Verify the browser URL contains the expected cart route.
  6. Verify the cart contains item content.

### SANITY_007 - Cart - should open cart page directly

- Source: `tests-ts/sanity/cases/cart.ts`
- Tags: `@sanity`, `@cart`
- Purpose: verifies cart page routing independently from the add-to-cart workflow.
- Risk covered: broken cart route, blank cart page, or unrecognized empty-cart UI.
- Execution:
  1. Open the cart page directly.
  2. Verify the browser URL contains the expected cart route.
  3. Verify the detected state is not unknown.

### SANITY_008 - Auth - should open login modal from homepage

- Source: `tests-ts/sanity/cases/authentication.ts`
- Tags: `@sanity`, `@auth`
- Purpose: confirms the unauthenticated login entry point is reachable from the homepage.
- Risk covered: missing login button, blocked click, or login panel copy not rendering.
- Execution:
  1. Open the login modal from the homepage.
  2. Verify the login modal or login entry point is visible.
  3. Verify the login modal contains the expected welcome copy.

### SANITY_016 - Auth - should show login entry point on homepage

- Source: `tests-ts/sanity/cases/authentication.ts`
- Tags: `@sanity`, `@auth`
- Purpose: verifies the login entry point is visible before opening the modal.
- Risk covered: missing unauthenticated account action or header auth selector drift.
- Execution:
  1. Open the homepage before checking the login entry point.
  2. Verify the login modal or login entry point is visible.

### SANITY_009 - Campaign - should open campaign page with EMI content

- Source: `tests-ts/sanity/cases/campaign.ts`
- Tags: `@sanity`, `@campaign`
- Purpose: checks that the promotional campaign route loads visible campaign content.
- Risk covered: campaign route outage, blank campaign page, or missing EMI promotion block.
- Execution:
  1. Open the campaign page.
  2. Verify the browser URL contains the expected route or slug.
  3. Verify the target element contains the expected text.

### SANITY_017 - Campaign - should render campaign page body

- Source: `tests-ts/sanity/cases/campaign.ts`
- Tags: `@sanity`, `@campaign`
- Purpose: verifies the campaign route renders a visible page body independent of specific promo copy.
- Risk covered: blank campaign route, failed page shell, or blocked content render.
- Execution:
  1. Open the campaign page.
  2. Verify the browser URL contains the expected route or slug.
  3. Verify the target element is visible.

### SANITY_010 - Footer - should navigate to terms and conditions

- Source: `tests-ts/sanity/cases/footer.ts`
- Tags: `@sanity`, `@footer`
- Purpose: validates a legal/footer navigation link that users commonly need after page load.
- Risk covered: footer not rendering, link target drift, or modal overlay blocking footer clicks.
- Execution:
  1. Open the homepage before checking footer navigation.
  2. Click the terms and conditions footer link.
  3. Verify the browser URL contains the terms and conditions route.

### SANITY_018 - Footer - should show terms and conditions link

- Source: `tests-ts/sanity/cases/footer.ts`
- Tags: `@sanity`, `@footer`
- Purpose: confirms the legal footer link is present before exercising navigation.
- Risk covered: missing footer link, changed href, or footer content failing to render.
- Execution:
  1. Open the homepage before checking footer navigation.
  2. Verify the footer terms and conditions link is visible.

### SANITY_019 - FAQ - should filter questions by search keyword

- Source: `tests-ts/sanity/cases/support.ts`
- Tags: `@sanity`, `@support`
- Purpose: validates FAQ client-side search so customers can quickly find self-service answers.
- Risk covered: FAQ search input missing, filter state broken, or expected help content not rendered.
- Execution:
  1. Open the FAQ page.
  2. Search the FAQ page with the configured keyword.
  3. Verify the FAQ result list contains the expected matching question.

### SANITY_020 - Store locator - should show store contact actions

- Source: `tests-ts/sanity/cases/support.ts`
- Tags: `@sanity`, `@support`
- Purpose: confirms the store locator renders actionable contact and direction options.
- Risk covered: store locator data missing, contact links absent, or service-location route broken.
- Execution:
  1. Open the store locator page.
  2. Verify the store locator page has loaded.
  3. Verify store locator contact actions are available.

## Regression Tests

### REG_001 - API - should return success from global setting healthcheck

- Source: `tests-ts/regression/api.spec.ts`
- Tags: None
- Purpose: verifies the backend global settings endpoint is reachable before deeper API checks.
- Risk covered: API outage, invalid base URL, or unexpected health response shape.
- Execution:
  1. Call the catalog API global settings healthcheck endpoint.
  2. Verify the final assertion for this test case.

### REG_002 - API - should return top-level categories

- Source: `tests-ts/regression/api.spec.ts`
- Tags: None
- Purpose: confirms catalog category data is present for UI comparison tests.
- Risk covered: empty category response or changed categories contract.
- Execution:
  1. Fetch top-level categories from the catalog API.
  2. Verify the measured value is greater than the expected minimum.

### REG_003 - Catalog - should match listing products with API products

- Source: `tests-ts/regression/catalog.spec.ts`
- Tags: `@api`
- Purpose: validates that the first page of a category listing reflects backend product data.
- Risk covered: stale listing results, incorrect sort order, or missing product links.
- Execution:
  1. Open the configured category listing with the configured pagination.
  2. Verify the category listing shell is loaded.
  3. Read visible product slugs from the category listing.
  4. Verify the measured value is greater than the expected minimum.
  5. Verify the first visible product slug matches the first API product slug.
  6. Verify the boolean check returns true.

### REG_004 - Catalog - should open product details page from category listing

- Source: `tests-ts/regression/catalog.spec.ts`
- Tags: None
- Purpose: proves that users can move from category browsing into a product details page.
- Risk covered: listing links that render but no longer navigate to valid PDP routes.
- Execution:
  1. Open the configured category listing with the configured pagination.
  2. Verify the category listing shell is loaded.
  3. Find the first product link in the category listing.
  4. Verify the browser URL matches the expected route pattern.
  5. Verify the target UI element is visible.

### REG_005 - Homepage - should show core content blocks

- Source: `tests-ts/regression/homepage.spec.ts`
- Tags: None
- Purpose: confirms the homepage renders the core merchandising surface, not just a 200 response.
- Risk covered: blank home layout, missing product blocks, or broken home page hydration.
- Execution:
  1. Open the homepage.
  2. Verify the homepage title, header, and search controls are loaded.
  3. Verify the homepage renders the expected minimum number of product cards.

### REG_006 - Homepage - should match visible category tiles with API categories

- Source: `tests-ts/regression/homepage.spec.ts`
- Tags: `@api`
- Purpose: compares visible category links with API slugs so navigation drift is caught early.
- Risk covered: UI exposing stale categories, broken category hrefs, or API/UI mismatch.
- Execution:
  1. Open the homepage.
  2. Read visible category slugs from the homepage.
  3. Verify the measured count meets or exceeds the expected minimum.
  4. Verify no unexpected values were found.

### REG_007 - Product - should load details page successfully

- Source: `tests-ts/regression/productDetails.spec.ts`
- Tags: None
- Purpose: validates the PDP can load and expose a usable product title.
- Risk covered: product route outage, blank PDP, or title selector drift.
- Execution:
  1. Open the first product from the configured category listing.
  2. Verify the extracted value is not empty.

### REG_008 - Product - should match details with API response

- Source: `tests-ts/regression/productDetails.spec.ts`
- Tags: `@api`
- Purpose: compares the PDP opened by API slug against the backend product contract.
- Risk covered: wrong product route, stale data, or missing title/price fields.
- Execution:
  1. Fetch catalog product data from the API for the configured category.
  2. Open the product details page using a live or API-provided product slug.
  3. Verify the product details page shell is loaded.
  4. Read the visible product title.
  5. Read the visible product price.
  6. Read product brand information from the details page.
  7. Verify the extracted value is not empty.
  8. Verify the current URL or value contains the expected slug.

### REG_009 - Product - should load image gallery

- Source: `tests-ts/regression/productDetails.spec.ts`
- Tags: None
- Purpose: confirms the PDP media area has at least one renderable product image.
- Risk covered: broken gallery selectors, missing image data, or failed image hydration.
- Execution:
  1. Open the first product from the configured category listing.
  2. Count product gallery images.
  3. Verify the measured value is greater than the expected minimum.

### REG_010 - Product - should display stock status indicator

- Source: `tests-ts/regression/productDetails.spec.ts`
- Tags: None
- Purpose: checks that PDP availability information is exposed to shoppers.
- Risk covered: missing stock badge/text or changed stock indicator markup.
- Execution:
  1. Open the first product from the configured category listing.
  2. Read the visible stock status.
  3. Check whether the product appears to be in stock.
  4. Verify the extracted value is not empty.

### REG_011 - Product - should show add to cart button

- Source: `tests-ts/regression/productDetails.spec.ts`
- Tags: None
- Purpose: verifies the primary buying action is visible before cart-specific tests run.
- Risk covered: hidden/renamed add-to-cart button or disabled PDP commerce actions.
- Execution:
  1. Open the first product from the configured category listing.
  2. Verify the boolean check returns true.

### REG_012 - Product - should allow checking reviews section visibility

- Source: `tests-ts/regression/productDetails.spec.ts`
- Tags: None
- Purpose: records whether reviews are present without failing products that have no reviews.
- Risk covered: reviews section selector drift while keeping the check non-blocking.
- Execution:
  1. Open the first product from the configured category listing.
  2. Check whether the reviews section is present.

### REG_013 - Product - should allow reading product description

- Source: `tests-ts/regression/productDetails.spec.ts`
- Tags: None
- Purpose: checks description extraction for reporting and future content assertions.
- Risk covered: changed description markup or empty content payloads.
- Execution:
  1. Open the first product from the configured category listing.
  2. Read the product description from the details page.

### REG_014 - Product - should allow reading brand information

- Source: `tests-ts/regression/productDetails.spec.ts`
- Tags: None
- Purpose: checks brand extraction without forcing all products to display brand copy.
- Risk covered: changed brand markup or missing brand data.
- Execution:
  1. Open the first product from the configured category listing.
  2. Read product brand information from the details page.

### REG_015 - Product - should display price

- Source: `tests-ts/regression/productDetails.spec.ts`
- Tags: None
- Purpose: validates that price is visible in the shopper-facing PDP content.
- Risk covered: missing price, pricing component failure, or currency selector drift.
- Execution:
  1. Open the first product from the configured category listing.
  2. Read the visible product price.
  3. Verify the extracted value is not empty.

### REG_016 - Product - should open directly by API slug

- Source: `tests-ts/regression/productDetails.spec.ts`
- Tags: `@api`
- Purpose: proves API product slugs can be used as direct PDP routes.
- Risk covered: broken deep links or mismatch between API slug and web route.
- Execution:
  1. Fetch catalog product data from the API for the configured category.
  2. Open the product details page using a live or API-provided product slug.
  3. Verify the product details page shell is loaded.
  4. Verify the extracted value is not empty.

### REG_017 - Product - should use matching product URL slug

- Source: `tests-ts/regression/productDetails.spec.ts`
- Tags: None
- Purpose: ensures the clicked listing href and final PDP URL resolve to the same product slug.
- Risk covered: redirects to a different product or malformed product URL structure.
- Execution:
  1. Open the configured category listing with the configured pagination.
  2. Verify the category listing shell is loaded.
  3. Read the target element attribute.
  4. Verify the extracted value is present.
  5. Click the target element.
  6. Verify the product details page shell is loaded.
  7. Verify the current URL or value contains the expected slug.
  8. Verify the final assertion for this test case.

### REG_018 - Product - should display a non-empty title

- Source: `tests-ts/regression/productDetails.spec.ts`
- Tags: None
- Purpose: keeps title extraction explicit for reports and future title-format assertions.
- Risk covered: empty product title or heading selector drift.
- Execution:
  1. Open the first product from the configured category listing.
  2. Read the visible product title.
  3. Verify the extracted value is not empty.
  4. Verify the measured value is greater than the expected minimum.

## Visual Regression Tests

### VISUAL_001 - Homepage header - should match baseline

- Source: `tests-ts/visual/homepage.visual.spec.ts`
- Tags: `@visual`
- Purpose: protects the primary storefront header against unintended layout or rendering drift.
- Risk covered: missing logo/navigation/search UI, broken header layout, or accidental visual regressions.
- Execution:
  1. Prepare the homepage for visual comparison at the baseline viewport.
  2. Verify the target UI element is visible.
  3. Compare the target area against the committed screenshot baseline.

### VISUAL_002 - Homepage hero - should match baseline

- Source: `tests-ts/visual/homepage.visual.spec.ts`
- Tags: `@visual`
- Purpose: protects the first homepage hero viewport against unexpected rendering changes.
- Risk covered: missing promotional hero content, shifted hero layout, or broken above-the-fold rendering.
- Execution:
  1. Prepare the homepage for visual comparison at the baseline viewport.
  2. Compare the target area against the committed screenshot baseline.

## Accessibility Tests

### A11Y_001 - Homepage - should not have critical axe violations

- Source: `tests-ts/accessibility/homepage.a11y.spec.ts`
- Tags: `@a11y`
- Purpose: scans the hydrated homepage for critical WCAG accessibility violations.
- Risk covered: missing accessible names, invalid ARIA, contrast regressions, or keyboard-blocking markup.
- Execution:
  1. Open the target page in the browser.
  2. Wait for the page to settle before assertions.
  3. Run the axe-core accessibility scan against the hydrated page.

### A11Y_002 - Homepage - should meet Lighthouse accessibility threshold

- Source: `tests-ts/accessibility/homepage.a11y.spec.ts`
- Tags: `@a11y`
- Purpose: records a Lighthouse accessibility audit as a high-level accessibility quality gate.
- Risk covered: broad accessibility regressions missed by targeted functional assertions.
- Execution:
  1. Run the Lighthouse accessibility audit and verify the score threshold.

## AI Generated Tests

### AI_SANITY_001 - Homepage - should load header and search controls

- Source: `tests-ts/ai-generated/ai-sanity-001.generated.spec.ts`
- Tags: `@ai`, `@smoke`, `@homepage`
- Purpose: mirrors the hand-written smoke test that verifies the homepage shell can load enough for a user to start browsing or searching.
- Risk covered: blank page, missing header, broken search entry point, or generated test drift from the canonical smoke flow.
- Execution:
  1. Open the target page in the browser.
  2. Verify the page title matches the expected Singer title pattern.
  3. Verify the target UI element is visible.
  4. Verify the final assertion for this test case.
