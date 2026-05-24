import { test } from "../fixtures/singerTest";

import { defineCategorySanity } from "./cases";

// Standalone entry point for only category sanity checks.
test.describe("Category sanity", () => {
  defineCategorySanity();
});
