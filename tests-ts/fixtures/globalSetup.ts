import { FullConfig } from "@playwright/test";

import { getSettings } from "../../src/config";
import { ConfigurationError } from "../../src/exceptions";

const reachableStatuses = new Set([200, 301, 302, 304, 401, 403]);

async function globalSetup(_config: FullConfig): Promise<void> {
  const settings = getSettings(process.env.TEST_ENV);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), settings.timeoutMs);

  try {
    // A HEAD request is enough to catch bad DNS/base URLs without spending CI time launching browsers.
    const response = await fetch(settings.baseUrl, {
      method: "HEAD",
      redirect: "manual",
      signal: controller.signal
    });

    // Redirects and auth/forbidden responses still prove that the selected host is reachable.
    if (!reachableStatuses.has(response.status)) {
      throw new ConfigurationError(
        "Target environment is not reachable",
        "BASE_URL",
        settings.baseUrl,
        `Expected one of: ${[...reachableStatuses].join(", ")}. Received: ${response.status}`
      );
    }
  } catch (error) {
    if (error instanceof ConfigurationError) {
      throw error;
    }

    const message = error instanceof Error ? error.message : String(error);
    throw new ConfigurationError(
      `Target environment smoke check failed: ${message}`,
      "BASE_URL",
      settings.baseUrl,
      "Reachable URL before Playwright tests start"
    );
  } finally {
    clearTimeout(timeout);
  }
}

export default globalSetup;
