import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUTPUT_FILE = "docs/test-cases.md";
const TEST_SECTIONS = [
  {
    title: "Sanity Tests",
    prefix: "SANITY",
    files: [
      "tests-ts/sanity/cases/homepage.ts",
      "tests-ts/sanity/cases/category.ts",
      "tests-ts/sanity/cases/search.ts",
      "tests-ts/sanity/cases/productListing.ts",
      "tests-ts/sanity/cases/productDetails.ts",
      "tests-ts/sanity/cases/cart.ts",
      "tests-ts/sanity/cases/authentication.ts",
      "tests-ts/sanity/cases/campaign.ts",
      "tests-ts/sanity/cases/footer.ts",
      "tests-ts/sanity/cases/support.ts"
    ]
  },
  {
    title: "Regression Tests",
    prefix: "REG",
    files: listFiles("tests-ts/regression")
  },
  {
    title: "Visual Regression Tests",
    prefix: "VISUAL",
    files: listFiles("tests-ts/visual")
  },
  {
    title: "Accessibility Tests",
    prefix: "A11Y",
    files: listFiles("tests-ts/accessibility").filter((file) => file.endsWith(".spec.ts"))
  },
  {
    title: "AI Generated Tests",
    prefix: "AI",
    files: listFiles("tests-ts/ai-generated")
  }
];

const METHOD_STEPS = new Map([
  ["apiAgent.healthcheck", "Call the catalog API global settings healthcheck endpoint."],
  ["apiAgent.getProducts", "Fetch catalog product data from the API for the configured category."],
  ["apiAgent.getTopLevelCategories", "Fetch top-level categories from the catalog API."],
  ["campaignPage.open", "Open the campaign page."],
  ["cartPage.expectKnownCartState", "Verify the cart page shows a recognized empty or populated cart state."],
  ["cartPage.expectUrlContains", "Verify the browser URL contains the expected cart route."],
  ["cartPage.expectVisible", "Verify the cart counter or cart element is visible."],
  ["cartPage.getCartState", "Read the cart state from the cart page."],
  ["cartPage.open", "Open the cart page directly."],
  ["category.assertLoaded", "Verify the category listing shell is loaded."],
  ["category.find", "Find the first product link in the category listing."],
  ["category.getVisibleProductSlugs", "Read visible product slugs from the category listing."],
  ["category.load", "Open the configured category listing with the configured pagination."],
  ["categoryPage.assertLoaded", "Verify the category listing shell is loaded."],
  ["categoryPage.expectCountGreaterThan", "Verify the listing exposes at least one matching element."],
  ["categoryPage.expectTextContains", "Verify the category page contains the expected category text."],
  ["categoryPage.expectUrlContains", "Verify the browser URL contains the expected category slug."],
  ["categoryPage.expectVisible", "Verify the category page body is visible."],
  ["categoryPage.load", "Open the category page using a live API-provided category slug."],
  ["categoryPage.openCategories", "Open the small appliances category page."],
  ["categoryPage.openWashingMachineCategory", "Open the washing machine category listing."],
  ["footerPage.expectUrlContains", "Verify the browser URL contains the terms and conditions route."],
  ["footerPage.expectVisible", "Verify the footer terms and conditions link is visible."],
  ["footerPage.openHome", "Open the homepage before checking footer navigation."],
  ["footerPage.openTermsConditions", "Click the terms and conditions footer link."],
  ["home.assertHasProducts", "Verify the homepage renders the expected minimum number of product cards."],
  ["home.assertLoaded", "Verify the homepage title, header, and search controls are loaded."],
  ["home.getVisibleCategorySlugs", "Read visible category slugs from the homepage."],
  ["home.load", "Open the homepage."],
  ["homePage.expectCountGreaterThan", "Verify the homepage exposes at least one matching element."],
  ["homePage.expectVisible", "Verify the homepage element is visible."],
  ["homePage.open", "Open the homepage."],
  ["homePage.searchFor", "Search from the homepage using configured keyword."],
  ["checkA11y", "Run the axe-core accessibility scan against the hydrated page."],
  ["expectLighthouseAccessibilityScore", "Run the Lighthouse accessibility audit and verify the score threshold."],
  ["openFirstProductFromCategory", "Open the first product from the configured category listing."],
  ["loginPage.expectTextContains", "Verify the login modal contains the expected welcome copy."],
  ["loginPage.expectVisible", "Verify the login modal or login entry point is visible."],
  ["loginPage.open", "Open the login modal from the homepage."],
  ["loginPage.openHome", "Open the homepage before checking the login entry point."],
  ["page.addStyleTag", "Disable animations and hide transient overlays for stable screenshots."],
  ["page.goto", "Open the target page in the browser."],
  ["page.setViewportSize", "Set the browser viewport used for the visual baseline."],
  ["page.waitForLoadState", "Wait for the page to settle before assertions."],
  ["prepareVisualPage", "Prepare the homepage for visual comparison at the baseline viewport."],
  ["productPage.addToCart", "Click the product add-to-cart action."],
  ["productPage.assertLoaded", "Verify the product details page shell is loaded."],
  ["productPage.expectCountGreaterThan", "Verify product media exists on the details page."],
  ["productPage.expectVisible", "Verify the product detail element is visible."],
  ["productPage.getProductBrand", "Read product brand information from the details page."],
  ["productPage.getProductDescription", "Read the product description from the details page."],
  ["productPage.getProductImagesCount", "Count product gallery images."],
  ["productPage.getProductPrice", "Read the visible product price."],
  ["productPage.getProductTitle", "Read the visible product title."],
  ["productPage.getStockStatus", "Read the visible stock status."],
  ["productPage.isAddToCartButtonVisible", "Check whether the add-to-cart button is visible."],
  ["productPage.isProductInStock", "Check whether the product appears to be in stock."],
  ["productPage.isReviewsSectionVisible", "Check whether the reviews section is present."],
  ["productPage.load", "Open the product details page using a live or API-provided product slug."],
  ["searchPage.expectCountGreaterThan", "Verify search results contain at least one product card."],
  ["searchPage.expectUrlContains", "Verify the search URL contains the normalized keyword slug."],
  ["supportPage.assertFaqSearchResult", "Verify the FAQ result list contains the expected matching question."],
  ["supportPage.assertStoreActionsAvailable", "Verify store locator contact actions are available."],
  ["supportPage.assertStoreLocatorLoaded", "Verify the store locator page has loaded."],
  ["supportPage.openFaq", "Open the FAQ page."],
  ["supportPage.openStoreLocator", "Open the store locator page."],
  ["supportPage.searchFaq", "Search the FAQ page with the configured keyword."]
]);

const SHARED_METHOD_STEPS = new Map([
  ["click", "Click the target element."],
  ["expectCountGreaterThan", "Verify the target element count is greater than the expected minimum."],
  ["expectTextContains", "Verify the target element contains the expected text."],
  ["expectUrlContains", "Verify the browser URL contains the expected route or slug."],
  ["expectVisible", "Verify the target element is visible."],
  ["find", "Find the target element on the page."],
  ["getAttribute", "Read the target element attribute."],
  ["locator", "Locate the target element on the page."],
  ["trim", "Normalize text before assertion."],
  ["url", "Read the current browser URL."]
]);

// Lists TypeScript files inside one test folder.
function listFiles(relativeDir) {
  const dir = path.join(ROOT, relativeDir);
  if (!fs.existsSync(dir)) {
    return [];
  }

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".ts"))
    .sort()
    .map((file) => path.join(relativeDir, file));
}

// Reads one source file as text.
function readText(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

// Reads data-driven search words used to expand search test titles.
function readSearchKeywords() {
  const keywordFile = path.join(ROOT, "tests-ts/data/search-keywords.json");
  if (!fs.existsSync(keywordFile)) {
    return [];
  }

  const parsed = JSON.parse(fs.readFileSync(keywordFile, "utf8"));
  return Array.isArray(parsed.keywords) ? parsed.keywords : [];
}

// Finds test cases in one file and pairs them with nearby Purpose/Risk comments.
function extractTestsFromFile(file) {
  const source = readText(file);
  const lines = source.split("\n");
  const tests = [];
  let pendingPurpose = "";
  let pendingRisk = "";

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    const purpose = line.match(/^\/\/\s*Purpose:\s*(.+)$/);
    const risk = line.match(/^\/\/\s*Risk covered:\s*(.+)$/);

    if (purpose) {
      pendingPurpose = purpose[1].trim();
      continue;
    }

    if (risk) {
      pendingRisk = risk[1].trim();
      continue;
    }

    if (!line.includes("test(") || line.includes("test.describe")) {
      continue;
    }

    const title = extractTitle(line);
    if (!title) {
      continue;
    }

    const bodyLines = collectTestBody(lines, index);
    const variants = expandTitleVariants(title);
    for (const variantTitle of variants) {
      tests.push({
        file,
        title: variantTitle,
        purpose: pendingPurpose,
        risk: pendingRisk,
        steps: extractSteps(bodyLines, variantTitle)
      });
    }

    pendingPurpose = "";
    pendingRisk = "";
  }

  return tests;
}

// Pulls a test title from a normal string or template string.
function extractTitle(line) {
  const quoteMatch = line.match(/test\(\s*["']([^"']+)["']/);
  if (quoteMatch) {
    return quoteMatch[1];
  }

  const templateMatch = line.match(/test\(\s*`([^`]+)`/);
  return templateMatch ? templateMatch[1] : "";
}

// Expands `${keyword}` titles into one title per configured search keyword.
function expandTitleVariants(title) {
  if (!title.includes("${keyword}")) {
    return [title];
  }

  const keywords = readSearchKeywords();
  return keywords.length > 0
    ? keywords.map((keyword) => title.replace("${keyword}", keyword))
    : [title.replace("${keyword}", "<keyword>")];
}

// Collects the lines inside one test body.
function collectTestBody(lines, startIndex) {
  const body = [];
  let braceDepth = 0;
  let seenBody = false;

  for (let index = startIndex; index < lines.length; index += 1) {
    const current = lines[index];
    if (index !== startIndex) {
      body.push(current);
    }

    for (const character of current) {
      if (character === "{") {
        braceDepth += 1;
        seenBody = true;
      } else if (character === "}") {
        braceDepth -= 1;
      }
    }

    if (seenBody && braceDepth <= 0 && index > startIndex) {
      break;
    }
  }

  return body;
}

// Turns important code lines into business-readable execution steps.
function extractSteps(bodyLines, title) {
  const steps = [];

  for (const rawLine of bodyLines) {
    const line = rawLine.trim();
    if (!isExecutionLine(line)) {
      continue;
    }

    const step = describeExecutionLine(line, title);
    if (step && !steps.includes(step)) {
      steps.push(step);
    }
  }

  return steps.length > 0 ? steps : ["Execute the Playwright test body and evaluate its assertions."];
}

// Decides whether one code line should appear as a test execution step.
function isExecutionLine(line) {
  if (!line || line.startsWith("//")) {
    return false;
  }

  if (line.includes("testInfo.attach")) {
    return false;
  }

  return line.startsWith("await ") || line.startsWith("expect(") || line.includes(" await ");
}

// Explains one executable line in plain words.
function describeExecutionLine(line, title) {
  const normalized = line.replace(/;$/, "");

  if (/^(await\s+)?expect\(/.test(normalized)) {
    return describeAssertion(normalized);
  }

  const method = normalized.match(/(?:await\s+)?([a-zA-Z]\w*)\.([a-zA-Z]\w+)\(/);
  if (method) {
    const key = `${method[1]}.${method[2]}`;
    return replaceKeyword(
      METHOD_STEPS.get(key) ?? SHARED_METHOD_STEPS.get(method[2]) ?? fallbackMethodStep(method[1], method[2]),
      title
    );
  }

  const helper = normalized.match(/await\s+([a-zA-Z]\w+)\(/);
  if (helper) {
    return replaceKeyword(METHOD_STEPS.get(helper[1]) ?? fallbackHelperStep(helper[1]), title);
  }

  return codeStep(normalized);
}

// Explains common Playwright assertions in plain words.
function describeAssertion(line) {
  if (line.includes("toHaveScreenshot")) {
    return "Compare the target area against the committed screenshot baseline.";
  }

  if (line.includes("toHaveTitle")) {
    return "Verify the page title matches the expected Singer title pattern.";
  }

  if (line.includes("toHaveURL")) {
    return "Verify the browser URL matches the expected route pattern.";
  }

  if (line.includes("toBeVisible")) {
    return "Verify the target UI element is visible.";
  }

  if (line.includes("toBeGreaterThanOrEqual")) {
    return "Verify the measured count meets or exceeds the expected minimum.";
  }

  if (line.includes("toBeGreaterThan")) {
    return "Verify the measured value is greater than the expected minimum.";
  }

  if (line.includes("toEqual([])")) {
    return "Verify no unexpected values were found.";
  }

  if (line.includes('.not.toBe("unknown")')) {
    return "Verify the detected state is not unknown.";
  }

  if (line.includes('.not.toBe("")')) {
    return "Verify the extracted value is not empty.";
  }

  if (line.includes("toBeTruthy")) {
    return "Verify the extracted value is present.";
  }

  if (line.includes("toBe(true)")) {
    return "Verify the boolean check returns true.";
  }

  if (line.includes("toBe(apiSlugs[0])")) {
    return "Verify the first visible product slug matches the first API product slug.";
  }

  if (line.includes('toBe("items")')) {
    return "Verify the cart contains item content.";
  }

  if (line.includes("toContain")) {
    return "Verify the current URL or value contains the expected slug.";
  }

  return "Verify the final assertion for this test case.";
}

// Gives a plain fallback sentence for unknown object method calls.
function fallbackMethodStep(objectName, methodName) {
  return `${toSentence(methodName)} on ${toSentence(objectName).toLowerCase()}.`;
}

// Gives a plain fallback sentence for unknown helper calls.
function fallbackHelperStep(helperName) {
  return `${toSentence(helperName)}.`;
}

// Replaces generic keyword wording with the actual data-driven keyword.
function replaceKeyword(step, title) {
  const keyword = title.match(/'([^']+)'/)?.[1];
  return keyword ? step.replace("configured keyword", `'${keyword}'`) : step;
}

// Keeps an unknown line visible as code instead of hiding it.
function codeStep(line) {
  return `Execute \`${line}\`.`;
}

// Turns camelCase helper names into readable sentences.
function toSentence(value) {
  return `${value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/Page$/, " page")
    .replace(/^./, (character) => character.toUpperCase())}.`;
}

// Removes tags and extra spaces from a test title.
function cleanTitle(title) {
  return title
    .replace(/@[^\s]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Pulls Playwright tags like @sanity from a test title.
function tagsFor(title) {
  return title.match(/@[a-zA-Z0-9_-]+/g) ?? [];
}

// Pulls explicit case IDs like SANITY_001 from a test title.
function explicitIdFor(title) {
  return title.match(/\b[A-Z]+(?:_[A-Z]+)*_\d+\b/)?.[0] ?? "";
}

// Builds the whole Markdown test case catalog.
function buildDocument(sections) {
  const output = [
    "# Test Case Catalog",
    "",
    "This file is generated from the Playwright tests under `tests-ts/`. It lists each test case in written form and explains how the test executes at a business-readable level.",
    "",
    "When a test case is added, removed, renamed, or materially changed, run:",
    "",
    "```bash",
    "npm run docs:test-cases",
    "```",
    "",
    "The generator expands data-driven search tests from `tests-ts/data/search-keywords.json` and reads `// Purpose:` plus `// Risk covered:` comments when they exist.",
    ""
  ];

  const summaryRows = [];
  for (const section of sections) {
    summaryRows.push(`| ${section.title} | ${section.tests.length} |`);
  }

  output.push("## Summary", "", ...formatTable(["Suite", "Test cases"], summaryRows), "");

  for (const section of sections) {
    output.push(`## ${section.title}`, "");

    section.tests.forEach((testCase, index) => {
      const explicitId = explicitIdFor(testCase.title);
      const generatedId = `${section.prefix}_${String(index + 1).padStart(3, "0")}`;
      const id = explicitId || generatedId;
      const tags = tagsFor(testCase.title);

      const title = cleanTitle(testCase.title);
      output.push(`### ${id} - ${explicitId ? title.replace(`${explicitId} `, "") : title}`, "");
      output.push(`- Source: \`${testCase.file}\``);
      output.push(`- Tags: ${tags.length > 0 ? tags.map((tag) => `\`${tag}\``).join(", ") : "None"}`);
      output.push(`- Purpose: ${testCase.purpose || inferPurpose(testCase.title)}`);
      output.push(`- Risk covered: ${testCase.risk || inferRisk(testCase.title)}`);
      output.push("- Execution:");

      testCase.steps.forEach((step, stepIndex) => {
        output.push(`  ${stepIndex + 1}. ${step}`);
      });

      output.push("");
    });
  }

  return `${output.join("\n").trim()}\n`;
}

// Builds a simple Markdown table with aligned columns.
function formatTable(headers, rows) {
  const parsedRows = rows.map((row) =>
    row
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim())
  );
  const widths = headers.map((header, index) => Math.max(header.length, ...parsedRows.map((row) => row[index].length)));
  const formatRow = (row) => `| ${row.map((cell, index) => cell.padEnd(widths[index])).join(" | ")} |`;
  const separator = `| ${widths.map((width) => "-".repeat(width)).join(" | ")} |`;

  return [formatRow(headers), separator, ...parsedRows.map(formatRow)];
}

// Guesses purpose text when a test has no inline Purpose comment.
function inferPurpose(title) {
  if (title.includes("@visual")) {
    return "protects a critical storefront component against unintended layout or rendering changes.";
  }

  if (title.includes("@a11y")) {
    return "validates accessibility coverage for a critical storefront page.";
  }

  if (title.includes("@ai")) {
    return "validates a generated Playwright test produced from structured AI-assisted test definitions.";
  }

  if (title.includes("@api")) {
    return "validates that UI-facing data remains aligned with the backend API contract.";
  }

  return "documents and validates the named user journey.";
}

// Guesses risk text when a test has no inline Risk comment.
function inferRisk(title) {
  if (title.includes("@visual")) {
    return "unexpected visual drift, broken layout, or missing critical UI components.";
  }

  if (title.includes("@a11y")) {
    return "critical accessibility defects, missing accessible metadata, or broad audit score regressions.";
  }

  if (title.includes("@ai")) {
    return "AI-generated test drift, invalid selectors, or generated specs that bypass framework conventions.";
  }

  if (title.includes("@api")) {
    return "API contract drift, missing data, or mismatched UI/API behavior.";
  }

  return "broken navigation, missing content, or failed user-facing behavior.";
}

// Reads all test sections and writes docs/test-cases.md.
function main() {
  const sections = TEST_SECTIONS.map((section) => ({
    ...section,
    tests: section.files.flatMap((file) => extractTestsFromFile(file))
  }));

  const document = buildDocument(sections);
  fs.mkdirSync(path.dirname(path.join(ROOT, OUTPUT_FILE)), { recursive: true });
  fs.writeFileSync(path.join(ROOT, OUTPUT_FILE), document);
  console.log(`Updated ${OUTPUT_FILE}`);
}

main();
