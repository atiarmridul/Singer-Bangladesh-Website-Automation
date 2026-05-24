import { test } from "../fixtures/singerTest";

import { defineCartSanity } from "./cases";

// Standalone entry point for only cart sanity checks.
test.describe("Cart sanity", () => {
  defineCartSanity();
});
