import fs from "node:fs";
import path from "node:path";

const inputFile = path.resolve(
  process.argv.find((arg) => arg.startsWith("--input="))?.split("=")[1] ?? "docs/test-cases.md"
);
const outputDir = path.resolve(process.argv.find((arg) => arg.startsWith("--out="))?.split("=")[1] ?? "ai/definitions");

const text = fs.readFileSync(inputFile, "utf8");

const selectors = {
  body: {
    description: "Page body",
    css: "body",
    candidates: ["body", "main"]
  },
  main: {
    description: "Main page content",
    css: "main, body",
    candidates: ["main", "body"]
  },
  header: {
    description: "Homepage header",
    css: "section.shadow-main-menu, .desktop-header-menu",
    candidates: ["section.shadow-main-menu", ".desktop-header-menu", "header", "[role='banner']"]
  },
  searchInput: {
    description: "Homepage search input",
    css: "input[name='search'], input[placeholder*='Search'], input[type='search']",
    candidates: ["input[name='search']", "input[placeholder*='Search']", "input[type='search']", "[role='searchbox']"]
  },
  productCards: {
    description: "Product cards or product links",
    css: ".product-card, a[href*='/product/']",
    candidates: [".product-card", "a[href*='/product/']", "main a[href*='/product/']"]
  },
  productLink: {
    description: "First product details link",
    css: ".product-card a[href*='/product/'], a[aria-label='Go to product details'][href^='/product/'], a[href*='/product/']",
    candidates: [
      ".product-card a[href*='/product/']",
      "a[aria-label='Go to product details'][href^='/product/']",
      "a[href*='/product/']"
    ]
  },
  productTitle: {
    description: "Product details title",
    css: "main h1:visible",
    candidates: ["main h1", "h1:visible"]
  },
  productImage: {
    description: "Product image or gallery",
    css: "main img[src*='product'], main img[alt], main [class*='gallery'] img",
    candidates: ["main img[src*='product']", "main img[alt]", "main [class*='gallery'] img"]
  },
  price: {
    description: "Product price",
    css: "main",
    text: "৳",
    candidates: ["main:has-text('৳')", "main [class*='price']", "main"]
  },
  stock: {
    description: "Product stock status",
    css: "main",
    candidates: ["main:has-text('In Stock')", "main:has-text('Available')", "main"]
  },
  addToCart: {
    description: "Add to cart button",
    role: "button",
    name: "Add to Cart",
    candidates: ["button:has-text('Add to Cart')", "button:has-text('Buy Now')"]
  },
  cartSurface: {
    description: "Cart page surface",
    css: ".cart.item, .cart.table-wrapper tbody tr, .cart-container .item-info, [class*='cart'], main, body",
    candidates: [
      ".cart.item",
      ".cart.table-wrapper tbody tr",
      ".cart-container .item-info",
      "[class*='cart']",
      "main",
      "body"
    ]
  },
  loginButton: {
    description: "Login button",
    css: "button:visible:has-text('Log In')",
    candidates: ["button:visible:has-text('Log In')", "button:visible:has-text('Login')", "header button:visible"]
  },
  loginModal: {
    description: "Login panel welcome text",
    text: "Welcome to Singer",
    candidates: ["text=Welcome to Singer", "[class*='modal']:has-text('Welcome to Singer')"]
  },
  termsLink: {
    description: "Terms and conditions footer link",
    css: "a[href='/terms-conditions'], a[href*='terms-conditions']",
    candidates: ["a[href='/terms-conditions']", "a[href*='terms-conditions']"]
  },
  faqSearch: {
    description: "FAQ search input",
    css: "main input[placeholder='Search topics, questions...']:visible",
    candidates: ["main input[placeholder='Search topics, questions...']", "main input[placeholder*='Search']"]
  },
  faqResult: {
    description: "FAQ payment result list",
    css: "main",
    candidates: ["main:has-text('What payment methods are accepted?')", "main:has-text('payment methods')"]
  },
  storeSearch: {
    description: "Store locator search input",
    css: "main input[placeholder='Search Here...']:visible",
    candidates: ["main input[placeholder='Search Here...']", "main input[placeholder*='Search']"]
  },
  storePhone: {
    description: "Store locator phone label",
    text: "Phone:",
    candidates: ["text=Phone:", "main:has-text('Phone:')"]
  },
  storeCallLink: {
    description: "Store locator call action",
    css: "main a[href^='tel:']",
    candidates: ["main a[href^='tel:']"]
  },
  storeDirections: {
    description: "Store locator directions action",
    css: "main a[href*='google.com/maps/dir']",
    candidates: ["main a[href*='google.com/maps/dir']", "main a[href*='maps']"]
  },
  storeBookNow: {
    description: "Store locator book now action",
    css: "main button:has-text('Book Now')",
    candidates: ["main button:has-text('Book Now')"]
  },
  categoryLinks: {
    description: "Homepage category navigation",
    css: "a[href*='/category/']",
    candidates: ["a[href*='/category/']", "section:has-text('What are you looking for?') a"]
  },
  footer: {
    description: "Footer",
    css: "footer:visible, [class*='footer']:visible",
    candidates: ["footer:visible", "[class*='footer']:visible"]
  }
};

// Reads the Markdown catalog and pulls out each written test case.
function parseCatalog(markdown) {
  const cases = [];
  let section = "";
  let current = null;

  for (const line of markdown.split("\n")) {
    const sectionMatch = line.match(/^## (.+)$/);
    if (sectionMatch) {
      section = sectionMatch[1];
      continue;
    }

    const caseMatch = line.match(/^### ([A-Z0-9_]+) - (.+)$/);
    if (caseMatch) {
      current = {
        id: caseMatch[1],
        title: caseMatch[2],
        section,
        source: "",
        tags: [],
        purpose: "",
        risk: ""
      };
      cases.push(current);
      continue;
    }

    if (!current) continue;

    const sourceMatch = line.match(/^- Source: `(.+)`$/);
    if (sourceMatch) current.source = sourceMatch[1];

    const tagsMatch = line.match(/^- Tags: (.+)$/);
    if (tagsMatch) {
      current.tags = tagsMatch[1] === "None" ? [] : [...tagsMatch[1].matchAll(/`(@[^`]+)`/g)].map((match) => match[1]);
    }

    const purposeMatch = line.match(/^- Purpose: (.+)$/);
    if (purposeMatch) current.purpose = purposeMatch[1];

    const riskMatch = line.match(/^- Risk covered: (.+)$/);
    if (riskMatch) current.risk = riskMatch[1];
  }

  return cases;
}

// Turns a title or ID into a lowercase filename-friendly slug.
function slug(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Keeps IDs unique when one catalog case expands into multiple examples.
function uniqueId(testCase, seen) {
  if (!seen.has(testCase.id)) {
    seen.add(testCase.id);
    return testCase.id;
  }

  const suffix = slug(testCase.title).replace(
    /^(homepage|category|search|listing|product|cart|auth|campaign|footer|faq|store-locator)-/,
    ""
  );
  const id = `${testCase.id}_${suffix}`
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
  seen.add(id);
  return id;
}

// Builds the repeated steps for opening a category listing page.
function categoryListingSteps(slugValue = "television") {
  return [
    { action: "goto", path: `/category/${slugValue}?category=${slugValue}&page=1&limit=12` },
    { action: "expectUrl", pattern: `/category/${slugValue}` },
    { action: "expectVisible", selector: selectors.productCards }
  ];
}

// Builds the repeated steps for opening the first product from a listing.
function openFirstProductSteps() {
  return [
    ...categoryListingSteps("television"),
    { action: "click", selector: selectors.productLink },
    { action: "expectUrl", pattern: "/product/" },
    { action: "expectVisible", selector: selectors.productTitle }
  ];
}

// Explains why some catalog cases cannot be generated with the current simple JSON actions.
function unsupportedReason(testCase) {
  if (testCase.section === "Visual Regression Tests")
    return "visual screenshot baselines are not supported by ai/generate-test.ts";
  if (testCase.section === "AI Generated Tests") return "already generated from ai/definitions";
  if (testCase.id === "REG_001" || testCase.id === "REG_002")
    return "raw API checks are not supported by ai/generate-test.ts";
  if (testCase.id === "A11Y_002") return "Lighthouse score audits are not supported by ai/generate-test.ts";
  if (/match .* api|api response|api slug/i.test(testCase.title)) {
    return "API/UI contract comparisons need custom code beyond JSON browser steps";
  }
  return "";
}

// Converts one catalog test case into JSON generator steps.
function stepsFor(testCase) {
  const title = testCase.title.toLowerCase();

  if (testCase.id === "A11Y_001") {
    return [
      { action: "goto", path: "/" },
      { action: "expectVisible", selector: selectors.header },
      { action: "checkA11y" }
    ];
  }

  if (title.includes("load header and search controls")) {
    return [
      { action: "goto", path: "/" },
      { action: "expectTitle", pattern: "Singer" },
      { action: "expectVisible", selector: selectors.header },
      { action: "expectVisible", selector: selectors.searchInput }
    ];
  }

  if (title.includes("category navigation links") || title.includes("visible category tiles")) {
    return [
      { action: "goto", path: "/" },
      { action: "expectVisible", selector: selectors.categoryLinks }
    ];
  }

  if (title.includes("render footer")) {
    return [
      { action: "goto", path: "/" },
      { action: "expectVisible", selector: selectors.footer }
    ];
  }

  if (title.includes("top-level category") || title.includes("category listing shell")) {
    return categoryListingSteps("television");
  }

  if (title.includes("search - should return products")) {
    const keyword = title.match(/'([^']+)'/)?.[1] ?? "television";
    const keywordSlug = keyword.replace(/\s+/g, "-");
    return [
      { action: "goto", path: `/category/${keywordSlug}?category=${keywordSlug}&page=1&limit=12` },
      { action: "expectUrl", pattern: keywordSlug },
      { action: "expectVisible", selector: selectors.productCards }
    ];
  }

  if (title.includes("washing machine category")) {
    return categoryListingSteps("washing-machine");
  }

  if (title.includes("product detail links")) {
    return [...categoryListingSteps("washing-machine"), { action: "expectVisible", selector: selectors.productLink }];
  }

  if (title.includes("open product details") || title.includes("load details page successfully")) {
    return openFirstProductSteps();
  }

  if (title.includes("show product images") || title.includes("load image gallery")) {
    return [...openFirstProductSteps(), { action: "expectVisible", selector: selectors.productImage }];
  }

  if (title.includes("add live in-stock product to cart")) {
    return [
      ...openFirstProductSteps(),
      { action: "expectVisible", selector: selectors.addToCart },
      { action: "click", selector: selectors.addToCart },
      { action: "goto", path: "/cart" },
      { action: "expectUrl", pattern: "/cart" },
      { action: "expectVisible", selector: selectors.cartSurface }
    ];
  }

  if (title.includes("open cart page directly")) {
    return [
      { action: "goto", path: "/cart" },
      { action: "expectUrl", pattern: "/cart" },
      { action: "expectVisible", selector: selectors.cartSurface }
    ];
  }

  if (title.includes("open login modal")) {
    return [
      { action: "goto", path: "/" },
      { action: "click", selector: selectors.loginButton },
      { action: "expectText", selector: selectors.loginModal, text: "Welcome to Singer" }
    ];
  }

  if (title.includes("login entry point")) {
    return [
      { action: "goto", path: "/" },
      { action: "expectVisible", selector: selectors.loginButton }
    ];
  }

  if (title.includes("emi content")) {
    return [
      { action: "goto", path: "/campaign" },
      { action: "expectUrl", pattern: "campaign" },
      { action: "expectText", selector: selectors.body, text: "EMI" }
    ];
  }

  if (title.includes("campaign page body")) {
    return [
      { action: "goto", path: "/campaign" },
      { action: "expectUrl", pattern: "campaign" },
      { action: "expectVisible", selector: selectors.body }
    ];
  }

  if (title.includes("navigate to terms and conditions")) {
    return [
      { action: "goto", path: "/" },
      { action: "click", selector: selectors.termsLink },
      { action: "expectUrl", pattern: "terms-conditions" }
    ];
  }

  if (title.includes("terms and conditions link")) {
    return [
      { action: "goto", path: "/" },
      { action: "expectVisible", selector: selectors.termsLink }
    ];
  }

  if (title.includes("filter questions by search keyword")) {
    return [
      { action: "goto", path: "/faq" },
      { action: "fill", selector: selectors.faqSearch, value: "payment" },
      { action: "expectText", selector: selectors.faqResult, text: "Related Search" }
    ];
  }

  if (title.includes("store contact actions")) {
    return [
      { action: "goto", path: "/store-locator" },
      { action: "expectTitle", pattern: "Store & Service Locations" },
      { action: "expectVisible", selector: selectors.storeSearch },
      { action: "expectText", selector: selectors.storePhone, text: "Phone:" },
      { action: "expectVisible", selector: selectors.storeCallLink },
      { action: "expectVisible", selector: selectors.storeDirections },
      { action: "expectVisible", selector: selectors.storeBookNow }
    ];
  }

  if (title.includes("core content blocks")) {
    return [
      { action: "goto", path: "/" },
      { action: "expectTitle", pattern: "Singer" },
      { action: "expectVisible", selector: selectors.header },
      { action: "expectVisible", selector: selectors.searchInput },
      { action: "expectVisible", selector: selectors.productCards }
    ];
  }

  if (title.includes("display stock status")) {
    return [...openFirstProductSteps(), { action: "expectVisible", selector: selectors.stock }];
  }

  if (title.includes("show add to cart button")) {
    return [...openFirstProductSteps(), { action: "expectVisible", selector: selectors.addToCart }];
  }

  if (title.includes("reviews section")) {
    return [...openFirstProductSteps(), { action: "expectVisible", selector: selectors.main }];
  }

  if (title.includes("product description")) {
    return [...openFirstProductSteps(), { action: "expectVisible", selector: selectors.main }];
  }

  if (title.includes("brand information")) {
    return [...openFirstProductSteps(), { action: "expectVisible", selector: selectors.main }];
  }

  if (title.includes("display price")) {
    return [...openFirstProductSteps(), { action: "expectVisible", selector: selectors.price }];
  }

  if (title.includes("matching product url slug")) {
    return openFirstProductSteps();
  }

  if (title.includes("non-empty title")) {
    return openFirstProductSteps();
  }

  if (title.includes("open product details page from category listing")) {
    return openFirstProductSteps();
  }

  return [];
}

// Writes one JSON definition file to ai/definitions.
function writeDefinition(testCase, id) {
  const tags = Array.from(new Set(["@ai", "@catalog", ...testCase.tags]));
  const definition = {
    id,
    title: testCase.title,
    tags,
    purpose: testCase.purpose,
    risk: testCase.risk,
    steps: stepsFor(testCase)
  };

  const fileName = `${slug(id)}.json`;
  fs.writeFileSync(path.join(outputDir, fileName), `${JSON.stringify(definition, null, 2)}\n`);
  return fileName;
}

fs.mkdirSync(outputDir, { recursive: true });

for (const file of fs.readdirSync(outputDir)) {
  if (file.endsWith(".json")) {
    fs.unlinkSync(path.join(outputDir, file));
  }
}

const seenIds = new Set();
const written = [];
const skipped = [];

for (const testCase of parseCatalog(text)) {
  const reason = unsupportedReason(testCase);
  const steps = stepsFor(testCase);

  if (reason || steps.length === 0) {
    skipped.push({
      id: testCase.id,
      title: testCase.title,
      reason: reason || "no conversion template matched this case"
    });
    continue;
  }

  const id = uniqueId(testCase, seenIds);
  const fileName = writeDefinition({ ...testCase, id }, id);
  written.push(fileName);
}

console.log(`Converted ${written.length} test cases into ${path.relative(process.cwd(), outputDir)}.`);
for (const file of written) console.log(`  wrote ${file}`);

if (skipped.length > 0) {
  console.log(`Skipped ${skipped.length} unsupported cases:`);
  for (const item of skipped) console.log(`  ${item.id} ${item.title}: ${item.reason}`);
}
