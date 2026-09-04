import { expect } from '@playwright/test';
import { parsePrice } from '../utils/priceCalculator.js';

export default class InventoryPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;

    this.sortSelect = page.locator('.product_sort_container');
    this.inventoryItems = page.locator('.inventory_item');
    this.itemNames = page.locator('.inventory_item_name');
    this.itemPrices = page.locator('.inventory_item_price');
    this.addToCartButtons = page.locator('button[id^="add-to-"]');
    this.removeFromCartButtons = page.locator('button[id^="remove-"]');
    this.cartBadge = page.locator('.shopping_cart_badge');
    this.cartLink = page.locator('.shopping_cart_link');
    this.menuButton = page.locator('#react-burger-menu-btn');
    this.logoutLink = page.locator('#logout_sidebar_link');
    this.inventoryList = page.locator('.inventory_list');
  }

  async waitUntilLoaded() {
    const url = this.page.url();
    if (!url.includes('inventory.html')) {
      await this.page.goto('/inventory.html');
    }
    await expect(this.inventoryList).toBeVisible();
  }

  /**
   * @param {string} name
   */
  async addItemToCart(name) {
    const item = this.inventoryItems.filter({ hasText: name });
    const addButton = item.locator('button[id^="add-to-"]');
    await addButton.click();
  }

  /**
   * @param {string} name
   */
  async removeItemFromCart(name) {
    const item = this.inventoryItems.filter({ hasText: name });
    const removeButton = item.locator('button[id^="remove-"]');
    await removeButton.click();
  }

  async getCartBadgeCount() {
    const text = await this.cartBadge.textContent();
    return text ? parseInt(text, 10) : 0;
  }

  /**
   * @param {string} option
   */
  async sortBy(option) {
    await this.sortSelect.selectOption(option);
  }

  async getDisplayedItemNames() {
    const count = await this.itemNames.count();
    const names = [];
    for (let i = 0; i < count; i++) {
      names.push(await this.itemNames.nth(i).textContent());
    }
    return names;
  }

  async getDisplayedItemPrices() {
    const count = await this.itemPrices.count();
    const prices = [];
    for (let i = 0; i < count; i++) {
      const text = await this.itemPrices.nth(i).textContent();
      prices.push(parsePrice(text));
    }
    return prices;
  }

  async goToCart() {
    await this.cartLink.click();
  }

  async logout() {
    await this.menuButton.click();
    await this.logoutLink.click();
  }
}
