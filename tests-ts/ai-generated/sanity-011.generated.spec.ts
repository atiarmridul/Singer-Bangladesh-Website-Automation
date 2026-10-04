import { expect, test } from "../fixtures/singerTest";

test.describe("AI generated tests", () => {
  // Purpose: verifies users can start category browsing from the homepage.
  // Risk covered: missing category navigation, hidden menu links, or selector drift in the browsing entry point.
  test("@ai @catalog @sanity @homepage SANITY_011 Homepage - should show category navigation links", async ({
    page
  }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("a[href*='/category/']").first()).toBeVisible();
  });
});
