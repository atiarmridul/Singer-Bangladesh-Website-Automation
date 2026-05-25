import { test } from "../../fixtures/singerTest";

import { CategoryPage } from "../../../src/pages/categoryPage";

// Groups live category page sanity checks.
export function defineCategorySanity(): void {
  // Purpose: checks a live top-level category route selected from API-backed test data.
  // Risk covered: stale hardcoded categories, category route regression, empty body, or category page not rendering.
  test("@sanity @category SANITY_002 Category - should open live top-level category page", async ({
    page,
    liveCategory
  }) => {
    const categoryPage = new CategoryPage(page);

    await categoryPage.load(liveCategory.slug);

    await categoryPage.expectUrlContains(`/category/${liveCategory.slug}`);
    await categoryPage.expectVisible(categoryPage.body);
  });

  // Purpose: validates that a live category with products reaches a hydrated listing surface.
  // Risk covered: category page shell loads but listing content never becomes available for current catalog data.
  test("@sanity @category SANITY_015 Category - should load live category listing shell", async ({
    page,
    liveCategory
  }) => {
    const categoryPage = new CategoryPage(page);

    await categoryPage.load(liveCategory.slug);

    await categoryPage.expectUrlContains(liveCategory.slug);
    await categoryPage.assertLoaded();
  });
}
