const API_KEY = process.env.ETHERSCAN_API_KEY;
const BASE_URL = 'https://api.etherscan.io/v2/api';

async function analyzeTransactionPatterns(contractAddress, chainId = 56) {
  const url = `${BASE_URL}?chainid=${chainId}&module=account&action=tokentx&contractaddress=${contractAddress}&page=1&offset=200&sort=desc&apikey=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.result) return null;

  const txs = data.result;

  const uniqueSenders = new Set(txs.map(tx => tx.from)).size;
  const uniqueReceivers = new Set(txs.map(tx => tx.to)).size;
  const uniqueAddresses = new Set([...txs.map(tx => tx.from), ...txs.map(tx => tx.to)]).size;

  // Ping-pong detection (A→B→A repeated ≥3 times)
  const addressPairs = {};
  txs.forEach(tx => {
    const pair = [tx.from, tx.to].sort().join('-');
    addressPairs[pair] = (addressPairs[pair] || 0) + 1;
  });
  const pingPongPairs = Object.entries(addressPairs)
    .filter(([, count]) => count >= 3)
    .map(([pair, count]) => ({ pair, count }));

  // Bot pattern: same value repeated ≥5 times
  const valueFrequency = {};
  txs.forEach(tx => {
    valueFrequency[tx.value] = (valueFrequency[tx.value] || 0) + 1;
  });
  const suspiciousValues = Object.entries(valueFrequency)
    .filter(([, count]) => count >= 5)
    .map(([value, count]) => ({ value, count }));

  // Time interval regularity (bot = very low variance)
  const timeIntervals = [];
  for (let i = 1; i < Math.min(txs.length, 50); i++) {
    timeIntervals.push(Math.abs(parseInt(txs[i - 1].timeStamp) - parseInt(txs[i].timeStamp)));
  }
  let isBotPattern = false;
  if (timeIntervals.length > 5) {
    const avgInterval = timeIntervals.reduce((a, b) => a + b, 0) / timeIntervals.length;
    const intervalVariance = timeIntervals.reduce((sum, t) => sum + Math.pow(t - avgInterval, 2), 0) / timeIntervals.length;
    isBotPattern = intervalVariance < 100;
  }

  const washTradingScore =
    (pingPongPairs.length > 3 ? 40 : 0) +
    (suspiciousValues.length > 3 ? 30 : 0) +
    (isBotPattern ? 30 : 0);

  return {
    totalTxAnalyzed: txs.length,
    uniqueSenders,
    uniqueReceivers,
    uniqueAddresses,
    uniqueAddressRatio: parseFloat((uniqueAddresses / txs.length * 100).toFixed(1)),
    pingPongPairs: pingPongPairs.length,
    suspiciousValues: suspiciousValues.length,
    isBotPattern,
    washTradingScore,
    washTradingRisk: washTradingScore >= 60 ? 'HIGH' : washTradingScore >= 30 ? 'MEDIUM' : 'LOW',
  };
}

module.exports = { analyzeTransactionPatterns };
