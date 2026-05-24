import { expect, test } from "../fixtures/singerTest";

async function prepareVisualPage(page: import("@playwright/test").Page): Promise<void> {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => undefined);
  // Visual checks should catch layout drift, not carousel animation frames or transient promotional overlays.
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        caret-color: transparent !important;
      }

      .modal-wrapper,
      [role="alert"],
      [class*="toast"],
      [class*="Toast"],
      [class*="floating"],
      [class*="Floating"] {
        visibility: hidden !important;
      }
    `
  });
}

test.describe("Homepage visual regression", () => {
  test("@visual Homepage header - should match baseline", async ({ page }) => {
    await prepareVisualPage(page);

    const header = page.locator("header, [role='banner']").first();
    await expect(header).toBeVisible();
    await expect(header).toHaveScreenshot("homepage-header.png", {
      animations: "disabled",
      maxDiffPixelRatio: 0.02
    });
  });

  test("@visual Homepage hero - should match baseline", async ({ page }) => {
    await prepareVisualPage(page);

    // Clip to the first hero viewport so lower-page product content changes do not invalidate this baseline.
    await expect(page).toHaveScreenshot("homepage-hero.png", {
      animations: "disabled",
      clip: { x: 0, y: 100, width: 1280, height: 312 },
      maxDiffPixelRatio: 0.03
    });
  });
});
