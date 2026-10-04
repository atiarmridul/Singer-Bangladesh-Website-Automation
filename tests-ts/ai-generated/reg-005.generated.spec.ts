import { expect, test } from "../fixtures/singerTest";

test.describe("AI generated tests", () => {
  // Purpose: confirms the homepage renders the core merchandising surface, not just a 200 response.
  // Risk covered: blank home layout, missing product blocks, or broken home page hydration.
  test("@ai @catalog REG_005 Homepage - should show core content blocks", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveTitle(/Singer/i);
    await expect(page.locator("section.shadow-main-menu, .desktop-header-menu").first()).toBeVisible();
    await expect(
      page.locator("input[name='search'], input[placeholder*='Search'], input[type='search']").first()
    ).toBeVisible();
    await expect(page.locator(".product-card, a[href*='/product/']").first()).toBeVisible();
  });
});
