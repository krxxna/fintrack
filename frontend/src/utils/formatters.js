/**
 * Format number as currency
 * @param {number} n
 * @param {string} currency
 */
export const fmt = (n, currency = 'USD') =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(n);

/**
 * Full currency with cents
 */
export const fmtFull = (n, currency = 'USD') =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(n);

/**
 * Format date string to readable
 */
export const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

/**
 * Format date to YYYY-MM-DD for input[type=date]
 */
export const toInputDate = (d) =>
  new Date(d).toISOString().slice(0, 10);

/**
 * Percent change between two values
 */
export const pctChange = (current, prev) =>
  prev ? Math.round(((current - prev) / prev) * 100) : 0;

/**
 * Abbreviate large numbers  1000 -> 1k
 */
export const abbr = (n) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(1)}k`;
  return `$${n}`;
};
