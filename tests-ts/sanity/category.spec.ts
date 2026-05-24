import { test } from "../fixtures/singerTest";

import { defineCategorySanity } from "./cases";

// Standalone entry point for only category sanity checks.
test.describe("Category sanity", () => {
  test.describe.configure({ mode: "serial" });

  defineCategorySanity();
});
