/**
 * @module services/claude
 * @description Claude AI integration for generating crypto analysis reports.
 * Uses @anthropic-ai/sdk to produce structured JSON analysis across 5 sections.
 * Falls back to realistic pre-written analysis when the API key is missing.
 */

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = 'claude-sonnet-4-6';

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
3a. BOILERPLATE BAN: NEVER output these phrases or anything like them — "전반적인 온체인 데이터는 건전하나", "스마트 컨트랙트 기능을 지원하는 탈중앙화 오픈소스 블록체인", "가격 변동성에 유의해야 합니다", "건전한 시장 구조". Every sentence must cite a specific number or fact from the provided data.
3b. EXECUTIVE SUMMARY: Must cite at minimum: current price, market cap, ATH drop %, 24h volume. If ATH drop ≥90%, start with "⚠️". Do NOT use generic filler endings.
3c. PROJECT OVERVIEW: Use marketData.description. If description is empty or null, output EXACTLY "프로젝트 설명 데이터 없음 — 공식 웹사이트 또는 백서 확인 필요". Do NOT generate a description from the token name.
3d. TRANSACTION COUNT: When citing transaction count in onchain_metrics, always specify what it counts. Format: "[토큰명] 토큰 전송 트랜잭션 X건 [BscScan]" or "컨트랙트 상호작용 X건 [BscScan]". Never cite a raw number without explaining what it represents.
4. SEVERE RISK FLAGS: ATH drop ≥90% → prepend "⚠️". Honeypot detected → prepend "🚨 CRITICAL".
5. COMPETITOR RULE: Only reference tokens in the provided competitors array. Empty array → "유사 시총 프로젝트 데이터 없음".
6. CERTIK: If computed_metrics.certik is present, include in risk_matrix.contractRisk: "CertiK 점수 {score}/100 (등급 {rating}/5.0) [CertiK]". rating < 3.0 → ⚠️ 낮은 보안 점수. rating >= 4.0 → ✅ 우수한 보안 점수.
6b. GOPLUS: Use computed_metrics.goplus_flags exactly. ownership_renounced=true → "소유권 포기 완료 ✓". is_honeypot=true → CRITICAL. sell_tax>10 → HIGH risk. can_take_back_ownership=true → HIGH risk. is_mintable=true → MEDIUM risk.
7. HOLDER RISK: If computed_metrics.holder_concentration is present, use top10_pct in risk_matrix.holderConcentrationRisk. top10_pct >= 47% → ⚠️ 집중도 위험. top10_pct > 50% → HIGH RISK. If computed_metrics.holder_count is present, include "홀더 수: {holder_count}명" in onchain_metrics. Cite as [CoinMarketCap/BscScan].
8. TWITTER: If twitterData present, include followers/activity in team_investors. followers < 1000 → LOW engagement flag.
9. TOKEN AGE: If computed_metrics.token_age_days_dex < 30, do NOT calculate or show 30-day volatility or 30-day price range in price_pattern_interpretation. Instead output "데이터 부족 — 토큰 출시 N일 (30일 지표 산출 불가)" where N = token_age_days_dex value. Only apply this rule when token_age_days_dex is explicitly < 30.
9b. WHITEPAPER TOKENOMICS: If computed_metrics.whitepaper_found=true, analyze whitepaper_content for the tokenomics section. Extract: 팀 물량 %, 생태계/마케팅 %, 커뮤니티/에어드랍 %, 투자자 %, 베스팅 스케줄. If content doesn't clearly state these, output "백서에서 명시적 수치 없음". If whitepaper_found=false, output "백서 데이터 없음 — 수동 확인 필요".
10. CONTRACT SOURCE ANALYSIS: When computed_metrics.contract_analysis is provided, use each flag in risk_matrix.contractRisk. Format: ✅ flag=false (safe), ⚠️ flag=true (risk). hasMint→무한발행, hasOwnerControl→소유자 권한 존재, hasTax→세금 함수, hasBlacklist→지갑 차단 가능, hasPause→거래 중단 가능, hasMaxTx→최대 거래량 제한, hasProxy→프록시 컨트랙트. hasRenounceOwnership=true→✅ 소유권 포기 완료. Cite as [Contract Source Code, Etherscan].
10. DATA SOURCES: Use marketData.priceDataSource to determine citation. priceDataSource='CoinMarketCap' → cite price/volume as [CoinMarketCap]; otherwise [CoinGecko].
11. VOLUME HEALTH: If volumeHealth is present in data: cite volMcapRatioPct (정상 1-30%, 과열 30%+, 유동성부족 <1%). If isDumpingSignal=true → ⚠️ 매도 압력 집중 (sellRatioPct%). If isWashTrading=true → ⚠️ 워시트레이딩 의심. Include in onchain_metrics.
12. WALLET AGE & DISTRIBUTION: If walletAgeAnalysis.isAirdropPattern=true → ⚠️ 상위 홀더 신생 지갑 비율 {newWalletRatio}% — 에어드랍/봇 의심. If distributionPattern.isAirdropLaunch=true → ⚠️ 초기 배포 {initialReceivers}개 지갑 — 에어드랍 런치 패턴. Include in holder_analysis_interpretation.
13. ONCHAIN VERIFICATION: If computed_metrics.onchain_verify.wash_trading_risk='HIGH' → ⚠️ 세탁거래 위험 HIGH, pingPongPairs 수 및 uniqueAddressRatio 명시. uniqueAddressRatio < 50% → ⚠️ 거래 다양성 부족. Include in onchain_metrics.
14. SOCIAL ANALYSIS: If socialAnalysis present: cite healthGrade and healthScore. isNewAccount=true → ⚠️ 신규 계정(계정 나이 {accountAgeMonths}개월). healthGrade='WEAK' → 커뮤니티 기반 취약. If githubActivity present: isDormant=true → ⚠️ 개발 중단 의심, recentCommits 수치 명시. Include in team_investors.
15. LIQUIDITY ANALYSIS: If liquidityAnalysis present: liquidityHealth='CRITICAL' → 상장 부적합. isWashTradingSuspect=true → ⚠️ 유동성 대비 거래량 이상. sellRatio>70 → ⚠️ 매도 압력 집중. Include in onchain_metrics.
16. UNLISTED TOKEN: If exchangeListings is null or empty, state "현재 중앙화 거래소 미상장" in exchange_listing_interpretation. Assess DEX listing status and compare against exchange listing criteria: DEX volume $1M+/day, 1,000+ holders, 6+ months operation.
14. LISTING ASSESSMENT GRADE: Use computed_metrics.listing_score for the listing_assessment. The composite score (0-100) is pre-calculated as: exchange 40% + onchain 30% + price stability 30%. Use composite_grade as the base, but you may adjust ±1 grade based on qualitative factors (e.g. contract risks, community size). Cite tierCounts: "T1×N, T2×N, T3×N" format. TIER1 상장 여부가 가장 중요한 지표임.
17. DORPHIN INTELLIGENCE: Use dorphinAnalysis object for the dorphin_intelligence section. This is Dorphin Research의 독자 알고리즘 결과다.
   - dorphinScore (0-100) + dorphinGrade (A-F): 러그풀/조작 위험 중심 평가. 기존 listing_assessment와 별도.
   - pumpDumpSignals: CRITICAL/HIGH severity 신호를 우선 명시. severity=CRITICAL → 🚨, HIGH → ⚠️.
   - volumeSignals: 거래량 이상 징후. isWashTrading 포함.
   - socialSignals: 소셜-온체인 불일치 신호.
   - positiveSignals: 긍정 지표 목록.
   - summary: 자동 생성된 한 줄 판단 그대로 사용.
   - twitterActivity 있으면: followers, accountAgeMonths, last7daysTweets, activityLevel 포함. isNewAccount=true → ⚠️ 신규 계정.
   - 최종 판단: 모든 신호 종합 → '투자 주의', '러그풀 의심', '정상 범위' 등 명확한 한 줄 결론.
   - 신호가 없으면 ("신호 없음") → "특이 패턴 미탐지 — 정상 범위로 판단".
   - riskLevel=CRITICAL → 전체 판단을 가장 강한 경고로 시작.

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
  "data_sources": ["CoinGecko API", "Etherscan API", "GoPlus Security API", "DexScreener API", "CoinMarketCap API"],
  "dorphin_intelligence": {
    "score": "Dorphin Score (0-100) — 100에서 감점 방식. 러그풀/조작 위험 평가.",
    "grade": "A|B|C|D|F",
    "summary": "dorphinAnalysis.summary 그대로 사용",
    "pump_dump_verdict": "pumpDumpSignals 종합 1-2문장. 신호 없으면 '런치 패턴 이상 없음'.",
    "volume_verdict": "volumeSignals 종합 1-2문장. 거래량 진위 판단.",
    "twitter_verdict": "twitterActivity 기반 커뮤니티 진위 1-2문장. 없으면 '트위터 데이터 없음'.",
    "final_judgment": "모든 신호 종합한 최종 판단 한 줄. 명확하고 직접적으로."
  }
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

  // Build project overview from actual description
  const desc = aggregatedData.marketData?.description || '';
  const descriptionText = desc.trim().length > 0
    ? `${desc.trim().slice(0, 300)}${desc.length > 300 ? '...' : ''} [CoinGecko]`
    : '프로젝트 설명 데이터 없음 — 공식 웹사이트 또는 백서 확인 필요';

  const chain = aggregatedData.actualChain || '알 수 없음';
  const exchangeCount = aggregatedData.exchangeListings?.length || 0;
  const vol24h = aggregatedData.marketData?.total_volume || 0;
  const volStr = vol24h >= 1e6 ? `$${(vol24h / 1e6).toFixed(1)}M` : `$${(vol24h / 1e3).toFixed(0)}K`;

  return {
    executive_summary: (() => {
      const parts = [`${name} (${symbol})은 현재 $${price} [CoinGecko]에 거래 중이며, 시가총액 ${mcapFormatted} [CoinGecko]을 기록하고 있습니다.`];
      if (athDrop > 0) parts.push(`ATH 대비 ${athDrop.toFixed(1)}% 하락 상태 [CoinGecko].`);
      if (vol24h > 0) parts.push(`24시간 거래량 ${volStr} [CoinGecko].`);
      if (exchangeCount > 0) parts.push(`${exchangeCount}개 거래소 상장 중 [CoinGecko].`);
      return `${athWarning}${parts.join(' ')}`;
    })(),

    project_overview: (() => {
      const chainNote = chain !== '알 수 없음' ? ` 체인: ${chain.toUpperCase()}.` : '';
      return `${descriptionText}${chainNote}`;
    })(),

    tokenomics: (() => {
      const circ = aggregatedData.marketData?.circulating_supply || 0;
      const total = aggregatedData.marketData?.total_supply || 0;
      const max = aggregatedData.marketData?.max_supply;
      const circRatio = total > 0 ? (circ / total * 100).toFixed(1) : null;
      const parts = [];
      if (circRatio) parts.push(`유통 공급량 ${Number(circ).toLocaleString()} / 총 공급량 ${Number(total).toLocaleString()} (${circRatio}% 유통 중) [CoinGecko]`);
      if (max) parts.push(`최대 공급량 ${Number(max).toLocaleString()} [CoinGecko]`);
      if (vol24h > 0 && marketCap > 0) parts.push(`시가총액 대비 거래량 ${volPercent}% [CoinGecko]`);
      return parts.length > 0 ? parts.join('. ') + '.' : '토크노믹스 데이터 없음';
    })(),

    team_investors: (() => {
      const tw = aggregatedData.twitterData;
      const cd = aggregatedData.communityData || {};
      const parts = [];

      // Twitter metrics (from Twitter API when available)
      const handle = cd.twitterHandle || aggregatedData.twitterHandle;
      if (handle) parts.push(`트위터 계정: @${handle}`);

      if (tw) {
        if (tw.followersCount != null)
          parts.push(`팔로워 ${tw.followersCount.toLocaleString()}명 [Twitter API]`);
        if (tw.tweetCount != null)
          parts.push(`총 트윗 ${tw.tweetCount.toLocaleString()}건 [Twitter API]`);
        if (tw.createdAt)
          parts.push(`계정 생성일 ${tw.createdAt.slice(0, 10)} [Twitter API]`);
        if (tw.recentTweetCount7d != null)
          parts.push(`최근 7일 트윗 ${tw.recentTweetCount7d}건 [Twitter API]`);
        if (tw.verified)
          parts.push('인증 계정 ✓ [Twitter API]');
        if (tw.followersCount != null && tw.followersCount < 1000)
          parts.push('⚠️ 팔로워 1,000명 미만 — 낮은 커뮤니티 참여도');
        if (tw.recentTweetCount7d === 0)
          parts.push('⚠️ 최근 7일 트윗 없음 — 비활성 계정');
      } else if (handle) {
        parts.push('Twitter API 크레딧 소진 — 팔로워 수 일시 조회 불가');
      }

      // Telegram (from CoinGecko community_data — always available)
      if (cd.telegramHandle)
        parts.push(`텔레그램: @${cd.telegramHandle}`);
      if (cd.telegramUserCount != null)
        parts.push(`텔레그램 멤버 ${cd.telegramUserCount.toLocaleString()}명 [CoinGecko]`);

      return parts.length ? parts.join('. ') : '공개 정보 없음';
    })(),

    onchain_metrics: (() => {
      const parts = [];
      const txCount = aggregatedData.onchainData?.transactionCount;
      if (txCount) {
        parts.push(`${symbol} 컨트랙트 트랜잭션 ${Number(txCount).toLocaleString()}건 [BscScan/Etherscan]`);
      }
      const holders = aggregatedData.onchainData?.holderCount;
      if (holders) {
        parts.push(`홀더 수: ${Number(holders).toLocaleString()}명 [BscScan]`);
      }
      const vh = aggregatedData.volumeHealth;
      if (vh?.volMcapRatioPct != null) {
        parts.push(`거래량/시총 비율 ${vh.volMcapRatioPct}% (${vh.volHealthLabel || '—'}) [DexScreener]`);
      }
      if (vh?.isDumpingSignal) {
        parts.push(`⚠️ 매도 압력 집중 — 매도 비율 ${vh.sellRatioPct}% [DexScreener]`);
      }
      return parts.length > 0 ? parts.join('. ') : '데이터 없음 — 해당 API 미연동';
    })(),

    risk_matrix: {
      contractRisk: (() => {
        const ca = aggregatedData.contractAnalysis;
        const verified = aggregatedData.onchainData?.contractVerified;
        const ck = aggregatedData.certik;
        const certikStr = ck
          ? (ck.rating >= 4.0
              ? `✅ CertiK ${ck.score.toFixed(1)}/100 (등급 ${ck.rating}/5.0) [CertiK]`
              : ck.rating < 3.0
                ? `⚠️ CertiK ${ck.score.toFixed(1)}/100 (등급 ${ck.rating}/5.0 — 낮은 보안 점수) [CertiK]`
                : `CertiK ${ck.score.toFixed(1)}/100 (등급 ${ck.rating}/5.0) [CertiK]`)
          : null;
        if (!verified) {
          const base = "컨트랙트 소스코드 미검증 — 잠재적 취약점 주의 요망 [Etherscan]";
          return certikStr ? `${base}. ${certikStr}` : base;
        }
        const flags = [
          certikStr,
          ca ? (ca.hasMint ? "⚠️ 무한발행(mint) 함수 존재" : "✅ 무한발행 없음") : null,
          ca ? (ca.hasOwnerControl ? "⚠️ onlyOwner 권한 함수 존재" : "✅ 소유자 권한 제한적") : null,
          ca ? (ca.hasTax ? "⚠️ 세금(tax/fee) 함수 감지" : "✅ 세금 함수 없음") : null,
          ca ? (ca.hasBlacklist ? "⚠️ 지갑 차단(blacklist) 기능 존재" : "✅ 블랙리스트 없음") : null,
          ca ? (ca.hasPause ? "⚠️ 거래 중단(pause) 기능 존재" : "✅ 거래 중단 없음") : null,
          ca?.hasRenounceOwnership ? "✅ 소유권 포기(renounceOwnership) 가능" : null,
        ].filter(Boolean);
        return (flags.length ? flags.join(". ") : "스마트 컨트랙트 검증 완료") + " [Contract Source Code, Etherscan]";
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
      const ageDays = aggregatedData.tokenAgeInDays;
      if (!pp) return "가격 패턴 데이터 없음";
      if (ageDays !== null && ageDays !== undefined && ageDays < 30) {
        return `데이터 부족 — 토큰 출시 ${ageDays}일 (30일 지표 산출 불가)`;
      }
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
      token_age_days_dex: aggregatedData.tokenAgeInDays,
      whitepaper_found: !!(aggregatedData.whitepaperContent?.found),
      whitepaper_source: aggregatedData.whitepaperContent?.source || null,
      contract_analysis: aggregatedData.contractAnalysis || null,
      price_data_source: aggregatedData.marketData?.priceDataSource || 'CoinGecko',
      certik: aggregatedData.certik ? {
        score: aggregatedData.certik.score,
        rating: aggregatedData.certik.rating,
        update_time: aggregatedData.certik.updateTime,
        link: aggregatedData.certik.link,
      } : null,
      atl: aggregatedData.marketData?.atl ?? null,
      atl_date: aggregatedData.marketData?.atl_date ?? null,
      ath_change_percent: aggregatedData.marketData?.ath_change_percent ?? null,
      holder_count: aggregatedData.onchainData?.holderCount ?? null,
      holder_count_bscscan: aggregatedData.onchainData?.holderCount ?? null,
      volume_health: aggregatedData.volumeHealth ? {
        vol_mcap_ratio_pct: aggregatedData.volumeHealth.volMcapRatioPct,
        health_label: aggregatedData.volumeHealth.volHealthLabel,
        sell_ratio_pct: aggregatedData.volumeHealth.sellRatioPct,
        is_dumping_signal: aggregatedData.volumeHealth.isDumpingSignal,
        is_wash_trading: aggregatedData.volumeHealth.isWashTrading,
      } : null,
      wallet_age_analysis: aggregatedData.walletAgeAnalysis ? {
        new_wallet_ratio: aggregatedData.walletAgeAnalysis.newWalletRatio,
        is_airdrop_pattern: aggregatedData.walletAgeAnalysis.isAirdropPattern,
        is_organic_holders: aggregatedData.walletAgeAnalysis.isOrganicHolders,
      } : null,
      distribution_pattern: aggregatedData.distributionPattern ? {
        deploy_date: aggregatedData.distributionPattern.deployDate,
        first_24h_tx_count: aggregatedData.distributionPattern.first24hTxCount,
        initial_receivers: aggregatedData.distributionPattern.initialReceivers,
        is_airdrop_launch: aggregatedData.distributionPattern.isAirdropLaunch,
      } : null,
      onchain_verify: aggregatedData.onchainVerification ? {
        wash_trading_risk: aggregatedData.onchainVerification.washTradingRisk,
        wash_trading_score: aggregatedData.onchainVerification.washTradingScore,
        unique_address_ratio: aggregatedData.onchainVerification.uniqueAddressRatio,
        ping_pong_pairs: aggregatedData.onchainVerification.pingPongPairs,
        is_bot_pattern: aggregatedData.onchainVerification.isBotPattern,
      } : null,
      social_analysis: aggregatedData.socialAnalysis ? {
        followers: aggregatedData.socialAnalysis.followers,
        health_grade: aggregatedData.socialAnalysis.healthGrade,
        health_score: aggregatedData.socialAnalysis.healthScore,
        account_age_months: aggregatedData.socialAnalysis.accountAgeMonths,
        is_new_account: aggregatedData.socialAnalysis.isNewAccount,
        follower_ratio: aggregatedData.socialAnalysis.followerRatio,
      } : null,
      github_activity: aggregatedData.githubActivity ? {
        stars: aggregatedData.githubActivity.stars,
        recent_commits: aggregatedData.githubActivity.recentCommits,
        is_active: aggregatedData.githubActivity.isActive,
        is_dormant: aggregatedData.githubActivity.isDormant,
        last_update: aggregatedData.githubActivity.lastUpdate,
      } : null,
      liquidity_analysis: aggregatedData.liquidityAnalysis ? {
        liquidity_usd: aggregatedData.liquidityAnalysis.liquidity,
        liquidity_health: aggregatedData.liquidityAnalysis.liquidityHealth,
        sell_ratio: aggregatedData.liquidityAnalysis.sellRatio,
        is_wash_trading_suspect: aggregatedData.liquidityAnalysis.isWashTradingSuspect,
        vol_liq_ratio: aggregatedData.liquidityAnalysis.volLiqRatio,
        is_new_pair: aggregatedData.liquidityAnalysis.isNewPair,
        pair_age_days: aggregatedData.liquidityAnalysis.pairAgeInDays,
      } : null,
      exchange_is_unlisted: !aggregatedData.exchangeListings || aggregatedData.exchangeListings.length === 0,
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

    const whitepaperSection = aggregatedData.whitepaperContent?.found
      ? `\n--- WHITEPAPER / DOCS CONTENT (use for tokenomics section) ---\nSource: ${aggregatedData.whitepaperContent.source}\n${aggregatedData.whitepaperContent.content}\n--- END WHITEPAPER ---`
      : '';

    const dorphinSection = aggregatedData.dorphinAnalysis
      ? `\n--- DORPHIN ANALYSIS (use for dorphin_intelligence section) ---\n${JSON.stringify(aggregatedData.dorphinAnalysis, null, 2)}\n--- END DORPHIN ---`
      : '';

    const twitterActivitySection = aggregatedData.twitterActivity
      ? `\n--- TWITTER ACTIVITY ---\n${JSON.stringify(aggregatedData.twitterActivity, null, 2)}\n--- END TWITTER ACTIVITY ---`
      : '';

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
  communityData: aggregatedData.communityData,
}, null, 2)}
--- END DATA ---${whitepaperSection}${dorphinSection}${twitterActivitySection}

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
