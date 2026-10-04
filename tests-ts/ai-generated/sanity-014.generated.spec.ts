import { expect, test } from "../fixtures/singerTest";

test.describe("AI generated tests", () => {
  // Purpose: checks that global footer content is present after homepage load.
  // Risk covered: broken layout shell, missing footer render, or hydration hiding footer content.
  test("@ai @catalog @sanity @homepage SANITY_014 Homepage - should render footer", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("footer:visible, [class*='footer']:visible").first()).toBeVisible();
  });
});
