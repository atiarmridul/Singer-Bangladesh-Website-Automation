import { expect, test } from "@playwright/test";

import { CatalogApiAgent } from "../../src/api/agents/catalogAgent";
import { ApiClient } from "../../src/api/client";
import { getSettings } from "../../src/config";
import { CategoryPage } from "../../src/pages/categoryPage";

test.describe("Catalog regression", () => {
  const settings = getSettings(process.env.TEST_ENV);
  const apiAgent = new CatalogApiAgent(new ApiClient(settings.apiBaseUrl, settings.timeoutMs));

  // Purpose: validates that the first page of a category listing reflects backend product data.
  // Risk covered: stale listing results, incorrect sort order, or missing product links.
  test("Catalog - should match listing products with API products @api", async ({ page }, testInfo) => {
    const categorySlug = settings.defaultCategory;
    const category = new CategoryPage(page, settings.baseUrl);
    await category.load(categorySlug, 1, settings.productsLimit);
    await category.assertLoaded();

    const uiSlugs = await category.getVisibleProductSlugs(settings.productsLimit);
    const apiSlugs = (await apiAgent.getProducts(categorySlug, 1, settings.productsLimit)).map((item) => item.slug);

    await testInfo.attach("ui_product_slugs", { body: uiSlugs.join("\n"), contentType: "text/plain" });
    await testInfo.attach("api_product_slugs", { body: apiSlugs.join("\n"), contentType: "text/plain" });

    expect(uiSlugs.length).toBeGreaterThan(0);
    expect(apiSlugs.length).toBeGreaterThan(0);
    expect(uiSlugs[0]).toBe(apiSlugs[0]);
    expect(apiSlugs.slice(0, 5).every((slug) => uiSlugs.includes(slug))).toBe(true);
  });

  // Purpose: proves that users can move from category browsing into a product details page.
  // Risk covered: listing links that render but no longer navigate to valid PDP routes.
  test("Catalog - should open product details page from category listing", async ({ page }) => {
    const category = new CategoryPage(page, settings.baseUrl);
    await category.load(settings.defaultCategory, 1, settings.productsLimit);
    await category.assertLoaded();

    await category.find(CategoryPage.productLinkSelector).first().click();

    await expect(page).toHaveURL(/\/product\//);
    await expect(page.locator("h1:visible").first()).toBeVisible({ timeout: 15_000 });
  });
});
