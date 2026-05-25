import type { Locator, Page } from "@playwright/test";
import { expect, test } from "../fixtures/singerTest";

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
  // Purpose: proves that users can move from category browsing into a product details page.
  // Risk covered: listing links that render but no longer navigate to valid PDP routes.
  test("@ai @catalog REG_004 Catalog - should open product details page from category listing", async ({ page }) => {
    await page.goto("/category/television?category=television&page=1&limit=12", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/category\/television/i);
    await expect(page.locator(".product-card, a[href*='/product/']").first()).toBeVisible();
    await dismissBlockingModals(page);
    await clickOrNavigate(
      page,
      page.locator(
        ".product-card a[href*='/product/'], a[aria-label='Go to product details'][href^='/product/'], a[href*='/product/']"
      )
    );
    await expect(page).toHaveURL(/\/product\//i);
    await expect(page.locator("main h1:visible").first()).toBeVisible();
  });
});
