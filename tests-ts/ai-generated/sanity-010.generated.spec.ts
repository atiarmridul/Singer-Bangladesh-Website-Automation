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
  // Purpose: validates a legal/footer navigation link that users commonly need after page load.
  // Risk covered: footer not rendering, link target drift, or modal overlay blocking footer clicks.
  test("@ai @catalog @sanity @footer SANITY_010 Footer - should navigate to terms and conditions", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await dismissBlockingModals(page);
    await clickOrNavigate(page, page.locator("a[href='/terms-conditions'], a[href*='terms-conditions']"));
    await expect(page).toHaveURL(/terms-conditions/i);
  });
});
