/**
 * @module routes/search
 * @description Search endpoint for finding crypto tokens.
 * Proxies search queries to CoinGecko and returns simplified results.
 */

const { Router } = require('express');
const coingecko = require('../services/coingecko');
const cache = require('../utils/cache');

const router = Router();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * GET /api/search?q={query}
 *
 * Search for crypto tokens by name or symbol.
 *
 * @query {string} q - Search query (required, min 1 character)
 * @returns {{ results: Array<{ id: string, name: string, symbol: string, image: string, market_cap_rank: number|null }> }}
 */
router.get('/', async (req, res, next) => {
  try {
    const query = (req.query.q || '').trim();

    if (!query) {
      return res.status(400).json({
        error: 'Missing required query parameter: q',
        results: [],
      });
    }

    // Check cache
    const cacheKey = `search:${query.toLowerCase()}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log(`[Search] Cache hit for "${query}"`);
      return res.json(cached);
    }

    console.log(`[Search] Searching for "${query}"`);
    const data = await coingecko.searchTokens(query);

    // Normalize results into a simpler structure
    const results = (data.coins || []).slice(0, 20).map((coin) => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      image: coin.large || coin.thumb || '',
      market_cap_rank: coin.market_cap_rank || null,
    }));

    const response = { results };
    cache.set(cacheKey, response, CACHE_TTL);

    return res.json(response);
  } catch (err) {
    console.error(`[Search] Error: ${err.message}`);
    next(err);
  }
});

module.exports = router;
