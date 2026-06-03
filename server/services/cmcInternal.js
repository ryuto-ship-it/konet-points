const cache = require('../utils/cache');

const BASE_URL = 'https://api.coinmarketcap.com/data-api/v3';
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  'Accept': 'application/json',
  'Referer': 'https://coinmarketcap.com/',
};

async function fetchCmcInternal(path) {
  const res = await fetch(`${BASE_URL}${path}`, { headers: DEFAULT_HEADERS });
  if (!res.ok) throw new Error(`CMC internal API ${res.status}: ${path}`);
  return res.json();
}

// Resolve contract address → CMC numeric ID
async function getCmcIdByAddress(contractAddress) {
  if (!contractAddress) return null;
  const cacheKey = `cmci:id:${contractAddress.toLowerCase()}`;
  const cached = cache.get(cacheKey);
  if (cached !== undefined) return cached;

  try {
    const data = await fetchCmcInternal(`/cryptocurrency/info?address=${contractAddress}`);
    const id = data?.data?.id ?? null;
    cache.set(cacheKey, id, CACHE_TTL);
    console.log(`[CMC-Internal] Resolved address ${contractAddress} → CMC ID ${id}`);
    return id;
  } catch (err) {
    console.error(`[CMC-Internal] getCmcIdByAddress failed: ${err.message}`);
    cache.set(cacheKey, null, CACHE_TTL);
    return null;
  }
}

// Full token detail: info, description, socials, tags, ranking
async function getTokenDetail(cmcId) {
  if (!cmcId) return null;
  const cacheKey = `cmci:detail:${cmcId}`;
  const cached = cache.get(cacheKey);
  if (cached !== undefined) return cached;

  try {
    const data = await fetchCmcInternal(`/cryptocurrency/detail?id=${cmcId}`);
    const d = data?.data;
    if (!d) { cache.set(cacheKey, null, CACHE_TTL); return null; }

    const result = {
      id: d.id,
      name: d.name || '',
      symbol: d.symbol || '',
      slug: d.slug || '',
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
      category: d.category || null,
      selfReportedTags: d.selfReportedTags || [],
    };

    cache.set(cacheKey, result, CACHE_TTL);
    return result;
  } catch (err) {
    console.error(`[CMC-Internal] getTokenDetail(${cmcId}) failed: ${err.message}`);
    cache.set(cacheKey, null, CACHE_TTL);
    return null;
  }
}

// Exchange market pairs (up to 40)
async function getMarketPairs(cmcId, limit = 40) {
  if (!cmcId) return [];
  const cacheKey = `cmci:pairs:${cmcId}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached !== undefined) return cached;

  try {
    const data = await fetchCmcInternal(
      `/cryptocurrency/market-pairs/latest?id=${cmcId}&limit=${limit}`
    );
    const pairs = data?.data?.marketPairs || [];

    const result = pairs.map(p => ({
      exchangeName: p.exchangeName || p.exchange?.name || '',
      exchangeId: p.exchangeSlug || p.exchange?.slug || '',
      pair: `${p.baseSymbol || ''}/${p.quoteSymbol || ''}`,
      priceUsd: p.price ?? 0,
      volume24hUsd: p.volumeUsd ?? p.volume24h ?? 0,
      trustScore: p.trustScore || null,
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

// Holder distribution
async function getHolderAggregated(cmcId) {
  if (!cmcId) return null;
  const cacheKey = `cmci:holders:${cmcId}`;
  const cached = cache.get(cacheKey);
  if (cached !== undefined) return cached;

  try {
    const data = await fetchCmcInternal(`/cryptocurrency/holders/aggregated?id=${cmcId}`);
    const d = data?.data;
    if (!d) { cache.set(cacheKey, null, CACHE_TTL); return null; }

    const result = {
      totalHolders: d.holderCount ?? null,
      top10Pct: d.topTenHolderRatio ?? null,
      top20Pct: d.topTwentyHolderRatio ?? null,
      top50Pct: d.topFiftyHolderRatio ?? null,
      holders: (d.holderList || []).map((h, i) => ({
        rank: i + 1,
        address: h.address || '',
        balance: h.balance ?? 0,
        percentage: h.percentage ?? 0,
        label: h.label || null,
      })),
    };

    cache.set(cacheKey, result, CACHE_TTL);
    return result;
  } catch (err) {
    console.error(`[CMC-Internal] getHolderAggregated(${cmcId}) failed: ${err.message}`);
    cache.set(cacheKey, null, CACHE_TTL);
    return null;
  }
}

module.exports = { getCmcIdByAddress, getTokenDetail, getMarketPairs, getHolderAggregated };
