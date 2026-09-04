import { test } from '@playwright/test';

const TAX_RATE = 0.08;

/**
 * Convert a SauceDemo price string to a number.
 * Example: "$29.99" -> 29.99
 */
export function parsePrice(priceText) {
  const cleaned = priceText.replace(/[^0-9.]/g, '');
  return parseFloat(cleaned);
}

/**
 * Calculate tax from a subtotal using the fixed SauceDemo tax rate.
 */
export function calculateTax(subtotal) {
  return Math.round(subtotal * TAX_RATE * 100) / 100;
}

/**
 * Calculate the expected order total.
 */
export function calculateTotal(subtotal) {
  const tax = calculateTax(subtotal);
  return Math.round((subtotal + tax) * 100) / 100;
}

/**
 * Compare two monetary values with a small tolerance to avoid
 * floating-point rounding failures.
 */
export function isApproximatelyEqual(actual, expected, tolerance = 0.01) {
  return Math.abs(actual - expected) <= tolerance;
}
