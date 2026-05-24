import { test } from "../fixtures/singerTest";

import { defineAuthenticationSanity } from "./cases";

// Standalone entry point for only authentication sanity checks.
test.describe("Authentication sanity", () => {
  test.describe.configure({ mode: "serial" });

  defineAuthenticationSanity();
});
