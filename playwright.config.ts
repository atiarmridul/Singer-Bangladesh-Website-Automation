import { defineConfig, devices } from "@playwright/test";

import { getSettings } from "./src/config";

const settings = getSettings(process.env.TEST_ENV);
const browserRunOptions = {
  // HEADED=true in an env file or shell opens the browser for debugging.
  headless: !settings.headed,
  launchOptions: {
    slowMo: settings.slowMo
  }
};

// Central Playwright configuration. Environment-specific values are resolved in src/config.ts.
export default defineConfig({
  testDir: "./tests-ts",
  timeout: settings.timeoutMs + 15_000,
  expect: {
    timeout: 15_000
  },
  fullyParallel: false,
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["junit", { outputFile: "test-results/junit/results.xml" }],
    ["allure-playwright", { outputFolder: "allure-results" }]
  ],
  use: {
    // baseURL lets page.goto("/path") resolve against the selected Singer environment.
    baseURL: settings.baseUrl,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    viewport: { width: 1536, height: 864 },
    actionTimeout: settings.timeoutMs,
    navigationTimeout: settings.timeoutMs
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        ...browserRunOptions
      }
    },
    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
        ...browserRunOptions
      }
    },
    {
      name: "webkit",
      use: {
        ...devices["Desktop Safari"],
        ...browserRunOptions
      }
    }
  ]
});
