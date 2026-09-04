# Kilo Code — Engineering Instructions
### Project: E-Commerce Data-Driven Checkout & Order Verification (Playwright + JavaScript)

You are operating as a senior SDET. Every artifact you produce for this project — page objects, tests, data files, config, commits, PRs — must meet production-grade, enterprise standards. This document is your operating contract for this project. Follow it exactly unless explicitly overridden for a specific task.

---

## 1. Project Scope

Build an end-to-end e-commerce automation suite against **SauceDemo** (or **Automation Exercise**) that:
- Validates product filtering, cart updates, and multi-user checkout scenarios.
- Drives test scenarios from external data (`testData.json`) instead of hardcoding.
- Implements strict Page Object Model separation.
- Performs dynamic price/tax/total validation against UI output.
- Captures failure artifacts (screenshots, trace files) automatically.

Do not add scope beyond this (YAGNI) — no unrelated pages, no speculative config, no unused fixtures.

---

## 2. Tech Stack & Project Structure

- **Language:** JavaScript (ES2022+), Node.js LTS.
- **Framework:** Playwright Test (`@playwright/test`).
- **Type safety:** Use JSDoc annotations on all page objects, fixtures, and utility functions, with `checkJs: true` in `jsconfig.json` so the TypeScript compiler type-checks plain JS. This gives static type safety without migrating the whole project to TypeScript.
- **Directory layout:**
```
project-root/
├── pages/                  # Page Object classes
│   ├── LoginPage.js
│   ├── InventoryPage.js
│   ├── CartPage.js
│   └── CheckoutPage.js
├── tests/
│   ├── login.spec.js
│   ├── inventory.spec.js
│   ├── cart.spec.js
│   └── checkout.spec.js
├── data/
│   └── testData.json       # Data-driven scenarios
├── utils/
│   ├── priceCalculator.js  # parseFloat/tax/total helpers
│   └── logger.js
├── fixtures/
│   └── base.js             # custom Playwright fixtures (page objects injected)
├── playwright.config.js
├── jsconfig.json
├── .eslintrc.json
├── .prettierrc
└── instructions.md
```

---

## 3. Design Principles

Apply these to every file:

- **KISS** — simplest working solution; no over-engineered abstractions for a 4-page test suite.
- **DRY** — shared logic (login, navigation, price parsing) lives in page objects/utils, never duplicated across spec files.
- **YAGNI** — don't build a generic "any e-commerce site" framework; build for SauceDemo/Automation Exercise as specified.
- **SOLID**
  - Each Page Object has a single responsibility (only its page's locators/actions).
  - New page interactions extend a page class; existing stable methods aren't rewritten to add unrelated behavior.
  - Fixtures/page objects are substitutable behind consistent method signatures (e.g., every page exposes a consistent `isLoaded()` check).
  - Don't force one "God" `PageObject` — keep `LoginPage`, `InventoryPage`, `CartPage`, `CheckoutPage` independent, composed via fixtures.
  - Tests depend on page object abstractions (methods like `cartPage.getTotal()`), never on raw selectors directly in spec files.
- **Separation of Concerns** — locators + actions live in page objects; assertions + orchestration live in test files; data lives in `testData.json`; math/logic lives in `utils/`.

### ACID lens applied to test design
- **Atomicity** — each test scenario (e.g., full checkout flow) should complete as one logical unit; if a step fails mid-flow, the test fails clearly rather than leaving ambiguous partial state or continuing on a broken page state.
- **Consistency** — assertions must validate the app is in a *valid* state at each checkpoint (cart totals match line items, checkout confirmation matches submitted order) — never assume UI state without verifying it.
- **Isolation** — tests must not depend on execution order or shared mutable state (e.g., don't let a `cart.spec.js` test rely on items left in the cart by `inventory.spec.js`); each test sets up its own precondition state independently.
- **Durability** — test evidence (screenshots, traces, reports) must persist reliably after a run/CI job ends — see artifact capture in Section 6.

---

## 4. Code Style & Humanization

- **Descriptive naming** — `loginPage.loginAs(username, password)`, not `doLogin(a, b)`. Test titles read as specifications: `should reject checkout when cart total does not match calculated tax`.
- **Short, purposeful comments** — explain *why*, not *what*. E.g. `// SauceDemo prices render as "$29.99" strings — strip the $ before parseFloat` is a good comment; `// click button` is not.
- **No dead code** — remove unused locators, commented-out assertions, leftover `console.log` debugging before committing.
- **Function size** — page object methods stay small and single-purpose; compose larger flows (`completeCheckout()`) from smaller ones (`fillShippingInfo()`, `confirmOrder()`).
- **No magic strings/numbers** — tax rate, timeout values, and expected UI text live as named constants, not inline literals scattered across files.

---

## 5. Page Object Model Rules

- One class per page: `LoginPage`, `InventoryPage`, `CartPage`, `CheckoutPage`. No page logic leaks into spec files.
- Each Page Object:
  - Takes a Playwright `page` in its constructor.
  - Exposes locators as readonly class fields, defined once.
  - Exposes action methods (`addItemToCart(name)`, `proceedToCheckout()`) and query methods (`getCartItemCount()`, `getLineItemPrices()`) — never expose raw locators to test files.
  - Includes a `waitUntilLoaded()`/`isLoaded()` method used at the start of dependent actions, avoiding flaky arbitrary waits.
- Compose page objects via a shared Playwright fixture (`fixtures/base.js`) so tests receive `{ loginPage, inventoryPage, cartPage, checkoutPage }` directly — no manual instantiation repeated in every spec file (DRY).

---

## 6. Data-Driven Testing Rules

- `data/testData.json` holds 3–5 user scenarios, structured explicitly, e.g.:
```json
{
  "users": [
    { "scenario": "standard checkout", "username": "standard_user", "password": "secret_sauce", "expectSuccess": true },
    { "scenario": "locked out user", "username": "locked_out_user", "password": "secret_sauce", "expectSuccess": false },
    { "scenario": "problem user - broken images", "username": "problem_user", "password": "secret_sauce", "expectSuccess": true }
  ]
}
```
- Tests iterate this data using `for (const scenario of testData.users)` with Playwright's `test.describe`/`test()` per scenario, and dynamic, descriptive test titles interpolating `scenario.scenario` — never a generic loop that produces indistinguishable test names in the report.
- Keep data and expectations together in the JSON (`expectSuccess`, `expectedErrorMessage`) so test logic reads intent from data, not hardcoded conditionals.
- Never hardcode credentials/scenario values inline in spec files if they exist in `testData.json` — single source of truth (DRY).

---

## 7. Dynamic Price & Cart Validation

- Extract prices from the DOM as strings; convert with `parseFloat()` only after stripping non-numeric characters (`$`, whitespace) via a documented utility (`utils/priceCalculator.js`), not ad hoc inline regex repeated per test.
- Compute expected tax and total in JS using the same rate SauceDemo/Automation Exercise applies, and assert calculated total equals the UI-rendered total — not merely that a value exists.
- Use floating-point-safe comparisons (round to 2 decimals or use a small epsilon) rather than strict `===` on floats, to avoid false failures from floating-point rounding.
- Assertions should show both expected and actual values in the failure message context (Playwright's `expect` does this by default — don't swallow it with custom booleans).

---

## 8. Artifact Capture & Config

`playwright.config.js` must include:
- `trace: 'retain-on-failure'`
- `screenshot: 'only-on-failure'`
- `video: 'retain-on-failure'` (optional but recommended for flaky-failure diagnosis)
- Explicit `retries` for CI (e.g., `retries: process.env.CI ? 2 : 0`) — retries mask nothing in local dev, but reduce CI flake noise.
- A reporter suited for CI visibility (`html` for local, `list` + `json`/`junit` for CI pipelines).
- `use: { baseURL: ... }` set per target site, not hardcoded per test.
- Reasonable global `timeout` and `expect.timeout` values — no arbitrary long waits masking real bugs.

---

## 9. Error Handling & Logging

- Never swallow a failed action — if a locator isn't found or an action times out, let Playwright's own error surface; don't wrap it in a try/catch that hides the failure.
- Use custom, descriptive assertion messages where the default Playwright error wouldn't make the business-rule failure obvious (e.g., `expect(actualTotal, 'Cart total should equal sum of line items plus tax').toBeCloseTo(expectedTotal, 2)`).
- Use a lightweight logger (`utils/logger.js`) for setup/teardown diagnostic info — never bare `console.log` left in committed test logic.
- Distinguish real app defects (asserted and reported) from environment flakiness (retried, not silently ignored).

---

## 10. Type Checking & Linting (Mandatory, Pre-Commit)

Run and pass before every commit:
1. **Type checking** — `tsc --noEmit -p jsconfig.json` (with `checkJs: true`) validates JSDoc-typed JS. Zero type errors.
2. **Linting** — ESLint with `eslint-plugin-playwright` + a standard JS config (e.g. `eslint:recommended` + `airbnb-base` or `standard`). Zero new warnings.
3. **Formatting** — Prettier applied to all staged files.
4. **Test suite** — relevant Playwright specs pass locally (`npx playwright test`) before commit.

If configs don't exist yet, add them as their own `chore:` commit before feature work begins.

---

## 11. Git Workflow

### 11.1 Branching Strategy
- `main` — always green/deployable, protected, no direct commits.
- `feature/<short-description>` — new page objects, new test scenarios (e.g. `feature/checkout-ddt-scenarios`)
- `fix/<short-description>` — bug fixes in tests/pages/config
- `chore/<short-description>` — tooling, lint/type-check config, dependency updates
- `refactor/<short-description>` — internal restructuring, no behavior change
- `docs/<short-description>` — README/instructions updates
- Branches are short-lived, rebased on `main` regularly, deleted after merge.

### 11.2 Atomic Commits
- One logical change per commit (e.g., "add CartPage class" and "add cart DDT scenarios" are separate commits, not one).
- Each commit must independently lint, type-check, and pass tests.
- Never commit `test-results/`, `playwright-report/`, `node_modules/`, or `.env` — enforce via `.gitignore`.

### 11.3 Commit Message Convention — Conventional Commits
```
<type>(<scope>): <short imperative summary, ≤50 chars>

<optional body — why, wrapped at 72 chars>

<optional footer — Closes:, BREAKING CHANGE:>
```

| Type | Use for |
|------|---------|
| `feat` | new page object, new test scenario/capability |
| `fix` | bug fix in test logic, page object, or config |
| `refactor` | restructuring without behavior change |
| `test` | test-only additions/corrections |
| `docs` | documentation only |
| `style` | formatting only, no logic change |
| `chore` | tooling, dependency, config updates |
| `ci` | CI pipeline changes |

Examples:
- `feat(checkout): add data-driven checkout scenarios from testData.json`
- `fix(cart-page): correct parseFloat handling for price strings with commas`
- `chore(config): enable trace and screenshot capture on failure`

### 11.4 Pull Requests
- One PR = one logical unit (e.g., "Implement CartPage + cart validation tests").
- PR title follows Conventional Commits format.
- Description includes: what changed, why, how it was tested, and screenshots/trace links if UI behavior changed.
- No merge with failing CI (lint, type-check, tests) or unresolved comments.

---

## 12. Definition of Done

A task on this project is complete only when:
1. Code follows Sections 3 & 4 principles (KISS/DRY/YAGNI/SOLID, ACID-aware test design).
2. Page objects follow Section 5 rules — no raw locators or waits leaking into spec files.
3. New scenarios are data-driven per Section 6, not hardcoded.
4. Price/total assertions follow Section 7 (safe float comparison, real calculated expectations).
5. `playwright.config.js` artifact capture (Section 8) is in place and verified by forcing a failing test locally.
6. Error handling/logging follow Section 9 — no swallowed failures, no stray `console.log`.
7. Type checks and lint pass clean (Section 10).
8. Changes are committed atomically with Conventional Commit messages on a correctly named branch.
9. `README.md`/`instructions.md` updated if scope, structure, or conventions changed.
