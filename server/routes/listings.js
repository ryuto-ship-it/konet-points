const express = require('express');
const router = express.Router();

const DEXSCREENER_BASE = 'https://api.dexscreener.com';

async function getNewListings() {
  try {
    // 최신 토큰 프로파일 가져오기
    const [profilesRes, boostsRes] = await Promise.allSettled([
      fetch(`${DEXSCREENER_BASE}/token-profiles/latest/v1`),
      fetch(`${DEXSCREENER_BASE}/token-boosts/latest/v1`)
    ]);
    
    const results = [];
    
    if (profilesRes.status === 'fulfilled') {
      const data = await profilesRes.value.json();
      if (Array.isArray(data)) results.push(...data);
    }
    
    if (boostsRes.status === 'fulfilled') {
      const data = await boostsRes.value.json();
      if (Array.isArray(data)) results.push(...data);
    }
    
    // BSC만, 중복 제거
    const seen = new Set();
    const bscTokens = results
      .filter(t => t.chainId === 'bsc' && t.tokenAddress)
      .filter(t => {
        if (seen.has(t.tokenAddress)) return false;
        seen.add(t.tokenAddress);
        return true;
      })
      .slice(0, 30); // 최대 30개
    
    console.log('[Listings] BSC tokens:', bscTokens.length);
    
    // 각 토큰 페어 데이터 가져오기 (병렬, 최대 10개)
    const pairDataList = await Promise.allSettled(
      bscTokens.slice(0, 10).map(async token => {
        const res = await fetch(
          `${DEXSCREENER_BASE}/latest/dex/tokens/${token.tokenAddress}`,
          { signal: AbortSignal.timeout(5000) }
        );
        const data = await res.json();
        const pair = data.pairs?.[0];
        if (!pair) return null;
        
        const liquidity = pair.liquidity?.usd || 0;
        const volume24h = pair.volume?.h24 || 0;
        const priceChange = pair.priceChange?.h24 || 0;
        const buys = pair.txns?.h24?.buys || 0;
        const sells = pair.txns?.h24?.sells || 0;
        const ageHours = pair.pairCreatedAt 
          ? (Date.now() - pair.pairCreatedAt) / (1000*60*60)
          : 0;
        
        // 리스크 점수
        let riskScore = 50;
        if (liquidity > 100000) riskScore += 20;
        else if (liquidity > 50000) riskScore += 10;
        else if (liquidity < 5000) riskScore -= 20;
        if (volume24h > 500000) riskScore += 10;
        if (sells > buys * 2) riskScore -= 15;
        if (priceChange < -80 && ageHours < 24) riskScore -= 30;
        riskScore = Math.max(0, Math.min(100, riskScore));
        
        return {
          address: token.tokenAddress,
          name: pair.baseToken?.name || token.description || 'Unknown',
          symbol: pair.baseToken?.symbol || '???',
          logoUrl: token.icon || null,
          chain: 'bsc',
          liquidity,
          volume24h,
          priceUsd: pair.priceUsd,
          priceChange24h: priceChange,
          buys,
          sells,
          ageHours: Math.round(ageHours * 10) / 10,
          pairCreatedAt: pair.pairCreatedAt,
          riskScore,
          riskLevel: riskScore >= 60 ? 'SAFE' :
                     riskScore >= 40 ? 'CAUTION' : 'DANGER',
          dexUrl: pair.url,
          detectedAt: Date.now()
        };
      })
    );
    
    return pairDataList
      .filter(r => r.status === 'fulfilled' && r.value)
      .map(r => r.value);
      
  } catch(e) {
    console.error('[Listings] error:', e.message);
    return [];
  }
}

router.get('/', async (req, res) => {
  try {
    const filter = req.query.filter || 'all';
    
    let listings = await getNewListings();
    
    // 필터 적용
    if (filter === 'safe') 
      listings = listings.filter(t => t.riskLevel === 'SAFE');
    else if (filter === 'caution') 
      listings = listings.filter(t => t.riskLevel === 'CAUTION');
    else if (filter === 'danger') 
      listings = listings.filter(t => t.riskLevel === 'DANGER');
    
    res.json({
      listings,
      total: listings.length,
      lastUpdated: new Date().toISOString()
    });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
