import { test } from "../fixtures/singerTest";

import {
  defineAuthenticationSanity,
  defineCampaignSanity,
  defineCartSanity,
  defineCategorySanity,
  defineFooterSanity,
  defineHomepageSanity,
  defineProductDetailsSanity,
  defineProductListingSanity,
  defineSearchSanity,
  defineSupportSanity
} from "./cases";

// Central entry point for full sanity execution and tag-based runs.
test.describe("Singer BD sanity", () => {
  defineHomepageSanity();
  defineCategorySanity();
  defineSearchSanity();
  defineProductListingSanity();
  defineProductDetailsSanity();
  defineCartSanity();
  defineAuthenticationSanity();
  defineCampaignSanity();
  defineFooterSanity();
  defineSupportSanity();
});
