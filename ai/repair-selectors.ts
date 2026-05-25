import fs from "node:fs";
import path from "node:path";

import { chromium } from "@playwright/test";

import { SelectorDefinition, listDefinitionFiles, parseTestCaseFile } from "./test-case-parser";
import { getSettings } from "../src/config";

const args = new Map(
  process.argv.slice(2).map((arg) => {
    const [key, ...valueParts] = arg.replace(/^--/, "").split("=");
    return [key, valueParts.join("=") || "true"];
  })
);

const inputDir = path.resolve(args.get("input") ?? "ai/definitions");
const failureContext = args.get("failure") ? path.resolve(String(args.get("failure"))) : "";

type SelectorCandidate = {
  description: string;
  current: string;
  candidate: string;
  count: number;
  visibleCount: number;
};

function selectorsFromDefinitions(): SelectorCandidate[] {
  const selectors: SelectorCandidate[] = [];

  for (const file of listDefinitionFiles(inputDir)) {
    const testCase = parseTestCaseFile(file);
    for (const step of testCase.steps) {
      if (!("selector" in step)) continue;

      const selector = step.selector as SelectorDefinition;
      for (const candidate of selector.candidates) {
        selectors.push({
          description: selector.description,
          current: selector.css ?? selector.role ?? selector.text ?? selector.placeholder ?? "",
          candidate,
          count: 0,
          visibleCount: 0
        });
      }
    }
  }

  return selectors;
}

function failureText(): string {
  if (!failureContext || !fs.existsSync(failureContext)) {
    return "";
  }

  return fs.readFileSync(failureContext, "utf8");
}

async function scoreCandidates(candidates: SelectorCandidate[]): Promise<SelectorCandidate[]> {
  const settings = getSettings(process.env.TEST_ENV);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Match the shared Playwright fixture so the live Next.js app hydrates before selector scoring.
    await page.route("https://prod.static-singerbd.com/**", async (route) => {
      const sameOriginUrl = route
        .request()
        .url()
        .replace("https://prod.static-singerbd.com", "https://www.singerbd.com");
      await route.continue({ url: sameOriginUrl });
    });
    await page.goto(settings.baseUrl, { waitUntil: "domcontentloaded", timeout: settings.timeoutMs });
    await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => undefined);

    for (const candidate of candidates) {
      const locator = page.locator(candidate.candidate);
      candidate.count = await locator.count().catch(() => 0);
      candidate.visibleCount = await locator
        .evaluateAll((elements) => elements.filter((element) => element.checkVisibility()).length)
        .catch(() => 0);
    }

    return candidates.sort((left, right) => right.visibleCount - left.visibleCount || right.count - left.count);
  } finally {
    await browser.close();
  }
}

async function main(): Promise<void> {
  const context = failureText();
  const candidates = selectorsFromDefinitions().filter((candidate) => {
    if (!context) return true;
    return context.includes(candidate.current) || context.includes(candidate.description);
  });

  if (candidates.length === 0) {
    console.log("No selector candidates matched the provided definitions or failure context.");
    return;
  }

  const scored = await scoreCandidates(candidates);
  for (const candidate of scored) {
    console.log(
      JSON.stringify(
        {
          description: candidate.description,
          current: candidate.current,
          suggestedSelector: candidate.candidate,
          matchCount: candidate.count,
          visibleCount: candidate.visibleCount
        },
        null,
        2
      )
    );
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
