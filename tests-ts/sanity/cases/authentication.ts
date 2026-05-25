import { test } from "../../fixtures/singerTest";

import { LoginPage } from "../../../src/pages/loginPage";

// Groups the login and account-entry sanity checks.
export function defineAuthenticationSanity(): void {
  // Purpose: confirms the unauthenticated login entry point is reachable from the homepage.
  // Risk covered: missing login button, blocked click, or login panel copy not rendering.
  test("@sanity @auth SANITY_008 Auth - should open login modal from homepage", async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.open();

    await loginPage.expectVisible(loginPage.loginModal);
    await loginPage.expectTextContains(loginPage.loginModal, "Welcome to Singer");
  });

  // Purpose: verifies the login entry point is visible before opening the modal.
  // Risk covered: missing unauthenticated account action or header auth selector drift.
  test("@sanity @auth SANITY_016 Auth - should show login entry point on homepage", async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.openHome();

    await loginPage.expectVisible(loginPage.loginButton);
  });
}
