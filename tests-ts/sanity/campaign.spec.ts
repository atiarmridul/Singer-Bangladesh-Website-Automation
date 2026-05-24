import { test } from "../fixtures/singerTest";

import { defineCampaignSanity } from "./cases";

// Standalone entry point for only campaign sanity checks.
test.describe("Campaign sanity", () => {
  test.describe.configure({ mode: "serial" });

  defineCampaignSanity();
});
