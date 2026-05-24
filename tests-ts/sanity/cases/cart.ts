import { expect, test } from "../../fixtures/singerTest";

import { CartPage } from "../../../src/pages/cartPage";
import { CategoryPage } from "../../../src/pages/categoryPage";
import { ProductPage } from "../../../src/pages/productPage";

export function defineCartSanity(): void {
  // Purpose: covers the main guest shopping path from listing page to PDP to cart.
  // Risk covered: disabled add-to-cart action, cart counter failure, or cart item not persisting.
  test("@sanity @cart SANITY_006 Cart - should add product to cart from product details page", async ({ page }) => {
    const categoryPage = new CategoryPage(page);
    const productPage = new ProductPage(page);
    const cartPage = new CartPage(page);

    await categoryPage.openWashingMachineCategory();
    await productPage.openFirstProductFromListing();
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
}
