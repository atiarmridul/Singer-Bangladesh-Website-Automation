import { Locator, Page } from "@playwright/test";

import { BasePage } from "./basePage";

// Page object for Singer campaign listing pages.
export class CampaignPage extends BasePage {
  readonly body: Locator;

  constructor(page: Page) {
    super(page);
    // Campaign content is validated through body text because promotional blocks change frequently.
    this.body = this.byCss("body");
  }

  async open(): Promise<void> {
    await this.goto("/campaign");
  }
}
