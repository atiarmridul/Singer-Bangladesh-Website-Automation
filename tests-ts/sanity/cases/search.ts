import { test } from "../../fixtures/singerTest";

import { HomePage } from "../../../src/pages/homePage";
import { SearchPage } from "../../../src/pages/searchPage";
import { searchKeywords } from "../../data/searchKeywords";

export function defineSearchSanity(): void {
  // Purpose: run the same search journey against representative high-traffic product keywords.
  // Risk covered: search form submission, search routing, and empty result listing regressions.
  for (const keyword of searchKeywords) {
    test(`@sanity @search SANITY_003 Search - should return products for '${keyword}'`, async ({ page }) => {
      const homePage = new HomePage(page);
      const searchPage = new SearchPage(page);

      await homePage.open();
      await homePage.searchFor(keyword);

      // Product search routes normalize spaces to hyphens, so assert the URL slug instead of raw text.
      await searchPage.expectUrlContains(keyword.trim().toLowerCase().replace(/\s+/g, "-"));
      await searchPage.expectCountGreaterThan(searchPage.productCards, 0);
    });
  }
}
