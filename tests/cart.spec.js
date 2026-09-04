import { test, expect } from '../fixtures/base.js';

test.describe('Cart scenarios', () => {
  test.beforeEach(async ({ page, loginPage, inventoryPage }) => {
    await loginPage.waitUntilLoaded();
    await loginPage.login('standard_user', 'secret_sauce');
    await inventoryPage.waitUntilLoaded();
  });

  test('should verify cart contents match added items', async ({ page, inventoryPage, cartPage }) => {
    await inventoryPage.addItemToCart('Sauce Labs Backpack');
    await inventoryPage.addItemToCart('Sauce Labs Bike Light');
    await inventoryPage.goToCart();
    await cartPage.waitUntilLoaded();

    const items = await cartPage.getCartItemDetails();
    const names = items.map(item => item.name);
    expect(names).toContain('Sauce Labs Backpack');
    expect(names).toContain('Sauce Labs Bike Light');
  });

  test('should verify calculated subtotal matches cart subtotal', async ({ page, inventoryPage, cartPage }) => {
    await inventoryPage.addItemToCart('Sauce Labs Backpack');
    await inventoryPage.addItemToCart('Sauce Labs Bike Light');
    await inventoryPage.goToCart();
    await cartPage.waitUntilLoaded();

    const calculatedSubtotal = await cartPage.getCalculatedSubtotal();
    const items = await cartPage.getCartItemDetails();
    const uiSubtotal = items.reduce((sum, item) => sum + item.price, 0);

    expect(calculatedSubtotal).toBeCloseTo(uiSubtotal, 2);
  });

  test('should remove item from cart and verify count decreases', async ({ page, inventoryPage, cartPage }) => {
    await inventoryPage.addItemToCart('Sauce Labs Backpack');
    await inventoryPage.addItemToCart('Sauce Labs Bike Light');
    await inventoryPage.goToCart();
    await cartPage.waitUntilLoaded();

    let count = await cartPage.getCartItemCount();
    expect(count).toBe(2);

    await cartPage.cartItems.nth(0).locator('button[id^="remove-"]').click();
    count = await cartPage.getCartItemCount();
    expect(count).toBe(1);
  });
});
