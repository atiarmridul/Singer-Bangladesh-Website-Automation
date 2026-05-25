import { expect } from "@playwright/test";

import { getSettings } from "../../src/config";

interface LighthouseResult {
  runtimeError?: {
    code: string;
    message: string;
  };
  categories?: {
    accessibility?: {
      score: number | null;
    };
  };
}

type LighthouseSnapshot = (
  page: unknown,
  options: Record<string, unknown>
) => Promise<{ lhr?: LighthouseResult } | undefined>;

type ChromeLauncher = {
  launch(options: { chromeFlags: string[] }): Promise<{ port: number; kill(): Promise<void> }>;
};

type PuppeteerBrowser = {
  newPage(): Promise<{
    setViewport(viewport: { width: number; height: number }): Promise<void>;
    goto(url: string, options: { waitUntil: "domcontentloaded"; timeout: number }): Promise<unknown>;
  }>;
  disconnect(): void;
};

type PuppeteerCore = {
  connect(options: { browserURL: string }): Promise<PuppeteerBrowser>;
};

// Lighthouse and Puppeteer are ESM packages; dynamic import keeps this CommonJS TypeScript project compatible.
const dynamicImport = new Function("specifier", "return import(specifier)") as <T>(specifier: string) => Promise<T>;

export async function expectLighthouseAccessibilityScore(minimumScore = 0.6): Promise<void> {
  const settings = getSettings(process.env.TEST_ENV);
  const [{ snapshot }, chromeLauncher, puppeteer] = await Promise.all([
    dynamicImport<{ snapshot: LighthouseSnapshot }>("lighthouse"),
    dynamicImport<ChromeLauncher>("chrome-launcher"),
    dynamicImport<PuppeteerCore>("puppeteer-core")
  ]);
  const chrome = await chromeLauncher.launch({
    chromeFlags: [
      "--headless=new",
      "--disable-gpu",
      "--no-sandbox",
      "--disable-dev-shm-usage",
      // Singer serves Next.js assets from a separate static host, so match the browser flags used by UI tests.
      "--disable-web-security",
      "--disable-features=OpaqueResponseBlocking"
    ]
  });
  let browser: PuppeteerBrowser | undefined;

  try {
    browser = await puppeteer.connect({ browserURL: `http://127.0.0.1:${chrome.port}` });
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });
    await page.goto(settings.baseUrl, { waitUntil: "domcontentloaded", timeout: settings.timeoutMs });
    // Navigation-mode Lighthouse hangs on this ecommerce page, so audit a hydrated page snapshot instead.
    await new Promise((resolve) => setTimeout(resolve, 8_000));

    const result = await snapshot(page, {
      flags: {
        onlyCategories: ["accessibility"],
        formFactor: "desktop",
        screenEmulation: { disabled: true },
        throttlingMethod: "provided"
      }
    });
    const score = result?.lhr?.categories?.accessibility?.score;

    expect(result?.lhr?.runtimeError, result?.lhr?.runtimeError?.message).toBeUndefined();
    expect(score, "Lighthouse accessibility score should be available").not.toBeNull();
    expect(score ?? 0).toBeGreaterThanOrEqual(minimumScore);
  } finally {
    browser?.disconnect();
    await chrome.kill();
  }
}
