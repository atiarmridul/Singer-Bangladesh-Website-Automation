import { test } from "../../fixtures/singerTest";

import { CategoryPage } from "../../../src/pages/categoryPage";
import { ProductPage } from "../../../src/pages/productPage";

export function defineProductDetailsSanity(): void {
  // Purpose: follows a real listing-to-product journey instead of relying on a hardcoded PDP URL.
  // Risk covered: broken product links, missing PDP title/price, or missing primary action button.
  test("@sanity @product SANITY_005 Product - should open product details from listing", async ({ page }) => {
    const categoryPage = new CategoryPage(page);
    const productPage = new ProductPage(page);

    await categoryPage.openWashingMachineCategory();
    await productPage.openFirstProductFromListing();

    await productPage.expectVisible(productPage.productTitle);
    await productPage.expectVisible(productPage.price);
    await productPage.expectVisible(productPage.actionButton);
  });

  // Purpose: validates the PDP media area renders at least one product image.
  // Risk covered: broken product image payloads, gallery selector drift, or failed media hydration.
  test("@sanity @product SANITY_013 Product - should show product images", async ({ page }) => {
    const categoryPage = new CategoryPage(page);
    const productPage = new ProductPage(page);

    await categoryPage.openWashingMachineCategory();
    await productPage.openFirstProductFromListing();

    await productPage.expectCountGreaterThan(productPage.productImages, 0);
  });
}
