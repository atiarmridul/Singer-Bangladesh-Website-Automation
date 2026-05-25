import fs from "node:fs";
import path from "node:path";

import {
  GeneratedTestCase,
  SelectorDefinition,
  TestStep,
  listDefinitionFiles,
  parseTestCaseFile,
  toSafeFileName
} from "./test-case-parser";

const args = new Map(
  process.argv.slice(2).map((arg) => {
    const [key, ...valueParts] = arg.replace(/^--/, "").split("=");
    return [key, valueParts.join("=") || "true"];
  })
);

const inputDir = path.resolve(args.get("input") ?? "ai/definitions");
const outputDir = path.resolve(args.get("out") ?? "tests-ts/ai-generated");

// Turns one selector definition into Playwright code that can find the element.
function locatorExpression(selector: SelectorDefinition): string {
  if (selector.role) {
    const roleOptions = selector.name ? `, { name: ${JSON.stringify(selector.name)} }` : "";
    return `page.getByRole(${JSON.stringify(selector.role)}${roleOptions})`;
  }

  if (selector.placeholder) {
    return `page.getByPlaceholder(${JSON.stringify(selector.placeholder)})`;
  }

  if (selector.text) {
    return `page.getByText(${JSON.stringify(selector.text)})`;
  }

  if (selector.css) {
    return `page.locator(${JSON.stringify(selector.css)})`;
  }

  throw new Error(`Selector '${selector.description}' must define role, placeholder, text, or css`);
}

// Escapes text so it can be safely used inside a generated regular expression.
function regexLiteral(pattern: string): string {
  return `/${pattern.replace(/[\\^$.*+?()[\]{}|/]/g, "\\$&")}/i`;
}

// Turns one JSON step into one or more Playwright code lines.
function renderStep(step: TestStep): string[] {
  switch (step.action) {
    case "goto":
      return [`await page.goto(${JSON.stringify(step.path)}, { waitUntil: "domcontentloaded" });`];
    case "click":
      return [
        `await dismissBlockingModals(page);`,
        `await clickOrNavigate(page, ${locatorExpression(step.selector)});`
      ];
    case "fill":
      return [`await robustFill(${locatorExpression(step.selector)}, ${JSON.stringify(step.value)});`];
    case "press":
      return [`await ${locatorExpression(step.selector)}.first().press(${JSON.stringify(step.key)});`];
    case "expectVisible":
      return [`await expect(${locatorExpression(step.selector)}.first()).toBeVisible();`];
    case "expectText":
      return [`await expect(${locatorExpression(step.selector)}.first()).toContainText(${JSON.stringify(step.text)});`];
    case "expectTitle":
      return [`await expect(page).toHaveTitle(${regexLiteral(step.pattern)});`];
    case "expectUrl":
      return [`await expect(page).toHaveURL(${regexLiteral(step.pattern)});`];
    case "checkA11y":
      return [`await checkA11y(page, testInfo);`];
  }
}

// Chooses imports needed by the generated test file.
function importsFor(testCase: GeneratedTestCase): string {
  const usesA11y = testCase.steps.some((step) => step.action === "checkA11y");
  const imports = [
    'import type { Locator, Page } from "@playwright/test";',
    'import { expect, test } from "../fixtures/singerTest";'
  ];

  if (usesA11y) {
    imports.push('import { checkA11y } from "../accessibility/a11y";');
  }

  return imports.join("\n");
}

// Writes helper code into every generated spec so generated tests can handle popups and tricky inputs.
function helperFunctions(): string {
  return `// Closes popups that can cover buttons during generated tests.
async function dismissBlockingModals(page: Page): Promise<void> {
  const modal = page.locator(".modal-wrapper:visible").last();

  if (!(await modal.isVisible({ timeout: 1_000 }).catch(() => false))) {
    return;
  }

  const closeButton = modal
    .locator("img.cursor-pointer, svg.cursor-pointer, [aria-label='Close'], button:has-text('Close'), div.cursor-pointer")
    .first();

  if (await closeButton.isVisible({ timeout: 1_000 }).catch(() => false)) {
    await closeButton.click({ force: true }).catch(() => undefined);
  }

  await page.keyboard.press("Escape").catch(() => undefined);
  await expect(modal).toBeHidden({ timeout: 3_000 }).catch(() => undefined);
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
`;
}

// Turns one parsed test definition into a complete Playwright spec file.
function renderTest(testCase: GeneratedTestCase): string {
  const title = `${testCase.tags.join(" ")} ${testCase.id} ${testCase.title}`.trim();
  const needsTestInfo = testCase.steps.some((step) => step.action === "checkA11y");
  const params = needsTestInfo ? "{ page }, testInfo" : "{ page }";
  const body = testCase.steps.flatMap(renderStep).map((line) => `    ${line}`);

  return `${importsFor(testCase)}

${helperFunctions()}

test.describe("AI generated tests", () => {
  // Purpose: ${testCase.purpose}
  // Risk covered: ${testCase.risk}
  test(${JSON.stringify(title)}, async (${params}) => {
${body.join("\n")}
  });
});
`;
}

// Regenerates all generated specs from the JSON definition folder.
function main(): void {
  fs.mkdirSync(outputDir, { recursive: true });

  for (const file of fs.readdirSync(outputDir)) {
    if (file.endsWith(".generated.spec.ts")) {
      fs.unlinkSync(path.join(outputDir, file));
    }
  }

  for (const file of listDefinitionFiles(inputDir)) {
    const testCase = parseTestCaseFile(file);
    const outputFile = path.join(outputDir, `${toSafeFileName(testCase.id)}.generated.spec.ts`);
    fs.writeFileSync(outputFile, renderTest(testCase));
    console.log(`Generated ${path.relative(process.cwd(), outputFile)} from ${path.relative(process.cwd(), file)}`);
  }
}

main();
