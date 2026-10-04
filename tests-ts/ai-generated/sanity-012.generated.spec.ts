import { expect, test } from "../fixtures/singerTest";

test.describe("AI generated tests", () => {
  // Purpose: confirms listing cards expose navigable product-detail links.
  // Risk covered: product cards render visually but cannot take shoppers to PDPs.
  test("@ai @catalog @sanity @listing SANITY_012 Listing - should expose product detail links", async ({ page }) => {
    await page.goto("/category/washing-machine?category=washing-machine&page=1&limit=12", {
      waitUntil: "domcontentloaded"
    });
    await expect(page).toHaveURL(/\/category\/washing-machine/i);
    await expect(page.locator(".product-card, a[href*='/product/']").first()).toBeVisible();
    await expect(
      page
        .locator(
          ".product-card a[href*='/product/'], a[aria-label='Go to product details'][href^='/product/'], a[href*='/product/']"
        )
        .first()
    ).toBeVisible();
  });
});
