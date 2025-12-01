// ============================================
// SAFE CALCULATION UTILITIES
// Prevents NaN, undefined, and calculation errors
// ============================================

/**
 * Safely parse a number from any input
 * Returns 0 for invalid values instead of NaN
 */
export function safeNumber(value, defaultValue = 0) {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }
  const parsed = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : Number(value);
  return isNaN(parsed) || !isFinite(parsed) ? defaultValue : parsed;
}

/**
 * Safely parse an integer from any input
 */
export function safeInt(value, defaultValue = 0) {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }
  const parsed = typeof value === 'string' ? parseInt(value.replace(/,/g, ''), 10) : Math.floor(Number(value));
  return isNaN(parsed) || !isFinite(parsed) ? defaultValue : parsed;
}

/**
 * Round a number to specified decimal places
 */
export function safeRound(value, decimals = 2) {
  const num = safeNumber(value);
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
}

/**
 * Safely divide two numbers, returns 0 if divisor is 0
 */
export function safeDivide(numerator, denominator, defaultValue = 0) {
  const num = safeNumber(numerator);
  const den = safeNumber(denominator);
  if (den === 0) return defaultValue;
  return num / den;
}

/**
 * Safely multiply numbers
 */
export function safeMultiply(...values) {
  return values.reduce((acc, val) => acc * safeNumber(val, 1), 1);
}

/**
 * Safely sum numbers
 */
export function safeSum(...values) {
  return values.reduce((acc, val) => acc + safeNumber(val), 0);
}

/**
 * Safely calculate percentage
 */
export function safePercentage(value, total, decimals = 2) {
  const result = safeDivide(safeNumber(value) * 100, safeNumber(total), 0);
  return safeRound(result, decimals);
}

/**
 * Safely calculate a value based on percentage
 */
export function calculatePercentageOf(base, percentage) {
  return safeRound(safeNumber(base) * (safeNumber(percentage) / 100));
}

/**
 * Format number with thousand separators
 */
export function formatNumber(value, decimals = 0) {
  const num = safeNumber(value);
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/**
 * Format currency (Le - New Leone)
 */
export function formatCurrency(value, currency = 'Le', decimals = 0) {
  const num = safeNumber(value);
  return `${currency} ${formatNumber(num, decimals)}`;
}

/**
 * Format as percentage string
 */
export function formatPercent(value, decimals = 1) {
  return `${safeRound(safeNumber(value), decimals)}%`;
}

/**
 * Calculate totals from an array of items
 */
export function calculateItemsTotal(items, amountField = 'amount') {
  if (!Array.isArray(items)) return 0;
  return items.reduce((sum, item) => sum + safeNumber(item?.[amountField]), 0);
}

/**
 * Calculate sale totals
 */
export function calculateSaleTotals(items, discountPercent = 0, taxPercent = 0) {
  const subtotal = calculateItemsTotal(items, 'total');
  const discount = calculatePercentageOf(subtotal, discountPercent);
  const taxableAmount = subtotal - discount;
  const tax = calculatePercentageOf(taxableAmount, taxPercent);
  const total = taxableAmount + tax;
  
  return {
    subtotal: safeRound(subtotal),
    discount: safeRound(discount),
    tax: safeRound(tax),
    total: safeRound(total)
  };
}

/**
 * Calculate item line total
 */
export function calculateLineTotal(quantity, unitPrice, discount = 0) {
  const qty = safeNumber(quantity);
  const price = safeNumber(unitPrice);
  const disc = safeNumber(discount);
  
  const subtotal = qty * price;
  const discountAmount = calculatePercentageOf(subtotal, disc);
  
  return safeRound(subtotal - discountAmount);
}

/**
 * Calculate average
 */
export function safeAverage(values) {
  if (!Array.isArray(values) || values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + safeNumber(val), 0);
  return safeRound(safeDivide(sum, values.length));
}

/**
 * Calculate min from values (ignoring non-numbers)
 */
export function safeMin(...values) {
  const nums = values.filter(v => !isNaN(safeNumber(v))).map(v => safeNumber(v));
  return nums.length > 0 ? Math.min(...nums) : 0;
}

/**
 * Calculate max from values (ignoring non-numbers)
 */
export function safeMax(...values) {
  const nums = values.filter(v => !isNaN(safeNumber(v))).map(v => safeNumber(v));
  return nums.length > 0 ? Math.max(...nums) : 0;
}

/**
 * Clamp a value between min and max
 */
export function clamp(value, min, max) {
  const num = safeNumber(value);
  return Math.min(Math.max(num, safeNumber(min)), safeNumber(max));
}

/**
 * Validate if a value is a valid positive number
 */
export function isValidPositiveNumber(value) {
  const num = safeNumber(value, NaN);
  return !isNaN(num) && num >= 0;
}

/**
 * Safe stock calculation
 */
export function calculateNewStock(currentStock, quantity, operation = 'add') {
  const current = safeNumber(currentStock);
  const qty = safeNumber(quantity);
  
  if (operation === 'add' || operation === 'in') {
    return current + qty;
  } else if (operation === 'subtract' || operation === 'out') {
    return Math.max(0, current - qty);
  } else if (operation === 'set') {
    return Math.max(0, qty);
  }
  return current;
}

/**
 * Calculate profit margin
 */
export function calculateProfitMargin(sellingPrice, costPrice) {
  const sell = safeNumber(sellingPrice);
  const cost = safeNumber(costPrice);
  
  if (sell === 0) return 0;
  return safeRound(safeDivide((sell - cost) * 100, sell));
}

/**
 * Calculate markup percentage
 */
export function calculateMarkup(sellingPrice, costPrice) {
  const sell = safeNumber(sellingPrice);
  const cost = safeNumber(costPrice);
  
  if (cost === 0) return 0;
  return safeRound(safeDivide((sell - cost) * 100, cost));
}

/**
 * Format large numbers with abbreviations (K, M, B)
 */
export function formatCompactNumber(value) {
  const num = safeNumber(value);
  
  if (num >= 1_000_000_000) {
    return `${safeRound(num / 1_000_000_000, 1)}B`;
  }
  if (num >= 1_000_000) {
    return `${safeRound(num / 1_000_000, 1)}M`;
  }
  if (num >= 1_000) {
    return `${safeRound(num / 1_000, 1)}K`;
  }
  return formatNumber(num);
}