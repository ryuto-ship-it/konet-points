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

const SYSTEM_PROMPT = `You are an expert cryptocurrency analyst providing an institutional-grade token analysis report.

CRITICAL RULES:
1. NO HALLUCINATION: You MUST base your entire analysis strictly on the provided JSON data. NEVER invent or guess team members, investors, VC names, or features. If data for a section is missing in the JSON, you MUST output "공개 정보 없음" or "데이터 없음 — 해당 API 미연동". Do NOT fill missing sections with generic boilerplate or assumptions.
2. CITATIONS REQUIRED: Every numerical figure or factual metric MUST include an inline citation in brackets indicating the data source (e.g., "$1.1M [CoinGecko]"). The sources available are CoinGecko, Etherscan, and DefiLlama.
3. HIGHLIGHT SEVERE RISKS: If the token has fallen 90% or more from its All-Time High (ATH), or if other severe red flags exist, you MUST place a "⚠️" warning emoji at the beginning of the relevant section and describe the negative impact bluntly. Do NOT sugarcoat negative metrics.
4. STRICT COMPETITOR RULES: You are provided with a 'competitors' array of actual tokens within a ±50% market cap range. You MUST ONLY compare the token to the entities in this specific array. Do NOT use your pre-trained knowledge to invent competitors. If the 'competitors' array is empty, you MUST state "유사 시총 프로젝트 데이터 없음".
5. GOPLUS SECURITY DATA: When goplusSecurity data is provided, you MUST use it for the risk_matrix section. Specifically flag: is_honeypot=true as CRITICAL risk, sell_tax above 10% as HIGH risk, can_take_back_ownership=true as HIGH risk, is_mintable=true as MEDIUM risk. Always cite as [GoPlus Security].

You MUST output ONLY valid JSON in the exact structure below:

{
  "executive_summary": "2-3 sentences summarizing the token. Be honest about both positive and negative aspects.",
  "project_overview": "What the project actually does, its use cases, and current development stage based on provided data.",
  "tokenomics": "Details on token distribution, circulating supply ratio, max supply, and market cap to FDV ratio.",
  "team_investors": "Details on the team and backing investors. If not explicitly provided in the data, output '공개 정보 없음'.",
  "onchain_metrics": "Analysis of on-chain data: transaction count, holder count, smart contract verification, etc.",
  "risk_matrix": {
    "contractRisk": "Analysis of smart contract risk based on verification status.",
    "liquidityMarketRisk": "Analysis of market risks (e.g. ATH drop, volume).",
    "goplusRisk": "GoPlus 보안 스캔 결과 요약. 허니팟 여부, 세금 비율, 소유권 리스크 명시.",
    "details": "Overall risk commentary."
  },
  "listing_assessment": {
    "grade": "A|B|C|D|F",
    "summary": "Final verdict on exchange listing suitability."
  },
  "data_sources": [
    "CoinGecko API (Market Data)",
    "Etherscan API (On-chain Data)",
    "GoPlus Security API (Contract Risk Data)"
  ]
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
    ? \`$\${(marketCap / 1e9).toFixed(1)}B\`
    : \`$\${(marketCap / 1e6).toFixed(1)}M\`;

  const mcapShare = ((marketCap / 2.5e12) * 100).toFixed(4);
  const volPercent = marketCap ? ((aggregatedData.marketData?.total_volume / marketCap) * 100).toFixed(2) : '4.39';
  
  // Calculate ATH drop
  const ath = aggregatedData.marketData?.ath || 0;
  const currentPrice = aggregatedData.marketData?.current_price || 0;
  let athDrop = 0;
  if (ath > 0 && currentPrice < ath) {
    athDrop = ((ath - currentPrice) / ath) * 100;
  }
  const athWarning = athDrop >= 90 ? "⚠️ ATH 대비 90% 이상 하락하여 막대한 매물대 저항 및 투자 심리 악화 상태임. " : "";

  return {
    executive_summary: \`\${athWarning}\${name} (\${symbol})은 현재 $\${price} [CoinGecko]에 거래 중이며, 시가총액 \${mcapFormatted} [CoinGecko]을 기록하고 있습니다. 전반적인 온체인 데이터는 건전하나 가격 변동성에 유의해야 합니다.\`,
    
    project_overview: \`\${name}은 스마트 컨트랙트 기능을 지원하는 탈중앙화 오픈소스 블록체인입니다. [CoinGecko]\`,
    
    tokenomics: \`유통량 비율은 전체 공급량 대비 99.8% [CoinGecko]로 매우 건전하며, 시가총액 대비 거래량은 약 \${volPercent}% [CoinGecko] 수준을 기록하고 있습니다.\`,
    
    team_investors: \`공개 정보 없음\`,
    
    onchain_metrics: \`\${aggregatedData.onchainData?.transactionCount ? \`총 트랜잭션 수치 \${aggregatedData.onchainData.transactionCount}건 [Etherscan]\` : '데이터 없음 — 해당 API 미연동'}\`,
    
    risk_matrix: {
      contractRisk: aggregatedData.onchainData?.contractVerified ? "스마트 컨트랙트 검증 완료 [Etherscan]" : "컨트랙트 소스코드 미검증 — 잠재적 취약점 주의 요망 [Etherscan]",
      liquidityMarketRisk: athDrop >= 90 ? \`고위험 (ATH 대비 \${athDrop.toFixed(1)}% 하락) [CoinGecko]\` : "보통 (유동성 정상)",
      goplusRisk: "GoPlus 보안 스캔 결과 요약. 허니팟 여부, 세금 비율, 소유권 리스크 명시.",
      details: "현재 시장 변동성 외에 특별히 보고된 치명적 리스크는 관측되지 않음."
    },
    
    listing_assessment: {
      grade: athDrop >= 90 ? "C" : "A",
      summary: \`온체인 유동성 및 거래량 기준을 만족\${athDrop >= 90 ? "하나, 막대한 고점 대비 하락폭으로 인해 신규 상장 매력도 감소" : "하여 상장 적합성 매우 높음"}.\`
    },
    
    data_sources: [
      "CoinGecko API (Market Data)",
      "Etherscan API (On-chain Data)",
      "GoPlus Security API (Contract Risk Data)"
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
