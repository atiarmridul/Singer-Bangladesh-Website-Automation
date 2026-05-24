import { CatalogApiAgent } from "../../src/api/agents/catalogAgent";
import { ApiClient } from "../../src/api/client";
import { getSettings, Settings } from "../../src/config";
import { NoDataError } from "../../src/exceptions";
import { Category, Product } from "../../src/api/models";

export type ProductSelection = "first" | "random";

export class TestDataFactory {
  private readonly settings: Settings;
  private readonly catalogApiAgent: CatalogApiAgent;

  constructor(settings = getSettings(process.env.TEST_ENV)) {
    this.settings = settings;
    this.catalogApiAgent = new CatalogApiAgent(new ApiClient(settings.apiBaseUrl, settings.timeoutMs));
  }

  async getTopLevelCategories(): Promise<Category[]> {
    return await this.catalogApiAgent.getTopLevelCategories();
  }

  async getProducts(categorySlug = this.settings.defaultCategory, limit = this.settings.productsLimit): Promise<Product[]> {
    return await this.catalogApiAgent.getProducts(categorySlug, 1, limit);
  }

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

export function createTestDataFactory(): TestDataFactory {
  return new TestDataFactory();
}
