import { test } from "../../fixtures/singerTest";

import { CategoryPage } from "../../../src/pages/categoryPage";

export function defineProductListingSanity(): void {
  // Purpose: validates that a known listing page renders real products.
  // Risk covered: broken category listing, no product cards, or product-link selector drift.
  test("@sanity @listing SANITY_004 Listing - should show products for washing machine category", async ({ page }) => {
    const categoryPage = new CategoryPage(page);

    await categoryPage.openWashingMachineCategory();

    await categoryPage.expectUrlContains("washing-machine");
    await categoryPage.expectCountGreaterThan(categoryPage.productCards, 0);
  });

  // Purpose: confirms listing cards expose navigable product-detail links.
  // Risk covered: product cards render visually but cannot take shoppers to PDPs.
  test("@sanity @listing SANITY_012 Listing - should expose product detail links", async ({ page }) => {
    const categoryPage = new CategoryPage(page);

    await categoryPage.openWashingMachineCategory();

    await categoryPage.expectCountGreaterThan(categoryPage.productLinks, 0);
  });
}
