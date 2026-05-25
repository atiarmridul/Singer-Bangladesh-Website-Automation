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
  // Purpose: confirms the store locator renders actionable contact and direction options.
  // Risk covered: store locator data missing, contact links absent, or service-location route broken.
  test("@ai @catalog @sanity @support SANITY_020 Store locator - should show store contact actions", async ({
    page
  }) => {
    await page.goto("/store-locator", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveTitle(/Store & Service Locations/i);
    await expect(page.locator("main input[placeholder='Search Here...']:visible").first()).toBeVisible();
    await expect(page.getByText("Phone:").first()).toContainText("Phone:");
    await expect(page.locator("main a[href^='tel:']").first()).toBeVisible();
    await expect(page.locator("main a[href*='google.com/maps/dir']").first()).toBeVisible();
    await expect(page.locator("main button:has-text('Book Now')").first()).toBeVisible();
  });
});
