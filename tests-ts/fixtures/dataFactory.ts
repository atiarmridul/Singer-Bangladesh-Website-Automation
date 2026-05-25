import { CatalogApiAgent } from "../../src/api/agents/catalogAgent";
import { ApiClient } from "../../src/api/client";
import { getSettings, Settings } from "../../src/config";
import { NoDataError } from "../../src/exceptions";
import { Category, Product } from "../../src/api/models";

export type ProductSelection = "first" | "random";
export type CategorySelection = "first" | "random";

export class TestDataFactory {
  private readonly settings: Settings;
  private readonly catalogApiAgent: CatalogApiAgent;

  // Builds the API helper used to fetch live categories and products.
  constructor(settings = getSettings(process.env.TEST_ENV)) {
    this.settings = settings;
    this.catalogApiAgent = new CatalogApiAgent(new ApiClient(settings.apiBaseUrl, settings.timeoutMs));
  }

  // Gets top-level categories from the live catalog.
  async getTopLevelCategories(): Promise<Category[]> {
    return await this.catalogApiAgent.getTopLevelCategories();
  }

  // Picks one top-level category, either the first one or a random one.
  async getTopLevelCategory(selection: CategorySelection = "random"): Promise<Category> {
    const categories = await this.getTopLevelCategories();

    if (categories.length === 0) {
      throw new NoDataError("No top-level categories found");
    }

    if (selection === "random") {
      return categories[Math.floor(Math.random() * categories.length)];
    }

    return categories[0];
  }

  // Finds a top-level category that actually has products.
  async getTopLevelCategoryWithProducts(selection: CategorySelection = "random"): Promise<Category> {
    const categories = await this.getTopLevelCategories();
    const candidateCategories = selection === "random" ? [...categories].sort(() => Math.random() - 0.5) : categories;

    for (const category of candidateCategories) {
      const products = await this.getProducts(category.slug, 1);
      if (products.length > 0) {
        return category;
      }
    }

    throw new NoDataError("No top-level categories with products found");
  }

  // Gets products from one category using the configured limit by default.
  async getProducts(
    categorySlug = this.settings.defaultCategory,
    limit = this.settings.productsLimit
  ): Promise<Product[]> {
    return await this.catalogApiAgent.getProducts(categorySlug, 1, limit);
  }

  // Finds an in-stock product inside one category.
  async getInStockProduct(
    categorySlug = this.settings.defaultCategory,
    selection: ProductSelection = "first"
  ): Promise<Product> {
    const products = await this.getProducts(categorySlug);
    // Product/cart flows should not depend on stale slugs or unavailable catalog items.
    const inStockProducts = products.filter((product) => product.inStock);

    if (inStockProducts.length === 0) {
      throw new NoDataError(`No in-stock products found for category '${categorySlug}'`);
    }

    if (selection === "random") {
      return inStockProducts[Math.floor(Math.random() * inStockProducts.length)];
    }

    return inStockProducts[0];
  }

  // Looks across categories until it finds any product that can be bought.
  async getAnyInStockProduct(selection: ProductSelection = "first"): Promise<Product> {
    const categories = await this.getTopLevelCategories();
    // Prefer the configured category for deterministic runs, then fall back across the live top-level catalog.
    const candidateSlugs = [this.settings.defaultCategory, ...categories.map((category) => category.slug)];
    const seen = new Set<string>();

    for (const categorySlug of candidateSlugs) {
      if (seen.has(categorySlug)) continue;
      seen.add(categorySlug);

      try {
        return await this.getInStockProduct(categorySlug, selection);
      } catch (error) {
        if (error instanceof NoDataError) continue;
        throw error;
      }
    }

    throw new NoDataError("No in-stock products found in configured or top-level categories");
  }
}

// Creates the default live test data factory.
export function createTestDataFactory(): TestDataFactory {
  return new TestDataFactory();
}
