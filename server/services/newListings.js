// key: "YYYY-MM-DD", value: Map(address → tokenData)
const listingsByDate = new Map();

function getDateKey(timestamp) {
  return new Date(timestamp).toISOString().split('T')[0];
}

function calcRisk(pair, ageHours) {
  const liquidity = pair.liquidity?.usd || 0;
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

  return { liquidity, volume24h, buys, sells, priceChange, isRugPattern, riskScore };
}

// forceDateKey: override which date bucket to store in (for historical loading)
function processAndStorePair(pair, now = Date.now(), forceDateKey = null) {
  const addr = pair.baseToken?.address?.toLowerCase();
  if (!addr) return;

  const pairCreatedAt = pair.pairCreatedAt;
  if (!pairCreatedAt) return;

  const dateKey = forceDateKey || getDateKey(pairCreatedAt);
  const ts = typeof now === 'number' ? now : Date.now();
  const ageHours = (ts - pairCreatedAt) / (1000 * 60 * 60);

  const dateMap = listingsByDate.get(dateKey);
  if (dateMap?.has(addr)) return;

  const { liquidity, volume24h, buys, sells, priceChange, isRugPattern, riskScore } = calcRisk(pair, ageHours);
  if (liquidity < 1000) return;

  if (!listingsByDate.has(dateKey)) {
    listingsByDate.set(dateKey, new Map());
  }

  listingsByDate.get(dateKey).set(addr, {
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
    pairCreatedAt,
    riskScore,
    riskLevel: riskScore >= 60 ? 'SAFE' : riskScore >= 40 ? 'CAUTION' : 'DANGER',
    isRugPattern,
    detectedAt: ts,
  });
}

async function fetchBscPairs() {
  const pairsRes = await fetch(
    'https://api.dexscreener.com/latest/dex/search?q=BSC',
    { signal: AbortSignal.timeout(10000) }
  );
  if (!pairsRes.ok) throw new Error(`DexScreener ${pairsRes.status}`);
  const data = await pairsRes.json();
  return (data.pairs || []).filter(p => p.chainId === 'bsc' && p.pairCreatedAt);
}

async function scanNewListings() {
  try {
    const pairs = await fetchBscPairs();
    const now = Date.now();

    for (const pair of pairs) {
      const ageHours = (now - pair.pairCreatedAt) / (1000 * 60 * 60);
      if (ageHours > 24) continue;
      processAndStorePair(pair, now);
    }

    // Remove date buckets older than 7 days
    const cutoff = getDateKey(now - 7 * 24 * 60 * 60 * 1000);
    for (const dateKey of listingsByDate.keys()) {
      if (dateKey < cutoff) listingsByDate.delete(dateKey);
    }

    const total = Array.from(listingsByDate.values()).reduce((s, m) => s + m.size, 0);
    console.log(`[NewListings] ${total} tokens across ${listingsByDate.size} dates`);
  } catch (e) {
    console.error('[NewListings] scan failed:', e.message);
  }
}

async function loadHistoricalData(dateStr) {
  try {
    const res = await fetch(
      'https://api.dexscreener.com/latest/dex/pairs/bsc',
      { signal: AbortSignal.timeout(15000) }
    );
    if (!res.ok) throw new Error(`DexScreener pairs ${res.status}`);
    const data = await res.json();
    const pairs = (data.pairs || []).filter(p => p.pairCreatedAt);

    // KST 기준 날짜 범위 (UTC+9)
    const targetDate = new Date(dateStr + 'T00:00:00+09:00');
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);
    const now = Date.now();

    let count = 0;
    for (const pair of pairs) {
      const created = new Date(pair.pairCreatedAt);
      if (created >= targetDate && created < nextDate) {
        processAndStorePair(pair, now);
        count++;
      }
    }

    // 날짜 범위 내 데이터 없으면 최근 50개라도 해당 날짜 버킷에 저장
    if (count === 0) {
      console.log(`[NewListings] No pairs for ${dateStr}, storing recent 50 under that date`);
      const recent = pairs
        .sort((a, b) => b.pairCreatedAt - a.pairCreatedAt)
        .slice(0, 50);
      for (const pair of recent) {
        processAndStorePair(pair, now, dateStr);
      }
    }

    console.log(`[NewListings] Historical load ${dateStr}: ${count} pairs`);
  } catch (e) {
    console.error('[NewListings] historical load failed:', e.message);
  }
}

function getListings(filter = 'all', date = null) {
  let tokens;

  if (date) {
    const dateMap = listingsByDate.get(date);
    tokens = dateMap ? Array.from(dateMap.values()) : [];
  } else {
    tokens = [];
    for (const dateMap of listingsByDate.values()) {
      for (const t of dateMap.values()) tokens.push(t);
    }
  }

  tokens = tokens.sort((a, b) => b.pairCreatedAt - a.pairCreatedAt);

  if (filter === 'safe')    return tokens.filter(t => t.riskLevel === 'SAFE');
  if (filter === 'caution') return tokens.filter(t => t.riskLevel === 'CAUTION');
  if (filter === 'danger')  return tokens.filter(t => t.riskLevel === 'DANGER');
  return tokens;
}

function getAvailableDates() {
  const today = new Date().toISOString().split('T')[0];

  const dates = Array.from(listingsByDate.keys())
    .filter(date => {
      const map = listingsByDate.get(date);
      return map && map.size > 0;
    })
    .sort()
    .reverse();

  // 오늘은 데이터 없어도 항상 포함
  if (!dates.includes(today)) dates.unshift(today);

  return dates.map(date => ({
    date,
    count: listingsByDate.get(date)?.size ?? 0,
  }));
}

// Scan every 5 minutes; load today + yesterday on startup
setInterval(scanNewListings, 5 * 60 * 1000);
scanNewListings();

const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
const yesterdayStr = yesterday.toISOString().split('T')[0];
loadHistoricalData(yesterdayStr);

module.exports = { getListings, getAvailableDates, scanNewListings, loadHistoricalData };
