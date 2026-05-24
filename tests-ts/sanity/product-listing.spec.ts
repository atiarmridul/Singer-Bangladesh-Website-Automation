import { test } from "../fixtures/singerTest";

import { defineProductListingSanity } from "./cases";

// Standalone entry point for only product listing sanity checks.
test.describe("Product listing sanity", () => {
  test.describe.configure({ mode: "serial" });

  defineProductListingSanity();
});
