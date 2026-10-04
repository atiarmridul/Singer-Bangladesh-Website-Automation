import { expect, test } from "../fixtures/singerTest";
import { checkA11y } from "../accessibility/a11y";

test.describe("AI generated tests", () => {
  // Purpose: scans the hydrated homepage for critical WCAG accessibility violations.
  // Risk covered: missing accessible names, invalid ARIA, contrast regressions, or keyboard-blocking markup.
  test("@ai @catalog @a11y A11Y_001 Homepage - should not have critical axe violations", async ({ page }, testInfo) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("section.shadow-main-menu, .desktop-header-menu").first()).toBeVisible();
    await checkA11y(page, testInfo);
  });
});
