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

  constructor(page: Page, baseUrl?: string) {
    super(page, baseUrl);
    this.main = this.byCss("main");
    this.faqSearchInput = this.byCss("main input[placeholder='Search topics, questions...']:visible");
    this.storeSearchInput = this.byCss("main input[placeholder='Search Here...']:visible");
    this.callNowLinks = this.byCss("main a[href^='tel:']");
    this.directionLinks = this.byCss("main a[href*='google.com/maps/dir']");
    this.bookNowButtons = this.byCss("main button:has-text('Book Now')");
  }

  async openFaq(): Promise<void> {
    await this.goto("/faq");
  }

  async openStoreLocator(): Promise<void> {
    await this.goto("/store-locator");
  }

  async searchFaq(query: string): Promise<void> {
    await this.expectVisible(this.faqSearchInput);
    await this.faqSearchInput.fill(query);
    await expect(this.main).toContainText(/Related Search/i);
  }

  async assertFaqSearchResult(expectedQuestion: RegExp): Promise<void> {
    await expect(this.main).toContainText(expectedQuestion);
  }

  async assertStoreLocatorLoaded(): Promise<void> {
    await expect(this.page).toHaveTitle(/Store & Service Locations/i);
    await expect(this.main).toContainText(/Store & Service Locations/i);
    await this.expectVisible(this.storeSearchInput);
    await expect(this.main).toContainText(/Phone:/i);
  }

  async assertStoreActionsAvailable(): Promise<void> {
    await this.expectVisible(this.callNowLinks);
    await this.expectVisible(this.directionLinks);
    await this.expectVisible(this.bookNowButtons);
  }
}
