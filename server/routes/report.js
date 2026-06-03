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
    const { coinId } = req.params;
    const address = req.query.address || null;
    const chain = req.query.chain || null;

    if (!coinId) {
      return res.status(400).json({ error: 'Missing required parameter: coinId' });
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
        high24h: marketData.high_24h,
        low24h: marketData.low_24h,
      },

      onchainData: {
        isNative: onchainData.isNative || false,
        networkStats: onchainData.networkStats || null,
        transactionCount: onchainData.transactionCount,
        dailyTxEstimate: onchainData.dailyTxEstimate,
        holderCount: onchainData.holderCount || null, // CoinGecko fallback holderCount mapped
        topHolders: [],    
        contractVerified: onchainData.contractVerified,
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

      analysis: {
        basicInfoAnalysis: analysis.basic_info_analysis || '',
        onchainAnalysis: analysis.onchain_analysis || '',
        utilityAnalysis: {
          text: analysis.utility_analysis?.text || '',
          hasBurn: analysis.utility_analysis?.hasBurn || false,
          hasStaking: analysis.utility_analysis?.hasStaking || false,
          hasGovernance: analysis.utility_analysis?.hasGovernance || false,
        },
        teamInvestors: {
          coreTeam: analysis.team_investors?.core_team || '',
          backingInvestors: analysis.team_investors?.backing_investors || '',
          transparencyRating: analysis.team_investors?.transparency_rating || 'medium',
        },
        tokenomicsAllocation: {
          supplyDistribution: analysis.tokenomics_allocation?.supply_distribution || '',
          circulationRatio: analysis.tokenomics_allocation?.circulation_ratio || 'N/A',
          mcapFdvRatio: analysis.tokenomics_allocation?.mcap_fdv_ratio || 'N/A',
        },
        competitiveLandscape: {
          summary: analysis.competitive_landscape?.summary || '',
          competitors: analysis.competitive_landscape?.competitors || [],
        },
        riskAnalysis: {
          concentrationRisk: analysis.risk_analysis?.concentrationRisk || 'unknown',
          liquidityRisk: analysis.risk_analysis?.liquidityRisk || 'unknown',
          volumeAnomaly: analysis.risk_analysis?.volumeAnomaly || 'unknown',
          overallRiskLevel: analysis.risk_analysis?.overallRiskLevel || 'unknown',
          details: analysis.risk_analysis?.details || '',
        },
        overallAssessment: {
          summary: analysis.overall_assessment?.summary || '',
          strengths: analysis.overall_assessment?.strengths || [],
          weaknesses: analysis.overall_assessment?.weaknesses || [],
          risks: analysis.overall_assessment?.risks || [],
          investmentPerspective: analysis.overall_assessment?.investmentPerspective || '',
          listingGrade: analysis.overall_assessment?.listingGrade || 'B',
          listingScoreMatrix: {
            circulation: analysis.overall_assessment?.listingScoreMatrix?.circulation || 'Fair',
            volume: analysis.overall_assessment?.listingScoreMatrix?.volume || 'Fair',
            onchain: analysis.overall_assessment?.listingScoreMatrix?.onchain || 'Fair',
            team: analysis.overall_assessment?.listingScoreMatrix?.team || 'Fair',
          },
        },
      },

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
