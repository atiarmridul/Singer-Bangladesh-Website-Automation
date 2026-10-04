import { expect, test } from "../fixtures/singerTest";

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

  // Purpose: verifies every sampled listing card points to one distinct, well-formed PDP route.
  // Risk covered: duplicated cards, empty hrefs, malformed routes, or links pointing outside the product area.
  test("Catalog - should expose unique valid product links", async ({ page }, testInfo) => {
    const category = new CategoryPage(page, settings.baseUrl);
    await category.load(settings.defaultCategory, 1, settings.productsLimit);
    await category.assertLoaded();

    const hrefs = await category.getVisibleProductHrefs(settings.productsLimit);
    const uniqueHrefs = new Set(hrefs);

    await testInfo.attach("visible_product_hrefs", { body: hrefs.join("\n"), contentType: "text/plain" });

    expect(hrefs.length).toBeGreaterThan(0);
    expect(hrefs.every((href) => /^\/product\/[^/?#]+(?:[?#].*)?$/.test(href))).toBe(true);
    expect(uniqueHrefs.size).toBe(hrefs.length);
  });

  // Purpose: confirms a listing remains usable after a browser reload without losing its requested page state.
  // Risk covered: hydration failures after reload, dropped category parameters, or disappearing product results.
  test("Catalog - should preserve listing state after reload", async ({ page }) => {
    const category = new CategoryPage(page, settings.baseUrl);
    await category.load(settings.defaultCategory, 1, settings.productsLimit);
    await category.assertLoaded();
    expect((await category.getVisibleProductHrefs(1)).length).toBe(1);

    await page.reload({ waitUntil: "domcontentloaded" });
    await category.assertLoaded();

    await expect(page).toHaveURL(new RegExp(`/category/${settings.defaultCategory}`));
    expect(new URL(page.url()).searchParams.get("category")).toBe(settings.defaultCategory);
    expect(new URL(page.url()).searchParams.get("page")).toBe("1");
    expect(new URL(page.url()).searchParams.get("limit")).toBe(String(settings.productsLimit));
    expect((await category.getVisibleProductHrefs(1)).length).toBe(1);
  });
});
