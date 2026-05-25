import { test } from "../../fixtures/singerTest";

import { SupportPage } from "../../../src/pages/supportPage";

// Groups FAQ and store locator support sanity checks.
export function defineSupportSanity(): void {
  // Purpose: validates FAQ client-side search so customers can quickly find self-service answers.
  // Risk covered: FAQ search input missing, filter state broken, or expected help content not rendered.
  test("@sanity @support SANITY_019 FAQ - should filter questions by search keyword", async ({ page }) => {
    const supportPage = new SupportPage(page);

    await supportPage.openFaq();
    await supportPage.searchFaq("payment");

    await supportPage.assertFaqSearchResult(/What payment methods are accepted\?/i);
  });

  // Purpose: confirms the store locator renders actionable contact and direction options.
  // Risk covered: store locator data missing, contact links absent, or service-location route broken.
  test("@sanity @support SANITY_020 Store locator - should show store contact actions", async ({ page }) => {
    const supportPage = new SupportPage(page);

    await supportPage.openStoreLocator();

    await supportPage.assertStoreLocatorLoaded();
    await supportPage.assertStoreActionsAvailable();
  });
}
