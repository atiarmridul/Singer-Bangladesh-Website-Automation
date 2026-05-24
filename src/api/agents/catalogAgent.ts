import { ApiClient } from "../client";
import { Category, Product, categoryFromJson, productFromJson } from "../models";
import { ApiResponseError, NoDataError } from "../../exceptions";

type JsonObject = Record<string, unknown>;

export class CatalogApiAgent {
  constructor(private readonly apiClient: ApiClient) {}

  async healthcheck(): Promise<string> {
    // This endpoint is a lightweight availability check used before deeper catalog assumptions.
    const response = await this.apiClient.get<JsonObject>("/api/global-setting");
    return String(response.status ?? "unknown");
  }

  async getCategories(): Promise<Category[]> {
    const response = await this.apiClient.get<JsonObject>("/api/categories");
    const data = response.data;
    // Validate the envelope here so model parsers can focus on one category at a time.
    if (!Array.isArray(data)) {
      throw new ApiResponseError(`Expected 'data' field to be a list, got ${typeof data}`);
    }
    if (data.length === 0) {
      throw new NoDataError("No categories found in API response");
    }

    return data.map((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        throw new ApiResponseError(
          `Expected category item to be an object, got ${Array.isArray(item) ? "array" : typeof item}`
        );
      }
      return categoryFromJson(item as JsonObject);
    });
  }

  async getTopLevelCategories(): Promise<Category[]> {
    const categories = await this.getCategories();
    // Top-level categories are what the homepage exposes, so child categories are filtered out.
    const topLevel = categories.filter((item) => item.parentId === 0);
    if (topLevel.length === 0) {
      throw new NoDataError("No top-level categories found");
    }
    return topLevel;
  }

  async getProducts(categorySlug: string, page = 1, limit = 12): Promise<Product[]> {
    if (!categorySlug) {
      throw new Error("categorySlug must be a non-empty string");
    }

    // Keep pagination explicit so UI/API comparison tests can compare the same listing page.
    const response = await this.apiClient.get<JsonObject>("/api/products", {
      category: categorySlug,
      page,
      limit
    });
    const data = response.data;
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      throw new ApiResponseError(
        `Expected 'data' field to be an object, got ${Array.isArray(data) ? "array" : typeof data}`
      );
    }
    const items = (data as JsonObject).items;
    if (!Array.isArray(items)) {
      throw new ApiResponseError(`Expected 'items' field to be a list, got ${typeof items}`);
    }
    if (items.length === 0) {
      throw new NoDataError(`No products found for category '${categorySlug}' on page ${page}`);
    }

    return items.map((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        throw new ApiResponseError(
          `Expected product item to be an object, got ${Array.isArray(item) ? "array" : typeof item}`
        );
      }
      return productFromJson(item as JsonObject);
    });
  }
}
