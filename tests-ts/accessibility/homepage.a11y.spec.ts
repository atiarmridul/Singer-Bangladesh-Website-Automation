import { test } from "../fixtures/singerTest";
import { checkA11y } from "./a11y";
import { expectLighthouseAccessibilityScore } from "./lighthouse";

test.describe("Accessibility", () => {
  // Purpose: scans the hydrated homepage for critical WCAG accessibility violations.
  // Risk covered: missing accessible names, invalid ARIA, contrast regressions, or keyboard-blocking markup.
  test("@a11y Homepage - should not have critical axe violations", async ({ page }, testInfo) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => undefined);

    await checkA11y(page, testInfo);
  });

  // Purpose: records a Lighthouse accessibility audit as a high-level accessibility quality gate.
  // Risk covered: broad accessibility regressions missed by targeted functional assertions.
  test("@a11y Homepage - should meet Lighthouse accessibility threshold", async () => {
    // Lighthouse launches and audits its own browser page, which needs more time than normal UI assertions.
    test.setTimeout(90_000);
    await expectLighthouseAccessibilityScore();
  });
});
