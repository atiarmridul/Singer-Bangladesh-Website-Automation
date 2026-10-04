import { expect, test } from "../fixtures/singerTest";

test.describe("AI generated tests", () => {
  // Purpose: verifies the login entry point is visible before opening the modal.
  // Risk covered: missing unauthenticated account action or header auth selector drift.
  test("@ai @catalog @sanity @auth SANITY_016 Auth - should show login entry point on homepage", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("button:visible:has-text('Log In')").first()).toBeVisible();
  });
});
