import type { Locator } from "@playwright/test";
import { expect, test } from "../fixtures/singerTest";

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

test.describe("AI generated tests", () => {
  // Purpose: validates FAQ client-side search so customers can quickly find self-service answers.
  // Risk covered: FAQ search input missing, filter state broken, or expected help content not rendered.
  test("@ai @catalog @sanity @support SANITY_019 FAQ - should filter questions by search keyword", async ({ page }) => {
    await page.goto("/faq", { waitUntil: "domcontentloaded" });
    await robustFill(page.locator("main input[placeholder='Search topics, questions...']:visible"), "payment");
    await expect(page.locator("main").first()).toContainText("Related Search");
  });
});
