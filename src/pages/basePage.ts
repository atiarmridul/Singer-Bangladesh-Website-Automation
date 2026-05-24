import { expect, Locator, Page } from "@playwright/test";

import { PageLoadError } from "../exceptions";

// Shared base class for all Page Object Model classes.
export abstract class BasePage {
  protected constructor(
    protected readonly page: Page,
    private readonly baseUrl?: string
  ) {}

  protected byCss(selector: string): Locator {
    return this.page.locator(selector);
  }

  find(selector: string): Locator {
    return this.byCss(selector);
  }

  protected async firstVisibleLocator(selectors: string[], timeout = 5_000): Promise<Locator> {
    // Ecommerce pages often swap markup during hydration; try fallback selectors until one is truly visible.
    const deadline = Date.now() + timeout;

    while (Date.now() <= deadline) {
      for (const selector of selectors) {
        const locator = this.byCss(selector).first();
        if (await locator.isVisible().catch(() => false)) {
          return locator;
        }
      }

      await this.page.waitForTimeout(250);
    }

    throw new Error(`Expected one selector to become visible: ${selectors.join(", ")}`);
  }

  async goto(pathname: string): Promise<void> {
    const normalizedPath = pathname.startsWith("/") || /^https?:\/\//i.test(pathname) ? pathname : `/${pathname}`;
    const target =
      this.baseUrl && !/^https?:\/\//i.test(normalizedPath)
        ? new URL(normalizedPath, this.baseUrl).toString()
        : normalizedPath;

    try {
      // Navigate through baseURL from playwright.config.ts, then clear common overlays.
      await this.page.goto(target, { waitUntil: "domcontentloaded" });
      await this.waitForPageReady();
      await this.dismissBlockingModals();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new PageLoadError(`Failed to load page: ${message}`, this.page.url());
    }
  }

  async waitForPageReady(): Promise<void> {
    await this.page.waitForLoadState("domcontentloaded");
    // Network idle can be noisy on ecommerce pages, so timeout is non-fatal.
    await this.page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => undefined);
  }

  async dismissBlockingModals(): Promise<void> {
    // The spin wheel and similar overlays block clicks; close the topmost visible one.
    const modal = this.page.locator(".modal-wrapper:visible").last();

    if (!(await modal.isVisible().catch(() => false))) return;

    const closeControls = [
      // The site uses different close-control markup across modal variants.
      modal.locator("img.cursor-pointer, svg.cursor-pointer, [aria-label='Close'], button:has-text('Close')").first(),
      modal.locator("div.cursor-pointer").first(),
      modal.locator("xpath=./img").first()
    ];

    for (const closeControl of closeControls) {
      if (!(await closeControl.isVisible().catch(() => false))) continue;

      await closeControl.click({ force: true, timeout: 5_000 }).catch(() => undefined);
      await expect(modal)
        .toBeHidden({ timeout: 5_000 })
        .catch(() => undefined);
      break;
    }
  }

  async expectVisible(locator: Locator, description?: string): Promise<void> {
    await expect(locator.first(), description).toBeVisible();
  }

  async expectTextContains(locator: Locator, text: string): Promise<void> {
    await expect(locator.first()).toContainText(text, { ignoreCase: true });
  }

  async expectUrlContains(value: string): Promise<void> {
    // Treat expected URL fragments literally so characters like ? or + do not become regex operators.
    await expect(this.page).toHaveURL(new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  async expectCountGreaterThan(locator: Locator, minimum: number): Promise<void> {
    // Polling avoids flaky failures while product grids finish rendering after navigation.
    await expect
      .poll(async () => locator.count(), {
        message: `Expected locator count to be greater than ${minimum}`
      })
      .toBeGreaterThan(minimum);
  }

  async clickWhenReady(locator: Locator): Promise<void> {
    const target = locator.first();

    await expect(target).toBeVisible();
    // Modals can appear after page load or while scrolling, so dismiss around the click.
    await this.dismissBlockingModals();
    await target.scrollIntoViewIfNeeded();
    await this.dismissBlockingModals();

    try {
      await target.click({ timeout: 10_000 });
    } catch {
      await this.dismissBlockingModals();
      await target.click();
    }

    await this.waitForPageReady();
  }
}
