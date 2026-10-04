import { expect, test } from "../fixtures/singerTest";

test.describe("AI generated tests", () => {
  // Purpose: validates that a live category with products reaches a hydrated listing surface.
  // Risk covered: category page shell loads but listing content never becomes available for current catalog data.
  test("@ai @catalog @sanity @category SANITY_015 Category - should load live category listing shell", async ({
    page
  }) => {
    await page.goto("/category/television?category=television&page=1&limit=12", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/category\/television/i);
    await expect(page.locator(".product-card, a[href*='/product/']").first()).toBeVisible();
  });
});
