const DEXSCREENER_BASE = 'https://api.dexscreener.com';

async function fetchNewTokens() {
  try {
    // 신규 토큰 부스트 목록
    const res = await fetch(
      `${DEXSCREENER_BASE}/token-boosts/latest/v1`,
      { signal: AbortSignal.timeout(10000) }
    );
    const boosts = await res.json();
    
    // 토큰 프로파일 목록
    const res2 = await fetch(
      `${DEXSCREENER_BASE}/token-profiles/latest/v1`,
      { signal: AbortSignal.timeout(10000) }
    );
    const profiles = await res2.json();
    
    // BSC 체인만 필터
    const bscTokens = [
      ...(Array.isArray(boosts) ? boosts : []),
      ...(Array.isArray(profiles) ? profiles : [])
    ].filter(t => t.chainId === 'bsc');
    
    console.log('[NewListings] BSC tokens found:', bscTokens.length);
    return bscTokens;
  } catch(e) {
    console.error('[NewListings] fetchNewTokens error:', e.message);
    return [];
  }
}

async function fetchTokenPairData(tokenAddress) {
  try {
    const res = await fetch(
      `${DEXSCREENER_BASE}/latest/dex/tokens/${tokenAddress}`,
      { signal: AbortSignal.timeout(8000) }
    );
    const data = await res.json();
    return data.pairs?.[0] || null;
  } catch(e) {
    return null;
  }
}

module.exports = {
  fetchNewTokens,
  fetchTokenPairData
};
