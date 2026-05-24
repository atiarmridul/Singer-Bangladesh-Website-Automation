import { test } from "../fixtures/singerTest";

import { defineSearchSanity } from "./cases";

// Standalone entry point for only search sanity checks.
test.describe("Search sanity", () => {
  defineSearchSanity();
});
