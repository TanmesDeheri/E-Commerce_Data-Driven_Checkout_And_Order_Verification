import { expect } from '@playwright/test';

export default class LoginPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;

    this.usernameInput = page.locator('#user-name');
    this.passwordInput = page.locator('#password');
    this.loginButton = page.locator('#login-button');
    this.errorMessage = page.locator('[data-test="error"]');
    this.appLogo = page.locator('.login_logo');
  }

  async waitUntilLoaded() {
    const url = this.page.url();
    if (!url.includes('saucedemo.com')) {
      await this.page.goto('/');
    }
    await expect(this.appLogo).toBeVisible();
  }

  /**
   * @param {string} username
   * @param {string} password
   */
  async login(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async getErrorMessage() {
    return await this.errorMessage.textContent();
  }

  async isLoggedIn() {
    const currentUrl = this.page.url();
    return currentUrl.includes('/inventory.html');
  }
}
