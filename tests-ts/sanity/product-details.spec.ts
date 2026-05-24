import { test } from "../fixtures/singerTest";

import { defineProductDetailsSanity } from "./cases";

// Standalone entry point for only product detail sanity checks.
test.describe("Product details sanity", () => {
  test.describe.configure({ mode: "serial" });

  defineProductDetailsSanity();
});
