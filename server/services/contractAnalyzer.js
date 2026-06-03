const API_KEY = process.env.ETHERSCAN_API_KEY;
const BASE_URL = 'https://api.etherscan.io/v2/api';

async function getContractSourceCode(contractAddress, chainId = 56) {
  const url = `${BASE_URL}?chainid=${chainId}&module=contract&action=getsourcecode&address=${contractAddress}&apikey=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.status !== '1' || !data.result?.[0]) return null;
  return data.result[0].SourceCode;
}

// Pattern-match the source code and return structured flags for Claude to interpret
function analyzeSource(sourceCode) {
  if (!sourceCode || sourceCode.trim() === '' || sourceCode === '/* No source code available */') return null;
  const src = sourceCode.toLowerCase();
  return {
    hasMint: /\bmint\s*\(/.test(src),
    hasOwnerControl: /\bonlyowner\b/.test(src),
    hasTax: /\btax\b|\bsell_?fee\b|\bbuy_?fee\b/.test(src),
    hasBlacklist: /\bblacklist\b|\b_?isblacklisted\b|\bblocklist\b/.test(src),
    hasWhitelist: /\bwhitelist\b|\b_?iswhitelisted\b/.test(src),
    hasPause: /\bpause\b/.test(src),
    hasRenounceOwnership: /\brenounceownership\b/.test(src),
    hasMaxTx: /\bmaxtx\b|\bmaxtransaction\b|\b_?maxtxamount\b/.test(src),
    hasProxy: /\bproxy\b|\bdelegatecall\b/.test(src),
  };
}

module.exports = { getContractSourceCode, analyzeSource };
