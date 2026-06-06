const DEXSCREENER = 'https://api.dexscreener.com';

function calculateRisk(pair) {
  const liquidity   = pair.liquidity?.usd || 0;
  const volume24h   = pair.volume?.h24 || 0;
  const priceChange = pair.priceChange?.h24 || 0;
  const buys        = pair.txns?.h24?.buys || 0;
  const sells       = pair.txns?.h24?.sells || 0;
  const ageHours    = pair.pairCreatedAt
    ? (Date.now() - pair.pairCreatedAt) / (1000 * 60 * 60)
    : 999;

  let score = 50;

  if (liquidity >= 100000)     score += 20;
  else if (liquidity >= 50000) score += 10;
  else if (liquidity >= 10000) score += 5;
  else if (liquidity < 2000)   score -= 20;

  if (volume24h >= 500000)     score += 15;
  else if (volume24h >= 100000) score += 8;
  else if (volume24h < 5000)   score -= 10;

  const totalTxns = buys + sells;
  if (totalTxns > 0) {
    const sellRatio = sells / totalTxns;
    if (sellRatio > 0.7)      score -= 20;
    else if (sellRatio > 0.6) score -= 10;
  }

  if (priceChange < -80 && ageHours < 24)  score -= 35;
  else if (priceChange < -50 && ageHours < 48) score -= 20;

  if (liquidity > 0 && volume24h / liquidity > 50) score -= 15;

  score = Math.max(0, Math.min(100, score));
  return {
    score,
    riskLevel: score >= 60 ? 'SAFE' : score >= 40 ? 'CAUTION' : 'DANGER',
  };
}

function processPair(pair) {
  if (!pair?.baseToken?.address) return null;

  const liquidity = pair.liquidity?.usd || 0;
  const volume24h = pair.volume?.h24 || 0;

  if (liquidity < 500) return null;

  const { score, riskLevel } = calculateRisk(pair);
  const ageHours = pair.pairCreatedAt
    ? (Date.now() - pair.pairCreatedAt) / (1000 * 60 * 60)
    : null;

  return {
    address:       pair.baseToken.address,
    name:          pair.baseToken.name || 'Unknown',
    symbol:        pair.baseToken.symbol || '???',
    chain:         pair.chainId || 'bsc',
    dexId:         pair.dexId,
    pairAddress:   pair.pairAddress,
    logoUrl:       pair.info?.imageUrl || null,
    liquidity,
    volume24h,
    priceUsd:      pair.priceUsd,
    priceChange24h: pair.priceChange?.h24 || 0,
    buys:          pair.txns?.h24?.buys || 0,
    sells:         pair.txns?.h24?.sells || 0,
    ageHours:      ageHours != null ? Math.round(ageHours * 10) / 10 : null,
    ageDisplay:    ageHours != null
      ? ageHours < 1    ? `${Math.round(ageHours * 60)}분 전`
        : ageHours < 24 ? `${Math.round(ageHours)}시간 전`
        : `${Math.floor(ageHours / 24)}일 전`
      : '알 수 없음',
    pairCreatedAt:   pair.pairCreatedAt,
    pairCreatedDate: pair.pairCreatedAt
      ? new Date(pair.pairCreatedAt).toISOString().split('T')[0]
      : null,
    riskScore: score,
    riskLevel,
    dexUrl: pair.url,
  };
}

async function fetchLatestTokens(filter = 'all') {
  const addresses = [];
  const seen = new Set();

  // token-profiles (newest listings) — accept any chain
  try {
    const res = await fetch(
      `${DEXSCREENER}/token-profiles/latest/v1`,
      { signal: AbortSignal.timeout(8000) }
    );
    const data = await res.json();
    if (Array.isArray(data)) {
      for (const t of data.filter(t => t.tokenAddress).slice(0, 20)) {
        const key = `${t.chainId}:${t.tokenAddress}`;
        if (!seen.has(key)) {
          seen.add(key);
          addresses.push({ chainId: t.chainId, address: t.tokenAddress });
        }
      }
    }
  } catch (e) {
    console.error('[Listings] profiles error:', e.message);
  }

  // token-boosts (trending/boosted) — accept any chain
  try {
    const res = await fetch(
      `${DEXSCREENER}/token-boosts/latest/v1`,
      { signal: AbortSignal.timeout(8000) }
    );
    const data = await res.json();
    if (Array.isArray(data)) {
      for (const t of data.filter(t => t.tokenAddress).slice(0, 15)) {
        const key = `${t.chainId}:${t.tokenAddress}`;
        if (!seen.has(key)) {
          seen.add(key);
          addresses.push({ chainId: t.chainId, address: t.tokenAddress });
        }
      }
    }
  } catch (e) {
    console.error('[Listings] boosts error:', e.message);
  }

  console.log(`[Listings] Fetching pair data for ${Math.min(addresses.length, 15)} tokens (${addresses.length} found)`);

  const pairResults = await Promise.allSettled(
    addresses.slice(0, 15).map(async ({ chainId, address }) => {
      try {
        const res = await fetch(
          `${DEXSCREENER}/latest/dex/tokens/${address}`,
          { signal: AbortSignal.timeout(6000) }
        );
        const data = await res.json();
        const pair = data.pairs?.[0];
        return pair ? processPair(pair) : null;
      } catch {
        return null;
      }
    })
  );

  let tokens = pairResults
    .filter(r => r.status === 'fulfilled' && r.value)
    .map(r => r.value)
    .sort((a, b) => (b.pairCreatedAt || 0) - (a.pairCreatedAt || 0));

  if (filter === 'safe')    tokens = tokens.filter(t => t.riskLevel === 'SAFE');
  else if (filter === 'caution') tokens = tokens.filter(t => t.riskLevel === 'CAUTION');
  else if (filter === 'danger')  tokens = tokens.filter(t => t.riskLevel === 'DANGER');

  return tokens;
}

async function fetchTokensByDate(dateStr, filter = 'all') {
  // /latest/dex/pairs/bsc is unreliable — fall back to latest with date note
  console.log(`[Listings] Date filter requested (${dateStr}), using latest tokens`);
  return fetchLatestTokens(filter);
}

module.exports = { fetchLatestTokens, fetchTokensByDate };
