const cache = require('../utils/cache');

const BASE_URL = 'https://api.coinmarketcap.com/data-api/v3';
const CACHE_TTL = 10 * 60 * 1000;

const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://coinmarketcap.com/',
  'Origin': 'https://coinmarketcap.com',
};

async function fetchCmcInternal(path) {
  const res = await fetch(`${BASE_URL}${path}`, { headers: DEFAULT_HEADERS });
  if (!res.ok) throw new Error(`CMC internal ${res.status}: ${path}`);
  return res.json();
}

// Resolve CoinGecko slug → CMC ID + full detail in one call.
// CoinGecko slug == CMC slug for most tokens (e.g. "wallitelli" → id 40061).
async function getDetailBySlug(slug) {
  if (!slug) return null;
  const cacheKey = `cmci:slug:${slug}`;
  const cached = cache.get(cacheKey);
  if (cached !== undefined) return cached;

  try {
    const data = await fetchCmcInternal(`/cryptocurrency/detail?slug=${slug}`);
    const d = data?.data;
    if (!d) { cache.set(cacheKey, null, CACHE_TTL); return null; }

    const result = {
      id: d.id,
      name: d.name || '',
      symbol: d.symbol || '',
      slug: d.slug || slug,
      cmcRank: d.cmcRank ?? null,
      description: d.description || '',
      logo: d.logo || '',
      tags: (d.tags || []).map(t => t.name || t.slug || t),
      dateAdded: d.dateAdded || null,
      website: d.urls?.website?.[0] || null,
      twitter: d.urls?.twitter?.[0] || null,
      telegram: d.urls?.telegram?.[0] || null,
      reddit: d.urls?.reddit?.[0] || null,
      github: d.urls?.sourceCode?.[0] || null,
      technicalDoc: d.urls?.technical_doc?.[0] || null,
      category: d.category || null,
    };

    cache.set(cacheKey, result, CACHE_TTL);
    console.log(`[CMC-Internal] slug "${slug}" → CMC ID ${result.id}`);
    return result;
  } catch (err) {
    console.error(`[CMC-Internal] getDetailBySlug(${slug}) failed: ${err.message}`);
    cache.set(cacheKey, null, CACHE_TTL);
    return null;
  }
}

// Exchange market pairs — up to 40, sorted by volume
async function getMarketPairs(cmcId, limit = 40) {
  if (!cmcId) return [];
  const cacheKey = `cmci:pairs:${cmcId}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached !== undefined) return cached;

  try {
    const data = await fetchCmcInternal(
      `/cryptocurrency/market-pairs/latest?id=${cmcId}&limit=${limit}&start=1`
    );
    const pairs = data?.data?.marketPairs || [];

    const result = pairs.map(p => ({
      exchangeName: p.exchangeName || '',
      exchangeId: p.exchangeSlug || '',
      pair: p.marketPair || `${p.baseSymbol || ''}/${p.quoteSymbol || ''}`,
      priceUsd: p.price ?? 0,
      volume24hUsd: p.volumeUsd ?? 0,
      trustScore: p.marketScore ?? null,
      tradeUrl: p.marketUrl || null,
    }));

    cache.set(cacheKey, result, CACHE_TTL);
    return result;
  } catch (err) {
    console.error(`[CMC-Internal] getMarketPairs(${cmcId}) failed: ${err.message}`);
    cache.set(cacheKey, [], CACHE_TTL);
    return [];
  }
}

module.exports = { getDetailBySlug, getMarketPairs };
