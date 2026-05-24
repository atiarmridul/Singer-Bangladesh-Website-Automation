import { test } from "../fixtures/singerTest";

import { defineFooterSanity } from "./cases";

// Standalone entry point for only footer sanity checks.
test.describe("Footer sanity", () => {
  defineFooterSanity();
});
