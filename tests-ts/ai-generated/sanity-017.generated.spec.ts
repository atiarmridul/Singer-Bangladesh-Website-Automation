import { expect, test } from "../fixtures/singerTest";

test.describe("AI generated tests", () => {
  // Purpose: verifies the campaign route renders a visible page body independent of specific promo copy.
  // Risk covered: blank campaign route, failed page shell, or blocked content render.
  test("@ai @catalog @sanity @campaign SANITY_017 Campaign - should render campaign page body", async ({ page }) => {
    await page.goto("/campaign", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/campaign/i);
    await expect(page.locator("body").first()).toBeVisible();
  });
});
