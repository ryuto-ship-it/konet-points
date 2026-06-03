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
  const rawCompetitors = extract(competitorsResult, []);
  const goplusData = extract(goplusSecurityResult);

  // ── Normalize market data ────────────────────────────────────────────────────
  const market = marketDataArr?.[0] || {};
  const details = tokenDetails || {};
  const detailMarket = details.market_data || {};

  const marketData = {
    name: details.name || market.name || coinId,
    symbol: details.symbol || market.symbol || '',
    image: details.image?.large || market.image || '',
    description: details.description?.en || '',
    categories: details.categories || [],
    genesisDate: details.genesis_date || null,
    links: details.links || {},
    current_price: market.current_price || detailMarket.current_price?.usd || 0,
    market_cap: market.market_cap || detailMarket.market_cap?.usd || 0,
    market_cap_rank: details.market_cap_rank || market.market_cap_rank || null,
    fully_diluted_valuation: market.fully_diluted_valuation || detailMarket.fully_diluted_valuation?.usd || 0,
    total_volume: market.total_volume || detailMarket.total_volume?.usd || 0,
    high_24h: market.high_24h || detailMarket.high_24h?.usd || 0,
    low_24h: market.low_24h || detailMarket.low_24h?.usd || 0,
    price_change_24h: market.price_change_24h || detailMarket.price_change_24h || 0,
    price_change_percentage_24h: market.price_change_percentage_24h || detailMarket.price_change_percentage_24h || 0,
    circulating_supply: market.circulating_supply || detailMarket.circulating_supply || 0,
    total_supply: market.total_supply || detailMarket.total_supply || 0,
    max_supply: market.max_supply || detailMarket.max_supply || null,
    ath: market.ath || detailMarket.ath?.usd || 0,
    ath_date: market.ath_date || detailMarket.ath_date?.usd || null,
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
    goplusSecurity: goplusData,
    holderCount: goplusData?.holderCount || coinGeckoHolderCount,
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

  return {
    actualChain,
    marketData,
    onchainData,
    defiData,
    priceHistory: normalizedHistory,
    competitors: validCompetitors,
  };
}

module.exports = { aggregateTokenData };
