/**
 * @module services/aggregator
 * @description Aggregates token data from CoinGecko, Etherscan, and DefiLlama.
 * Calls all services in parallel and merges results into a unified structure.
 * Handles partial failures gracefully – if one API fails, data from others is still returned.
 */

const coingecko = require('./coingecko');
const etherscan = require('./etherscan');
const defillama = require('./defillama');
const goplus = require('./goplus');
const cmc = require('./coinmarketcap');
const dexscreener = require('./dexscreener');
const twitter = require('./twitter');
const bscscan = require('./bscscan');
const contractAnalyzer = require('./contractAnalyzer');

/**
 * Aggregate token data from all API sources.
 *
 * @param {string} coinId - CoinGecko coin ID (e.g. "ethereum")
 * @param {string|null} contractAddress - Token contract address (null for native tokens)
 * @param {string} [chain='ethereum'] - Blockchain network name
 * @returns {Promise<{ marketData: Object, onchainData: Object, defiData: Object, priceHistory: Object }>}
 */
async function aggregateTokenData(coinId, contractAddress = null, chain = null) {
  let actualChain = chain;

  // ── Step 1: Pre-fetch token details to resolve contract address if needed ─────
  let tokenDetails = {};
  try {
    tokenDetails = await coingecko.getTokenDetails(coinId);
  } catch (err) {
    console.error(`[Aggregator] Failed to pre-fetch CoinGecko token details: ${err.message}`);
  }

  // Infer chain if not provided
  if (!actualChain || actualChain === 'ethereum') {
    if (coinId === 'binancecoin') actualChain = 'bsc';
    else if (coinId === 'matic-network') actualChain = 'polygon';
    else if (coinId === 'avalanche-2') actualChain = 'avalanche';
    else if (coinId === 'solana') actualChain = 'solana';
    else if (tokenDetails && tokenDetails.asset_platform_id) {
      const revPlatformMap = {
        'ethereum': 'ethereum',
        'polygon-pos': 'polygon',
        'arbitrum-one': 'arbitrum',
        'optimistic-ethereum': 'optimism',
        'base': 'base',
        'binance-smart-chain': 'bsc',
        'avalanche': 'avalanche'
      };
      if (revPlatformMap[tokenDetails.asset_platform_id]) {
        actualChain = revPlatformMap[tokenDetails.asset_platform_id];
      }
    }
  }
  
  if (!actualChain) actualChain = 'ethereum';

  console.log(`[Aggregator] Aggregating data for coinId=${coinId}, address=${contractAddress}, chain=${actualChain}`);

  // Map chain names to Etherscan chain IDs
  const chainIdMap = {
    ethereum: 1,
    polygon: 137,
    arbitrum: 42161,
    optimism: 10,
    base: 8453,
    bsc: 56,
    avalanche: 43114,
  };
  const chainId = chainIdMap[actualChain] || 1;

  const platformMap = {
    ethereum: 'ethereum',
    polygon: 'polygon-pos',
    arbitrum: 'arbitrum-one',
    optimism: 'optimistic-ethereum',
    base: 'base',
    bsc: 'binance-smart-chain',
    avalanche: 'avalanche',
  };
  const platformId = platformMap[actualChain] || 'ethereum';



  let resolvedAddress = contractAddress;
  if (!resolvedAddress && tokenDetails && tokenDetails.platforms) {
    resolvedAddress = tokenDetails.platforms[platformId] || null;
    if (resolvedAddress) {
      console.log(`[Aggregator] Dynamically resolved contract address for ${coinId}: ${resolvedAddress}`);
    }
  }

  // Extract Twitter handle from CoinGecko links (available from Step 1)
  const twitterHandle = tokenDetails?.links?.twitter_screen_name || null;

  // ── Step 2: Run all remaining API calls in parallel ──────────────────────────
  const [
    marketDataResult,
    priceHistoryResult,
    txCountResult,
    txListResult,
    contractSourceResult,
    tokenInfoResult,
    networkStatsResult,
    defiProtocolResult,
    goplusSecurityResult,
    cmcResult,
    cmcMarketResult,
    cmcPairsResult,
    holderCountResult,
    topHoldersResult,
    dexDataResult,
    twitterResult,
    tickersResult,
    tokenCreationResult,
    bscHoldersResult,
    bscCreationDateResult,
    bscHolderCountResult,
    competitorsResult,
  ] = await Promise.allSettled([
    // CoinGecko
    coingecko.getTokenMarketData(coinId),
    coingecko.getPriceHistory(coinId, 30),

    // Etherscan ERC-20 calls (only if contract address is resolved)
    resolvedAddress
      ? etherscan.getTransactionCount(resolvedAddress, chainId)
      : Promise.resolve(null),
    resolvedAddress
      ? etherscan.getTransactionList(resolvedAddress, chainId, 1, 20)
      : Promise.resolve(null),
    resolvedAddress
      ? etherscan.getContractSource(resolvedAddress, chainId)
      : Promise.resolve(null),
    resolvedAddress
      ? etherscan.getTokenInfo(resolvedAddress, chainId)
      : Promise.resolve(null),

    // Etherscan Native statistic calls (only if native coin)
    !resolvedAddress
      ? etherscan.getNetworkStats(chainId)
      : Promise.resolve(null),

    // DefiLlama – find protocol by token symbol
    Promise.resolve(tokenDetails?.symbol?.toUpperCase()).then((symbol) => {
      if (symbol) return defillama.findProtocolByToken(symbol);
      return null;
    }),

    // GoPlus Security
    resolvedAddress
      ? goplus.getTokenSecurity(resolvedAddress, String(chainId))
      : Promise.resolve(null),

    // CoinMarketCap — project info
    resolvedAddress
      ? cmc.getProjectInfoByContract(resolvedAddress)
      : Promise.resolve(null),

    // CoinMarketCap — market data (primary price source)
    resolvedAddress
      ? cmc.getMarketDataByContract(resolvedAddress)
      : Promise.resolve(null),

    // CoinMarketCap — exchange pairs (primary exchange listing source)
    resolvedAddress
      ? cmc.getExchangePairsByContract(resolvedAddress)
      : Promise.resolve(null),

    // BscScan / Etherscan Token Holders
    resolvedAddress
      ? etherscan.getTokenHolderCount(resolvedAddress, chainId)
      : Promise.resolve(null),
    resolvedAddress
      ? etherscan.getTopTokenHolders(resolvedAddress, chainId)
      : Promise.resolve(null),

    // DexScreener
    resolvedAddress
      ? dexscreener.getPairData(resolvedAddress)
      : Promise.resolve(null),

    // Twitter social metrics (24h cache, graceful fail)
    twitterHandle
      ? twitter.getTwitterData(twitterHandle)
      : Promise.resolve(null),

    // CoinGecko exchange tickers
    coingecko.getTokenTickers(coinId),

    // Token creation date (first ERC-20 tx)
    resolvedAddress
      ? etherscan.getTokenCreationDate(resolvedAddress, chainId)
      : Promise.resolve(null),

    // BSC-specific: BscScan holder data (Etherscan V2 chainid=56)
    actualChain === 'bsc' && resolvedAddress
      ? bscscan.getTokenHolders(resolvedAddress)
      : Promise.resolve(null),
    actualChain === 'bsc' && resolvedAddress
      ? bscscan.getTokenCreationDate(resolvedAddress)
      : Promise.resolve(null),
    actualChain === 'bsc' && resolvedAddress
      ? bscscan.getTokenTotalHolderCount(resolvedAddress)
      : Promise.resolve(null),

    // Competitors logic
    (async () => {
      const categories = tokenDetails?.categories || [];
      if (categories.length === 0) return [];
      
      const allCategories = await coingecko.getCategoriesList();
      if (!allCategories || allCategories.length === 0) return [];
      
      let catMatch = null;
      for (const cat of categories) {
        const target = cat.toLowerCase();
        catMatch = allCategories.find(c => c.name.toLowerCase() === target);
        if (catMatch) break;
      }
      
      if (!catMatch) return [];
      
      const coins = await coingecko.getCoinsByCategory(catMatch.category_id);
      if (!coins || coins.length === 0) return [];
      
      return coins;
    })()
  ]);

  // ── Extract results (handle failures) ────────────────────────────────────────
  /** @param {PromiseSettledResult} result */
  const extract = (result, fallback = null) => {
    if (result.status === 'fulfilled') return result.value;
    console.warn(`[Aggregator] Partial failure: ${result.reason?.message || 'unknown error'}`);
    return fallback;
  };

  const marketDataArr = extract(marketDataResult, []);
  const priceHistory = extract(priceHistoryResult, { prices: [], total_volumes: [] });
  const txCount = extract(txCountResult);
  const txList = extract(txListResult);
  const contractSource = extract(contractSourceResult);
  const tokenInfo = extract(tokenInfoResult);
  const networkStats = extract(networkStatsResult);
  const defiProtocol = extract(defiProtocolResult);
  const cmcData = extract(cmcResult);
  const cmcMarketData = extract(cmcMarketResult);
  const cmcPairsData = extract(cmcPairsResult, []);
  const holderCountData = extract(holderCountResult);
  const topHoldersData = extract(topHoldersResult, []);
  const dexData = extract(dexDataResult);
  const tickersData = extract(tickersResult, []);
  const tokenCreationDate = extract(tokenCreationResult);
  const bscHoldersData = extract(bscHoldersResult);
  const bscCreationDate = extract(bscCreationDateResult);
  const bscHolderCountData = extract(bscHolderCountResult);
  const rawCompetitors = extract(competitorsResult, []);

  // CMC Twitter URL fallback: try if CoinGecko had no handle
  let twitterData = extract(twitterResult);
  if (!twitterData && !twitterHandle) {
    const cmcRaw = extract(cmcResult);
    const cmcTwitterUrl = cmcRaw?.urls?.twitter?.[0] || null;
    if (cmcTwitterUrl) {
      const cmcHandle = cmcTwitterUrl.split('/').filter(Boolean).pop();
      if (cmcHandle) {
        try {
          twitterData = await twitter.getTwitterData(cmcHandle);
        } catch {}
      }
    }
  }
  const goplusData = extract(goplusSecurityResult);

  // ── Normalize market data (CMC primary, CoinGecko fallback) ──────────────────
  const market = marketDataArr?.[0] || {};
  const details = tokenDetails || {};
  const detailMarket = details.market_data || {};
  const hasCmcMarket = !!cmcMarketData?.price;

  const marketData = {
    // Identifiers: CMC → CoinGecko
    name: cmcData?.name || details.name || market.name || coinId,
    symbol: cmcData?.symbol || details.symbol || market.symbol || '',
    image: details.image?.large || market.image || cmcData?.logo || '',
    description: details.description?.en || cmcData?.description || dexData?.info?.description || '',
    cmcData: cmcData || null,
    dexData: dexData || null,
    categories: details.categories || cmcData?.tags || [],
    genesisDate: cmcData?.dateAdded || details.genesis_date || null,
    links: {
      ...details.links,
      ...(cmcData?.website ? { homepage: [cmcData.website] } : {}),
      ...(cmcData?.twitter ? { twitter_screen_name: cmcData.twitter.split('/').pop() } : {}),
    },
    // Price / market metrics: CMC → CoinGecko
    current_price: cmcMarketData?.price || market.current_price || detailMarket.current_price?.usd || 0,
    market_cap: cmcMarketData?.marketCap || market.market_cap || detailMarket.market_cap?.usd || 0,
    market_cap_rank: cmcMarketData?.cmcRank || details.market_cap_rank || market.market_cap_rank || null,
    fully_diluted_valuation: cmcMarketData?.fdv || market.fully_diluted_valuation || detailMarket.fully_diluted_valuation?.usd || 0,
    total_volume: cmcMarketData?.volume24h || market.total_volume || detailMarket.total_volume?.usd || 0,
    high_24h: market.high_24h || detailMarket.high_24h?.usd || 0,
    low_24h: market.low_24h || detailMarket.low_24h?.usd || 0,
    price_change_24h: market.price_change_24h || detailMarket.price_change_24h || 0,
    price_change_percentage_24h: cmcMarketData?.percentChange24h || market.price_change_percentage_24h || detailMarket.price_change_percentage_24h || 0,
    price_change_percentage_7d: cmcMarketData?.percentChange7d || null,
    circulating_supply: cmcMarketData?.circulatingSupply || market.circulating_supply || detailMarket.circulating_supply || 0,
    total_supply: cmcMarketData?.totalSupply || market.total_supply || detailMarket.total_supply || 0,
    max_supply: cmcMarketData?.maxSupply || market.max_supply || detailMarket.max_supply || null,
    ath: market.ath || detailMarket.ath?.usd || 0,
    ath_date: market.ath_date || detailMarket.ath_date?.usd || null,
    // Data source tracking for citation
    priceDataSource: hasCmcMarket ? 'CoinMarketCap' : 'CoinGecko',
  };

  // ── Normalize on-chain data ──────────────────────────────────────────────────
  const txCountDecimal = txCount ? parseInt(txCount, 16) : null;
  const recentTxs = txList?.result || [];
  const sourceCode = contractSource?.result?.[0] || {};
  const tokenInfoData = tokenInfo?.result?.[0] || {};

  // Retrieve CoinGecko holder count as a dynamic fallback
  const coinGeckoHolderCount = details.detail_platforms?.[platformId]?.holder_count 
    || details.market_data?.holder_count
    || null;

  const onchainData = {
    isNative: !resolvedAddress,
    networkStats: networkStats || null,
    transactionCount: txCountDecimal,
    dailyTxEstimate: txCountDecimal ? Math.round(txCountDecimal / 365) : null,
    recentTransactions: recentTxs.slice(0, 10).map((tx) => ({
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: tx.value,
      timestamp: tx.timeStamp ? new Date(parseInt(tx.timeStamp) * 1000).toISOString() : null,
      functionName: tx.functionName || null,
      isError: tx.isError === '1',
    })),
    contractVerified: !!(sourceCode.SourceCode && sourceCode.SourceCode !== ''),
    contractName: sourceCode.ContractName || null,
    compilerVersion: sourceCode.CompilerVersion || null,
    tokenName: tokenInfoData.tokenName || null,
    tokenType: tokenInfoData.tokenType || null,
    tokenDecimals: tokenInfoData.divisor || null,
    holderCount: bscHolderCountData || holderCountData || coinGeckoHolderCount,
    topHolders: topHoldersData,
    // BSC-specific pre-computed holder data
    bscTopHolders: bscHoldersData?.topHolders || null,
    top10Concentration: bscHoldersData?.top10Concentration ?? null,
    tokenCreationDate: (actualChain === 'bsc' ? bscCreationDate : null) || tokenCreationDate || null,
  };

  // ── Normalize DeFi data ──────────────────────────────────────────────────────
  let defiData = {
    tvl: null,
    protocol: null,
    category: null,
    chains: [],
    slug: null,
  };

  if (defiProtocol) {
    defiData = {
      tvl: defiProtocol.tvl || null,
      protocol: defiProtocol.name || null,
      category: defiProtocol.category || null,
      chains: defiProtocol.chains || [],
      slug: defiProtocol.slug || null,
    };
  }

  // ── Normalize price history ──────────────────────────────────────────────────
  const normalizedHistory = {
    prices: priceHistory.prices || [],
    volumes: priceHistory.total_volumes || [],
  };

  // ── Normalize competitors ────────────────────────────────────────────────────
  const currentMcap = marketData.market_cap;
  let validCompetitors = [];
  if (currentMcap > 0 && rawCompetitors.length > 0) {
    const minMcap = currentMcap * 0.5;
    const maxMcap = currentMcap * 1.5;
    validCompetitors = rawCompetitors
      .filter(c => c.id !== coinId && c.market_cap >= minMcap && c.market_cap <= maxMcap)
      .slice(0, 5) // keep up to 5
      .map(c => ({
        id: c.id,
        name: c.name,
        symbol: c.symbol,
        market_cap: c.market_cap,
        market_cap_rank: c.market_cap_rank
      }));
  }

  console.log(`[Aggregator] Found ${validCompetitors.length} competitors within ±50% market cap.`);

  // ── Compute holder concentration ─────────────────────────────────────────────
  let holderAnalysis = null;

  if (actualChain === 'bsc' && bscHoldersData?.topHolders?.length > 0) {
    // BSC: use bscscan data, recalculate percentages with actual total supply if available
    const actualTotalSupply = marketData.total_supply || 0;
    const holders = bscHoldersData.topHolders.map(h => {
      const pct = actualTotalSupply > 0
        ? parseFloat((h.balance / actualTotalSupply * 100).toFixed(2))
        : parseFloat(h.percentage); // fall back to bscscan's own calc
      return { rank: h.rank, address: h.address, balance: h.balance, percentage: pct };
    });
    const top10Total = parseFloat(holders.reduce((s, h) => s + h.percentage, 0).toFixed(2));
    holderAnalysis = { holders, top10TotalPercent: top10Total, isHighRisk: top10Total > 50 };
  } else if (topHoldersData && topHoldersData.length > 0 && tokenInfoData.totalSupply) {
    try {
      const totalSupply = BigInt(tokenInfoData.totalSupply);
      const holders = topHoldersData.slice(0, 10).map(h => {
        let qty = BigInt(0);
        try { qty = BigInt(h.TokenHolderQuantity || '0'); } catch {}
        const pct = totalSupply > 0n
          ? parseFloat((Number(qty * 10000n / totalSupply) / 100).toFixed(2))
          : 0;
        return { address: h.TokenHolderAddress, percentage: pct };
      });
      const top10Total = parseFloat(holders.reduce((s, h) => s + h.percentage, 0).toFixed(2));
      holderAnalysis = { holders, top10TotalPercent: top10Total, isHighRisk: top10Total > 50 };
    } catch (e) {
      console.warn(`[Aggregator] Holder concentration calc failed: ${e.message}`);
    }
  }

  // ── Compute price pattern ────────────────────────────────────────────────────
  let pricePattern = null;
  const prices = normalizedHistory.prices;
  const volumes = normalizedHistory.volumes;
  if (prices.length >= 7) {
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      const prev = prices[i - 1][1], curr = prices[i][1];
      if (prev > 0) returns.push((curr - prev) / prev);
    }
    if (returns.length > 0) {
      const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
      const variance = returns.reduce((a, b) => a + (b - mean) ** 2, 0) / returns.length;
      const volatility30d = parseFloat((Math.sqrt(variance) * 100).toFixed(2));

      const vols = volumes.map(v => v[1]).filter(v => v > 0);
      const avgVol = vols.reduce((a, b) => a + b, 0) / vols.length;
      const maxVol = Math.max(...vols);
      const volumeSpikeRatio = avgVol > 0 ? parseFloat((maxVol / avgVol).toFixed(1)) : null;

      const priceVals = prices.map(p => p[1]);
      const maxP = Math.max(...priceVals), minP = Math.min(...priceVals);
      const rangePercent30d = minP > 0 ? parseFloat(((maxP - minP) / minP * 100).toFixed(1)) : null;

      pricePattern = { volatility30d, volumeSpikeRatio, rangePercent30d };
    }
  }

  // ── Contract source analysis (reuse existing etherscan source, no extra API call) ─
  const rawSourceCode = (contractSource?.result?.[0]?.SourceCode) || null;
  const contractAnalysis = contractAnalyzer.analyzeSource(rawSourceCode);

  // ── Normalize exchange listings (CMC primary, CoinGecko tickers fallback) ────
  const exchangeListings = (cmcPairsData.length > 0 ? cmcPairsData : null)
    || (tickersData.length > 0 ? tickersData : null);

  return {
    actualChain,
    marketData,
    onchainData,
    defiData,
    priceHistory: normalizedHistory,
    competitors: validCompetitors,
    goplusSecurity: goplusData,
    twitterData: twitterData || null,
    exchangeListings,
    holderAnalysis,
    pricePattern,
    tokenCreationDate: (actualChain === 'bsc' ? bscCreationDate : null) || tokenCreationDate || null,
    contractAnalysis: contractAnalysis || null,
  };
}

module.exports = { aggregateTokenData };
