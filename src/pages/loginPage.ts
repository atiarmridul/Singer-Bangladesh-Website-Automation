import { Locator, Page } from "@playwright/test";

import { BasePage } from "./basePage";

// Page object for opening and validating the login panel.
export class LoginPage extends BasePage {
  readonly body: Locator;
  readonly loginButton: Locator;
  readonly loginModal: Locator;

  // Builds locators for the login button and the login panel text.
  constructor(page: Page) {
    super(page);
    this.body = this.byCss("body");
    this.loginButton = this.byCss("button").filter({ hasText: /^Log In$/ });
    // Current site renders login as a fixed panel, not a .modal-wrapper overlay.
    this.loginModal = this.page.getByText("Welcome to Singer", { exact: true });
  }

  // Opens the homepage and clicks Log In so the login panel appears.
  async open(): Promise<void> {
    await this.goto("/");
    await this.clickWhenReady(this.loginButton);
  }

  // Opens only the homepage, leaving the login panel closed.
  async openHome(): Promise<void> {
    // Used by sanity checks that validate the entry point before opening the login panel.
    await this.goto("/");
  }
}
