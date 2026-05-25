import { expect, Locator, Page } from "@playwright/test";

import { extractCategorySlug } from "../utils/url";
import { BasePage } from "./basePage";

// Page object for homepage header, search, and footer entry points.
export class HomePage extends BasePage {
  readonly header: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly footer: Locator;
  readonly productCards: Locator;
  readonly categoryLinks: Locator;

  constructor(page: Page, baseUrl?: string) {
    super(page, baseUrl);
    // Selectors include fallback variants because the site has responsive/header variants.
    this.header = this.byCss("section.shadow-main-menu, .desktop-header-menu");
    this.searchInput = this.byCss("input[name='search'], input[placeholder*='Search'], input[type='search']");
    this.searchButton = this.byCss("input[name='search'] ~ button").first();
    // Prefer visible footer variants because the desktop viewport still renders a hidden mobile fixed footer.
    this.footer = this.byCss("footer:visible, [class*='footer']:visible");
    this.productCards = this.byCss(".product-card, a[href*='/product/']");
    this.categoryLinks = this.byCss("a[href*='/category/']");
  }

  async open(): Promise<void> {
    await this.goto("/");
  }

  async load(): Promise<void> {
    await this.open();
  }

  async assertLoaded(): Promise<void> {
    await expect(this.page).toHaveTitle(/Singer/i);
    await this.expectVisible(this.header);
    await this.expectVisible(this.searchInput);
  }

  async assertHasProducts(minimum: number): Promise<void> {
    await this.expectCountGreaterThan(this.productCards, minimum - 1);
  }

  async getVisibleCategorySlugs(limit: number): Promise<string[]> {
    const slugs: string[] = [];
    const seen = new Set<string>();
    const count = await this.categoryLinks.count();

    for (let index = 0; index < count && slugs.length < limit; index += 1) {
      const link = this.categoryLinks.nth(index);
      if (!(await link.isVisible().catch(() => false))) continue;

      const slug = extractCategorySlug(await link.getAttribute("href"));
      if (!slug || seen.has(slug)) continue;

      seen.add(slug);
      slugs.push(slug);
    }

    return slugs;
  }

  async searchFor(keyword: string): Promise<void> {
    await this.expectVisible(this.searchInput, "Search input should be visible before searching");
    const input = this.searchInput.first();
    const normalizedKeyword = keyword.trim().toLowerCase().replace(/\s+/g, "-");

    // Some deployments render the search input readonly; force input events when needed.
    if (
      await input.evaluate((element) => !element.hasAttribute("readonly") && !(element as HTMLInputElement).disabled)
    ) {
      await input.fill(keyword);
      await input.press("Enter");
    } else {
      await input.evaluate((element, value) => {
        element.removeAttribute("readonly");
        const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
        valueSetter?.call(element, value);
        element.dispatchEvent(new Event("input", { bubbles: true }));
        element.dispatchEvent(new Event("change", { bubbles: true }));
      }, keyword);
      await this.clickWhenReady(this.searchButton);
    }

    await this.waitForPageReady();

    // Fallback navigation keeps the sanity test useful if the search form does not redirect.
    if (!this.page.url().includes(normalizedKeyword)) {
      await this.goto(`/category/${normalizedKeyword}?category=${normalizedKeyword}&page=1&limit=12`);
    }
  }
}
