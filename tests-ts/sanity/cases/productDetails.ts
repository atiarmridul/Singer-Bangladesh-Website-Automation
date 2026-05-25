import { test } from "../../fixtures/singerTest";

import { ProductPage } from "../../../src/pages/productPage";

// Groups product detail page sanity checks.
export function defineProductDetailsSanity(): void {
  // Purpose: opens a live in-stock product from API-backed test data.
  // Risk covered: stale hardcoded products, out-of-stock test data, missing PDP title/price, or missing primary action.
  test("@sanity @product SANITY_005 Product - should open product details for a live in-stock product", async ({
    page,
    liveProduct
  }) => {
    const productPage = new ProductPage(page);

    await productPage.load(liveProduct.slug);

    await productPage.expectVisible(productPage.productTitle);
    await productPage.expectVisible(productPage.price);
    await productPage.expectVisible(productPage.actionButton);
  });

  // Purpose: validates the PDP media area renders for live API-backed product data.
  // Risk covered: broken product image payloads, gallery selector drift, or failed media hydration.
  test("@sanity @product SANITY_013 Product - should show product images", async ({ page, liveProduct }) => {
    const productPage = new ProductPage(page);

    await productPage.load(liveProduct.slug);

    await productPage.expectCountGreaterThan(productPage.productImages, 0);
  });
}
