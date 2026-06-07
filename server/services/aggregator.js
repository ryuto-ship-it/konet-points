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
const cmcInternal = require('./cmcInternal');
const dexscreener = require('./dexscreener');
const twitter = require('./twitter');
const bscscan = require('./bscscan');
const contractAnalyzer = require('./contractAnalyzer');
const { getExchangeTier, calculateListingScore } = require('../data/exchangeTiers');
const onchainVerifier = require('./onchainVerifier');
const docsParser = require('./docsParser');
const socialAnalyzer = require('./socialAnalyzer');
const liquidityAnalyzer = require('./liquidityAnalyzer');
const githubAnalyzer = require('./githubAnalyzer');
const pulseFeed = require('./pulseFeed');
const webSecurity = require('./webSecurity');
const { checkCompliance } = require('./complianceChecker');
const { calculateDorphinScore } = require('./dorphinScore');
const { analyzeTwitterActivity } = require('./twitter');
const { buildCertiKData } = require('./certik');

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

  // Extract GitHub URL from CoinGecko links
  const githubUrl = tokenDetails?.links?.repos_url?.github?.[0] || null;

  // ── Step 1b: Resolve CMC detail via slug (CoinGecko slug == CMC slug for most tokens) ──
  let cmciDetailFromSlug = null;
  let cmcId = null;
  try {
    cmciDetailFromSlug = await cmcInternal.getDetailBySlug(coinId);
    cmcId = cmciDetailFromSlug?.id ?? null;
  } catch (err) {
    console.warn(`[Aggregator] CMC slug lookup failed: ${err.message}`);
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
    cmcResult,
    cmcMarketResult,
    cmcPairsResult,
    cmciPairsResult,
    holderCountResult,
    topHoldersResult,
    dexDataResult,
    twitterResult,
    tickersResult,
    tokenCreationResult,
    bscHoldersResult,
    bscCreationDateResult,
    bscHolderCountResult,
    bscDistributionResult,
    onchainVerifyResult,
    socialAnalysisResult,
    liquidityAnalysisResult,
    githubAnalysisResult,
    whitepaperResult,
    cmcHolderCountResult,
    competitorsResult,
    pulseFeedResult,
    webSecurityResult,
    priceHistory7dResult,
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

    // CoinMarketCap official API — project info
    resolvedAddress
      ? cmc.getProjectInfoByContract(resolvedAddress)
      : Promise.resolve(null),

    // CoinMarketCap official API — market data (primary price source)
    resolvedAddress
      ? cmc.getMarketDataByContract(resolvedAddress)
      : Promise.resolve(null),

    // CoinMarketCap official API — exchange pairs
    resolvedAddress
      ? cmc.getExchangePairsByContract(resolvedAddress)
      : Promise.resolve(null),

    // CMC internal web API — exchange market pairs (up to 40, no API key needed)
    cmcId
      ? cmcInternal.getMarketPairs(cmcId, 40)
      : Promise.resolve([]),

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

    // BSC distribution pattern (first 100 txs, airdrop detection)
    actualChain === 'bsc' && resolvedAddress
      ? bscscan.analyzeDistributionPattern(resolvedAddress, chainId)
      : Promise.resolve(null),

    // Onchain transaction verification (wash trading, bot detection)
    resolvedAddress
      ? onchainVerifier.analyzeTransactionPatterns(resolvedAddress, chainId)
      : Promise.resolve(null),

    // Social analysis (Twitter health score)
    twitterHandle
      ? socialAnalyzer.analyzeTwitterAccount(twitterHandle)
      : Promise.resolve(null),

    // Liquidity analysis (DexScreener, sell ratio, wash trading)
    resolvedAddress
      ? liquidityAnalyzer.analyzeLiquidity(resolvedAddress)
      : Promise.resolve(null),

    // GitHub activity
    githubUrl
      ? githubAnalyzer.analyzeGithub(githubUrl)
      : Promise.resolve(null),

    // Whitepaper / docs parsing
    docsParser.fetchAndParseWhitepaper({
      whitepaper: tokenDetails?.links?.whitepaper || null,
      website: tokenDetails?.links?.homepage?.[0] || cmciDetailFromSlug?.website || null,
      docs: null,
      technicalDoc: cmciDetailFromSlug?.technicalDoc || null,
    }),

    // CMC holder count (aggregated)
    cmcId
      ? cmcInternal.getHolderCount(cmcId)
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
    })(),

    // Pulse Feed (CoinGecko status updates + CMC news)
    pulseFeed.getPulseFeed(coinId, cmcId),

    // Website security analysis
    (() => {
      const websiteUrl = tokenDetails?.links?.homepage?.[0] || cmciDetailFromSlug?.website || null;
      return websiteUrl ? webSecurity.analyzeWebsite(websiteUrl) : Promise.resolve(null);
    })(),

    // 7-day hourly price chart
    coinId ? coingecko.getPriceHistory7d(coinId) : Promise.resolve([]),
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
  const cmciPairs = extract(cmciPairsResult, []);
  // cmciDetailFromSlug already resolved in Step 1b (before parallel calls)
  const cmciDetail = cmciDetailFromSlug;
  const certikData = buildCertiKData(cmciDetail);
  const holderCountData = extract(holderCountResult);
  const topHoldersData = extract(topHoldersResult, []);
  const dexData = extract(dexDataResult);
  const tickersData = extract(tickersResult, []);
  const tokenCreationDate = extract(tokenCreationResult);
  const bscHoldersData = extract(bscHoldersResult);
  const bscCreationDate = extract(bscCreationDateResult);
  const bscHolderCountData = extract(bscHolderCountResult);
  const bscDistributionData = extract(bscDistributionResult);
  const onchainVerifyData = extract(onchainVerifyResult);
  const socialAnalysisData = extract(socialAnalysisResult);
  const liquidityAnalysisData = extract(liquidityAnalysisResult);
  const githubData = extract(githubAnalysisResult);
  const whitepaperData = extract(whitepaperResult);
  const cmcHolderCount = extract(cmcHolderCountResult);
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
  const pulseFeedData = extract(pulseFeedResult, []);
  const webSecurityData = extract(webSecurityResult);
  const priceHistory7d = extract(priceHistory7dResult, []);

  // ── Community / social data (CoinGecko community_data + twitterData merge) ───
  const cgCommunity = tokenDetails?.community_data || {};
  const communityData = {
    // Twitter — from Twitter API when available, else null
    twitterHandle: twitterHandle || null,
    twitterFollowers: twitterData?.followersCount ?? null,
    twitterFollowing: null,  // not exposed by Twitter API v2 free
    twitterTotalTweets: twitterData?.tweetCount ?? null,
    twitterAccountCreated: twitterData?.createdAt ?? null,
    twitterVerified: twitterData?.verified ?? null,
    twitterRecentTweets7d: twitterData?.recentTweetCount7d ?? null,
    // Telegram — from CoinGecko community_data (free)
    telegramHandle: tokenDetails?.links?.telegram_channel_identifier || null,
    telegramUserCount: cgCommunity.telegram_channel_user_count ?? null,
    // Reddit
    redditSubscribers: cgCommunity.reddit_subscribers ?? null,
    // Sources
    sources: [
      twitterData ? 'Twitter API v2' : null,
      cgCommunity.telegram_channel_user_count != null ? 'CoinGecko' : null,
    ].filter(Boolean),
  };

  // ── Normalize market data (CMC primary, CoinGecko fallback) ──────────────────
  const market = marketDataArr?.[0] || {};
  const details = tokenDetails || {};
  const detailMarket = details.market_data || {};
  const hasCmcMarket = !!cmcMarketData?.price;

  // cmcInternal detail is the most complete source (web scrape, no API key needed)
  const cmciBest = cmciDetail || cmcData;

  const marketData = {
    // Identifiers: cmcInternal → CMC official → CoinGecko
    name: cmciDetail?.name || cmcData?.name || details.name || market.name || coinId,
    symbol: cmciDetail?.symbol || cmcData?.symbol || details.symbol || market.symbol || '',
    image: cmciDetail?.logo || details.image?.large || market.image || cmcData?.logo || '',
    description: cmciDetail?.description || details.description?.en || cmcData?.description || dexData?.info?.description || '',
    cmcData: cmcData || null,
    cmciDetail: cmciDetail || null,
    dexData: dexData || null,
    categories: cmciDetail?.tags || details.categories || cmcData?.tags || [],
    genesisDate: cmciDetail?.dateAdded || cmcData?.dateAdded || details.genesis_date || null,
    links: {
      ...details.links,
      ...(cmciBest?.website ? { homepage: [cmciBest.website] } : {}),
      ...(cmciBest?.twitter ? { twitter_screen_name: cmciBest.twitter.split('/').filter(Boolean).pop() } : {}),
      ...(cmciBest?.telegram ? { telegram_channel_identifier: cmciBest.telegram.split('/').filter(Boolean).pop() } : {}),
    },
    // Price / market metrics: CoinGecko primary → CMC fallback
    current_price: market.current_price || detailMarket.current_price?.usd || cmcMarketData?.price || 0,
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
    ath: cmciDetail?.ath || market.ath || detailMarket.ath?.usd || 0,
    ath_date: cmciDetail?.athTimestamp || market.ath_date || detailMarket.ath_date?.usd || null,
    atl: cmciDetail?.atl || null,
    atl_date: cmciDetail?.atlTimestamp || null,
    ath_change_percent: cmciDetail?.athChangePercent || null,
    // Data source tracking for citation
    priceDataSource: (market.current_price || detailMarket.current_price?.usd) ? 'CoinGecko' : (hasCmcMarket ? 'CoinMarketCap' : 'CoinGecko'),
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
    holderCount: (() => {
      const isErr = v => typeof v === 'string' && (v.toLowerCase().includes('free api') || v.toLowerCase().includes('upgrade') || v.toLowerCase().includes('not supported'));
      const clean = v => (isErr(v) ? null : v);
      return clean(cmcHolderCount) || clean(bscHolderCountData) || clean(holderCountData) || clean(coinGeckoHolderCount);
    })(),
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

  // ── Volume health analysis ────────────────────────────────────────────────────
  let volumeHealth = null;
  const dex = marketData.dexData;
  if (dex) {
    const vol24h = dex.volume24h || 0;
    const mcap = marketData.market_cap || 0;
    const volMcapRatio = mcap > 0 ? parseFloat((vol24h / mcap * 100).toFixed(2)) : null;
    let volHealthLabel = null;
    if (volMcapRatio !== null) {
      if (volMcapRatio >= 30) volHealthLabel = '과열 (워시트레이딩 의심)';
      else if (volMcapRatio >= 1) volHealthLabel = '정상';
      else volHealthLabel = '유동성 부족';
    }

    const buys = dex.buys24h ?? 0;
    const sells = dex.sells24h ?? 0;
    const sellRatioCalc = (buys + sells) > 0 ? parseFloat((sells / (buys + sells) * 100).toFixed(1)) : null;

    volumeHealth = {
      volume24h: vol24h,
      volumeH6: dex.volumeH6,
      volumeH1: dex.volumeH1,
      volMcapRatioPct: volMcapRatio,
      volHealthLabel,
      buys24h: buys,
      sells24h: sells,
      sellRatioPct: sellRatioCalc,
      isDumpingSignal: sellRatioCalc !== null && sellRatioCalc >= 70,
      isWashTrading: volMcapRatio !== null && volMcapRatio >= 30,
    };
  }

  // ── Holder wallet age + distribution pattern (BSC, best-effort) ──────────────
  let walletAgeAnalysis = null;
  if (actualChain === 'bsc' && holderAnalysis?.holders?.length > 0) {
    try {
      walletAgeAnalysis = await bscscan.analyzeHolderWalletAge(holderAnalysis.holders, chainId);
    } catch (e) {
      console.warn(`[Aggregator] Wallet age analysis failed: ${e.message}`);
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

  // ── Normalize exchange listings + add tier info ───────────────────────────────
  const rawListings = (cmciPairs.length > 0 ? cmciPairs : null)
    || (cmcPairsData.length > 0 ? cmcPairsData : null)
    || (tickersData.length > 0 ? tickersData : null)
    || [];

  const exchangeListings = rawListings.map(ex => ({
    ...ex,
    tierInfo: getExchangeTier(ex.exchangeName),
  }));

  // Sort by tier score descending
  exchangeListings.sort((a, b) => (b.tierInfo?.score ?? 0) - (a.tierInfo?.score ?? 0));

  // ── Composite listing score (exchange 40% + onchain 30% + price stability 30%) ─
  const exchangeScoreResult = calculateListingScore(exchangeListings);

  // Token age from DexScreener pairCreatedAt (ms timestamp)
  const pairCreatedAt = dexData?.pairCreatedAt ?? null;
  const tokenAgeInDays = pairCreatedAt
    ? Math.floor((Date.now() - pairCreatedAt) / 86400000)
    : null;

  const dailyTx = onchainData.dailyTxEstimate || 0;
  const onchainScore = dailyTx >= 10000 ? 100
    : dailyTx >= 5000 ? 80
    : dailyTx >= 1000 ? 60
    : dailyTx >= 100  ? 40
    : 20;
  const onchainLevel = dailyTx >= 10000 ? '매우 높음'
    : dailyTx >= 5000 ? '높음'
    : dailyTx >= 1000 ? '보통'
    : dailyTx >= 100  ? '낮음'
    : '매우 낮음';

  const athDrop = marketData.ath > 0 && marketData.current_price > 0
    ? ((marketData.ath - marketData.current_price) / marketData.ath) * 100
    : 0;
  const priceScore = athDrop <= 50 ? 100 : athDrop <= 80 ? 60 : athDrop <= 90 ? 30 : 10;
  const priceLevel = athDrop <= 50 ? '높음' : athDrop <= 80 ? '중간' : athDrop <= 90 ? '낮음' : '매우 낮음';

  const compositeScore = Math.round(
    exchangeScoreResult.score * 0.4 + onchainScore * 0.3 + priceScore * 0.3
  );
  const compositeGrade = compositeScore >= 90 ? 'A+' : compositeScore >= 80 ? 'A' : compositeScore >= 70 ? 'B+' : compositeScore >= 60 ? 'B' : compositeScore >= 50 ? 'C+' : compositeScore >= 40 ? 'C' : compositeScore >= 30 ? 'D' : 'F';

  const listingScore = {
    composite: compositeScore,
    compositeGrade,
    exchange: {
      score: exchangeScoreResult.score,
      grade: exchangeScoreResult.grade,
      reason: exchangeScoreResult.reason,
      tierCounts: exchangeScoreResult.tierCounts,
    },
    onchain: { score: onchainScore, level: onchainLevel, dailyTx },
    priceStability: { score: priceScore, level: priceLevel, athDropPct: parseFloat(athDrop.toFixed(1)) },
  };

  // ── Compliance check (synchronous) ──────────────────────────────────────────
  const tier1or2Listed = exchangeListings.some(e =>
    ['TIER1', 'TIER2'].includes(e.tierInfo?.tier)
  );

  const dexLiquidity = typeof dexData?.liquidity?.usd === 'number'
    ? dexData.liquidity.usd
    : (marketData.dexData?.liquidity?.usd ?? 0);

  const rawHolderCount = onchainData.holderCount;
  const holderCountNum = (typeof rawHolderCount === 'number' && !isNaN(rawHolderCount))
    ? rawHolderCount
    : (typeof rawHolderCount === 'string' ? parseInt(rawHolderCount, 10) || 0 : 0);

  const certikScore = typeof cmciDetail?.certik?.score === 'number'
    ? cmciDetail.certik.score
    : 0;
  // hasAudit = certik data exists (complianceChecker decides full vs partial via certikScore)
  const hasAudit = certikScore > 0;

  const complianceData = checkCompliance({
    hasAudit,
    certikScore,
    teamKYC: false,
    hasWhitepaper: !!(whitepaperData?.found),
    contractVerified: !!(onchainData.contractVerified),
    hasVestingSchedule: false,
    marketCap: marketData.market_cap || 0,
    description: marketData.description || '',
    tags: marketData.categories || [],
    // Realistic exchange score inputs
    volume24h:      marketData.total_volume || 0,
    liquidity:      dexLiquidity,
    tokenAgeInDays: tokenAgeInDays || 0,
    holderCount:    holderCountNum,
    tier1or2Listed,
  });

  // ── Dorphin proprietary score ────────────────────────────────────────────────
  const dorphinAnalysis = calculateDorphinScore({
    volume24h:       dexData?.volume24h || marketData.total_volume || 0,
    liquidity:       dexLiquidity,
    marketCap:       marketData.market_cap || 0,
    tokenAgeInDays:  tokenAgeInDays || 0,
    exchangeCount:   exchangeListings.length,
    tier1Count:      exchangeListings.filter(e => e.tierInfo?.tier === 'TIER1').length,
    tier2Count:      exchangeListings.filter(e => e.tierInfo?.tier === 'TIER2').length,
    tier3Count:      exchangeListings.filter(e => e.tierInfo?.tier === 'TIER3').length,
    priceChange24h:  marketData.price_change_percentage_24h || 0,
    priceChange7d:   marketData.price_change_percentage_7d || 0,
    buys:            dexData?.buys24h || 0,
    sells:           dexData?.sells24h || 0,
    washTradingRisk: onchainVerifyData?.washTradingRisk || 'LOW',
    telegramCount:   communityData.telegramUserCount || 0,
    twitterFollowers: communityData.twitterFollowers || 0,
    holderCount:     holderCountNum,
    hasAudit:        hasAudit,
    teamKYC:         false,
    lpLockDays:      liquidityAnalysisData?.lpLockDays || 0,
    pairCreatedAt:   pairCreatedAt || null,
    athDropPercent:  marketData.ath_change_percent
      ? Math.abs(marketData.ath_change_percent) : 0,
  });

  const twitterActivity = await analyzeTwitterActivity(communityData.twitterHandle);

  return {
    actualChain,
    marketData,
    onchainData,
    defiData,
    priceHistory: normalizedHistory,
    competitors: validCompetitors,
    goplusSecurity: goplusData,
    twitterData: twitterData || null,
    twitterHandle: twitterHandle || null,
    communityData: communityData,
    exchangeListings,
    holderAnalysis,
    pricePattern,
    tokenCreationDate: (actualChain === 'bsc' ? bscCreationDate : null) || tokenCreationDate || null,
    contractAnalysis: contractAnalysis || null,
    certik: cmciDetail?.certik || null,
    tokenAgeInDays: tokenAgeInDays,
    pairCreatedAt: pairCreatedAt || null,
    listingScore,
    volumeHealth: volumeHealth || null,
    walletAgeAnalysis: walletAgeAnalysis || null,
    distributionPattern: bscDistributionData || null,
    onchainVerification: onchainVerifyData || null,
    socialAnalysis: socialAnalysisData || null,
    liquidityAnalysis: liquidityAnalysisData || null,
    githubActivity: githubData || null,
    whitepaperContent: (whitepaperData?.found && whitepaperData?.content) ? whitepaperData : null,
    pulseFeed: pulseFeedData.length > 0 ? pulseFeedData : null,
    webSecurity: webSecurityData || null,
    priceHistory7d: priceHistory7d.length > 0 ? priceHistory7d : null,
    certikData: certikData || null,
    compliance: complianceData,
    dorphinAnalysis,
    twitterActivity: twitterActivity || null,
  };
}

module.exports = { aggregateTokenData };
