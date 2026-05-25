import { expect, Locator, Page } from "@playwright/test";

import { BasePage } from "./basePage";

// Page object for product listing entry points and product detail actions.
export class ProductPage extends BasePage {
  readonly firstProductLink: Locator;
  readonly productTitle: Locator;
  readonly price: Locator;
  readonly actionButton: Locator;
  readonly addToCartButton: Locator;
  readonly productImages: Locator;
  readonly stockStatus: Locator;
  readonly reviewsSection: Locator;
  readonly description: Locator;
  readonly brand: Locator;

  // Builds the locators for the product list and product detail page.
  constructor(page: Page, baseUrl?: string) {
    super(page, baseUrl);
    // The first product link is used to move from a listing page into a real PDP.
    this.firstProductLink = this.byCss("main a[aria-label='Go to product details'][href^='/product/']");
    this.productTitle = this.byCss("main h1").filter({ hasNotText: /^Product Details$/ });
    this.price = this.page.locator("main").getByText(/৳\s*[\d,]+/);
    this.actionButton = this.page.getByRole("button", { name: /Buy Now|Add to Cart/ });
    this.addToCartButton = this.page.getByRole("button", { name: "Add to Cart" });
    this.productImages = this.byCss("main img[src*='product'], main img[alt], main [class*='gallery'] img");
    this.stockStatus = this.byCss("main").getByText(/in stock|out of stock|available|unavailable/i);
    this.reviewsSection = this.byCss("main").getByText(/review|rating/i);
    this.description = this.byCss("[class*='description'], #description, main section:has-text('Description')");
    this.brand = this.byCss("main").getByText(/brand/i);
  }

  // Opens one product page by its slug.
  async load(productSlug: string): Promise<void> {
    await this.goto(`/product/${productSlug}`);
  }

  // Checks that the browser is on a product page and a title is visible.
  async assertLoaded(): Promise<void> {
    await this.expectUrlContains("/product/");
    await this.expectVisible(this.productTitle);
  }

  // Checks that the current product URL still contains the expected product slug.
  assertUrlContainsProductSlug(productSlug: string): void {
    expect(this.page.url()).toContain(productSlug);
  }

  // Reads the product title text, or returns an empty string if it is missing.
  async getProductTitle(): Promise<string> {
    return (await this.productTitle.first().textContent())?.trim() ?? "";
  }

  // Reads the product price text, or returns an empty string if it is missing.
  async getProductPrice(): Promise<string> {
    return (
      (
        await this.price
          .first()
          .textContent()
          .catch(() => null)
      )?.trim() ?? ""
    );
  }

  // Reads the product brand text when the page shows it.
  async getProductBrand(): Promise<string> {
    const explicitBrand = await this.brand
      .first()
      .textContent()
      .catch(() => null);
    if (explicitBrand?.trim()) {
      return explicitBrand.trim();
    }

    return "";
  }

  // Counts product pictures so tests know the gallery loaded.
  async getProductImagesCount(): Promise<number> {
    return await this.productImages.count();
  }

  // Reads the stock status text from the product page.
  async getStockStatus(): Promise<string> {
    return (
      (
        await this.stockStatus
          .first()
          .textContent()
          .catch(() => null)
      )?.trim() ?? ""
    );
  }

  // Turns the stock text into a simple yes/no answer.
  async isProductInStock(): Promise<boolean> {
    const stockText = await this.getStockStatus();
    return /in stock|available/i.test(stockText) && !/out of stock|unavailable/i.test(stockText);
  }

  // Checks if the Add to Cart button is visible.
  async isAddToCartButtonVisible(): Promise<boolean> {
    return await this.addToCartButton
      .first()
      .isVisible()
      .catch(() => false);
  }

  // Checks if a reviews or ratings area is visible.
  async isReviewsSectionVisible(): Promise<boolean> {
    return await this.reviewsSection
      .first()
      .isVisible()
      .catch(() => false);
  }

  // Reads the product description when it is available.
  async getProductDescription(): Promise<string> {
    return (
      (
        await this.description
          .first()
          .textContent()
          .catch(() => null)
      )?.trim() ?? ""
    );
  }

  // Opens the first product from a listing by using its link address.
  async openFirstProductFromListing(): Promise<void> {
    await this.expectVisible(this.firstProductLink, "First product details link should be visible");

    // Navigate by href instead of click to avoid carousel/card overlay interception.
    const href = await this.firstProductLink.first().getAttribute("href");
    if (!href) {
      throw new Error("First product details link does not have an href");
    }

    await this.goto(href);
    await this.expectUrlContains("/product/");
  }

  // Clicks the Add to Cart button.
  async addToCart(): Promise<void> {
    await this.clickWhenReady(this.addToCartButton);
  }
}
