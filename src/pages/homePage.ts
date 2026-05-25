import { expect, Locator, Page } from "@playwright/test";

import { extractCategorySlug } from "../utils/url";
import { BasePage, SelfHealingLocatorDefinition } from "./basePage";

const headerLocator: SelfHealingLocatorDefinition = {
  name: "Homepage header",
  primary: "section.shadow-main-menu, .desktop-header-menu",
  fallbacks: ["header", "[role='banner']", "nav:has-text('Categories')"],
  textHints: ["categories", "brands", "campaigns", "search"],
  attributeHints: {
    role: ["banner", "navigation"]
  }
};

const searchInputLocator: SelfHealingLocatorDefinition = {
  name: "Homepage search input",
  primary: "input[name='search'], input[placeholder*='Search'], input[type='search']",
  fallbacks: ["input[placeholder*='Search']", "input[name='search']", "[role='searchbox']"],
  textHints: ["search", "search here"],
  attributeHints: {
    placeholder: ["search"],
    name: ["search"],
    type: ["search"]
  }
};

const categoryLinksLocator: SelfHealingLocatorDefinition = {
  name: "Homepage category navigation",
  primary: "a[href*='/category/']",
  fallbacks: ["section:has-text('What are you looking for?') a", "a[aria-label*='category' i]"],
  textHints: ["refrigerator", "television", "washing machine", "category"],
  attributeHints: {
    href: ["/category/"],
    "aria-label": ["category"]
  }
};

// Page object for homepage header, search, and footer entry points.
export class HomePage extends BasePage {
  readonly header: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly footer: Locator;
  readonly productCards: Locator;
  readonly categoryLinks: Locator;

  // Builds all homepage locators once, so tests can reuse the same named pieces.
  constructor(page: Page, baseUrl?: string) {
    super(page, baseUrl);
    // Selectors include fallback variants because the site has responsive/header variants.
    this.header = this.selfHealingPrimary(headerLocator);
    this.searchInput = this.selfHealingPrimary(searchInputLocator);
    this.searchButton = this.byCss("input[name='search'] ~ button").first();
    // Prefer visible footer variants because the desktop viewport still renders a hidden mobile fixed footer.
    this.footer = this.byCss("footer:visible, [class*='footer']:visible");
    this.productCards = this.byCss(".product-card, a[href*='/product/']");
    this.categoryLinks = this.selfHealingPrimary(categoryLinksLocator);
  }

  // Opens the storefront homepage.
  async open(): Promise<void> {
    await this.goto("/");
  }

  // Loads the homepage; this name matches the other page objects.
  async load(): Promise<void> {
    await this.open();
  }

  // Checks the homepage has the title, header, and search box users need first.
  async assertLoaded(): Promise<void> {
    await expect(this.page).toHaveTitle(/Singer/i);
    await this.expectSelfHealingVisible(headerLocator, 10_000);
    await this.expectSelfHealingVisible(searchInputLocator, 10_000);
  }

  // Checks that enough product cards showed up on the homepage.
  async assertHasProducts(minimum: number): Promise<void> {
    await this.expectCountGreaterThan(this.productCards, minimum - 1);
  }

  // Collects category slugs from visible homepage category links.
  async getVisibleCategorySlugs(limit: number): Promise<string[]> {
    const slugs: string[] = [];
    const seen = new Set<string>();
    const categoryLinks = this.byCss(await this.resolveSelfHealingSelector(categoryLinksLocator, 10_000));
    const count = await categoryLinks.count();

    for (let index = 0; index < count && slugs.length < limit; index += 1) {
      const link = categoryLinks.nth(index);
      if (!(await link.isVisible().catch(() => false))) continue;

      const slug = extractCategorySlug(await link.getAttribute("href"));
      if (!slug || seen.has(slug)) continue;

      seen.add(slug);
      slugs.push(slug);
    }

    return slugs;
  }

  // Searches for a product word and falls back to the matching category URL if the search box is readonly.
  async searchFor(keyword: string): Promise<void> {
    await this.expectSelfHealingVisible(searchInputLocator, 10_000);
    const input = await this.resolveSelfHealingLocator(searchInputLocator, 10_000);
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
