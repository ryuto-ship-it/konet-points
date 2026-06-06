const cache = require('../utils/cache');

const CACHE_TTL = 30 * 60 * 1000; // 30 min

const CMC_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Referer': 'https://coinmarketcap.com/',
  'Origin': 'https://coinmarketcap.com',
};

async function getPulseFeed(coinGeckoId, cmcId) {
  const cacheKey = `pulse:${coinGeckoId}:${cmcId}`;
  const cached = cache.get(cacheKey);
  if (cached !== undefined) return cached;

  const events = [];

  // CoinGecko status updates
  try {
    const cgRes = await fetch(
      `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(coinGeckoId)}/status_updates?per_page=5`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (cgRes.ok) {
      const cgData = await cgRes.json();
      (cgData.status_updates || []).forEach(u => {
        events.push({
          date: u.created_at,
          type: u.category || 'general',
          title: u.description?.substring(0, 120) || null,
          source: 'CoinGecko',
          url: null,
        });
      });
    }
  } catch (e) {
    console.warn(`[PulseFeed] CoinGecko status_updates failed: ${e.message}`);
  }

  // CMC news
  if (cmcId) {
    try {
      const cmcRes = await fetch(
        `https://api.coinmarketcap.com/data-api/v3/cryptocurrency/news?id=${cmcId}&limit=5`,
        { headers: CMC_HEADERS, signal: AbortSignal.timeout(8000) }
      );
      if (cmcRes.ok) {
        const cmcData = await cmcRes.json();
        (cmcData.data || []).forEach(n => {
          events.push({
            date: n.releasedAt,
            type: 'news',
            title: n.title?.substring(0, 120) || null,
            source: 'CoinMarketCap',
            url: n.sourceUrl || null,
          });
        });
      }
    } catch (e) {
      console.warn(`[PulseFeed] CMC news failed: ${e.message}`);
    }
  }

  const result = events
    .filter(e => e.title)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 8);

  cache.set(cacheKey, result, CACHE_TTL);
  console.log(`[PulseFeed] ${result.length} events for ${coinGeckoId}`);
  return result;
}

module.exports = { getPulseFeed };
