import { test } from "../../fixtures/singerTest";

import { CampaignPage } from "../../../src/pages/campaignPage";

// Groups the campaign page sanity checks.
export function defineCampaignSanity(): void {
  // Purpose: checks that the promotional campaign route loads visible campaign content.
  // Risk covered: campaign route outage, blank campaign page, or missing EMI promotion block.
  test("@sanity @campaign SANITY_009 Campaign - should open campaign page with EMI content", async ({ page }) => {
    const campaignPage = new CampaignPage(page);

    await campaignPage.open();

    await campaignPage.expectUrlContains("campaign");
    await campaignPage.expectTextContains(campaignPage.body, "EMI");
  });

  // Purpose: verifies the campaign route renders a visible page body independent of specific promo copy.
  // Risk covered: blank campaign route, failed page shell, or blocked content render.
  test("@sanity @campaign SANITY_017 Campaign - should render campaign page body", async ({ page }) => {
    const campaignPage = new CampaignPage(page);

    await campaignPage.open();

    await campaignPage.expectUrlContains("campaign");
    await campaignPage.expectVisible(campaignPage.body);
  });
}
