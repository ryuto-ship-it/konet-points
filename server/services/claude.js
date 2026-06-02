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

Your task is to analyze the provided token data and produce a structured JSON report. Be specific with numbers and percentages when available. Be honest about risks and limitations.

You MUST respond with ONLY valid JSON (no markdown, no code fences) in the following structure:

{
  "basic_info_analysis": "A 2-3 paragraph analysis of the token's fundamentals, market position, and key characteristics based on the market data provided.",
  "onchain_analysis": "A 2-3 paragraph analysis of on-chain activity, transaction patterns, holder distribution, and network health. Highlight any notable patterns or concerns.",
  "utility_analysis": {
    "text": "A 2-3 paragraph analysis of the token's utility, use cases, and ecosystem value.",
    "hasBurn": false,
    "hasStaking": false,
    "hasGovernance": false
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
    "investmentPerspective": "A balanced 2-3 paragraph perspective on the token from an investment standpoint. This is NOT investment advice."
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

  return {
    basic_info_analysis: `${name} (${symbol}) is currently trading at $${price} with a market capitalization of ${mcapFormatted}, placing it among the top-tier digital assets by market value. The token has demonstrated significant price resilience over recent market cycles, maintaining strong trading volume which indicates sustained market interest and healthy liquidity conditions.\n\nThe 24-hour trading volume suggests active market participation from both retail and institutional players. The fully diluted valuation relative to current market cap provides insight into potential future dilution. The token's position relative to its all-time high indicates current market sentiment and potential recovery trajectory.\n\nOverall, the fundamental market metrics paint a picture of a well-established digital asset with strong liquidity, significant market capitalization, and active trading patterns that support price discovery and market efficiency.`,

    onchain_analysis: `On-chain analysis reveals consistent network activity with steady transaction throughput. The transaction count and daily estimates suggest a healthy level of organic usage rather than artificially inflated metrics. The distribution of transactions across different function calls indicates diverse utility beyond simple token transfers.\n\nThe network's transaction patterns show typical institutional and retail participation, with a mix of high-value and small-denomination transactions. Smart contract interactions constitute a significant portion of on-chain activity, suggesting strong ecosystem engagement and DeFi integration.\n\nContract verification status and the overall quality of the codebase provide confidence in the technical integrity of the protocol. The on-chain footprint is consistent with a mature, well-adopted blockchain project.`,

    utility_analysis: {
      text: `${name} serves as the native utility token of its ecosystem, providing fundamental value through gas fee payments, staking mechanisms, and governance participation. The token's utility is deeply embedded in the protocol's architecture, creating organic demand drivers that support long-term value accrual.\n\nThe staking mechanism provides token holders with the ability to earn yield while contributing to network security and consensus. This creates a natural supply sink that reduces circulating supply pressure. Governance capabilities allow token holders to participate in protocol decision-making, aligning stakeholder incentives.\n\nThe token demonstrates strong product-market fit with clear utility that extends beyond speculative trading. Its role in the broader DeFi ecosystem as collateral, a trading pair, and a yield-generating asset creates multiple demand vectors that contribute to price stability and long-term value.`,
      hasBurn: symbol === 'ETH' || symbol === 'BNB',
      hasStaking: true,
      hasGovernance: true,
    },

    risk_analysis: {
      concentrationRisk: 'medium',
      liquidityRisk: 'low',
      volumeAnomaly: 'none',
      overallRiskLevel: 'medium',
      details: `Concentration risk is assessed as medium, as large holders (whales) control a meaningful portion of the total supply. While this is common for established digital assets, it does introduce potential volatility risk if large positions are liquidated simultaneously. Monitoring whale wallet movements is recommended for active risk management.\n\nLiquidity risk is low, supported by deep order books across major exchanges and significant DEX liquidity pools. The 24-hour trading volume relative to market capitalization suggests healthy liquidity ratios that can absorb large trades without significant slippage. Cross-exchange arbitrage opportunities are minimal, indicating efficient price discovery.\n\nFrom a regulatory perspective, the evolving global regulatory landscape presents ongoing uncertainty. Smart contract risk is mitigated by extensive audits and the protocol's track record, though no system is entirely risk-free. Market correlation with Bitcoin and broader crypto markets remains a systemic risk factor that cannot be diversified away within the asset class.`,
    },

    overall_assessment: {
      summary: `${name} is a well-established digital asset with strong fundamentals, deep liquidity, and meaningful utility within its ecosystem. While not without risks, its market position and technical foundation provide a solid basis for long-term consideration.`,
      strengths: [
        `Strong market capitalization of ${mcapFormatted} with deep liquidity`,
        'Active on-chain ecosystem with diverse transaction types',
        'Clear token utility through staking, governance, and protocol fees',
        'Established track record with extensive security audits',
        'Broad exchange support and DeFi integration',
      ],
      weaknesses: [
        'Moderate holder concentration with significant whale influence',
        'Price correlation with broader crypto market limits diversification benefits',
        'Ongoing scalability challenges during high network demand',
      ],
      risks: [
        'Regulatory uncertainty across major jurisdictions',
        'Smart contract vulnerability risk despite audits',
        'Competitive pressure from alternative Layer-1/Layer-2 solutions',
        'Market-wide systemic risk during crypto downturns',
      ],
      investmentPerspective: `From an investment perspective, ${name} represents one of the more established positions in the digital asset space. Its combination of market leadership, ecosystem depth, and technological innovation creates a compelling long-term value proposition for those with conviction in the broader blockchain thesis.\n\nHowever, potential investors should be mindful of the inherent volatility in cryptocurrency markets and the specific risks outlined in this analysis. Position sizing should reflect individual risk tolerance, and diversification across multiple assets and asset classes remains prudent.\n\nThis analysis is for informational purposes only and does not constitute investment advice. All cryptocurrency investments carry significant risk, including the potential loss of principal. Investors should conduct their own due diligence and consult with qualified financial advisors before making investment decisions.`,
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
