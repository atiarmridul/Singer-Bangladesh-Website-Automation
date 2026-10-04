import { expect, test } from "../fixtures/singerTest";

test.describe("AI generated tests", () => {
  // Purpose: verifies the homepage shell can load enough for a user to start browsing or searching.
  // Risk covered: blank page, missing header, or broken search entry point.
  test("@ai @catalog @sanity @smoke @homepage SANITY_001 Homepage - should load header and search controls", async ({
    page
  }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveTitle(/Singer/i);
    await expect(page.locator("section.shadow-main-menu, .desktop-header-menu").first()).toBeVisible();
    await expect(
      page.locator("input[name='search'], input[placeholder*='Search'], input[type='search']").first()
    ).toBeVisible();
  });
});
