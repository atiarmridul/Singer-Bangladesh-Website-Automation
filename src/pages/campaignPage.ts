import { Locator, Page } from "@playwright/test";

import { BasePage } from "./basePage";

// Page object for Singer campaign listing pages.
export class CampaignPage extends BasePage {
  readonly body: Locator;

  // Builds the body locator for campaign content checks.
  constructor(page: Page) {
    super(page);
    // Campaign content is validated through body text because promotional blocks change frequently.
    this.body = this.byCss("body");
  }

  // Opens the campaign page.
  async open(): Promise<void> {
    await this.goto("/campaign");
  }
}
