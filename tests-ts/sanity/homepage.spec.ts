import { test } from "../fixtures/singerTest";

import { defineHomepageSanity } from "./cases";

// Standalone entry point for only homepage sanity checks.
test.describe("Homepage sanity", () => {
  defineHomepageSanity();
});
