import { expect, test } from "../../fixtures/singerTest";

import { HomePage } from "../../../src/pages/homePage";

export function defineHomepageSanity(): void {
  // Purpose: verifies the homepage shell can load enough for a user to start browsing or searching.
  // Risk covered: blank page, missing header, or broken search entry point.
  test("@sanity @smoke @homepage SANITY_001 Homepage - should load header and search controls", async ({ page }) => {
    const homePage = new HomePage(page);

    await homePage.open();

    await expect(page).toHaveTitle(/Singer/i);
    await homePage.expectVisible(homePage.header);
    await homePage.expectVisible(homePage.searchInput);
  });

  // Purpose: verifies users can start category browsing from the homepage.
  // Risk covered: missing category navigation, hidden menu links, or selector drift in the browsing entry point.
  test("@sanity @homepage SANITY_011 Homepage - should show category navigation links", async ({ page }) => {
    const homePage = new HomePage(page);

    await homePage.open();

    await homePage.expectCountGreaterThan(homePage.categoryLinks, 0);
  });

  // Purpose: checks that global footer content is present after homepage load.
  // Risk covered: broken layout shell, missing footer render, or hydration hiding footer content.
  test("@sanity @homepage SANITY_014 Homepage - should render footer", async ({ page }) => {
    const homePage = new HomePage(page);

    await homePage.open();

    await homePage.expectVisible(homePage.footer);
  });
}
