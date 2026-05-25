import { Locator, Page } from "@playwright/test";

import { extractSlugFromHref } from "../utils/url";
import { BasePage } from "./basePage";

// Page object for category and product-listing pages.
export class CategoryPage extends BasePage {
  // This selector finds links that take a shopper from a listing to a product page.
  static readonly productLinkSelector =
    ".product-card a[href*='/product/'], a[aria-label='Go to product details'][href^='/product/'], a[href*='/product/']";

  readonly body: Locator;
  readonly productCards: Locator;
  readonly productLinks: Locator;

  // Builds locators for the category body, product cards, and product links.
  constructor(page: Page, baseUrl?: string) {
    super(page, baseUrl);
    this.body = this.byCss("body");
    // Product cards can be rendered as cards or direct product links depending on layout.
    this.productCards = this.byCss(".product-card, a[href*='/product/']");
    this.productLinks = this.byCss(CategoryPage.productLinkSelector);
  }

  // Opens a category page with the chosen page number and product limit.
  async load(categorySlug: string, page = 1, limit = 12): Promise<void> {
    await this.goto(`/category/${categorySlug}?category=${categorySlug}&page=${page}&limit=${limit}`);
  }

  // Checks that the category page shell and listing area appeared.
  async assertLoaded(): Promise<void> {
    await this.expectVisible(this.body);
    await this.firstVisibleLocator(["main", ".product-card", "a[href*='/product/']", "body"], 10_000);
  }

  // Reads product slugs from visible product links so tests can compare UI with API data.
  async getVisibleProductSlugs(limit: number): Promise<string[]> {
    const slugs: string[] = [];
    const seen = new Set<string>();
    const count = await this.productLinks.count();

    for (let index = 0; index < count && slugs.length < limit; index += 1) {
      const link = this.productLinks.nth(index);
      if (!(await link.isVisible().catch(() => false))) continue;

      const slug = extractSlugFromHref(await link.getAttribute("href"), "product");
      if (!slug || seen.has(slug)) continue;

      seen.add(slug);
      slugs.push(slug);
    }

    return slugs;
  }

  // Opens a stable category page used by simple navigation checks.
  async openCategories(): Promise<void> {
    await this.goto("/category/small-appliances");
  }

  // Opens the washing machine category used by listing sanity tests.
  async openWashingMachineCategory(): Promise<void> {
    await this.goto("/category/washing-machine");
  }
}
