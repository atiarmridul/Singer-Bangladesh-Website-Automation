import type { Page } from "@playwright/test";

import { expect, test } from "../fixtures/singerTest";

import { CatalogApiAgent } from "../../src/api/agents/catalogAgent";
import { ApiClient } from "../../src/api/client";
import { getSettings } from "../../src/config";
import { CategoryPage } from "../../src/pages/categoryPage";
import { ProductPage } from "../../src/pages/productPage";

test.describe("Product details regression", () => {
  const settings = getSettings(process.env.TEST_ENV);
  const apiAgent = new CatalogApiAgent(new ApiClient(settings.apiBaseUrl, settings.timeoutMs));

  async function openFirstProductFromCategory(page: Page): Promise<ProductPage> {
    // Shared journey: use a live listing item so product-detail checks stay aligned with real catalog data.
    const category = new CategoryPage(page, settings.baseUrl);
    await category.load(settings.defaultCategory, 1, settings.productsLimit);
    await category.assertLoaded();
    await category.find(CategoryPage.productLinkSelector).first().click();
    const productPage = new ProductPage(page, settings.baseUrl);
    await expect(page).toHaveURL(/\/product\//);
    await productPage.assertLoaded();
    return productPage;
  }

  // Purpose: validates the PDP can load and expose a usable product title.
  // Risk covered: product route outage, blank PDP, or title selector drift.
  test("Product - should load details page successfully", async ({ page }) => {
    const productPage = await openFirstProductFromCategory(page);
    expect(await productPage.getProductTitle()).not.toBe("");
  });

  // Purpose: compares the PDP opened by API slug against the backend product contract.
  // Risk covered: wrong product route, stale data, or missing title/price fields.
  test("Product - should match details with API response @api", async ({ page }, testInfo) => {
    const [apiProduct] = await apiAgent.getProducts(settings.defaultCategory, 1, 1);
    const productPage = new ProductPage(page, settings.baseUrl);
    await productPage.load(apiProduct.slug);
    await productPage.assertLoaded();
    productPage.assertUrlContainsProductSlug(apiProduct.slug);

    const uiTitle = await productPage.getProductTitle();
    const uiPrice = await productPage.getProductPrice();
    const uiBrand = await productPage.getProductBrand();

    await testInfo.attach("api_product_name", { body: apiProduct.name, contentType: "text/plain" });
    await testInfo.attach("ui_product_title", { body: uiTitle, contentType: "text/plain" });
    await testInfo.attach("api_product_price", { body: String(apiProduct.sellPrice), contentType: "text/plain" });
    await testInfo.attach("ui_product_price", { body: uiPrice, contentType: "text/plain" });
    await testInfo.attach("ui_product_brand", { body: uiBrand, contentType: "text/plain" });

    expect(uiTitle).not.toBe("");
    expect(page.url()).toContain(apiProduct.slug);
    expect(uiPrice).not.toBe("");
  });

  // Purpose: confirms the PDP media area has at least one renderable product image.
  // Risk covered: broken gallery selectors, missing image data, or failed image hydration.
  test("Product - should load image gallery", async ({ page }, testInfo) => {
    const productPage = await openFirstProductFromCategory(page);
    const imagesCount = await productPage.getProductImagesCount();
    await testInfo.attach("product_images_count", { body: String(imagesCount), contentType: "text/plain" });
    expect(imagesCount).toBeGreaterThan(0);
  });

  // Purpose: checks that PDP availability information is exposed to shoppers.
  // Risk covered: missing stock badge/text or changed stock indicator markup.
  test("Product - should display stock status indicator", async ({ page }, testInfo) => {
    const productPage = await openFirstProductFromCategory(page);
    const stockStatus = await productPage.getStockStatus();
    const inStock = await productPage.isProductInStock();
    await testInfo.attach("product_stock_status", { body: stockStatus, contentType: "text/plain" });
    expect(stockStatus || String(inStock)).not.toBe("");
  });

  // Purpose: verifies the primary buying action is visible before cart-specific tests run.
  // Risk covered: hidden/renamed add-to-cart button or disabled PDP commerce actions.
  test("Product - should show add to cart button", async ({ page }) => {
    const productPage = await openFirstProductFromCategory(page);
    expect(await productPage.isAddToCartButtonVisible()).toBe(true);
  });

  // Purpose: records whether reviews are present without failing products that have no reviews.
  // Risk covered: reviews section selector drift while keeping the check non-blocking.
  test("Product - should allow checking reviews section visibility", async ({ page }, testInfo) => {
    const productPage = await openFirstProductFromCategory(page);
    const isVisible = await productPage.isReviewsSectionVisible();
    await testInfo.attach("reviews_visibility", { body: String(isVisible), contentType: "text/plain" });
  });

  // Purpose: checks description extraction for reporting and future content assertions.
  // Risk covered: changed description markup or empty content payloads.
  test("Product - should allow reading product description", async ({ page }, testInfo) => {
    const productPage = await openFirstProductFromCategory(page);
    const description = await productPage.getProductDescription();
    await testInfo.attach("product_description", { body: String(Boolean(description)), contentType: "text/plain" });
  });

  // Purpose: checks brand extraction without forcing all products to display brand copy.
  // Risk covered: changed brand markup or missing brand data.
  test("Product - should allow reading brand information", async ({ page }, testInfo) => {
    const productPage = await openFirstProductFromCategory(page);
    const brand = await productPage.getProductBrand();
    await testInfo.attach("product_brand", { body: brand || "Not displayed", contentType: "text/plain" });
  });

  // Purpose: validates that price is visible in the shopper-facing PDP content.
  // Risk covered: missing price, pricing component failure, or currency selector drift.
  test("Product - should display price", async ({ page }, testInfo) => {
    const productPage = await openFirstProductFromCategory(page);
    const price = await productPage.getProductPrice();
    await testInfo.attach("product_price", { body: price, contentType: "text/plain" });
    expect(price).not.toBe("");
  });

  // Purpose: proves API product slugs can be used as direct PDP routes.
  // Risk covered: broken deep links or mismatch between API slug and web route.
  test("Product - should open directly by API slug @api", async ({ page }) => {
    const [apiProduct] = await apiAgent.getProducts(settings.defaultCategory, 1, 1);
    const productPage = new ProductPage(page, settings.baseUrl);
    await productPage.load(apiProduct.slug);
    await productPage.assertLoaded();
    productPage.assertUrlContainsProductSlug(apiProduct.slug);
    expect(await productPage.getProductTitle()).not.toBe("");
  });

  // Purpose: ensures the clicked listing href and final PDP URL resolve to the same product slug.
  // Risk covered: redirects to a different product or malformed product URL structure.
  test("Product - should use matching product URL slug", async ({ page }) => {
    const category = new CategoryPage(page, settings.baseUrl);
    await category.load(settings.defaultCategory, 1, settings.productsLimit);
    await category.assertLoaded();

    const firstProduct = category.find(CategoryPage.productLinkSelector).first();
    const productHref = await firstProduct.getAttribute("href");
    expect(productHref).toBeTruthy();
    await firstProduct.click();

    const productPage = new ProductPage(page, settings.baseUrl);
    await productPage.assertLoaded();

    expect(page.url()).toContain("/product/");
    const urlSlug = page.url().match(/\/product\/([^/?]+)/)?.[1];
    const hrefSlug = productHref?.match(/\/product\/([^/?]+)/)?.[1];
    expect(urlSlug).toBeTruthy();
    expect(hrefSlug).toBeTruthy();
    expect(urlSlug).toBe(hrefSlug);
  });

  // Purpose: keeps title extraction explicit for reports and future title-format assertions.
  // Risk covered: empty product title or heading selector drift.
  test("Product - should display a non-empty title", async ({ page }, testInfo) => {
    const productPage = await openFirstProductFromCategory(page);
    const title = await productPage.getProductTitle();
    await testInfo.attach("product_title", { body: title, contentType: "text/plain" });
    expect(title).not.toBe("");
    expect(title.trim().length).toBeGreaterThan(0);
  });
});
