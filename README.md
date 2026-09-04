# SauceDemo Playwright Test Suite

A production-grade, data-driven end-to-end test automation suite for the [SauceDemo](https://www.saucedemo.com) e-commerce application. Built with Playwright Test and JavaScript (ES2022+), this project demonstrates enterprise patterns including the Page Object Model (POM), data-driven testing (DDT), custom fixtures, dynamic price validation, and CI integration.

## Target Users

- QA engineers and SDETs looking for a reference Playwright implementation
- Developers who need to validate checkout flows against a stable demo site
- Teams seeking a template for data-driven browser automation with artifact capture

## Key Value

- **Reliability**: Strict page-object isolation, wait strategies, and floating-point-safe price assertions reduce flakiness.
- **Maintainability**: Tests are driven by external JSON data (`data/testData.json`); adding scenarios requires no test-code changes.
- **Observability**: Automatic trace, screenshot, and video capture on failure; HTML and list reporters for local and CI use.
- **Quality Gates**: ESLint with Playwright rules, TypeScript JSDoc type checking via `checkJs: true`, and Prettier formatting.

---

## Prerequisites

Before setting up this project, ensure the following are installed:

| Software | Minimum Version | Purpose |
|----------|----------------|---------|
| **Node.js** | LTS (v18.x or v20.x recommended) | Runtime for Playwright Test |
| **npm** | v9+ | Package manager |
| **Git** | v2.30+ | Version control |
| **Playwright Browsers** | Chromium (installed via `npx playwright install`) | Browser automation runtime |

> **Note**: This project targets **Chromium** only. If you need to run against Firefox or WebKit, update `playwright.config.js` accordingly.

---

## Installation

Clone the repository and install dependencies:

```bash
# Clone the repository
git clone https://github.com/<your-org>/saucedemo-playwright-suite.git
cd saucedemo-playwright-suite

# Install project dependencies
npm ci

# Install Playwright browser binaries and OS dependencies
npx playwright install --with-deps chromium
```

### OS-Specific Notes

- **Windows**: Run the commands above in PowerShell or Command Prompt. The `--with-deps` flag installs required system libraries automatically.
- **macOS**: You may need to run `npx playwright install --with-deps chromium` with administrator privileges the first time.
- **Linux (Ubuntu/Debian)**: The `--with-deps` flag installs missing system packages via `apt`. Ensure you have `sudo` access if prompted.

---

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `CI` | No | `undefined` | When set to `true`, Playwright retries failed tests twice and disables parallel workers for CI stability. |
| `DEBUG` | No | `undefined` | When set, enables verbose `[saucedemo]` diagnostic logs from `utils/logger.js`. |

No API keys or external service credentials are required.

### Config Files

- **`playwright.config.js`**: Defines the test directory, base URL (`https://www.saucedemo.com`), timeouts, artifact capture policy, reporters, and target project (Chromium).
- **`jsconfig.json`**: Enables JSDoc-based type checking for plain JavaScript files with `checkJs: true`.
- **`eslint.config.js`**: ESLint flat config using `eslint:recommended` rules plus `eslint-plugin-playwright`.
- **`.prettierrc`**: Code formatting rules (2-space indentation, semicolons, trailing commas in ES5).
- **`data/testData.json`**: Single source of truth for test scenarios, credentials, and checkout inputs.

---

## Usage

### Run the Full Test Suite

```bash
npm test
```

### Run Tests in Headed Mode (Visible Browser)

```bash
npm run test:headed
```

### Run a Specific Test File

```bash
npx playwright test tests/login.spec.js
```

### Run a Specific Test by Name

```bash
npx playwright test --grep "should succeed for scenario: standard checkout"
```

### Run Tests for a Specific Project

```bash
npx playwright test --project=chromium
```

### Lint the Codebase

```bash
npm run lint
```

### Type Check (JSDoc Validation)

```bash
npm run typecheck
```

### Format Code with Prettier

```bash
npm run format
```

### View the HTML Test Report

```bash
npm run report
```

### Expected Output

A successful run produces console output similar to:

```
Running 16 tests using 1 worker

  ✓ [chromium] › tests/login.spec.js:12 › Login scenarios › should succeed for scenario: standard checkout (3.2s)
  ✓ [chromium] › tests/login.spec.js:12 › Login scenarios › should fail for scenario: locked out user (1.8s)
  ...
  16 passed (45.3s)
```

On failure, Playwright automatically captures:
- Screenshots (`test-results/`)
- Videos (`test-results/`)
- Trace files (`test-results/`)
- An HTML report (`playwright-report/`)

---

## Core Features

- **Page Object Model (POM)**: Four dedicated page classes (`LoginPage`, `InventoryPage`, `CartPage`, `CheckoutPage`) encapsulate locators, actions, and queries. No raw selectors leak into test files.
- **Custom Fixtures**: `fixtures/base.js` injects page objects into every test via Playwright's fixture system, eliminating boilerplate instantiation.
- **Data-Driven Testing**: All scenarios are parameterized in `data/testData.json`. Tests iterate over users and items dynamically, producing descriptive, per-scenario titles.
- **Dynamic Price Validation**:
  - `utils/priceCalculator.js` strips currency symbols and computes tax (8%) and totals.
  - Assertions use `toBeCloseTo` with 2-decimal precision to avoid floating-point rounding failures.
- **Artifact Capture on Failure**:
  - `trace: 'retain-on-failure'`
  - `screenshot: 'only-on-failure'`
  - `video: 'retain-on-failure'`
- **CI Ready**: GitHub Actions workflow installs dependencies, runs lint, type checking, and Playwright tests, then uploads reports and failure artifacts.
- **Quality Enforcement**: ESLint with Playwright plugin rules, TypeScript JSDoc checking, and Prettier formatting are enforced pre-commit.

### Covered Scenarios

| Feature | Details |
|---------|---------|
| Login | Standard login, locked-out user, problem user, invalid credentials, empty username |
| Inventory | Add to cart, remove from cart, cart badge count, sort by name (A-Z, Z-A), sort by price (low-high, high-low) |
| Cart | Verify cart item details, verify calculated subtotal against line items, remove items |
| Checkout | Fill shipping info, proceed to overview, verify subtotal/tax/total calculations, complete order, verify confirmation |
