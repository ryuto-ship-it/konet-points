/**
 * @module services/aggregator
 * @description Aggregates token data from CoinGecko, Etherscan, and DefiLlama.
 * Calls all services in parallel and merges results into a unified structure.
 * Handles partial failures gracefully – if one API fails, data from others is still returned.
 */

const coingecko = require('./coingecko');
const etherscan = require('./etherscan');
const defillama = require('./defillama');

/**
 * Aggregate token data from all API sources.
 *
 * @param {string} coinId - CoinGecko coin ID (e.g. "ethereum")
 * @param {string|null} contractAddress - Token contract address (null for native tokens)
 * @param {string} [chain='ethereum'] - Blockchain network name
 * @returns {Promise<{ marketData: Object, onchainData: Object, defiData: Object, priceHistory: Object }>}
 */
async function aggregateTokenData(coinId, contractAddress = null, chain = 'ethereum') {
  console.log(`[Aggregator] Aggregating data for coinId=${coinId}, address=${contractAddress}, chain=${chain}`);

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
  const chainId = chainIdMap[chain] || 1;

  // ── Run all API calls in parallel ────────────────────────────────────────────
  const [
    tokenDetailsResult,
    marketDataResult,
    priceHistoryResult,
    txCountResult,
    txListResult,
    contractSourceResult,
    tokenInfoResult,
    defiProtocolResult,
  ] = await Promise.allSettled([
    // CoinGecko
    coingecko.getTokenDetails(coinId),
    coingecko.getTokenMarketData(coinId),
    coingecko.getPriceHistory(coinId, 30),

    // Etherscan (only if contract address is provided)
    contractAddress
      ? etherscan.getTransactionCount(contractAddress, chainId)
      : Promise.resolve(null),
    contractAddress
      ? etherscan.getTransactionList(contractAddress, chainId, 1, 20)
      : Promise.resolve(null),
    contractAddress
      ? etherscan.getContractSource(contractAddress, chainId)
      : Promise.resolve(null),
    contractAddress
      ? etherscan.getTokenInfo(contractAddress, chainId)
      : Promise.resolve(null),

    // DefiLlama – try to find a protocol associated with this token
    coingecko.getTokenDetails(coinId).then((details) => {
      const symbol = details?.symbol?.toUpperCase();
      if (symbol) return defillama.findProtocolByToken(symbol);
      return null;
    }),
  ]);

  // ── Extract results (handle failures) ────────────────────────────────────────

  /** @param {PromiseSettledResult} result */
  const extract = (result, fallback = null) => {
    if (result.status === 'fulfilled') return result.value;
    console.warn(`[Aggregator] Partial failure: ${result.reason?.message || 'unknown error'}`);
    return fallback;
  };

  const tokenDetails = extract(tokenDetailsResult, {});
  const marketDataArr = extract(marketDataResult, []);
  const priceHistory = extract(priceHistoryResult, { prices: [], total_volumes: [] });
  const txCount = extract(txCountResult);
  const txList = extract(txListResult);
  const contractSource = extract(contractSourceResult);
  const tokenInfo = extract(tokenInfoResult);
  const defiProtocol = extract(defiProtocolResult);

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

  const onchainData = {
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

  console.log('[Aggregator] Aggregation complete');

  return {
    marketData,
    onchainData,
    defiData,
    priceHistory: normalizedHistory,
  };
}

module.exports = { aggregateTokenData };
