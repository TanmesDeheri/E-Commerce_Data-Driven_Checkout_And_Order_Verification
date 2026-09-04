import { expect } from '@playwright/test';
import { parsePrice, calculateTax, calculateTotal } from '../utils/priceCalculator.js';

export default class CheckoutPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;

    this.firstNameInput = page.locator('#first-name');
    this.lastNameInput = page.locator('#last-name');
    this.postalCodeInput = page.locator('#postal-code');
    this.continueButton = page.locator('#continue');
    this.finishButton = page.locator('#finish');
    this.errorMessage = page.locator('[data-test="error"]');
    this.subtotalLabel = page.locator('.summary_subtotal_label');
    this.taxLabel = page.locator('.summary_tax_label');
    this.totalLabel = page.locator('.summary_total_label');
    this.confirmationHeader = page.locator('.complete-header');
    this.cartItem = page.locator('.cart_item');
  }

  async waitUntilLoaded() {
    const url = this.page.url();
    if (!url.includes('checkout-step-one.html') && !url.includes('checkout-step-two.html') && !url.includes('checkout-complete.html')) {
      await this.page.goto('/checkout-step-one.html');
    }
    if (url.includes('checkout-step-one.html')) {
      await expect(this.firstNameInput).toBeVisible();
    } else if (url.includes('checkout-step-two.html')) {
      await expect(this.subtotalLabel).toBeVisible();
    } else if (url.includes('checkout-complete.html')) {
      await expect(this.confirmationHeader).toBeVisible();
    }
  }

  /**
   * @param {string} firstName
   * @param {string} lastName
   * @param {string} postalCode
   */
  async fillShippingInfo(firstName, lastName, postalCode) {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.postalCodeInput.fill(postalCode);
  }

  async continueToOverview() {
    await this.continueButton.click();
  }

  async getSubtotal() {
    const text = await this.subtotalLabel.textContent();
    const match = text.match(/(\d+\.\d+)/);
    return match ? parseFloat(match[1]) : 0;
  }

  async getTax() {
    const text = await this.taxLabel.textContent();
    const match = text.match(/(\d+\.\d+)/);
    return match ? parseFloat(match[1]) : 0;
  }

  async getTotal() {
    const text = await this.totalLabel.textContent();
    const match = text.match(/(\d+\.\d+)/);
    return match ? parseFloat(match[1]) : 0;
  }

  async finishOrder() {
    await this.finishButton.click();
  }

  async getConfirmationMessage() {
    return await this.confirmationHeader.textContent();
  }

  async getCalculatedTotal() {
    const subtotal = await this.getSubtotal();
    return calculateTotal(subtotal);
  }
}
