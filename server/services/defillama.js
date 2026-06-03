/**
 * @module services/defillama
 * @description DefiLlama API client with mock data fallback.
 * Provides TVL data, protocol information, and token-to-protocol lookups.
 * No API key required – public API.
 */

const cache = require('../utils/cache');

const BASE_URL = 'https://api.llama.fi';
const CACHE_TTL = 5 * 60 * 1000;         // 5 minutes
const PROTOCOLS_CACHE_TTL = 30 * 60 * 1000; // 30 minutes (heavy cache)

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Make a GET request to the DefiLlama API.
 *
 * @param {string} path - API path (e.g. "/tvl/aave")
 * @returns {Promise<*>} Parsed JSON response
 * @throws {Error} On network / HTTP errors
 */
async function fetchDefiLlama(path) {

  const url = `${BASE_URL}${path}`;
  console.log(`[DefiLlama] GET ${url}`);

  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`DefiLlama API ${res.status}: ${body}`);
  }

  return res.json();
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_PROTOCOL_TVL = 12_450_000_000; // $12.45B

const MOCK_PROTOCOL_DATA = {
  id: '111',
  name: 'Lido',
  slug: 'lido',
  symbol: 'LDO',
  url: 'https://lido.fi',
  description: 'Liquid staking solution for Ethereum and other PoS chains.',
  logo: 'https://icons.llama.fi/lido.png',
  category: 'Liquid Staking',
  chains: ['Ethereum', 'Polygon', 'Solana', 'Moonbeam'],
  tvl: 12_450_000_000,
  chainTvls: {
    Ethereum: 11_800_000_000,
    Polygon: 350_000_000,
    Solana: 200_000_000,
    Moonbeam: 100_000_000,
  },
  change_1h: 0.12,
  change_1d: -0.87,
  change_7d: 2.34,
  mcap: 1_850_000_000,
  fdv: 2_100_000_000,
};

const MOCK_ALL_PROTOCOLS = [
  {
    id: '111',
    name: 'Lido',
    slug: 'lido',
    symbol: 'LDO',
    category: 'Liquid Staking',
    chains: ['Ethereum', 'Polygon', 'Solana'],
    tvl: 12_450_000_000,
    logo: 'https://icons.llama.fi/lido.png',
  },
  {
    id: '196',
    name: 'Aave',
    slug: 'aave',
    symbol: 'AAVE',
    category: 'Lending',
    chains: ['Ethereum', 'Polygon', 'Avalanche', 'Arbitrum', 'Optimism'],
    tvl: 10_200_000_000,
    logo: 'https://icons.llama.fi/aave.png',
  },
  {
    id: '118',
    name: 'Uniswap',
    slug: 'uniswap',
    symbol: 'UNI',
    category: 'Dexes',
    chains: ['Ethereum', 'Polygon', 'Arbitrum', 'Optimism', 'Base'],
    tvl: 5_400_000_000,
    logo: 'https://icons.llama.fi/uniswap.png',
  },
  {
    id: '119',
    name: 'MakerDAO',
    slug: 'makerdao',
    symbol: 'MKR',
    category: 'CDP',
    chains: ['Ethereum'],
    tvl: 8_100_000_000,
    logo: 'https://icons.llama.fi/makerdao.png',
  },
  {
    id: '120',
    name: 'Curve Finance',
    slug: 'curve-finance',
    symbol: 'CRV',
    category: 'Dexes',
    chains: ['Ethereum', 'Polygon', 'Arbitrum', 'Fantom', 'Avalanche'],
    tvl: 2_300_000_000,
    logo: 'https://icons.llama.fi/curve-finance.png',
  },
];

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Get the total value locked (TVL) for a specific protocol.
 *
 * @param {string} protocolName - Protocol slug (e.g. "aave", "lido")
 * @returns {Promise<number>} TVL in USD
 */
async function getProtocolTVL(protocolName) {
  const cacheKey = `dl:tvl:${protocolName}`;
  const cached = cache.get(cacheKey);
  if (cached !== undefined) return cached;

  try {
    const data = await fetchDefiLlama(`/tvl/${encodeURIComponent(protocolName)}`);
    // DefiLlama returns a plain number for /tvl endpoint
    const tvl = typeof data === 'number' ? data : parseFloat(data) || 0;
    cache.set(cacheKey, tvl, CACHE_TTL);
    return tvl;
  } catch (err) {
    console.error(`[DefiLlama] getProtocolTVL failed: ${err.message}`);
    cache.set(cacheKey, MOCK_PROTOCOL_TVL, CACHE_TTL);
    return MOCK_PROTOCOL_TVL;
  }
}

/**
 * Get detailed protocol data including TVL breakdown by chain.
 *
 * @param {string} protocolName - Protocol slug
 * @returns {Promise<Object>} Protocol data
 */
async function getProtocolData(protocolName) {
  const cacheKey = `dl:protocol:${protocolName}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const data = await fetchDefiLlama(`/protocol/${encodeURIComponent(protocolName)}`);
    cache.set(cacheKey, data, CACHE_TTL);
    return data;
  } catch (err) {
    console.error(`[DefiLlama] getProtocolData failed: ${err.message}`);
    cache.set(cacheKey, MOCK_PROTOCOL_DATA, CACHE_TTL);
    return MOCK_PROTOCOL_DATA;
  }
}

/**
 * Get all protocols (heavily cached).
 *
 * @returns {Promise<Object[]>} Array of protocol summaries
 */
async function getAllProtocols() {
  const cacheKey = 'dl:all_protocols';
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const data = await fetchDefiLlama('/protocols');
    cache.set(cacheKey, data, PROTOCOLS_CACHE_TTL);
    return data;
  } catch (err) {
    console.error(`[DefiLlama] getAllProtocols failed: ${err.message}`);
    cache.set(cacheKey, MOCK_ALL_PROTOCOLS, PROTOCOLS_CACHE_TTL);
    return MOCK_ALL_PROTOCOLS;
  }
}

/**
 * Find a protocol by its associated token symbol.
 * Searches through the full protocols list.
 *
 * @param {string} tokenSymbol - Token symbol to search for (e.g. "UNI", "AAVE")
 * @returns {Promise<Object|null>} Matching protocol or null
 */
async function findProtocolByToken(tokenSymbol) {
  const cacheKey = `dl:find:${tokenSymbol.toUpperCase()}`;
  const cached = cache.get(cacheKey);
  if (cached !== undefined) return cached;

  try {
    const protocols = await getAllProtocols();
    const symbol = tokenSymbol.toUpperCase();
    const match = protocols.find(
      (p) => p.symbol && p.symbol.toUpperCase() === symbol
    ) || null;

    cache.set(cacheKey, match, CACHE_TTL);
    return match;
  } catch (err) {
    console.error(`[DefiLlama] findProtocolByToken failed: ${err.message}`);
    // Try mock data
    const symbol = tokenSymbol.toUpperCase();
    const match = MOCK_ALL_PROTOCOLS.find(
      (p) => p.symbol && p.symbol.toUpperCase() === symbol
    ) || null;
    return match;
  }
}

module.exports = {
  getProtocolTVL,
  getProtocolData,
  getAllProtocols,
  findProtocolByToken,
};
