type CurrencyConfig = {
  code: string;
  symbol: string;
  name: string;
  decimals: number;
  locale: string;
};

// Common currencies configuration
export const CURRENCIES: { [key: string]: CurrencyConfig } = {
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    decimals: 2,
    locale: 'en-IN',
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    decimals: 2,
    locale: 'en-US',
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    decimals: 2,
    locale: 'de-DE',
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    decimals: 2,
    locale: 'en-GB',
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    decimals: 0,
    locale: 'ja-JP',
  },
  // Add more currencies as needed
};

// Default currency code (can be changed)
let defaultCurrencyCode = 'INR';

/**
 * Set the default currency for the application
 */
export const setDefaultCurrency = (currencyCode: string) => {
  if (!CURRENCIES[currencyCode]) {
    throw new Error(`Unsupported currency code: ${currencyCode}`);
  }
  defaultCurrencyCode = currencyCode;
};

/**
 * Get the current default currency code
 */
export const getDefaultCurrency = (): string => defaultCurrencyCode;

/**
 * Get currency configuration for a specific currency code
 */
export const getCurrencyConfig = (currencyCode?: string): CurrencyConfig => {
  const code = currencyCode || defaultCurrencyCode;
  const config = CURRENCIES[code];
  if (!config) {
    throw new Error(`Unsupported currency code: ${code}`);
  }
  return config;
};

/**
 * Format a number as currency
 */
export const formatCurrency = (
  amount: number,
  currencyCode?: string,
): string => {
  const config = getCurrencyConfig(currencyCode);
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.code,
    minimumFractionDigits: config.decimals,
    maximumFractionDigits: config.decimals,
  }).format(amount);
};

/**
 * Parse a currency string to number
 */
export const parseCurrency = (value: string): number => {
  // Remove currency symbol and any thousand separators
  const cleanValue = value.replace(/[^0-9.-]+/g, '');
  return parseFloat(cleanValue);
};

/**
 * Round to the appropriate number of decimal places for the currency
 */
export const roundCurrency = (amount: number, currencyCode?: string): number => {
  const config = getCurrencyConfig(currencyCode);
  const factor = Math.pow(10, config.decimals);
  return Math.round(amount * factor) / factor;
};

/**
 * Add two currency amounts
 */
export const addCurrency = (amount1: number, amount2: number, currencyCode?: string): number => {
  return roundCurrency(amount1 + amount2, currencyCode);
};

/**
 * Subtract two currency amounts
 */
export const subtractCurrency = (amount1: number, amount2: number, currencyCode?: string): number => {
  return roundCurrency(amount1 - amount2, currencyCode);
};

/**
 * Multiply currency amount by a factor
 */
export const multiplyCurrency = (amount: number, factor: number, currencyCode?: string): number => {
  return roundCurrency(amount * factor, currencyCode);
};

/**
 * Divide currency amount by a divisor
 */
export const divideCurrency = (amount: number, divisor: number, currencyCode?: string): number => {
  if (divisor === 0) {
    throw new Error('Cannot divide by zero');
  }
  return roundCurrency(amount / divisor, currencyCode);
};

/**
 * Get absolute value of a currency amount
 */
export const absoluteCurrency = (amount: number, currencyCode?: string): number => {
  return roundCurrency(Math.abs(amount), currencyCode);
};

/**
 * Check if amount is negative
 */
export const isNegativeCurrency = (amount: number): boolean => {
  return amount < 0;
};

/**
 * Check if amount is positive
 */
export const isPositiveCurrency = (amount: number): boolean => {
  return amount > 0;
};

/**
 * Check if amount is zero
 */
export const isZeroCurrency = (amount: number): boolean => {
  return amount === 0;
};

/**
 * Get currency symbol
 */
export const getCurrencySymbol = (currencyCode?: string): string => {
  const config = getCurrencyConfig(currencyCode);
  return config.symbol;
};

/**
 * Get list of supported currency codes
 */
export const getSupportedCurrencies = (): string[] => {
  return Object.keys(CURRENCIES);
};

/**
 * Validate if a currency code is supported
 */
export const isSupportedCurrency = (currencyCode: string): boolean => {
  return !!CURRENCIES[currencyCode];
};
