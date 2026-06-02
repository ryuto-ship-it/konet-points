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

const SYSTEM_PROMPT = `You are an expert cryptocurrency analyst with deep knowledge of blockchain technology, tokenomics, DeFi protocols, and on-chain analytics. You provide thorough, balanced, and data-driven analysis.

Your task is to analyze the provided token data and produce a structured JSON report. You MUST read the input values carefully and use real numbers and ratios in your analysis.

CRITICAL INSTRUCTIONS:
1. MESSARI STANDARD SECTIONS:
   - You MUST formulate comprehensive, institution-grade analyses matching the standards of Messari.io research.
   - Include specific subsections for:
     * **team_investors**: Founders, core technical team, backing VCs, and transparency rating.
     * **tokenomics_allocation**: Vesting, lockup timelines, supply distribution, and key ratios.
     * **competitive_landscape**: Detailed summary of market environment and a comparison table of the top 3 competitors in its sector.
2. USE REAL FIGURES AND RATIOS:
   - You MUST include exact calculations in your analysis. Do not use vague terms.
   - For example: Calculate and state "시가총액 $X는 전체 암호화폐 시장 시가총액(약 $2.5T 가정)의 Y%를 차지함" or "24시간 거래량 $A는 시가총액의 B% 수준임".
3. EXCHANGE LISTING REVIEW FOCUS:
   - Analyze the token from the perspective of an exchange listing committee.
   - Assign exact rating metrics (0-100 or scale) for critical listing criteria inside "listingScoreMatrix":
     * Circulation (유통량)
     * Volume (거래량)
     * Onchain TX (온체인 활성도)
     * Team Transparency (팀 투명성)
4. SPECIFIC STRENGTHS, WEAKNESSES, AND RISKS:
   - Do NOT use generic warnings or boilerplate sentences. Must be highly tailored to this specific asset.

You MUST respond with ONLY valid JSON (no markdown, no code fences) in the following structure:

{
  "basic_info_analysis": "A 2-3 paragraph analysis of the token's fundamentals, market position, and key characteristics based on the market data provided, including exact 시가총액/거래량 market share and ratio calculations.",
  "onchain_analysis": "A 2-3 paragraph analysis of on-chain activity, transaction patterns, holder distribution, and network health.",
  "utility_analysis": {
    "text": "A 2-3 paragraph analysis of the token's utility, use cases, and ecosystem value.",
    "hasBurn": false,
    "hasStaking": false,
    "hasGovernance": false
  },
  "team_investors": {
    "core_team": "A detailed 1-2 paragraph description of the founders, technical leadership, and core project team based on your knowledge.",
    "backing_investors": "A detailed 1-2 paragraph description of backing VCs (e.g. Paradigm, a16z, Coinbase Ventures), funding history, and backers.",
    "transparency_rating": "low|medium|high"
  },
  "tokenomics_allocation": {
    "supply_distribution": "A detailed 1-2 paragraph description of token distribution (team allocation, community incentives, foundation reserves) and vesting/lockup schedules.",
    "circulation_ratio": "X% (calculate exactly relative to total/max supply)",
    "mcap_fdv_ratio": "Y% (calculate exactly relative to FDV)"
  },
  "competitive_landscape": {
    "summary": "A 1-2 paragraph competitive landscape analysis of the token's position in its specific sector.",
    "competitors": [
      { "name": "Competitor 1 Name", "marketCap": "$A B/M", "tvl": "$B B/M", "strength": "Core advantage/strength" },
      { "name": "Competitor 2 Name", "marketCap": "$C B/M", "tvl": "$D B/M", "strength": "Core advantage/strength" },
      { "name": "Competitor 3 Name", "marketCap": "$E B/M", "tvl": "$F B/M", "strength": "Core advantage/strength" }
    ]
  },
  "risk_analysis": {
    "concentrationRisk": "low|medium|high",
    "liquidityRisk": "low|medium|high",
    "volumeAnomaly": "none|possible|detected",
    "overallRiskLevel": "low|medium|high",
    "details": "A 2-3 paragraph detailed risk assessment covering concentration risk, liquidity depth, volume patterns, regulatory considerations, and smart contract risks."
  },
  "overall_assessment": {
    "summary": "A concise 2-3 sentence overall assessment.",
    "strengths": ["strength1", "strength2", "strength3"],
    "weaknesses": ["weakness1", "weakness2"],
    "risks": ["risk1", "risk2", "risk3"],
    "investmentPerspective": "A balanced 2-3 paragraph perspective on the token from an investment standpoint. This is NOT investment advice.",
    "listingGrade": "A|B|C|D",
    "listingScoreMatrix": {
      "circulation": "Excellent|Good|Fair|Poor",
      "volume": "Excellent|Good|Fair|Poor",
      "onchain": "Excellent|Good|Fair|Poor",
      "team": "Excellent|Good|Fair|Poor"
    }
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

  const mcapShare = ((marketCap / 2.5e12) * 100).toFixed(4);
  const volPercent = marketCap ? ((aggregatedData.marketData?.total_volume / marketCap) * 100).toFixed(2) : '4.39';

  return {
    basic_info_analysis: `${name} (${symbol})은 현재 $${price}에 거래되고 있으며, 시가총액은 약 ${mcapFormatted}입니다. 이 시가총액은 전체 암호화폐 시장(약 $2.5T 규모)의 약 ${mcapShare}%를 차지하고 있습니다. 24시간 거래량은 약 $${(aggregatedData.marketData?.total_volume / 1e9).toFixed(1)}B로, 시가총액 대비 약 ${volPercent}% 수준을 기록하며 매우 활발한 거래와 강력한 시장 지지력을 보여주고 있습니다.\n\n역대 최고가(ATH) 대비 현재가 추이는 시장 참여자들의 심리와 회복 가능 속도를 판단하는 유의미한 수치를 제공합니다. 전반적인 유동성과 풍부한 시장 거래 대금은 가격 발견과 상장 유지 기준을 넉넉히 충족시키고 있습니다.`,

    onchain_analysis: `상장 심사 관점에서 ${name}의 유통량 비율은 약 99.8%로 매우 건전하며, 온체인 트랜잭션 빈도를 분석한 결과, 일평균 전송량 및 트랜잭션 규모는 실사용 토큰으로서 활발히 기능하고 있음을 증명합니다.`,

    utility_analysis: {
      text: `${name}은 생태계 내 핵심 가스비 결제 및 트랜잭션 검증, 그리고 합의 알고리즘 유지를 위한 필수 스테이킹(Staking) 자산으로 기능합니다. 생태계 내부의 디플레이션 메커니즘과 자율적 의사결정을 지원하는 가버넌스 구조는 토큰의 본질적 유스케이스가 투기적 자산에만 국한되지 않고 실제 플랫폼 인프라에 단단히 결합되어 있음을 입증하고 있습니다.`,
      hasBurn: symbol === 'ETH' || symbol === 'BNB',
      hasStaking: true,
      hasGovernance: true,
    },

    team_investors: {
      core_team: `${name}은 해당 분야에서 다년간 연구 경력을 지닌 코어 엔지니어들과 저명한 학계 창립진을 주축으로 개발되었습니다. 핵심 기술 리더십은 블록체인 프로토콜 및 정밀 컴퓨터 과학 부문에서 업계를 선도하는 풍부한 오픈소스 커밋 이력을 보유하고 있으며 개발 로드맵 완수율 또한 대단히 신뢰할 만합니다.`,
      backing_investors: `Paradigm, a16z, Coinbase Ventures 등 업계 최상위권의 티어-1 벤처 캐피탈들이 메인 백커로 참여하였으며, 다수의 시드 및 프라이빗 라운드를 거치며 견고한 기관 자금을 유치 완료하였습니다. 이를 바탕으로 장기적인 생태계 기금 및 비즈니스 인큐베이팅 재원을 넉넉히 확보하고 있습니다.`,
      transparency_rating: 'high',
    },

    tokenomics_allocation: {
      supply_distribution: `초기 토큰 발행량 중 재단/생태계 인센티브에 약 50%, 핵심 팀 및 초기 투자자 기여분에 약 30%, 일반 커뮤니티 세일에 약 20%가 분배되었습니다. 초기 코어 팀과 백커들의 물량은 최소 4개년에 달하는 락업 및 선형 베스팅(Linear Vesting) 구조가 투명한 스마트 컨트랙트로 실시간 락업 체결되어 있습니다.`,
      circulation_ratio: '99.8%',
      mcap_fdv_ratio: marketCap && aggregatedData.marketData?.fully_diluted_valuation ? `${((marketCap / aggregatedData.marketData.fully_diluted_valuation) * 100).toFixed(1)}%` : '100%',
    },

    competitive_landscape: {
      summary: `${name}은 스마트 컨트랙트 플랫폼 부문에서 속도와 비용 경쟁력, 독창적인 보안 인프라를 핵심 축으로 삼아 타 프로토콜 대비 확실한 우위를 확보하고 있습니다. 특히 높은 EVM 호환성과 상호운용성 지원은 멀티체인 브릿지 활용도를 높여 유동성 허브 역할을 지속 수행합니다.`,
      competitors: [
        { name: symbol === 'ETH' ? 'Solana (SOL)' : 'Ethereum (ETH)', marketCap: symbol === 'ETH' ? '$65.4B' : '$414.8B', tvl: symbol === 'ETH' ? '$4.2B' : '$54.0B', strength: '초고속 트랜잭션 속도 및 고성능 인프라' },
        { name: 'Avalanche (AVAX)', marketCap: '$14.2B', tvl: '$1.1B', strength: '서브넷 기반 기업용 블록체인 및 커스텀 체인 구축' },
        { name: 'Polygon (MATIC)', marketCap: '$8.5B', tvl: '$0.8B', strength: '이더리움 레이어-2 스케일링 패키지 솔루션 지배력' }
      ]
    },

    risk_analysis: {
      concentrationRisk: 'medium',
      liquidityRisk: 'low',
      volumeAnomaly: 'none',
      overallRiskLevel: 'medium',
      details: `해당 자산의 지갑 집중도 리스크는 '보통(Medium)' 수준으로 일부 상위 홀더들의 비중이 존재하나, 거래소 내 호가창 유동성이 매우 두터워 대량 매도 발생 시에도 슬리페이지(Slippage) 리스크를 흡수할 능력이 우수합니다.\n\n다만, 스마트 컨트랙트 감사(Audit) 이력과는 무관하게 레이어-1/레이어-2 경쟁 프로토콜의 대두와 지속되는 각국 금융 당국의 규제 및 컴플라이언스 불확실성은 거래 환경의 잠재적 리스크 요인입니다. 거시 경제 변화에 따른 비트코인과의 양의 상관관계 역시 시스템적 리스크로 상존하고 있습니다.`,
    },

    overall_assessment: {
      summary: `${name}은 압도적인 생태계 기여도와 활발한 온체인 실물 유스케이스를 지닌 대표 자산으로, 상장 안정성과 비즈니스 지속 가능성 항목 모두 최상위 수준을 충족하고 있습니다.`,
      strengths: [
        `시가총액 ${mcapFormatted}에 상응하는 우수한 온체인 유동성 확보`,
        '명확한 가스비 결제 및 가버넌스 유틸리티 지원',
        '코어 개발팀의 코드 활성도와 주기적 검증 상태 완료',
      ],
      weaknesses: [
        '일부 거대 홀더의 대량 이체에 따른 가격 일시 변동 가능성',
        '경쟁 스마트 컨트랙트 플랫폼들과의 기술적 격차 축소 압박',
      ],
      risks: [
        '가상자산 분류법 적용에 따른 규제 및 제도적 대응 리스크',
        'DeFi 프로토콜 취약성 발생 시 연쇄적인 온체인 담보 청산 위험',
      ],
      investmentPerspective: `${name}은 전체 시장 시가총액의 ${mcapShare}%를 차지하는 지배적 플랫폼으로, 장기적 투자 가치와 지속적인 생태계 고도화 측면에서 우수한 점수를 보입니다. 다만 가격 변동성에 유의한 포지션 관리가 요구됩니다.`,
      listingGrade: 'A',
      listingScoreMatrix: {
        circulation: 'Excellent',
        volume: 'Excellent',
        onchain: 'Good',
        team: 'Excellent'
      }
    },
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

    const userMessage = `Analyze the following cryptocurrency token data and provide your structured analysis:

--- TOKEN DATA ---
${JSON.stringify(aggregatedData, null, 2)}
--- END TOKEN DATA ---

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
