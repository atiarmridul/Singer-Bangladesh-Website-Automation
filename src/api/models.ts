import { ApiResponseError } from "../exceptions";

type JsonObject = Record<string, unknown>;

// Narrow API payloads into the fields tests need, instead of passing raw JSON around.
export interface Category {
  id: number;
  slug: string;
  name: string;
  parentId: number;
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  brand: string;
  sellPrice: number;
  regularPrice: number;
  quantity: number;
  maxCartQuantity: number;
  status: number;
  inStock: boolean;
}

function asObject(value: unknown): JsonObject {
  // Treat malformed nested objects as empty objects so callers can provide fallbacks.
  return value && typeof value === "object" && !Array.isArray(value) ? (value as JsonObject) : {};
}

function localizedName(value: unknown, fallback: string): string {
  // Singer names are localized objects; tests use English when available.
  const objectValue = asObject(value);
  const en = objectValue.en;
  return typeof en === "string" ? en : fallback;
}

function toNumber(value: unknown, field: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new ApiResponseError(`Invalid value for '${field}': ${String(value)}`);
  }
  return parsed;
}

function toFloat(value: unknown): number {
  // Price fields can be absent for unavailable products; model them as zero instead of failing parsing.
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseRequiredSlug(payload: JsonObject, entity: string): string {
  // Slugs are used for navigation, so missing or blank slugs should fail fast.
  if (!("slug" in payload)) {
    throw new ApiResponseError(`Missing required field 'slug' in ${entity} response`);
  }
  const slug = String(payload.slug).trim();
  if (!slug) {
    throw new ApiResponseError(`Field 'slug' cannot be empty in ${entity} response`);
  }
  return slug;
}

export function categoryFromJson(payload: JsonObject): Category {
  // Convert the API category shape into the simpler framework model.
  if (!("id" in payload)) {
    throw new ApiResponseError("Missing required field 'id' in category response");
  }
  const slug = parseRequiredSlug(payload, "category");

  return {
    id: toNumber(payload.id, "id"),
    slug,
    name: localizedName(payload.name, slug),
    parentId: Number(payload.parent_id ?? 0)
  };
}

export function productFromJson(payload: JsonObject): Product {
  // Convert product API data into stable fields used by sanity flows.
  if (!("id" in payload)) {
    throw new ApiResponseError("Missing required field 'id' in product response");
  }
  const slug = parseRequiredSlug(payload, "product");
  const brand = asObject(asObject(payload.brand).name);
  const quantity = toFloat(payload.quantity);
  const maxCartQuantity = toFloat(payload.max_cart_quantity);
  const status = toFloat(payload.status);

  return {
    id: toNumber(payload.id, "id"),
    slug,
    name: localizedName(payload.name, slug),
    brand: typeof brand.en === "string" ? brand.en : "",
    sellPrice: toFloat(payload.sell_price),
    regularPrice: toFloat(payload.regular_price),
    quantity,
    maxCartQuantity,
    status,
    // The listing API exposes availability through stock count, cart limit, and active status together.
    inStock: quantity > 0 && maxCartQuantity > 0 && status === 1
  };
}
