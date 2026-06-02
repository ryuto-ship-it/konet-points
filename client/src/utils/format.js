/**
 * Format a number as USD currency.
 * @param {number} value
 * @param {number} [maxDecimals=2]
 * @returns {string}
 */
export function formatCurrency(value, maxDecimals = 2) {
  if (value == null || isNaN(value)) return '—';

  // For very small values (< 0.01), show more decimals
  if (Math.abs(value) < 0.01 && value !== 0) {
    return `$${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    })}`;
  }

  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: maxDecimals,
  })}`;
}

/**
 * Format a number with commas.
 * @param {number} value
 * @returns {string}
 */
export function formatNumber(value) {
  if (value == null || isNaN(value)) return '—';
  return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

/**
 * Format a percentage value.
 * @param {number} value
 * @returns {string}
 */
export function formatPercent(value) {
  if (value == null || isNaN(value)) return '—';
  return value.toFixed(2);
}

/**
 * Format large numbers with K/M/B/T suffixes.
 * @param {number} value
 * @returns {string}
 */
export function formatLargeNumber(value) {
  if (value == null || isNaN(value)) return '—';

  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (abs >= 1e12) {
    return `${sign}$${(abs / 1e12).toFixed(2)}T`;
  }
  if (abs >= 1e9) {
    return `${sign}$${(abs / 1e9).toFixed(2)}B`;
  }
  if (abs >= 1e6) {
    return `${sign}$${(abs / 1e6).toFixed(2)}M`;
  }
  if (abs >= 1e3) {
    return `${sign}$${(abs / 1e3).toFixed(2)}K`;
  }

  return formatCurrency(value);
}

/**
 * Truncate an address for display.
 * @param {string} address
 * @param {number} [start=6]
 * @param {number} [end=4]
 * @returns {string}
 */
export function truncateAddress(address, start = 6, end = 4) {
  if (!address) return '';
  if (address.length <= start + end + 3) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}
