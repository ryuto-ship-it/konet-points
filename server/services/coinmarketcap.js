const CMC_API_KEY = process.env.CMC_API_KEY;
const BASE_URL = 'https://pro-api.coinmarketcap.com/v1';
const cache = require('../utils/cache');
const CACHE_TTL = 5 * 60 * 1000;

function headers() {
  return CMC_API_KEY ? { 'X-CMC_PRO_API_KEY': CMC_API_KEY } : {};
}

async function fetchCMC(path) {
  if (!CMC_API_KEY) throw new Error('CMC_API_KEY not configured');
  const res = await fetch(`${BASE_URL}${path}`, { headers: headers() });
  const data = await res.json();
  if (data.status?.error_code !== 0) {
    throw new Error(`CMC API error ${data.status?.error_code}: ${data.status?.error_message}`);
  }
  return data;
}

// GET /v1/cryptocurrency/info?address={contractAddress}
async function getProjectInfoByContract(contractAddress) {
  const cacheKey = `cmc:info:${contractAddress}`;
  const cached = cache.get(cacheKey);
  if (cached !== undefined) return cached;

  try {
    const data = await fetchCMC(`/cryptocurrency/info?address=${contractAddress}`);
    const coins = data.data;
    if (!coins) { cache.set(cacheKey, null, CACHE_TTL); return null; }

    const coinKeys = Object.keys(coins);
    if (coinKeys.length === 0) { cache.set(cacheKey, null, CACHE_TTL); return null; }

    const project = coins[coinKeys[0]];
    const result = {
      id: project.id,
      name: project.name || '',
      symbol: project.symbol || '',
      description: project.description || '',
      logo: project.logo || '',
      urls: project.urls || {},
      tags: project.tags || [],
      dateAdded: project.date_added || null,
      website: project.urls?.website?.[0] || null,
      twitter: project.urls?.twitter?.[0] || null,
      telegram: project.urls?.telegram?.[0] || null,
      contractAddress: project.contract_address?.[0]?.contract_address || null,
    };
    cache.set(cacheKey, result, CACHE_TTL);
    return result;
  } catch (err) {
    console.error(`[CMC] getProjectInfoByContract failed: ${err.message}`);
    cache.set(cacheKey, null, CACHE_TTL);
    return null;
  }
}

// GET /v1/cryptocurrency/quotes/latest?address={contractAddress}
async function getMarketDataByContract(contractAddress) {
  const cacheKey = `cmc:quotes:${contractAddress}`;
  const cached = cache.get(cacheKey);
  if (cached !== undefined) return cached;

  try {
    const data = await fetchCMC(`/cryptocurrency/quotes/latest?address=${contractAddress}`);
    const coins = data.data;
    if (!coins) { cache.set(cacheKey, null, CACHE_TTL); return null; }

    const coinKeys = Object.keys(coins);
    if (coinKeys.length === 0) { cache.set(cacheKey, null, CACHE_TTL); return null; }

    const token = coins[coinKeys[0]];
    const usd = token.quote?.USD || {};

    const result = {
      id: token.id,
      cmcRank: token.cmc_rank || null,
      circulatingSupply: token.circulating_supply || 0,
      totalSupply: token.total_supply || 0,
      maxSupply: token.max_supply || null,
      price: usd.price || 0,
      marketCap: usd.market_cap || 0,
      fdv: usd.fully_diluted_market_cap || 0,
      volume24h: usd.volume_24h || 0,
      percentChange24h: usd.percent_change_24h || 0,
      percentChange7d: usd.percent_change_7d || 0,
      lastUpdated: usd.last_updated || null,
    };
    cache.set(cacheKey, result, CACHE_TTL);
    return result;
  } catch (err) {
    console.error(`[CMC] getMarketDataByContract failed: ${err.message}`);
    cache.set(cacheKey, null, CACHE_TTL);
    return null;
  }
}

// GET /v1/cryptocurrency/market-pairs/latest?address={contractAddress}&limit=20
async function getExchangePairsByContract(contractAddress, limit = 20) {
  const cacheKey = `cmc:pairs:${contractAddress}`;
  const cached = cache.get(cacheKey);
  if (cached !== undefined) return cached;

  try {
    const data = await fetchCMC(
      `/cryptocurrency/market-pairs/latest?address=${contractAddress}&limit=${limit}&convert=USD`
    );
    const token = data.data;
    if (!token?.market_pairs) { cache.set(cacheKey, [], CACHE_TTL); return []; }

    const pairs = token.market_pairs.map(p => ({
      exchangeName: p.exchange?.name || '',
      exchangeId: p.exchange?.slug || '',
      pair: p.market_pair || '',
      priceUsd: p.quote?.USD?.price || 0,
      volume24hUsd: p.quote?.USD?.volume_24h || 0,
      trustScore: null, // CMC doesn't provide trust score
    }));
    cache.set(cacheKey, pairs, CACHE_TTL);
    return pairs;
  } catch (err) {
    console.error(`[CMC] getExchangePairsByContract failed: ${err.message}`);
    cache.set(cacheKey, [], CACHE_TTL);
    return [];
  }
}

module.exports = { getProjectInfoByContract, getMarketDataByContract, getExchangePairsByContract };
