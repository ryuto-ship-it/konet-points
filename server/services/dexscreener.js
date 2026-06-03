const BASE_URL = 'https://api.dexscreener.com/latest/dex';

async function getPairData(contractAddress) {
  try {
    const res = await fetch(`${BASE_URL}/tokens/${contractAddress}`);
    if (!res.ok) return null;
    const data = await res.json();
    const pair = data.pairs?.[0];
    if (!pair) return null;
    
    return {
      dexId: pair.dexId,
      pairAddress: pair.pairAddress,
      priceUsd: pair.priceUsd,
      volume24h: pair.volume?.h24,
      priceChange24h: pair.priceChange?.h24,
      liquidity: pair.liquidity?.usd,
      fdv: pair.fdv,
      pairCreatedAt: pair.pairCreatedAt,
      buys24h: pair.txns?.h24?.buys,
      sells24h: pair.txns?.h24?.sells,
      info: {
        websites: pair.info?.websites,
        socials: pair.info?.socials,
        description: pair.info?.description
      }
    };
  } catch (err) {
    console.error(`[DexScreener] getPairData failed: ${err.message}`);
    return null;
  }
}

module.exports = { getPairData };
