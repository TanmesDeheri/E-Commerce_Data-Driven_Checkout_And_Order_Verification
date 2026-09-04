import { test, expect } from '../fixtures/base.js';

test.describe('Inventory scenarios', () => {
  test.beforeEach(async ({ page, loginPage }) => {
    await loginPage.waitUntilLoaded();
    await loginPage.login('standard_user', 'secret_sauce');
  });

  test('should add item to cart and verify badge count', async ({ page, inventoryPage }) => {
    await inventoryPage.waitUntilLoaded();
    const initialCount = await inventoryPage.getCartBadgeCount();
    await inventoryPage.addItemToCart('Sauce Labs Backpack');
    const newCount = await inventoryPage.getCartBadgeCount();
    expect(newCount).toBe(initialCount + 1);
  });

  test('should remove item from cart and update badge', async ({ page, inventoryPage }) => {
    await inventoryPage.waitUntilLoaded();
    await inventoryPage.addItemToCart('Sauce Labs Backpack');
    await inventoryPage.addItemToCart('Sauce Labs Bike Light');
    let count = await inventoryPage.getCartBadgeCount();
    expect(count).toBe(2);

    await inventoryPage.removeItemFromCart('Sauce Labs Backpack');
    count = await inventoryPage.getCartBadgeCount();
    expect(count).toBe(1);
  });

  test('should sort items by price low to high', async ({ page, inventoryPage }) => {
    await inventoryPage.waitUntilLoaded();
    await inventoryPage.sortBy('lohi');
    const prices = await inventoryPage.getDisplayedItemPrices();
    const sorted = [...prices].sort((a, b) => a - b);
    expect(prices).toEqual(sorted);
  });

  test('should sort items by price high to low', async ({ page, inventoryPage }) => {
    await inventoryPage.waitUntilLoaded();
    await inventoryPage.sortBy('hilo');
    const prices = await inventoryPage.getDisplayedItemPrices();
    const sorted = [...prices].sort((a, b) => b - a);
    expect(prices).toEqual(sorted);
  });

  test('should display all inventory item names', async ({ page, inventoryPage }) => {
    await inventoryPage.waitUntilLoaded();
    const names = await inventoryPage.getDisplayedItemNames();
    expect(names.length).toBeGreaterThan(0);
    expect(names).toContain('Sauce Labs Backpack');
  });
});
