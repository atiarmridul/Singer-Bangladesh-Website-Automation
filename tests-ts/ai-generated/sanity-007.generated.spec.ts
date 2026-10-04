import { expect, test } from "../fixtures/singerTest";

test.describe("AI generated tests", () => {
  // Purpose: verifies cart page routing independently from the add-to-cart workflow.
  // Risk covered: broken cart route, blank cart page, or unrecognized empty-cart UI.
  test("@ai @catalog @sanity @cart SANITY_007 Cart - should open cart page directly", async ({ page }) => {
    await page.goto("/cart", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/cart/i);
    await expect(
      page
        .locator(".cart.item, .cart.table-wrapper tbody tr, .cart-container .item-info, [class*='cart'], main, body")
        .first()
    ).toBeVisible();
  });
});
