import { test, expect } from '../fixtures/base.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const testData = JSON.parse(readFileSync(join(__dirname, '..', 'data', 'testData.json'), 'utf-8'));

test.describe('Checkout scenarios', () => {
  test.beforeEach(async ({ page, loginPage, inventoryPage }) => {
    await loginPage.waitUntilLoaded();
    await loginPage.login('standard_user', 'secret_sauce');
    await inventoryPage.waitUntilLoaded();
  });

  for (const item of testData.checkout.items) {
    test(`should add ${item.name} and complete checkout`, async ({ page, inventoryPage, cartPage, checkoutPage }) => {
      await inventoryPage.addItemToCart(item.name);
      await inventoryPage.goToCart();
      await cartPage.waitUntilLoaded();
      await cartPage.proceedToCheckout();

      await checkoutPage.waitUntilLoaded();
      await checkoutPage.fillShippingInfo(
        testData.checkout.firstName,
        testData.checkout.lastName,
        testData.checkout.postalCode
      );
      await checkoutPage.continueToOverview();

      const uiTotal = await checkoutPage.getTotal();
      const calculatedTotal = await checkoutPage.getCalculatedTotal();
      expect(calculatedTotal).toBeCloseTo(uiTotal, 2);

      await checkoutPage.finishOrder();
      const confirmation = await checkoutPage.getConfirmationMessage();
      expect(confirmation).toContain('Thank you');
    });
  }

  test('should verify calculated total matches UI total for multiple items', async ({ page, inventoryPage, cartPage, checkoutPage }) => {
    for (const item of testData.checkout.items) {
      await inventoryPage.addItemToCart(item.name);
    }
    await inventoryPage.goToCart();
    await cartPage.waitUntilLoaded();
    await cartPage.proceedToCheckout();

    await checkoutPage.waitUntilLoaded();
    await checkoutPage.fillShippingInfo(
      testData.checkout.firstName,
      testData.checkout.lastName,
      testData.checkout.postalCode
    );
    await checkoutPage.continueToOverview();

    const uiSubtotal = await checkoutPage.getSubtotal();
    const uiTax = await checkoutPage.getTax();
    const uiTotal = await checkoutPage.getTotal();
    const calculatedTotal = uiSubtotal + uiTax;

    expect(calculatedTotal).toBeCloseTo(uiTotal, 2);
  });
});
