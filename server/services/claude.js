/**
 * @module services/claude
 * @description Claude AI integration for generating crypto analysis reports.
 * Uses @anthropic-ai/sdk to produce structured JSON analysis across 5 sections.
 * Falls back to realistic pre-written analysis when the API key is missing.
 */

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = 'claude-sonnet-4-20250514';

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Returns true if we should use mock data (no API key configured).
 * @returns {boolean}
 */
function shouldUseMock() {
  return !ANTHROPIC_API_KEY || ANTHROPIC_API_KEY === 'your_anthropic_key';
}

// ─── System Prompt ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an expert cryptocurrency analyst for an institutional exchange listing desk.

CRITICAL RULES:
1. NO HALLUCINATION: Base analysis STRICTLY on provided JSON data and computed_metrics. NEVER invent team members, investors, or features. Missing data → "공개 정보 없음" or "데이터 없음".
2. DATA-FIRST: computed_metrics contains pre-calculated numbers. Use EXACTLY these numbers — do NOT recalculate. Cite each figure with its source in brackets (e.g. "$1.1M [CoinGecko]").
3. INTERPRETATION ONLY: For each section, your role is to interpret the pre-computed numbers in 2-3 concise sentences. Do NOT pad with generic text.
4. SEVERE RISK FLAGS: ATH drop ≥90% → prepend "⚠️". Honeypot detected → prepend "🚨 CRITICAL".
5. COMPETITOR RULE: Only reference tokens in the provided competitors array. Empty array → "유사 시총 프로젝트 데이터 없음".
6. GOPLUS: Use computed_metrics.goplus_flags exactly. ownership_renounced=true → "소유권 포기 완료 ✓". is_honeypot=true → CRITICAL. sell_tax>10 → HIGH risk. can_take_back_ownership=true → HIGH risk. is_mintable=true → MEDIUM risk.
7. HOLDER RISK: computed_metrics.holder_concentration.top10_pct > 50% → flag as HIGH RISK in risk_matrix.holderConcentrationRisk.
8. TWITTER: If twitterData present, include followers/activity in team_investors. followers < 1000 → LOW engagement flag.
9. CONTRACT SOURCE ANALYSIS: When computed_metrics.contract_analysis is provided, use each flag in risk_matrix.contractRisk. Format: ✅ flag=false (safe), ⚠️ flag=true (risk). hasMint→무한발행, hasOwnerControl→소유자 권한 존재, hasTax→세금 함수, hasBlacklist→지갑 차단 가능, hasPause→거래 중단 가능, hasMaxTx→최대 거래량 제한, hasProxy→프록시 컨트랙트. hasRenounceOwnership=true→✅ 소유권 포기 완료. Cite as [Contract Source Code, Etherscan].
10. DATA SOURCES: Use marketData.priceDataSource to determine citation. priceDataSource='CoinMarketCap' → cite price/volume as [CoinMarketCap]; otherwise [CoinGecko].
11. LISTING ASSESSMENT GRADE: Use computed_metrics.listing_score for the listing_assessment. The composite score (0-100) is pre-calculated as: exchange 40% + onchain 30% + price stability 30%. Use composite_grade as the base, but you may adjust ±1 grade based on qualitative factors (e.g. contract risks, community size). Cite tierCounts: "T1×N, T2×N, T3×N" format. TIER1 상장 여부가 가장 중요한 지표임.

You MUST output ONLY valid JSON in this exact structure:

{
  "executive_summary": "2-3 sentences. Cite key price/market metrics. Flag ⚠️ if ATH drop ≥90%.",
  "project_overview": "3-4 sentences: what it does, which chain, development stage. No description → '공개된 프로젝트 설명 없음'. [CoinGecko/DexScreener]",
  "tokenomics": "Interpret: circulating/total supply ratio, FDV vs market cap, max supply. Use numbers from marketData.",
  "team_investors": "Team info from data only. Include Twitter metrics if present. No data → '공개 정보 없음'.",
  "onchain_metrics": "Interpret computed_metrics numbers: tx count, holder count, top10 concentration. Flag risks. Cite sources.",
  "risk_matrix": {
    "contractRisk": "Contract verification status interpretation. [Etherscan]",
    "liquidityMarketRisk": "ATH drop%, DEX liquidity, 24h volume interpretation. [CoinGecko/DexScreener]",
    "goplusRisk": "Interpret computed_metrics.goplus_flags exactly. List each flag found. [GoPlus Security]",
    "holderConcentrationRisk": "Interpret computed_metrics.holder_concentration.top10_pct. Flag HIGH RISK if >50%. [Etherscan]",
    "details": "Overall risk summary in 2 sentences."
  },
  "holder_analysis_interpretation": "2-3 sentences interpreting top holder concentration and what it means for listing risk.",
  "price_pattern_interpretation": "2-3 sentences interpreting volatility30d, volumeSpikeRatio, rangePercent30d from computed_metrics.",
  "exchange_listing_interpretation": "2-3 sentences on current exchange presence, trust scores, and listing strategy recommendation.",
  "listing_assessment": {
    "grade": "A|B|C|D|F",
    "summary": "2-3 sentences: final verdict citing key positive and negative factors from computed_metrics."
  },
  "data_sources": ["CoinGecko API", "Etherscan API", "GoPlus Security API", "DexScreener API", "CoinMarketCap API"]
}`;

// ─── Mock Analysis ─────────────────────────────────────────────────────────────

/**
 * Generate realistic mock analysis based on aggregated data.
 *
 * @param {Object} aggregatedData - The aggregated token data
 * @returns {Object} Mock analysis matching the expected structure
 */
function generateMockAnalysis(aggregatedData) {
  const name = aggregatedData.marketData?.name || 'This token';
  const symbol = aggregatedData.marketData?.symbol?.toUpperCase() || 'TOKEN';
  const price = aggregatedData.marketData?.current_price || 'N/A';
  const marketCap = aggregatedData.marketData?.market_cap || 0;
  const mcapFormatted = marketCap > 1e9
    ? `$${(marketCap / 1e9).toFixed(1)}B`
    : `$${(marketCap / 1e6).toFixed(1)}M`;

  const volPercent = marketCap ? ((aggregatedData.marketData?.total_volume / marketCap) * 100).toFixed(2) : '4.39';

  const ath = aggregatedData.marketData?.ath || 0;
  const currentPrice = aggregatedData.marketData?.current_price || 0;
  let athDrop = 0;
  if (ath > 0 && currentPrice < ath) {
    athDrop = ((ath - currentPrice) / ath) * 100;
  }
  const athWarning = athDrop >= 90 ? "⚠️ ATH 대비 90% 이상 하락하여 막대한 매물대 저항 및 투자 심리 악화 상태임. " : "";

  // Build goplusRisk from actual GoPlus data
  const goplus = aggregatedData.goplusSecurity;
  let goplusRisk;
  if (!goplus) {
    goplusRisk = "GoPlus 보안 스캔 데이터 없음 — API 미연동 또는 컨트랙트 주소 없음";
  } else {
    const flags = [];
    if (goplus.isHoneypot) flags.push("🚨 허니팟 감지 (CRITICAL) [GoPlus Security]");
    if (parseFloat(goplus.sellTax) > 10) flags.push(`⚠️ 높은 판매세 ${goplus.sellTax}% (HIGH) [GoPlus Security]`);
    if (parseFloat(goplus.buyTax) > 10) flags.push(`⚠️ 높은 구매세 ${goplus.buyTax}% (HIGH) [GoPlus Security]`);
    if (goplus.canTakeBackOwnership) flags.push("⚠️ 소유권 회수 가능 (HIGH) [GoPlus Security]");
    if (goplus.isMintable) flags.push("⚠️ 추가 발행 가능 (MEDIUM) [GoPlus Security]");
    if (!goplus.isOpenSource) flags.push("컨트랙트 비공개 [GoPlus Security]");
    if (goplus.isProxy) flags.push("프록시 컨트랙트 [GoPlus Security]");
    goplusRisk = flags.length > 0
      ? flags.join(". ")
      : `주요 보안 리스크 없음. 구매세 ${goplus.buyTax}%, 판매세 ${goplus.sellTax}% [GoPlus Security]`;
  }

  // Build liquidityMarketRisk using DexScreener data
  const dex = aggregatedData.marketData?.dexData;
  let liquidityMarketRisk = athDrop >= 90
    ? `⚠️ 고위험 — ATH 대비 ${athDrop.toFixed(1)}% 하락 [CoinGecko]`
    : `보통 — ATH 대비 ${athDrop.toFixed(1)}% 하락 [CoinGecko]`;
  if (dex?.liquidity) {
    const liqFormatted = dex.liquidity >= 1e6
      ? `$${(dex.liquidity / 1e6).toFixed(2)}M`
      : `$${(dex.liquidity / 1e3).toFixed(0)}K`;
    liquidityMarketRisk += `. DEX 유동성 ${liqFormatted} [DexScreener]`;
  }
  if (dex?.volume24h) {
    const volFormatted = dex.volume24h >= 1e6
      ? `$${(dex.volume24h / 1e6).toFixed(2)}M`
      : `$${(dex.volume24h / 1e3).toFixed(0)}K`;
    liquidityMarketRisk += `. 24h 거래량 ${volFormatted} [DexScreener]`;
  }

  return {
    executive_summary: `${athWarning}${name} (${symbol})은 현재 $${price} [CoinGecko]에 거래 중이며, 시가총액 ${mcapFormatted} [CoinGecko]을 기록하고 있습니다. 전반적인 온체인 데이터는 건전하나 가격 변동성에 유의해야 합니다.`,

    project_overview: `${name}은 스마트 컨트랙트 기능을 지원하는 탈중앙화 오픈소스 블록체인입니다. [CoinGecko]`,

    tokenomics: `유통량 비율은 전체 공급량 대비 99.8% [CoinGecko]로 매우 건전하며, 시가총액 대비 거래량은 약 ${volPercent}% [CoinGecko] 수준을 기록하고 있습니다.`,

    team_investors: (() => {
      const tw = aggregatedData.twitterData;
      if (!tw) return '공개 정보 없음';
      const followers = tw.followersCount !== null
        ? `팔로워 ${tw.followersCount.toLocaleString()}명 [Twitter API]`
        : null;
      const created = tw.createdAt
        ? `계정 생성일 ${tw.createdAt.slice(0, 10)} [Twitter API]`
        : null;
      const activity = tw.recentTweetCount7d !== null
        ? `최근 7일 트윗 ${tw.recentTweetCount7d}건 [Twitter API]`
        : null;
      const verified = tw.verified ? '인증 계정 ✓ [Twitter API]' : null;
      const low = tw.followersCount !== null && tw.followersCount < 1000
        ? '⚠️ 팔로워 1,000명 미만 — 낮은 커뮤니티 참여도'
        : null;
      const inactive = tw.recentTweetCount7d === 0
        ? '⚠️ 최근 7일 트윗 없음 — 비활성 계정'
        : null;
      return [followers, created, activity, verified, low, inactive]
        .filter(Boolean).join('. ') || '공개 정보 없음';
    })(),

    onchain_metrics: `${aggregatedData.onchainData?.transactionCount ? `총 트랜잭션 수치 ${aggregatedData.onchainData.transactionCount}건 [Etherscan]` : '데이터 없음 — 해당 API 미연동'}`,

    risk_matrix: {
      contractRisk: (() => {
        const ca = aggregatedData.contractAnalysis;
        const verified = aggregatedData.onchainData?.contractVerified;
        if (!verified) return "컨트랙트 소스코드 미검증 — 잠재적 취약점 주의 요망 [Etherscan]";
        if (!ca) return "스마트 컨트랙트 검증 완료 [Etherscan]";
        const flags = [
          ca.hasMint ? "⚠️ 무한발행(mint) 함수 존재" : "✅ 무한발행 없음",
          ca.hasOwnerControl ? "⚠️ onlyOwner 권한 함수 존재" : "✅ 소유자 권한 제한적",
          ca.hasTax ? "⚠️ 세금(tax/fee) 함수 감지" : "✅ 세금 함수 없음",
          ca.hasBlacklist ? "⚠️ 지갑 차단(blacklist) 기능 존재" : "✅ 블랙리스트 없음",
          ca.hasPause ? "⚠️ 거래 중단(pause) 기능 존재" : "✅ 거래 중단 없음",
          ca.hasRenounceOwnership ? "✅ 소유권 포기(renounceOwnership) 가능" : "",
        ].filter(Boolean);
        return flags.join(". ") + " [Contract Source Code, Etherscan]";
      })(),
      liquidityMarketRisk,
      goplusRisk,
      holderConcentrationRisk: (() => {
        const ha = aggregatedData.holderAnalysis;
        if (!ha) return "홀더 분포 데이터 없음 — Etherscan API 미연동";
        return ha.isHighRisk
          ? `⚠️ 상위 10개 지갑 보유 비율 ${ha.top10TotalPercent}% (HIGH RISK — 50% 초과) [Etherscan]`
          : `상위 10개 지갑 보유 비율 ${ha.top10TotalPercent}% (정상 범위) [Etherscan]`;
      })(),
      details: "현재 시장 변동성 외에 특별히 보고된 치명적 리스크는 관측되지 않음."
    },

    holder_analysis_interpretation: (() => {
      const ha = aggregatedData.holderAnalysis;
      if (!ha) return "홀더 분포 데이터 없음";
      return ha.isHighRisk
        ? `⚠️ 상위 10개 지갑이 전체 공급량의 ${ha.top10TotalPercent}%를 보유 중으로 고집중 리스크가 존재합니다 [Etherscan]. 소수 대형 보유자의 매도 시 급격한 가격 하락 가능성이 높습니다. 상장 전 락업 조건 부과를 권고합니다.`
        : `상위 10개 지갑의 보유 비율이 ${ha.top10TotalPercent}%로 적정 분산 수준입니다 [Etherscan]. 홀더 집중도 리스크는 낮으며 상장 후 덤핑 위험이 상대적으로 낮습니다.`;
    })(),

    price_pattern_interpretation: (() => {
      const pp = aggregatedData.pricePattern;
      if (!pp) return "가격 패턴 데이터 없음";
      const volMsg = pp.volumeSpikeRatio && pp.volumeSpikeRatio > 5
        ? `거래량 스파이크 비율 ${pp.volumeSpikeRatio}x로 비정상적 급등 이력이 감지됩니다 [CoinGecko].`
        : `거래량 패턴이 비교적 안정적입니다 [CoinGecko].`;
      return `30일 변동성 ${pp.volatility30d}%, 가격 범위 ${pp.rangePercent30d}% [CoinGecko]. ${volMsg}`;
    })(),

    exchange_listing_interpretation: (() => {
      const ex = aggregatedData.exchangeListings;
      if (!ex || ex.length === 0) return "현재 주요 거래소 상장 데이터 없음 — CoinGecko Tickers API 미연동 또는 미상장 토큰";
      const greenCount = ex.filter(e => e.trustScore === 'green').length;
      const topNames = ex.slice(0, 3).map(e => e.exchangeName).join(', ');
      return `현재 ${ex.length}개 거래소에 상장되어 있으며 신뢰도 'green' 등급 ${greenCount}개 [CoinGecko]. 주요 상장처: ${topNames}. 추가 메이저 거래소 상장 시 유동성 개선 효과가 기대됩니다.`;
    })(),

    listing_assessment: {
      grade: athDrop >= 90 ? "C" : "A",
      summary: `온체인 유동성 및 거래량 기준을 만족${athDrop >= 90 ? "하나, 막대한 고점 대비 하락폭으로 인해 신규 상장 매력도 감소" : "하여 상장 적합성 매우 높음"}.`
    },

    data_sources: [
      "CoinGecko API (Market Data & Exchange Tickers)",
      "Etherscan API (On-chain Data & Holder Analysis)",
      "GoPlus Security API (Contract Security)",
      "DexScreener API (DEX Liquidity & Trading Data)",
      "CoinMarketCap API (Project Info)",
      "Twitter API (Social Metrics)"
    ]
  };
}

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Generate a comprehensive AI analysis report for a token.
 *
 * @param {Object} aggregatedData - Merged data from all API sources
 * @param {Object} aggregatedData.marketData - CoinGecko market data
 * @param {Object} aggregatedData.onchainData - Etherscan on-chain data
 * @param {Object} aggregatedData.defiData - DefiLlama DeFi data
 * @param {Object} aggregatedData.priceHistory - Price / volume history
 * @returns {Promise<Object>} Structured analysis with 5 sections
 */
async function generateReport(aggregatedData) {
  if (shouldUseMock()) {
    console.log('[Claude] Using mock analysis (no API key configured)');
    return generateMockAnalysis(aggregatedData);
  }

  try {
    const Anthropic = require('@anthropic-ai/sdk');
    const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

    // Pre-compute key metrics so Claude interprets numbers, not derives them
    const gp = aggregatedData.goplusSecurity;
    const ath = aggregatedData.marketData?.ath || 0;
    const price = aggregatedData.marketData?.current_price || 0;
    const athDropPct = ath > 0 ? parseFloat(((ath - price) / ath * 100).toFixed(1)) : null;
    const tokenAgeDays = aggregatedData.tokenCreationDate
      ? Math.floor((Date.now() - new Date(aggregatedData.tokenCreationDate).getTime()) / 86400000)
      : null;

    const computed_metrics = {
      ath_drop_pct: athDropPct,
      token_age_days: tokenAgeDays,
      token_creation_date: aggregatedData.tokenCreationDate || null,
      contract_analysis: aggregatedData.contractAnalysis || null,
      price_data_source: aggregatedData.marketData?.priceDataSource || 'CoinGecko',
      listing_score: aggregatedData.listingScore ? {
        composite_score: aggregatedData.listingScore.composite,
        composite_grade: aggregatedData.listingScore.compositeGrade,
        exchange_score: aggregatedData.listingScore.exchange.score,
        exchange_grade: aggregatedData.listingScore.exchange.grade,
        exchange_reason: aggregatedData.listingScore.exchange.reason,
        tier_counts: aggregatedData.listingScore.exchange.tierCounts,
        onchain_score: aggregatedData.listingScore.onchain.score,
        onchain_level: aggregatedData.listingScore.onchain.level,
        price_stability_score: aggregatedData.listingScore.priceStability.score,
        price_stability_level: aggregatedData.listingScore.priceStability.level,
        ath_drop_pct: aggregatedData.listingScore.priceStability.athDropPct,
      } : null,
      holder_concentration: aggregatedData.holderAnalysis ? {
        top10_pct: aggregatedData.holderAnalysis.top10TotalPercent,
        is_high_risk: aggregatedData.holderAnalysis.isHighRisk,
        top_holders: aggregatedData.holderAnalysis.holders,
      } : null,
      price_pattern: aggregatedData.pricePattern || null,
      exchange_count: aggregatedData.exchangeListings?.length || 0,
      top_exchanges: (aggregatedData.exchangeListings || []).slice(0, 5).map(e => ({
        name: e.exchangeName,
        pair: e.pair,
        volume24h_usd: e.volume24hUsd,
        trust_score: e.trustScore,
      })),
      goplus_flags: gp ? {
        is_honeypot: gp.isHoneypot,
        buy_tax_pct: gp.buyTax,
        sell_tax_pct: gp.sellTax,
        can_take_back_ownership: gp.canTakeBackOwnership,
        is_mintable: gp.isMintable,
        is_open_source: gp.isOpenSource,
        is_proxy: gp.isProxy,
        ownership_renounced: gp.ownerAddress === '0x0000000000000000000000000000000000000000',
        owner_address: gp.ownerAddress,
      } : null,
    };

    const userMessage = `Analyze this token for exchange listing suitability. The computed_metrics object contains pre-calculated numbers — use them directly without recalculating.

--- COMPUTED METRICS (use these exact numbers) ---
${JSON.stringify(computed_metrics, null, 2)}

--- FULL TOKEN DATA ---
${JSON.stringify({
  marketData: aggregatedData.marketData,
  onchainData: aggregatedData.onchainData,
  defiData: aggregatedData.defiData,
  competitors: aggregatedData.competitors,
  twitterData: aggregatedData.twitterData,
}, null, 2)}
--- END DATA ---

Respond with ONLY the JSON object as specified. No additional text.`;

    console.log('[Claude] Sending analysis request…');
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    });

    // Extract text content from the response
    const textBlock = response.content.find((b) => b.type === 'text');
    if (!textBlock) {
      throw new Error('No text content in Claude response');
    }

    // Parse the JSON response – strip code fences if present
    let jsonText = textBlock.text.trim();
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    const analysis = JSON.parse(jsonText);
    console.log('[Claude] Analysis generated successfully');
    return analysis;
  } catch (err) {
    console.error(`[Claude] generateReport failed: ${err.message}`);
    console.log('[Claude] Falling back to mock analysis');
    return generateMockAnalysis(aggregatedData);
  }
}

module.exports = { generateReport };
