import { expect, Locator, Page } from "@playwright/test";

import { BasePage } from "./basePage";

// Page object for help and service-location surfaces.
export class SupportPage extends BasePage {
  readonly faqSearchInput: Locator;
  readonly storeSearchInput: Locator;
  readonly main: Locator;
  readonly callNowLinks: Locator;
  readonly directionLinks: Locator;
  readonly bookNowButtons: Locator;

  // Builds locators for FAQ search and store locator actions.
  constructor(page: Page, baseUrl?: string) {
    super(page, baseUrl);
    this.main = this.byCss("main");
    this.faqSearchInput = this.byCss("main input[placeholder='Search topics, questions...']:visible");
    this.storeSearchInput = this.byCss("main input[placeholder='Search Here...']:visible");
    this.callNowLinks = this.byCss("main a[href^='tel:']");
    this.directionLinks = this.byCss("main a[href*='google.com/maps/dir']");
    this.bookNowButtons = this.byCss("main button:has-text('Book Now')");
  }

  // Opens the FAQ page.
  async openFaq(): Promise<void> {
    await this.goto("/faq");
  }

  // Opens the store locator page.
  async openStoreLocator(): Promise<void> {
    await this.goto("/store-locator");
  }

  // Types into FAQ search and waits until results are shown.
  async searchFaq(query: string): Promise<void> {
    await this.expectVisible(this.faqSearchInput);
    await this.faqSearchInput.fill(query);
    await expect(this.main).toContainText(/Related Search/i);
  }

  // Checks that FAQ search results include the expected question.
  async assertFaqSearchResult(expectedQuestion: RegExp): Promise<void> {
    await expect(this.main).toContainText(expectedQuestion);
  }

  // Checks that the store locator page title, search box, and phone text loaded.
  async assertStoreLocatorLoaded(): Promise<void> {
    await expect(this.page).toHaveTitle(/Store & Service Locations/i);
    await expect(this.main).toContainText(/Store & Service Locations/i);
    await this.expectVisible(this.storeSearchInput);
    await expect(this.main).toContainText(/Phone:/i);
  }

  // Checks that shoppers can call, get directions, and book from store results.
  async assertStoreActionsAvailable(): Promise<void> {
    await this.expectVisible(this.callNowLinks);
    await this.expectVisible(this.directionLinks);
    await this.expectVisible(this.bookNowButtons);
  }
}
