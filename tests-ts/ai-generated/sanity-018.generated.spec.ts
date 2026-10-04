import { expect, test } from "../fixtures/singerTest";

test.describe("AI generated tests", () => {
  // Purpose: confirms the legal footer link is present before exercising navigation.
  // Risk covered: missing footer link, changed href, or footer content failing to render.
  test("@ai @catalog @sanity @footer SANITY_018 Footer - should show terms and conditions link", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("a[href='/terms-conditions'], a[href*='terms-conditions']").first()).toBeVisible();
  });
});
