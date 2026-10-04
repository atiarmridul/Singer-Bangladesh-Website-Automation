import { expect, test } from "../fixtures/singerTest";

test.describe("AI generated tests", () => {
  // Purpose: validates that a known listing page renders real products.
  // Risk covered: broken category listing, no product cards, or product-link selector drift.
  test("@ai @catalog @sanity @listing SANITY_004 Listing - should show products for washing machine category", async ({
    page
  }) => {
    await page.goto("/category/washing-machine?category=washing-machine&page=1&limit=12", {
      waitUntil: "domcontentloaded"
    });
    await expect(page).toHaveURL(/\/category\/washing-machine/i);
    await expect(page.locator(".product-card, a[href*='/product/']").first()).toBeVisible();
  });
});
