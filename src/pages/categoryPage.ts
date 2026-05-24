import { Locator, Page } from "@playwright/test";

import { extractSlugFromHref } from "../utils/url";
import { BasePage } from "./basePage";

// Page object for category and product-listing pages.
export class CategoryPage extends BasePage {
  static readonly productLinkSelector =
    ".product-card a[href*='/product/'], a[aria-label='Go to product details'][href^='/product/'], a[href*='/product/']";

  readonly body: Locator;
  readonly productCards: Locator;
  readonly productLinks: Locator;

  constructor(page: Page, baseUrl?: string) {
    super(page, baseUrl);
    this.body = this.byCss("body");
    // Product cards can be rendered as cards or direct product links depending on layout.
    this.productCards = this.byCss(".product-card, a[href*='/product/']");
    this.productLinks = this.byCss(CategoryPage.productLinkSelector);
  }

  async load(categorySlug: string, page = 1, limit = 12): Promise<void> {
    await this.goto(`/category/${categorySlug}?category=${categorySlug}&page=${page}&limit=${limit}`);
  }

  async assertLoaded(): Promise<void> {
    await this.expectVisible(this.body);
    await this.firstVisibleLocator(["main", ".product-card", "a[href*='/product/']", "body"], 10_000);
  }

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

  async openCategories(): Promise<void> {
    await this.goto("/category/small-appliances");
  }

  async openWashingMachineCategory(): Promise<void> {
    await this.goto("/category/washing-machine");
  }
}
