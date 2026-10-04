import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

const workspace = fs.mkdtempSync(path.join(os.tmpdir(), "singer-ai-generator-"));
const inputDir = path.join(workspace, "definitions");
const outputDir = path.join(workspace, "generated");

test.after(() => fs.rmSync(workspace, { recursive: true, force: true }));

fs.mkdirSync(inputDir, { recursive: true });

function writeDefinition(id, steps) {
  fs.writeFileSync(
    path.join(inputDir, `${id}.json`),
    JSON.stringify({ id, title: id, tags: ["@ai"], purpose: "Generator test", risk: "Generator drift", steps })
  );
}

writeDefinition("assertion-only", [
  { action: "goto", path: "/" },
  { action: "expectTitle", pattern: "Singer" }
]);
writeDefinition("fill-only", [
  {
    action: "fill",
    selector: { description: "Search", css: "input[type='search']" },
    value: "television"
  }
]);
writeDefinition("click-only", [
  {
    action: "click",
    selector: { description: "Product", css: "a[href*='/product/']" }
  }
]);
writeDefinition("a11y-only", [{ action: "checkA11y" }]);

execFileSync(path.resolve("node_modules/.bin/ts-node"), [
  "ai/generate-test.ts",
  `--input=${inputDir}`,
  `--out=${outputDir}`
]);

const generated = (id) => fs.readFileSync(path.join(outputDir, `${id}.generated.spec.ts`), "utf8");

test("assertion-only specs omit helper functions and Playwright type imports", () => {
  const source = generated("assertion-only");

  assert.doesNotMatch(source, /import type \{.*Locator|import type \{.*Page/);
  assert.doesNotMatch(source, /function dismissBlockingModals|function robustFill|function clickOrNavigate/);
});

test("fill specs emit only robustFill and its Locator import", () => {
  const source = generated("fill-only");

  assert.match(source, /import type \{ Locator \} from "@playwright\/test";/);
  assert.match(source, /function robustFill/);
  assert.doesNotMatch(source, /\bPage\b|function dismissBlockingModals|function clickOrNavigate/);
});

test("click specs emit navigation helpers and their Page and Locator imports", () => {
  const source = generated("click-only");

  assert.match(source, /import type \{ Locator, Page \} from "@playwright\/test";/);
  assert.match(source, /function dismissBlockingModals/);
  assert.match(source, /function clickOrNavigate/);
  assert.doesNotMatch(source, /function robustFill/);
});

test("accessibility specs retain checkA11y and testInfo without unrelated helpers", () => {
  const source = generated("a11y-only");

  assert.match(source, /import \{ checkA11y \} from "\.\.\/accessibility\/a11y";/);
  assert.match(source, /async \(\{ page \}, testInfo\)/);
  assert.doesNotMatch(
    source,
    /import type \{|function dismissBlockingModals|function robustFill|function clickOrNavigate/
  );
});
