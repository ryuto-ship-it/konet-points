/**
 * @module utils/cache
 * @description Simple in-memory cache with TTL (Time-To-Live) support.
 * Entries are automatically invalidated after their TTL expires.
 * No external dependencies required.
 */

/** Default TTL in milliseconds (5 minutes) */
const DEFAULT_TTL_MS = 5 * 60 * 1000;

/**
 * @typedef {Object} CacheEntry
 * @property {*} value - The cached value
 * @property {number} expiresAt - Unix timestamp (ms) when this entry expires
 */

/** @type {Map<string, CacheEntry>} */
const store = new Map();

/**
 * Retrieve a value from the cache.
 * Returns undefined if the key doesn't exist or has expired.
 *
 * @param {string} key - Cache key
 * @returns {*|undefined} The cached value, or undefined if not found / expired
 */
function get(key) {
  const entry = store.get(key);
  if (!entry) return undefined;

  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return undefined;
  }

  return entry.value;
}

/**
 * Store a value in the cache with an optional TTL.
 *
 * @param {string} key - Cache key
 * @param {*} value - Value to cache
 * @param {number} [ttlMs=DEFAULT_TTL_MS] - Time-to-live in milliseconds
 */
function set(key, value, ttlMs = DEFAULT_TTL_MS) {
  store.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
}

/**
 * Check if a non-expired entry exists for the given key.
 *
 * @param {string} key - Cache key
 * @returns {boolean}
 */
function has(key) {
  return get(key) !== undefined;
}

/**
 * Remove all entries from the cache.
 */
function clear() {
  store.clear();
}

/**
 * Get the current number of entries (including potentially expired ones).
 *
 * @returns {number}
 */
function size() {
  return store.size;
}

module.exports = { get, set, has, clear, size, DEFAULT_TTL_MS };
