import { Locator, Page } from "@playwright/test";

import { BasePage } from "./basePage";

// Page object for search results assertions.
export class SearchPage extends BasePage {
  readonly productCards: Locator;

  // Builds the locator for products shown in search results.
  constructor(page: Page) {
    super(page);
    // Search results use the same product card/link shapes as category listings.
    this.productCards = this.byCss(".product-card, a[href*='/product/']");
  }
}
