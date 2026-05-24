import { expect, Page, Route, test as base } from "@playwright/test";

async function tearDownPassedTest(page: Page): Promise<void> {
  // Failed tests keep their context artifacts intact for traces, screenshots, and debugging.
  if (page.isClosed()) {
    return;
  }

  // Keep each passed test isolated from local/session storage and cookies.
  await page
    .evaluate(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    })
    .catch(() => undefined);

  await page
    .context()
    .clearCookies()
    .catch(() => undefined);
  await page.context().clearPermissions();
  await page
    .context()
    .close()
    .catch(() => undefined);
}

export const test = base.extend({
  page: async ({ page }, use, testInfo) => {
    // Static assets are served from a CDN domain; route them through the main origin.
    // This avoids CDN-specific failures masking real storefront regressions.
    const staticAssetRoute = async (route: Route) => {
      const sameOriginUrl = route
        .request()
        .url()
        .replace("https://prod.static-singerbd.com", "https://www.singerbd.com");
      await route.continue({ url: sameOriginUrl });
    };

    await page.route("https://prod.static-singerbd.com/**", staticAssetRoute);

    await use(page);

    // Cleanup route handlers before optional context teardown.
    // The catch keeps teardown from hiding the real test result if the page already closed.
    await page.unroute("https://prod.static-singerbd.com/**", staticAssetRoute).catch(() => undefined);

    if (testInfo.status === "passed") {
      await tearDownPassedTest(page);
    }
  }
});

export { expect };
