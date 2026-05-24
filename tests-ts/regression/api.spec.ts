import { expect, test } from "@playwright/test";

import { CatalogApiAgent } from "../../src/api/agents/catalogAgent";
import { ApiClient } from "../../src/api/client";
import { getSettings } from "../../src/config";

test.describe("API baseline @api", () => {
  const settings = getSettings(process.env.TEST_ENV);
  const apiAgent = new CatalogApiAgent(new ApiClient(settings.apiBaseUrl, settings.timeoutMs));

  // Purpose: verifies the backend global settings endpoint is reachable before deeper API checks.
  // Risk covered: API outage, invalid base URL, or unexpected health response shape.
  test("API - should return success from global setting healthcheck", async ({}, testInfo) => {
    const status = await apiAgent.healthcheck();
    await testInfo.attach("global_setting_status", {
      body: status,
      contentType: "text/plain"
    });
    expect(status).toBe("success");
  });

  // Purpose: confirms catalog category data is present for UI comparison tests.
  // Risk covered: empty category response or changed categories contract.
  test("API - should return top-level categories", async ({}, testInfo) => {
    const categories = await apiAgent.getTopLevelCategories();
    await testInfo.attach("top_level_categories", {
      body: categories.map((item) => item.slug).join("\n"),
      contentType: "text/plain"
    });
    expect(categories.length).toBeGreaterThan(0);
  });
});
