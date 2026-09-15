# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: login.spec.js >> Login scenarios >> should fail for scenario: empty username
- Location: tests\login.spec.js:12:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('.login_logo')
Expected: visible
Error: SyntaxError: Unexpected token 'this'

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('.login_logo')

```

# Test source

```ts
  1  | import { expect } from '@playwright/test';
  2  | 
  3  | export default class LoginPage {
  4  |   /** @param {import('@playwright/test').Page} page */
  5  |   constructor(page) {
  6  |     this.page = page;
  7  | 
  8  |     this.usernameInput = page.locator('#user-name');
  9  |     this.passwordInput = page.locator('#password');
  10 |     this.loginButton = page.locator('#login-button');
  11 |     this.errorMessage = page.locator('[data-test="error"]');
  12 |     this.appLogo = page.locator('.login_logo');
  13 |   }
  14 | 
  15 |   async waitUntilLoaded() {
  16 |     const url = this.page.url();
  17 |     if (!url.includes('saucedemo.com')) {
  18 |       await this.page.goto('/');
  19 |     }
> 20 |     await expect(this.appLogo).toBeVisible();
     |                                ^ Error: expect(locator).toBeVisible() failed
  21 |   }
  22 | 
  23 |   /**
  24 |    * @param {string} username
  25 |    * @param {string} password
  26 |    */
  27 |   async login(username, password) {
  28 |     await this.usernameInput.fill(username);
  29 |     await this.passwordInput.fill(password);
  30 |     await this.loginButton.click();
  31 |   }
  32 | 
  33 |   async getErrorMessage() {
  34 |     return await this.errorMessage.textContent();
  35 |   }
  36 | 
  37 |   async isLoggedIn() {
  38 |     const currentUrl = this.page.url();
  39 |     return currentUrl.includes('/inventory.html');
  40 |   }
  41 | }
  42 | 
```