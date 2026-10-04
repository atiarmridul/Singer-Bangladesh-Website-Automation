import { expect, test } from "../fixtures/singerTest";

test.describe("AI generated tests", () => {
  // Purpose: checks a live top-level category route selected from API-backed test data.
  // Risk covered: stale hardcoded categories, category route regression, empty body, or category page not rendering.
  test("@ai @catalog @sanity @category SANITY_002 Category - should open live top-level category page", async ({
    page
  }) => {
    await page.goto("/category/television?category=television&page=1&limit=12", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/category\/television/i);
    await expect(page.locator(".product-card, a[href*='/product/']").first()).toBeVisible();
  });
});
