import { expect, test } from "../fixtures/singerTest";

test.describe("AI generated tests", () => {
  // Purpose: checks that the promotional campaign route loads visible campaign content.
  // Risk covered: campaign route outage, blank campaign page, or missing EMI promotion block.
  test("@ai @catalog @sanity @campaign SANITY_009 Campaign - should open campaign page with EMI content", async ({
    page
  }) => {
    await page.goto("/campaign", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/campaign/i);
    await expect(page.locator("body").first()).toContainText("EMI");
  });
});
