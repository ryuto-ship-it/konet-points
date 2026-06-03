/**
 * @module services/coingecko
 * @description CoinGecko API client with mock data fallback.
 * Provides token search, market data, price history, and contract lookups.
 * Falls back to realistic mock data when the API key is missing or the API fails.
 */

const cache = require('../utils/cache');

const BASE_URL = 'https://api.coingecko.com/api/v3';
const API_KEY = process.env.COINGECKO_API_KEY;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Make an authenticated GET request to the CoinGecko API.
 *
 * @param {string} path - API path (e.g. "/search?query=eth")
 * @returns {Promise<Object>} Parsed JSON response
 * @throws {Error} On network / HTTP errors
 */
async function fetchCoinGecko(path) {

  const url = `${BASE_URL}${path}`;
  const headers = {};
  if (API_KEY && API_KEY !== 'your_coingecko_demo_key') {
    headers['x-cg-demo-api-key'] = API_KEY;
  }

  console.log(`[CoinGecko] GET ${url}`);
  const res = await fetch(url, { headers });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`CoinGecko API ${res.status}: ${body}`);
  }

  return res.json();
}

/**
 * Returns true if we should use mock data (no API key configured).
 * @returns {boolean}
 */
function shouldUseMock() {
  // Try real API first instead of aggressive mock fallback
  return false;
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_SEARCH_RESULTS = {
  coins: [
    {
      id: 'ethereum',
      name: 'Ethereum',
      api_symbol: 'ethereum',
      symbol: 'ETH',
      market_cap_rank: 2,
      thumb: 'https://assets.coingecko.com/coins/images/279/thumb/ethereum.png',
      large: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
    },
    {
      id: 'bitcoin',
      name: 'Bitcoin',
      api_symbol: 'bitcoin',
      symbol: 'BTC',
      market_cap_rank: 1,
      thumb: 'https://assets.coingecko.com/coins/images/1/thumb/bitcoin.png',
      large: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
    },
    {
      id: 'solana',
      name: 'Solana',
      api_symbol: 'solana',
      symbol: 'SOL',
      market_cap_rank: 5,
      thumb: 'https://assets.coingecko.com/coins/images/4128/thumb/solana.png',
      large: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
    },
  ],
};

const MOCK_MARKET_DATA = [
  {
    id: 'ethereum',
    symbol: 'eth',
    name: 'Ethereum',
    image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
    current_price: 3450.21,
    market_cap: 414_800_000_000,
    market_cap_rank: 2,
    fully_diluted_valuation: 414_800_000_000,
    total_volume: 18_200_000_000,
    high_24h: 3520.44,
    low_24h: 3380.10,
    price_change_24h: -32.56,
    price_change_percentage_24h: -0.94,
    circulating_supply: 120_200_000,
    total_supply: 120_200_000,
    max_supply: null,
    ath: 4878.26,
    ath_date: '2021-11-10T14:24:19.604Z',
    atl: 0.432979,
    atl_date: '2015-10-20T00:00:00.000Z',
    last_updated: new Date().toISOString(),
  },
];

const MOCK_TOKEN_DETAILS = {
  id: 'ethereum',
  symbol: 'eth',
  name: 'Ethereum',
  web_slug: 'ethereum',
  categories: ['Smart Contract Platform', 'Layer 1 (L1)'],
  description: {
    en: 'Ethereum is a decentralized open-source blockchain featuring smart contract functionality. Ether (ETH) is the native cryptocurrency of the platform. It is the second-largest cryptocurrency by market capitalisation, after Bitcoin. Ethereum allows anyone to deploy permanent and immutable decentralized applications onto it, with which users can interact.',
  },
  links: {
    homepage: ['https://www.ethereum.org/'],
    blockchain_site: ['https://etherscan.io/', 'https://ethplorer.io/'],
    repos_url: { github: ['https://github.com/ethereum/go-ethereum'] },
  },
  image: {
    thumb: 'https://assets.coingecko.com/coins/images/279/thumb/ethereum.png',
    small: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
    large: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
  },
  genesis_date: '2015-07-30',
  market_cap_rank: 2,
  market_data: {
    current_price: { usd: 3450.21 },
    market_cap: { usd: 414_800_000_000 },
    fully_diluted_valuation: { usd: 414_800_000_000 },
    total_volume: { usd: 18_200_000_000 },
    high_24h: { usd: 3520.44 },
    low_24h: { usd: 3380.10 },
    price_change_24h: -32.56,
    price_change_percentage_24h: -0.94,
    circulating_supply: 120_200_000,
    total_supply: 120_200_000,
    max_supply: null,
    ath: { usd: 4878.26 },
    ath_date: { usd: '2021-11-10T14:24:19.604Z' },
  },
  platforms: {},
  detail_platforms: {},
};

/**
 * Generate realistic mock price history data.
 *
 * @param {number} days - Number of days of history
 * @returns {{ prices: number[][], total_volumes: number[][] }}
 */
function generateMockPriceHistory(days) {
  const now = Date.now();
  const msPerDay = 86_400_000;
  const prices = [];
  const volumes = [];
  let price = 3200;

  for (let i = days; i >= 0; i--) {
    const timestamp = now - i * msPerDay;
    // Random walk around a base price
    price += (Math.random() - 0.48) * 80;
    price = Math.max(2800, Math.min(3800, price));
    prices.push([timestamp, parseFloat(price.toFixed(2))]);
    volumes.push([timestamp, parseFloat((14_000_000_000 + Math.random() * 8_000_000_000).toFixed(0))]);
  }

  return { prices, total_volumes: volumes };
}

const MOCK_CONTRACT_DATA = {
  id: 'ethereum',
  symbol: 'eth',
  name: 'Ethereum',
  platforms: {},
  market_data: MOCK_TOKEN_DETAILS.market_data,
  image: MOCK_TOKEN_DETAILS.image,
};

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Search for tokens by name or symbol.
 *
 * @param {string} query - Search query (e.g. "ethereum", "ETH")
 * @returns {Promise<Object>} Search results with coins array
 */
async function searchTokens(query) {
  const cacheKey = `cg:search:${query.toLowerCase()}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  if (shouldUseMock()) {
    console.log('[CoinGecko] Using mock data for searchTokens');
    const q = query.toLowerCase();
    const filtered = {
      coins: MOCK_SEARCH_RESULTS.coins.filter(
        (c) => c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q) || c.id.includes(q)
      ),
    };
    cache.set(cacheKey, filtered, CACHE_TTL);
    return filtered;
  }

  try {
    const data = await fetchCoinGecko(`/search?query=${encodeURIComponent(query)}`);
    cache.set(cacheKey, data, CACHE_TTL);
    return data;
  } catch (err) {
    console.error(`[CoinGecko] searchTokens failed: ${err.message}`);
    return MOCK_SEARCH_RESULTS;
  }
}

/**
 * Get market data for a specific coin.
 *
 * @param {string} coinId - CoinGecko coin ID (e.g. "ethereum")
 * @returns {Promise<Object[]>} Array of market data objects
 */
async function getTokenMarketData(coinId) {
  const cacheKey = `cg:market:${coinId}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  if (shouldUseMock()) {
    console.log('[CoinGecko] Using mock data for getTokenMarketData');
    cache.set(cacheKey, MOCK_MARKET_DATA, CACHE_TTL);
    return MOCK_MARKET_DATA;
  }

  try {
    const data = await fetchCoinGecko(`/coins/markets?vs_currency=usd&ids=${encodeURIComponent(coinId)}`);
    cache.set(cacheKey, data, CACHE_TTL);
    return data;
  } catch (err) {
    console.error(`[CoinGecko] getTokenMarketData failed: ${err.message}`);
    return MOCK_MARKET_DATA;
  }
}

/**
 * Get detailed information for a specific coin.
 *
 * @param {string} coinId - CoinGecko coin ID
 * @returns {Promise<Object>} Detailed coin data
 */
async function getTokenDetails(coinId) {
  const cacheKey = `cg:details:${coinId}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  if (shouldUseMock()) {
    console.log('[CoinGecko] Using mock data for getTokenDetails');
    cache.set(cacheKey, MOCK_TOKEN_DETAILS, CACHE_TTL);
    return MOCK_TOKEN_DETAILS;
  }

  try {
    const data = await fetchCoinGecko(
      `/coins/${encodeURIComponent(coinId)}?localization=false&tickers=false&community_data=false`
    );
    cache.set(cacheKey, data, CACHE_TTL);
    return data;
  } catch (err) {
    console.error(`[CoinGecko] getTokenDetails failed: ${err.message}`);
    return MOCK_TOKEN_DETAILS;
  }
}

/**
 * Get historical price and volume data for a coin.
 *
 * @param {string} coinId - CoinGecko coin ID
 * @param {number} [days=30] - Number of days of history
 * @returns {Promise<{ prices: number[][], total_volumes: number[][] }>}
 */
async function getPriceHistory(coinId, days = 30) {
  const cacheKey = `cg:history:${coinId}:${days}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  if (shouldUseMock()) {
    console.log('[CoinGecko] Using mock data for getPriceHistory');
    const mockData = generateMockPriceHistory(days);
    cache.set(cacheKey, mockData, CACHE_TTL);
    return mockData;
  }

  try {
    const data = await fetchCoinGecko(
      `/coins/${encodeURIComponent(coinId)}/market_chart?vs_currency=usd&days=${days}`
    );
    cache.set(cacheKey, data, CACHE_TTL);
    return data;
  } catch (err) {
    console.error(`[CoinGecko] getPriceHistory failed: ${err.message}`);
    return generateMockPriceHistory(days);
  }
}

/**
 * Get token data by contract address on a specific platform.
 *
 * @param {string} platform - Platform ID (e.g. "ethereum")
 * @param {string} address - Contract address
 * @returns {Promise<Object>} Token data
 */
async function getTokenByContract(platform, address) {
  const cacheKey = `cg:contract:${platform}:${address}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  if (shouldUseMock()) {
    console.log('[CoinGecko] Using mock data for getTokenByContract');
    cache.set(cacheKey, MOCK_CONTRACT_DATA, CACHE_TTL);
    return MOCK_CONTRACT_DATA;
  }

  try {
    const data = await fetchCoinGecko(
      `/coins/${encodeURIComponent(platform)}/contract/${encodeURIComponent(address)}`
    );
    cache.set(cacheKey, data, CACHE_TTL);
    return data;
  } catch (err) {
    console.error(`[CoinGecko] getTokenByContract failed: ${err.message}`);
    return MOCK_CONTRACT_DATA;
  }
}

module.exports = {
  searchTokens,
  getTokenMarketData,
  getTokenDetails,
  getPriceHistory,
  getTokenByContract,
};
