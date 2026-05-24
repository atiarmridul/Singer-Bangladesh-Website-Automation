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

  async load(productSlug: string): Promise<void> {
    await this.goto(`/product/${productSlug}`);
  }

  async assertLoaded(): Promise<void> {
    await this.expectUrlContains("/product/");
    await this.expectVisible(this.productTitle);
  }

  assertUrlContainsProductSlug(productSlug: string): void {
    expect(this.page.url()).toContain(productSlug);
  }

  async getProductTitle(): Promise<string> {
    return (await this.productTitle.first().textContent())?.trim() ?? "";
  }

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

  async getProductImagesCount(): Promise<number> {
    return await this.productImages.count();
  }

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

  async isProductInStock(): Promise<boolean> {
    const stockText = await this.getStockStatus();
    return /in stock|available/i.test(stockText) && !/out of stock|unavailable/i.test(stockText);
  }

  async isAddToCartButtonVisible(): Promise<boolean> {
    return await this.addToCartButton
      .first()
      .isVisible()
      .catch(() => false);
  }

  async isReviewsSectionVisible(): Promise<boolean> {
    return await this.reviewsSection
      .first()
      .isVisible()
      .catch(() => false);
  }

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

  async addToCart(): Promise<void> {
    await this.clickWhenReady(this.addToCartButton);
  }
}
