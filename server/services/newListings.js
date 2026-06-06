const listings = new Map();

async function scanNewListings() {
  try {
    const res = await fetch(
      'https://api.dexscreener.com/token-profiles/latest/v1',
      { signal: AbortSignal.timeout(10000) }
    );
    if (!res.ok) throw new Error(`DexScreener ${res.status}`);
    const data = await res.json();

    // token-profiles gives us the latest tokens; fall back to pairs search
    // Try the pairs/search endpoint for recently-created BSC pairs
    const pairsRes = await fetch(
      'https://api.dexscreener.com/latest/dex/search?q=BSC',
      { signal: AbortSignal.timeout(10000) }
    );
    const pairsData = pairsRes.ok ? await pairsRes.json() : { pairs: [] };
    const pairs = (pairsData.pairs || []).filter(p => p.chainId === 'bsc' && p.pairCreatedAt);

    const now = Date.now();

    for (const pair of pairs) {
      const ageHours = (now - pair.pairCreatedAt) / (1000 * 60 * 60);
      if (ageHours > 24) continue;

      const addr = pair.baseToken?.address?.toLowerCase();
      if (!addr || listings.has(addr)) continue;

      const liquidity = pair.liquidity?.usd || 0;
      if (liquidity < 1000) continue;

      const volume24h = pair.volume?.h24 || 0;
      const buys = pair.txns?.h24?.buys || 0;
      const sells = pair.txns?.h24?.sells || 0;
      const priceChange = pair.priceChange?.h24 || 0;
      const isRugPattern = priceChange < -80 && ageHours < 24;

      let riskScore = 50;
      if (liquidity > 100000) riskScore += 20;
      else if (liquidity > 50000) riskScore += 10;
      else if (liquidity < 5000) riskScore -= 20;
      if (volume24h > 500000) riskScore += 10;
      if (buys > 0 && sells > buys * 2) riskScore -= 15;
      if (isRugPattern) riskScore -= 40;
      riskScore = Math.max(0, Math.min(100, riskScore));

      listings.set(addr, {
        address: addr,
        name: pair.baseToken?.name || '—',
        symbol: pair.baseToken?.symbol || '—',
        chain: 'bsc',
        pairAddress: pair.pairAddress || null,
        dexId: pair.dexId || null,
        liquidity,
        volume24h,
        priceUsd: pair.priceUsd || null,
        priceChange24h: priceChange,
        buys,
        sells,
        ageHours: Math.round(ageHours * 10) / 10,
        pairCreatedAt: pair.pairCreatedAt,
        riskScore,
        riskLevel: riskScore >= 60 ? 'SAFE' : riskScore >= 40 ? 'CAUTION' : 'DANGER',
        isRugPattern,
        detectedAt: now,
      });
    }

    // Remove entries older than 48 hours
    for (const [addr, token] of listings) {
      if (now - token.detectedAt > 48 * 60 * 60 * 1000) {
        listings.delete(addr);
      }
    }

    console.log(`[NewListings] ${listings.size} tokens tracked`);
  } catch (e) {
    console.error('[NewListings] scan failed:', e.message);
  }
}

function getListings(filter = 'all') {
  const all = Array.from(listings.values())
    .sort((a, b) => b.detectedAt - a.detectedAt);
  if (filter === 'safe')    return all.filter(t => t.riskLevel === 'SAFE');
  if (filter === 'caution') return all.filter(t => t.riskLevel === 'CAUTION');
  if (filter === 'danger')  return all.filter(t => t.riskLevel === 'DANGER');
  return all;
}

// Scan every 5 minutes; initial scan at module load
setInterval(scanNewListings, 5 * 60 * 1000);
scanNewListings();

module.exports = { getListings, scanNewListings };
