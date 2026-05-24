import { test } from "../fixtures/singerTest";

import { defineSupportSanity } from "./cases";

// Standalone entry point for only support/service sanity checks.
test.describe("Support sanity", () => {
  test.describe.configure({ mode: "serial" });

  defineSupportSanity();
});
