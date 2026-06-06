/**
 * @module routes/report
 * @description Report generation endpoint for comprehensive token analysis.
 * Aggregates data from multiple sources and generates AI-powered analysis.
 */

const { Router } = require('express');
const aggregator = require('../services/aggregator');
const claude = require('../services/claude');
const cache = require('../utils/cache');

const router = Router();
const REPORT_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

/**
 * GET /api/report/:coinId?address=0x...&chain=ethereum
 *
 * Generate a comprehensive analysis report for a specific token.
 *
 * @param {string} coinId - CoinGecko coin ID (e.g. "ethereum", "bitcoin")
 * @query {string} [address] - Token contract address for on-chain analysis
 * @query {string} [chain=ethereum] - Blockchain network (ethereum, polygon, arbitrum, etc.)
 * @returns {Object} Complete report with market data, on-chain data, DeFi data, price history, and AI analysis
 */
router.get('/:coinId', async (req, res, next) => {
  try {
    let { coinId } = req.params;
    const address = req.query.address || null;
    const chain = req.query.chain || null;

    if (!coinId) {
      return res.status(400).json({ error: 'Missing required parameter: coinId' });
    }

    if (coinId.startsWith('0x')) {
      const coingecko = require('../services/coingecko');
      const platformMap = {
        bsc: 'binance-smart-chain',
        ethereum: 'ethereum',
        polygon: 'polygon-pos',
        base: 'base',
        arbitrum: 'arbitrum-one'
      };
      const platform = platformMap[chain] || 'binance-smart-chain';
      
      const resolvedId = await coingecko.getCoinIdByContract(coinId, platform);
      if (!resolvedId) {
        return res.status(404).json({ error: '해당 컨트랙트 주소를 CoinGecko에서 찾을 수 없습니다. 소형 토큰이거나 미등록 토큰일 수 있습니다.' });
      }
      coinId = resolvedId;
    }

    // ── Check cache ────────────────────────────────────────────────────────────
    const cacheKey = `report:${coinId}:${address || 'none'}:${chain}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log(`[Report] Cache hit for ${coinId}`);
      return res.json(cached);
    }

    console.log(`[Report] Generating report for ${coinId} (address=${address}, chain=${chain})`);

    // ── Step 1: Aggregate data from all sources ────────────────────────────────
    const aggregatedData = await aggregator.aggregateTokenData(coinId, address, chain);

    // ── Step 2: Generate AI analysis ───────────────────────────────────────────
    const analysis = await claude.generateReport(aggregatedData);

    // ── Step 3: Build the final report structure ───────────────────────────────
    const { marketData, onchainData, defiData, priceHistory } = aggregatedData;

    const report = {
      token: {
        name: marketData.name,
        symbol: marketData.symbol,
        network: aggregatedData.actualChain,
        contractAddress: address,
        image: marketData.image,
      },

      marketData: {
        currentPrice: marketData.current_price,
        marketCap: marketData.market_cap,
        fdv: marketData.fully_diluted_valuation,
        volume24h: marketData.total_volume,
        circulatingSupply: marketData.circulating_supply,
        totalSupply: marketData.total_supply,
        maxSupply: marketData.max_supply,
        priceChange24h: marketData.price_change_24h,
        priceChangePercent24h: marketData.price_change_percentage_24h,
        ath: marketData.ath,
        athDate: marketData.ath_date,
        atl: marketData.atl || null,
        atl_date: marketData.atl_date || null,
        ath_change_percent: marketData.ath_change_percent || null,
        high24h: marketData.high_24h,
        low24h: marketData.low_24h,
        dexData: marketData.dexData || null,
        cmciDetail: marketData.cmciDetail || null,
        priceDataSource: marketData.priceDataSource || 'CoinGecko',
      },

      onchainData: {
        isNative: onchainData.isNative || false,
        networkStats: onchainData.networkStats || null,
        transactionCount: onchainData.transactionCount,
        dailyTxEstimate: onchainData.dailyTxEstimate,
        holderCount: onchainData.holderCount || null,
        contractVerified: onchainData.contractVerified,
        contractName: onchainData.contractName || null,
        tokenType: onchainData.tokenType || null,
      },

      defiData: {
        tvl: defiData.tvl,
        protocol: defiData.protocol,
        category: defiData.category,
        chains: defiData.chains,
      },

      priceHistory: {
        prices: priceHistory.prices,
        volumes: priceHistory.volumes,
      },

      // New data sections
      exchangeListings: aggregatedData.exchangeListings || null,
      holderAnalysis: aggregatedData.holderAnalysis || null,
      pricePattern: aggregatedData.pricePattern || null,
      tokenCreationDate: aggregatedData.tokenCreationDate || null,
      goplusSecurity: aggregatedData.goplusSecurity || null,
      certik: aggregatedData.certik || null,
      tokenAgeInDays: aggregatedData.tokenAgeInDays ?? null,
      pairCreatedAt: aggregatedData.pairCreatedAt ?? null,
      listingScore: aggregatedData.listingScore || null,
      volumeHealth: aggregatedData.volumeHealth || null,
      walletAgeAnalysis: aggregatedData.walletAgeAnalysis || null,
      distributionPattern: aggregatedData.distributionPattern || null,
      onchainVerification: aggregatedData.onchainVerification || null,
      socialAnalysis: aggregatedData.socialAnalysis || null,
      twitterData: aggregatedData.twitterData || null,
      twitterHandle: aggregatedData.twitterHandle || null,
      communityData: aggregatedData.communityData || null,
      liquidityAnalysis: aggregatedData.liquidityAnalysis || null,
      githubActivity: aggregatedData.githubActivity || null,
      whitepaperContent: aggregatedData.whitepaperContent || null,

      analysis: analysis,

      generatedAt: new Date().toISOString(),
    };

    // ── Step 4: Cache and return ───────────────────────────────────────────────
    cache.set(cacheKey, report, REPORT_CACHE_TTL);
    console.log(`[Report] Report generated and cached for ${coinId}`);

    return res.json(report);
  } catch (err) {
    console.error(`[Report] Error generating report: ${err.message}`);
    next(err);
  }
});

module.exports = router;
