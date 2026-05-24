import { test } from "../../fixtures/singerTest";

import { FooterPage } from "../../../src/pages/footerPage";

export function defineFooterSanity(): void {
  // Purpose: validates a legal/footer navigation link that users commonly need after page load.
  // Risk covered: footer not rendering, link target drift, or modal overlay blocking footer clicks.
  test("@sanity @footer SANITY_010 Footer - should navigate to terms and conditions", async ({ page }) => {
    const footerPage = new FooterPage(page);

    await footerPage.openHome();
    await footerPage.openTermsConditions();

    await footerPage.expectUrlContains("terms-conditions");
  });

  // Purpose: confirms the legal footer link is present before exercising navigation.
  // Risk covered: missing footer link, changed href, or footer content failing to render.
  test("@sanity @footer SANITY_018 Footer - should show terms and conditions link", async ({ page }) => {
    const footerPage = new FooterPage(page);

    await footerPage.openHome();

    await footerPage.expectVisible(footerPage.termsConditionsLink);
  });
}
