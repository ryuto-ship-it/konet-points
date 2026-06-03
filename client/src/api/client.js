// ─── KONET API Client ─────────────────────────────────────────
const API_BASE = import.meta.env.PROD 
  ? '/api' 
  : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api');

/**
 * Search for tokens by name or contract address.
 * @param {string} query - Search query
 * @returns {Promise<Array>} Array of matching tokens
 */
export async function searchTokens(query) {
  if (!query || query.trim().length === 0) return [];

  try {
    const res = await fetch(
      `${API_BASE}/search?q=${encodeURIComponent(query.trim())}`
    );

    if (!res.ok) {
      throw new Error(`Search failed: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    return data.results || [];
  } catch (err) {
    console.error('[Dorphin Research] Search error:', err);
    throw err;
  }
}

/**
 * Get a full analysis report for a token.
 * @param {string} coinId - CoinGecko coin ID
 * @param {string} [address] - Contract address (optional)
 * @param {string} [chain] - Blockchain network (optional)
 * @returns {Promise<Object>} Full report data
 */
export async function getReport(coinId, address, chain) {
  try {
    const params = new URLSearchParams();
    if (address) params.set('address', address);
    if (chain) params.set('chain', chain);

    const queryString = params.toString();
    const url = `${API_BASE}/report/${encodeURIComponent(coinId)}${
      queryString ? `?${queryString}` : ''
    }`;

    const res = await fetch(url);

    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(
        `Report generation failed: ${res.status} ${res.statusText} — ${errorBody}`
      );
    }

    return await res.json();
  } catch (err) {
    console.error('[Dorphin Research] Report error:', err);
    throw err;
  }
}
