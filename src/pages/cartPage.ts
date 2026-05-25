import { Locator, Page } from "@playwright/test";

import { BasePage } from "./basePage";

export type CartState = "empty" | "items" | "unknown";

const emptyCartMessageSelectors = [
  // Empty-cart markup differs between deployments, so keep the known variants together.
  ".cart-empty p",
  ".cart-empty",
  ".checkout-cart-index .cart-empty",
  "[class*='empty-cart']",
  "main:has-text('Your cart is empty')",
  "main:has-text('Shopping cart is empty')"
];

const cartItemSelectors = [
  // Cart item markup can be table-based or card-based depending on current checkout UI.
  ".cart.item",
  ".cart.table-wrapper tbody tr",
  ".cart-container .item-info",
  "[class*='cart'] [class*='item']",
  "main a[href*='/product/']"
];

// Page object for cart navigation and cart-specific indicators.
export class CartPage extends BasePage {
  readonly body: Locator;
  readonly cartCount: Locator;
  readonly cartItems: Locator;
  readonly emptyCartMessage: Locator;

  // Builds locators for cart content, cart count, and empty-cart messages.
  constructor(page: Page) {
    super(page);
    this.body = this.byCss("body");
    // Header cart count appears only after an item is added.
    this.cartCount = this.page.getByRole("banner").getByText(/^[1-9]\d*$/);
    this.cartItems = this.byCss(cartItemSelectors.join(", "));
    this.emptyCartMessage = this.byCss(emptyCartMessageSelectors.join(", "));
  }

  // Opens the cart page directly.
  async open(): Promise<void> {
    await this.goto("/cart");
  }

  // Decides whether the cart has items, is empty, or cannot be recognized.
  async getCartState(): Promise<CartState> {
    // Wait for any recognizable cart surface before deciding whether the page has items or is empty.
    await this.firstVisibleLocator([...cartItemSelectors, ...emptyCartMessageSelectors, "main", "body"], 10_000);

    if (await this.hasVisibleMatch(cartItemSelectors)) {
      return "items";
    }

    if (await this.hasVisibleMatch(emptyCartMessageSelectors)) {
      return "empty";
    }

    return "unknown";
  }

  // Returns the cart state, but fails if the page does not look like a cart.
  async expectKnownCartState(): Promise<CartState> {
    const state = await this.getCartState();
    if (state === "unknown") {
      throw new Error(`Expected cart page to show items or an empty-cart message. Current URL: ${this.page.url()}`);
    }

    return state;
  }

  // Checks if any selector in a list has at least one visible match.
  private async hasVisibleMatch(selectors: string[]): Promise<boolean> {
    // Check each match individually because hidden template nodes may share the same selector.
    for (const selector of selectors) {
      const locators = this.byCss(selector);
      const count = await locators.count();

      for (let index = 0; index < count; index += 1) {
        if (
          await locators
            .nth(index)
            .isVisible()
            .catch(() => false)
        ) {
          return true;
        }
      }
    }

    return false;
  }
}
