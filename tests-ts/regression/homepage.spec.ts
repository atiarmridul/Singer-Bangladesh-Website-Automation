import { expect, test } from "@playwright/test";

import { CatalogApiAgent } from "../../src/api/agents/catalogAgent";
import { ApiClient } from "../../src/api/client";
import { getSettings } from "../../src/config";
import { HomePage } from "../../src/pages/homePage";

test.describe("Homepage regression", () => {
  const settings = getSettings(process.env.TEST_ENV);
  const apiAgent = new CatalogApiAgent(new ApiClient(settings.apiBaseUrl, settings.timeoutMs));

  // Purpose: confirms the homepage renders the core merchandising surface, not just a 200 response.
  // Risk covered: blank home layout, missing product blocks, or broken home page hydration.
  test("Homepage - should show core content blocks", async ({ page }) => {
    const home = new HomePage(page, settings.baseUrl);
    await home.load();
    await home.assertLoaded();
    await home.assertHasProducts(4);
  });

  // Purpose: compares visible category links with API slugs so navigation drift is caught early.
  // Risk covered: UI exposing stale categories, broken category hrefs, or API/UI mismatch.
  test("Homepage - should match visible category tiles with API categories @api", async ({ page }, testInfo) => {
    const home = new HomePage(page, settings.baseUrl);
    await home.load();
    const uiSlugs = await home.getVisibleCategorySlugs(20);
    const apiSlugs = (await apiAgent.getTopLevelCategories()).map((item) => item.slug);
    const unexpected = uiSlugs.filter((slug) => !apiSlugs.includes(slug));

    await testInfo.attach("ui_category_slugs", { body: uiSlugs.join("\n"), contentType: "text/plain" });
    await testInfo.attach("api_category_slugs", { body: apiSlugs.join("\n"), contentType: "text/plain" });

    expect(uiSlugs.length).toBeGreaterThanOrEqual(8);
    expect(unexpected).toEqual([]);
  });
});
