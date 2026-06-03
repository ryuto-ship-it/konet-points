const BASE_URL = 'https://api.dexscreener.com/latest/dex';

async function getPairData(contractAddress) {
  try {
    const res = await fetch(`${BASE_URL}/tokens/${contractAddress}`);
    if (!res.ok) return null;
    const data = await res.json();
    const pair = data.pairs?.[0];
    if (!pair) return null;
    
    const buys24h = pair.txns?.h24?.buys ?? 0;
    const sells24h = pair.txns?.h24?.sells ?? 0;
    const totalTxns = buys24h + sells24h;
    const sellRatio = totalTxns > 0 ? parseFloat((sells24h / totalTxns * 100).toFixed(1)) : null;

    const volume24h = pair.volume?.h24 ?? 0;
    const volumeH6 = pair.volume?.h6 ?? null;
    const volumeH1 = pair.volume?.h1 ?? null;

    return {
      dexId: pair.dexId,
      pairAddress: pair.pairAddress,
      priceUsd: pair.priceUsd,
      volume24h,
      volumeH6,
      volumeH1,
      priceChange24h: pair.priceChange?.h24,
      priceChangeH6: pair.priceChange?.h6 ?? null,
      priceChangeH1: pair.priceChange?.h1 ?? null,
      liquidity: pair.liquidity?.usd,
      fdv: pair.fdv,
      pairCreatedAt: pair.pairCreatedAt,
      buys24h,
      sells24h,
      sellRatio,
      info: {
        websites: pair.info?.websites,
        socials: pair.info?.socials,
        description: pair.info?.description,
      },
    };
  } catch (err) {
    console.error(`[DexScreener] getPairData failed: ${err.message}`);
    return null;
  }
}

module.exports = { getPairData };
