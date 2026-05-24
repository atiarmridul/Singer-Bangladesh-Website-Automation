import { Locator, Page } from "@playwright/test";

import { BasePage } from "./basePage";

// Page object for search results assertions.
export class SearchPage extends BasePage {
  readonly productCards: Locator;

  constructor(page: Page) {
    super(page);
    // Search results use the same product card/link shapes as category listings.
    this.productCards = this.byCss(".product-card, a[href*='/product/']");
  }
}
