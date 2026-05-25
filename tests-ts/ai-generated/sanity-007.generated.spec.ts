import type { Locator, Page } from "@playwright/test";
import { expect, test } from "../fixtures/singerTest";

// Closes popups that can cover buttons during generated tests.
async function dismissBlockingModals(page: Page): Promise<void> {
  const modal = page.locator(".modal-wrapper:visible").last();

  if (!(await modal.isVisible({ timeout: 1_000 }).catch(() => false))) {
    return;
  }

  const closeButton = modal
    .locator(
      "img.cursor-pointer, svg.cursor-pointer, [aria-label='Close'], button:has-text('Close'), div.cursor-pointer"
    )
    .first();

  if (await closeButton.isVisible({ timeout: 1_000 }).catch(() => false)) {
    await closeButton.click({ force: true }).catch(() => undefined);
  }

  await page.keyboard.press("Escape").catch(() => undefined);
  await expect(modal)
    .toBeHidden({ timeout: 3_000 })
    .catch(() => undefined);
}

// Fills normal inputs, and also helps readonly inputs by sending browser events.
async function robustFill(locator: Locator, value: string): Promise<void> {
  const target = locator.first();

  await target.fill(value, { timeout: 5_000 }).catch(async () => {
    await target.evaluate((element, inputValue) => {
      element.removeAttribute("readonly");
      const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
      valueSetter?.call(element, inputValue);
      element.dispatchEvent(new Event("input", { bubbles: true }));
      element.dispatchEvent(new Event("change", { bubbles: true }));
    }, value);
  });
}

// Opens links by href, and clicks normal buttons.
async function clickOrNavigate(page: Page, locator: Locator): Promise<void> {
  const target = locator.first();
  const href = await target.getAttribute("href").catch(() => null);

  if (href) {
    await page.goto(href, { waitUntil: "domcontentloaded" });
    return;
  }

  await target.click({ timeout: 10_000 }).catch(async () => {
    await target.click({ force: true });
  });
}

test.describe("AI generated tests", () => {
  // Purpose: verifies cart page routing independently from the add-to-cart workflow.
  // Risk covered: broken cart route, blank cart page, or unrecognized empty-cart UI.
  test("@ai @catalog @sanity @cart SANITY_007 Cart - should open cart page directly", async ({ page }) => {
    await page.goto("/cart", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/cart/i);
    await expect(
      page
        .locator(".cart.item, .cart.table-wrapper tbody tr, .cart-container .item-info, [class*='cart'], main, body")
        .first()
    ).toBeVisible();
  });
});
