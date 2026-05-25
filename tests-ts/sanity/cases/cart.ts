import { expect, test } from "../../fixtures/singerTest";

import { CartPage } from "../../../src/pages/cartPage";
import { ProductPage } from "../../../src/pages/productPage";

// Groups cart journey sanity checks.
export function defineCartSanity(): void {
  test.describe("Cart state sanity", () => {
    test.describe.configure({ mode: "serial" });

    // Purpose: covers the main guest shopping path using a live in-stock product from API-backed test data.
    // Risk covered: stale hardcoded products, disabled add-to-cart action, cart counter failure, or cart item not persisting.
    test("@sanity @cart SANITY_006 Cart - should add live in-stock product to cart", async ({ page, liveProduct }) => {
      const productPage = new ProductPage(page);
      const cartPage = new CartPage(page);

      await productPage.load(liveProduct.slug);
      await productPage.addToCart();

      await cartPage.expectVisible(cartPage.cartCount);
      await cartPage.open();
      await cartPage.expectUrlContains("/cart");
      await expect(await cartPage.getCartState()).toBe("items");
    });

    // Purpose: verifies cart page routing independently from the add-to-cart workflow.
    // Risk covered: broken cart route, blank cart page, or unrecognized empty-cart UI.
    test("@sanity @cart SANITY_007 Cart - should open cart page directly", async ({ page }) => {
      const cartPage = new CartPage(page);

      await cartPage.open();

      await cartPage.expectUrlContains("/cart");
      await expect(await cartPage.expectKnownCartState()).not.toBe("unknown");
    });
  });
}
