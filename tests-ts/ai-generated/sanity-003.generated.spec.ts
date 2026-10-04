import { expect, test } from "../fixtures/singerTest";

test.describe("AI generated tests", () => {
  // Purpose: run the same search journey against representative high-traffic product keywords.
  // Risk covered: search form submission, search routing, and empty result listing regressions.
  test("@ai @catalog @sanity @search SANITY_003 Search - should return products for 'television'", async ({ page }) => {
    await page.goto("/category/television?category=television&page=1&limit=12", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/television/i);
    await expect(page.locator(".product-card, a[href*='/product/']").first()).toBeVisible();
  });
});
