// key: "YYYY-MM-DD" (UTC), value: Map(address → tokenData)
const listingsByDate = new Map();

// getDateKey always uses UTC so it matches ISO date strings
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

// Multiple queries for broader BSC pair coverage — deduped by pairAddress
const SEARCH_QUERIES = ['BSC', 'pancakeswap', 'bnb token', 'bsc swap'];

async function fetchBscPairs() {
  const results = await Promise.allSettled(
    SEARCH_QUERIES.map(q =>
      fetch(
        `https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(q)}`,
        {
          signal: AbortSignal.timeout(10000),
          headers: { 'User-Agent': 'Mozilla/5.0' },
        }
      )
        .then(r => { if (!r.ok) throw new Error(`${r.status}`); return r.json(); })
        .then(data => (data.pairs || []).filter(p => p.chainId === 'bsc' && p.pairCreatedAt))
    )
  );

  const seen = new Set();
  const pairs = [];
  let errors = 0;
  for (const result of results) {
    if (result.status === 'fulfilled') {
      for (const pair of result.value) {
        const key = (pair.pairAddress || pair.baseToken?.address || '').toLowerCase();
        if (key && !seen.has(key)) {
          seen.add(key);
          pairs.push(pair);
        }
      }
    } else {
      errors++;
    }
  }

  const dateMap = {};
  for (const p of pairs) {
    const d = getDateKey(p.pairCreatedAt);
    dateMap[d] = (dateMap[d] || 0) + 1;
  }
  console.log(`[NewListings] fetchBscPairs: ${pairs.length} unique BSC pairs (${errors} query errors), dates:`, dateMap);
  return pairs;
}

async function scanNewListings() {
  try {
    const pairs = await fetchBscPairs();
    const now = Date.now();
    let stored = 0;

    for (const pair of pairs) {
      const ageHours = (now - pair.pairCreatedAt) / (1000 * 60 * 60);
      // 48h window: captures both today and yesterday
      if (ageHours > 48) continue;
      const before = listingsByDate.get(getDateKey(pair.pairCreatedAt))?.size ?? 0;
      processAndStorePair(pair, now);
      const after = listingsByDate.get(getDateKey(pair.pairCreatedAt))?.size ?? 0;
      if (after > before) stored++;
    }

    // Remove buckets older than 7 days
    const cutoff = getDateKey(now - 7 * 24 * 60 * 60 * 1000);
    for (const dateKey of listingsByDate.keys()) {
      if (dateKey < cutoff) listingsByDate.delete(dateKey);
    }

    const summary = Array.from(listingsByDate.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([d, m]) => `${d}(${m.size})`)
      .join(', ');
    console.log(`[NewListings] scan: stored ${stored} new pairs | listingsByDate: ${summary || 'empty'}`);
  } catch (e) {
    console.error('[NewListings] scan failed:', e.message);
  }
}

async function loadHistoricalData(dateStr) {
  try {
    console.log(`[NewListings] loadHistoricalData(${dateStr}) starting...`);
    const pairs = await fetchBscPairs();
    console.log(`[NewListings] loadHistoricalData(${dateStr}): ${pairs.length} pairs fetched`);

    const now = Date.now();
    let count = 0;

    // Use UTC date matching (consistent with getDateKey)
    for (const pair of pairs) {
      const pairDateKey = getDateKey(pair.pairCreatedAt);
      if (pairDateKey === dateStr) {
        processAndStorePair(pair, now);
        count++;
      }
    }

    console.log(`[NewListings] loadHistoricalData(${dateStr}): ${count} pairs matched date`);

    // Fallback: if no exact date match, seed the bucket with the 30 most recent pairs
    if (count === 0) {
      const recent = pairs
        .slice()
        .sort((a, b) => b.pairCreatedAt - a.pairCreatedAt)
        .slice(0, 30);
      for (const pair of recent) {
        processAndStorePair(pair, now, dateStr);
      }
      console.log(`[NewListings] loadHistoricalData(${dateStr}): fallback — seeded ${recent.length} recent pairs`);
    }

    const summary = Array.from(listingsByDate.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([d, m]) => `${d}(${m.size})`)
      .join(', ');
    console.log(`[NewListings] listingsByDate after historical load: ${summary}`);
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

// Scan every 5 minutes; load yesterday on startup
setInterval(scanNewListings, 5 * 60 * 1000);
scanNewListings();

const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
loadHistoricalData(yesterday.toISOString().split('T')[0]);

module.exports = { getListings, getAvailableDates, scanNewListings, loadHistoricalData };
