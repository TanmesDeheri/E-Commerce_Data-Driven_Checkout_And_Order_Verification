import { test, expect } from '../fixtures/base.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const testData = JSON.parse(readFileSync(join(__dirname, '..', 'data', 'testData.json'), 'utf-8'));

test.describe('Login scenarios', () => {
  for (const scenario of testData.users) {
    test(`should ${scenario.expectSuccess ? 'succeed' : 'fail'} for scenario: ${scenario.scenario}`, async ({ page, loginPage }) => {
      await loginPage.waitUntilLoaded();
      await loginPage.login(scenario.username, scenario.password);

      if (scenario.expectSuccess) {
        await expect(page).toHaveURL('/inventory.html');
      } else {
        const error = await loginPage.getErrorMessage();
        expect(error).toContain(scenario.expectedErrorMessage);
      }
    });
  }
});
