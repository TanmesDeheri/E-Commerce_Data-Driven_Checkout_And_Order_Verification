import { expect } from '@playwright/test';
import { parsePrice, isApproximatelyEqual } from '../utils/priceCalculator.js';

export default class CartPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;

    this.cartItems = page.locator('.cart_item');
    this.itemNames = page.locator('.inventory_item_name');
    this.itemPrices = page.locator('.inventory_item_price');
    this.quantities = page.locator('.cart_quantity');
    this.checkoutButton = page.locator('#checkout');
    this.continueShoppingButton = page.locator('#continue-shopping');
  }

  async waitUntilLoaded() {
    const url = this.page.url();
    if (!url.includes('cart.html')) {
      await this.page.goto('/cart.html');
    }
    await expect(this.cartItems.first()).toBeVisible();
  }

  async getCartItemCount() {
    return await this.cartItems.count();
  }

  async getCartItemDetails() {
    const items = [];
    const count = await this.cartItems.count();
    for (let i = 0; i < count; i++) {
      const item = this.cartItems.nth(i);
      const name = await item.locator('.inventory_item_name').textContent();
      const priceText = await item.locator('.inventory_item_price').textContent();
      const price = parsePrice(priceText);
      const quantity = await item.locator('.cart_quantity').textContent();
      items.push({ name, price, quantity });
    }
    return items;
  }

  async getCalculatedSubtotal() {
    const items = await this.getCartItemDetails();
    return items.reduce((sum, item) => sum + item.price * parseInt(item.quantity || '1', 10), 0);
  }

  async proceedToCheckout() {
    await this.checkoutButton.click();
  }

  async continueShopping() {
    await this.continueShoppingButton.click();
  }
}
