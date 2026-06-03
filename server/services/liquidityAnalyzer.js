async function analyzeLiquidity(contractAddress) {
  try {
    const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${contractAddress}`);
    if (!res.ok) return null;
    const data = await res.json();
    const pairs = data.pairs || [];
    if (!pairs.length) return null;

    const mainPair = pairs[0];
    const volume24h = mainPair.volume?.h24 || 0;
    const liquidity = mainPair.liquidity?.usd || 0;
    const marketCap = mainPair.marketCap || 0;

    const volMcapRatio = marketCap > 0 ? parseFloat((volume24h / marketCap * 100).toFixed(2)) : 0;
    const volLiqRatio = liquidity > 0 ? parseFloat((volume24h / liquidity).toFixed(2)) : 0;

    const buys = mainPair.txns?.h24?.buys || 0;
    const sells = mainPair.txns?.h24?.sells || 0;
    const totalTxns = buys + sells;
    const sellRatio = totalTxns > 0 ? parseFloat((sells / totalTxns * 100).toFixed(1)) : 50;

    const pairAge = mainPair.pairCreatedAt
      ? Math.floor((Date.now() - mainPair.pairCreatedAt) / (1000 * 60 * 60 * 24))
      : null;

    return {
      liquidity,
      volume24h,
      volMcapRatio,
      volLiqRatio,
      buys,
      sells,
      sellRatio,
      pairAgeInDays: pairAge,
      isNewPair: pairAge !== null && pairAge < 30,
      isWashTradingSuspect: volLiqRatio > 50,
      liquidityHealth: liquidity >= 500000 ? 'STRONG'
        : liquidity >= 100000 ? 'MODERATE'
        : liquidity >= 10000 ? 'WEAK'
        : 'CRITICAL',
    };
  } catch (err) {
    console.error(`[LiquidityAnalyzer] failed: ${err.message}`);
    return null;
  }
}

module.exports = { analyzeLiquidity };
