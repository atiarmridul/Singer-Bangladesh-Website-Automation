import { expect, test } from "../fixtures/singerTest";

test.describe("AI generated tests", () => {
  // Purpose: confirms the store locator renders actionable contact and direction options.
  // Risk covered: store locator data missing, contact links absent, or service-location route broken.
  test("@ai @catalog @sanity @support SANITY_020 Store locator - should show store contact actions", async ({
    page
  }) => {
    await page.goto("/store-locator", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveTitle(/Store & Service Locations/i);
    await expect(page.locator("main input[placeholder='Search Here...']:visible").first()).toBeVisible();
    await expect(page.getByText("Phone:").first()).toContainText("Phone:");
    await expect(page.locator("main a[href^='tel:']").first()).toBeVisible();
    await expect(page.locator("main a[href*='google.com/maps/dir']").first()).toBeVisible();
    await expect(page.locator("main button:has-text('Book Now')").first()).toBeVisible();
  });
});
