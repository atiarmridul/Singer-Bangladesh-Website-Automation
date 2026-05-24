import { Locator, Page } from "@playwright/test";

import { BasePage } from "./basePage";

// Page object for footer links and footer-level navigation checks.
export class FooterPage extends BasePage {
  readonly termsConditionsLink: Locator;

  constructor(page: Page) {
    super(page);
    // Use the stable href instead of visible text because footer copy can be localized or reworded.
    this.termsConditionsLink = this.byCss("a[href='/terms-conditions']");
  }

  async openHome(): Promise<void> {
    await this.goto("/");
  }

  async openTermsConditions(): Promise<void> {
    // The spin wheel can appear while the footer is in view and intercept this click.
    await this.dismissBlockingModals();
    await this.clickWhenReady(this.termsConditionsLink);
  }
}
