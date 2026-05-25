import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

// Reads a JSON file, like package.json.
function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

// Checks if a path exists inside the repo.
function exists(relPath) {
  return fs.existsSync(path.join(ROOT, relPath));
}

// Lists files in a folder, optionally keeping only one file extension.
function listFiles(relDir, ext) {
  // Walk directories manually so docs generation stays dependency-free in CI.
  const out = [];
  const start = path.join(ROOT, relDir);
  if (!fs.existsSync(start)) return out;

  const stack = [start];
  while (stack.length > 0) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(full);
        continue;
      }
      if (!entry.isFile()) continue;
      if (ext && !entry.name.endsWith(ext)) continue;
      out.push(path.relative(ROOT, full).replaceAll(path.sep, "/"));
    }
  }

  return out.sort((a, b) => a.localeCompare(b));
}

// Writes a file only when the content really changed.
function writeIfChanged(relPath, content) {
  // Avoid rewriting generated docs when content is unchanged; this keeps CI diffs quiet.
  const abs = path.join(ROOT, relPath);
  const normalized = `${content.trimEnd()}\n`;
  const prev = fs.existsSync(abs) ? fs.readFileSync(abs, "utf8") : null;
  if (prev === normalized) return false;
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, normalized, "utf8");
  return true;
}

// Builds the README text from the current project files and scripts.
function buildReadme() {
  // README is generated from the current repo shape so setup docs do not drift from scripts/files.
  const pkg = readJson(path.join(ROOT, "package.json"));
  const envFiles = listFiles("environments", ".env")
    .map((p) => path.basename(p))
    .sort();
  const srcFiles = listFiles("src", ".ts");
  const testFiles = listFiles("tests-ts", ".ts");

  const lines = [];
  lines.push("# Singer Bangladesh Playwright Automation", "");
  lines.push("Playwright TypeScript sanity automation framework for the Singer Bangladesh ecommerce website.", "");
  lines.push("## Prerequisites", "");
  lines.push("- Node.js 20+");
  lines.push("- npm 10+", "");
  lines.push("## Stack", "");
  lines.push("- Node.js 20+");
  lines.push("- TypeScript 5.x");
  lines.push("- Playwright Test (`@playwright/test`)");
  lines.push("- Page Object Model");
  lines.push("- `dotenv`", "");
  lines.push("## Base URL", "");
  lines.push("- `https://www.singerbd.com`", "");
  lines.push("## Project Structure", "");
  lines.push("```text");
  lines.push("environments/");
  for (const envFile of envFiles) lines.push(`  ${envFile}`);
  lines.push("src/");
  for (const srcFile of srcFiles) {
    lines.push(`  ${srcFile.replace(/^src\//, "")}`);
  }
  lines.push("tests-ts/");
  for (const testFile of testFiles) {
    lines.push(`  ${testFile.replace(/^tests-ts\//, "")}`);
  }
  if (exists("playwright.config.ts")) lines.push("playwright.config.ts");
  if (exists("tsconfig.json")) lines.push("tsconfig.json");
  lines.push("```", "");
  lines.push("## Setup", "");
  lines.push("```bash");
  lines.push("npm ci");
  lines.push("npx playwright install chromium");
  lines.push("```", "");
  lines.push("## Run Tests", "");
  lines.push("```bash");
  lines.push("npm test");
  lines.push("npm run test:sanity");
  lines.push("TEST_ENV=prod npm run test:sanity");
  lines.push("npm run typecheck");
  lines.push("```", "");
  lines.push("Useful commands:", "");
  const scripts = pkg.scripts ?? {};
  for (const key of [
    "test",
    "test:sanity",
    "test:sanity:modules",
    "test:headed",
    "test:prod",
    "test:ui",
    "typecheck",
    "docs:update"
  ]) {
    if (scripts[key]) lines.push(`- \`npm run ${key}\``);
  }
  lines.push("", "## Artifacts", "");
  lines.push("- Failure screenshots/videos/traces: `test-results/`");
  lines.push("- HTML report: `playwright-report/`");
  lines.push("", "## CI", "");
  lines.push("GitHub Actions workflows are in `.github/workflows/`.");
  lines.push("- `sanity.yml` runs type checking and the Playwright sanity suite.");
  lines.push("- `docs-sync.yml` auto-updates `README.md` and `docs/agent.md` on push.");
  return lines.join("\n");
}

// Builds the automation guide text from the current project layout.
function buildAgentGuide() {
  // Agent guide mirrors the automation architecture for future Codex/MCP-assisted maintenance.
  const agentFiles = listFiles("src/api/agents", ".ts")
    .map((p) => path.basename(p))
    .sort();
  const modelFiles = listFiles("src/api", ".ts")
    .filter((p) => !p.includes("/agents/"))
    .map((p) => path.basename(p))
    .sort();
  const pageFiles = listFiles("src/pages", ".ts")
    .map((p) => path.basename(p))
    .sort();
  const specFiles = listFiles("tests-ts/sanity", ".spec.ts").sort();
  const caseFiles = listFiles("tests-ts/sanity/cases", ".ts").sort();

  const lines = [];
  lines.push("# Automation Guide", "");
  lines.push("This guide defines the Singer Bangladesh Playwright TypeScript automation structure.", "");
  lines.push("## Page Objects", "");
  for (const file of pageFiles) lines.push(`- \`src/pages/${file}\``);
  lines.push("", "## Sanity Specs", "");
  for (const file of specFiles) lines.push(`- \`${file}\``);
  lines.push("", "## Sanity Case Files", "");
  for (const file of caseFiles) lines.push(`- \`${file}\``);
  lines.push("", "## Current Agents", "");
  if (agentFiles.length === 0) {
    lines.push("- No agent files found under `src/api/agents/`.");
  } else {
    for (const file of agentFiles) lines.push(`- \`src/api/agents/${file}\``);
  }
  lines.push("", "## Purpose", "");
  lines.push("Page objects keep locators and page actions reusable.");
  lines.push("Specs keep assertions explicit and organized with `test.describe` blocks.");
  lines.push("API agents provide optional typed access to Singer BD backend endpoints.", "");
  lines.push("## Architecture Rules", "");
  lines.push("1. Keep reusable locators and page actions in `src/pages/`.");
  lines.push("2. Keep reusable test bodies in `tests-ts/sanity/cases/`.");
  lines.push("3. Keep spec files as suite/group entry points under `tests-ts/sanity/`.");
  lines.push("4. Use Playwright `expect` assertions and retry-safe locators.");
  lines.push("5. Keep environment-specific settings in `.env` or `environments/*.env`.");
  lines.push("6. Keep raw HTTP transport logic in `src/api/client.ts`.");
  lines.push("7. Throw domain-meaningful errors from `src/exceptions.ts`.", "");
  lines.push("## API Layer Files", "");
  for (const file of modelFiles) lines.push(`- \`src/api/${file}\``);
  lines.push("", "## Example API Agent Usage", "");
  lines.push("```ts");
  lines.push('import { CatalogApiAgent } from "../src/api/agents/catalogAgent";');
  lines.push('import { ApiClient } from "../src/api/client";');
  lines.push('import { getSettings } from "../src/config";');
  lines.push("");
  lines.push("const settings = getSettings(process.env.TEST_ENV);");
  lines.push("const agent = new CatalogApiAgent(");
  lines.push("  new ApiClient(settings.apiBaseUrl, settings.timeoutMs)");
  lines.push(");");
  lines.push("```", "");
  lines.push("## Environment and CI", "");
  lines.push("- Select environment profile with `TEST_ENV=dev|staging|prod`.");
  lines.push("- Screenshots, videos, and traces are retained on failure by `playwright.config.ts`.");
  lines.push("- Sanity CI runs from `.github/workflows/sanity.yml`.");
  lines.push("- Docs are auto-synced by `.github/workflows/docs-sync.yml`.");
  return lines.join("\n");
}

const changed = [];
if (writeIfChanged("README.md", buildReadme())) changed.push("README.md");
if (writeIfChanged("docs/agent.md", buildAgentGuide())) changed.push("docs/agent.md");

if (changed.length > 0) {
  console.log(`Updated: ${changed.join(", ")}`);
} else {
  console.log("No doc changes.");
}
