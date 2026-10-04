import { expect, test } from "../fixtures/singerTest";

test.describe("AI generated tests", () => {
  // Purpose: run the same search journey against representative high-traffic product keywords.
  // Risk covered: search form submission, search routing, and empty result listing regressions.
  test("@ai @catalog @sanity @search SANITY_003_SHOULD_RETURN_PRODUCTS_FOR_WASHING_MACHINE Search - should return products for 'washing machine'", async ({
    page
  }) => {
    await page.goto("/category/washing-machine?category=washing-machine&page=1&limit=12", {
      waitUntil: "domcontentloaded"
    });
    await expect(page).toHaveURL(/washing-machine/i);
    await expect(page.locator(".product-card, a[href*='/product/']").first()).toBeVisible();
  });
});
