// Pulls the slug out of a URL path, like "television" from "/category/television".
export function extractSlugFromHref(href: string | null | undefined, prefix: string): string | null {
  if (!href) return null;
  // Escape the route prefix because this helper is shared by product and category URL checks.
  const pattern = new RegExp(`/${prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/([^/?#]+)`);
  const match = href.match(pattern);
  return match?.[1] ?? null;
}

// Pulls a category slug from either the path or the category query parameter.
export function extractCategorySlug(href: string | null | undefined): string | null {
  const slug = extractSlugFromHref(href, "category");
  if (slug) return slug;
  if (!href) return null;

  try {
    // Some category links use query params instead of /category/:slug paths.
    const parsed = new URL(href, "https://placeholder.local");
    return parsed.searchParams.get("category");
  } catch {
    return null;
  }
}
