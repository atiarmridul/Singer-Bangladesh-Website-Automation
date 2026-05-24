import { test } from "../../fixtures/singerTest";

import { CategoryPage } from "../../../src/pages/categoryPage";

export function defineCategorySanity(): void {
  // Purpose: checks a stable category route that should always be reachable from the catalog.
  // Risk covered: category route regression, empty body, or category title not rendering.
  test("@sanity @category SANITY_002 Category - should open small appliances category page", async ({ page }) => {
    const categoryPage = new CategoryPage(page);

    await categoryPage.openCategories();

    await categoryPage.expectUrlContains("/category/small-appliances");
    await categoryPage.expectVisible(categoryPage.body);
    await categoryPage.expectTextContains(categoryPage.body, "Small Appliances");
  });

  // Purpose: validates that a high-traffic category reaches a hydrated listing surface.
  // Risk covered: category page shell loads but listing content never becomes available.
  test("@sanity @category SANITY_015 Category - should load washing machine listing shell", async ({ page }) => {
    const categoryPage = new CategoryPage(page);

    await categoryPage.openWashingMachineCategory();

    await categoryPage.expectUrlContains("washing-machine");
    await categoryPage.assertLoaded();
  });
}
