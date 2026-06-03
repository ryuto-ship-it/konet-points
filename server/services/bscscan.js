const API_KEY = process.env.ETHERSCAN_API_KEY;
const BASE_URL = 'https://api.etherscan.io/v2/api';

async function getTokenHolders(contractAddress) {
  const url = `${BASE_URL}?chainid=56&module=token&action=tokenholderlist&contractaddress=${contractAddress}&page=1&offset=10&apikey=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.status !== '1') return null;
  const holders = data.result;
  const totalSupply = 1000000000;
  return {
    topHolders: holders.map((h, i) => ({
      rank: i + 1,
      address: h.TokenHolderAddress,
      balance: parseFloat(h.TokenHolderQuantity),
      percentage: (parseFloat(h.TokenHolderQuantity) / totalSupply * 100).toFixed(2)
    })),
    top10Concentration: holders.slice(0, 10)
      .reduce((sum, h) => sum + parseFloat(h.TokenHolderQuantity), 0)
      / totalSupply * 100
  };
}

async function getTokenCreationDate(contractAddress) {
  const url = `${BASE_URL}?chainid=56&module=account&action=tokentx&contractaddress=${contractAddress}&page=1&offset=1&sort=asc&apikey=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.result?.[0]) return null;
  return new Date(data.result[0].timeStamp * 1000).toISOString().split('T')[0];
}

async function getTokenTotalHolderCount(contractAddress) {
  const url = `${BASE_URL}?chainid=56&module=token&action=tokenholdercount&contractaddress=${contractAddress}&apikey=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.result || null;
}

async function analyzeHolderWalletAge(topHolders, chainId = 56) {
  const walletAges = await Promise.allSettled(
    topHolders.slice(0, 5).map(async holder => {
      const url = `${BASE_URL}?chainid=${chainId}&module=account&action=txlist&address=${holder.address}&page=1&offset=1&sort=asc&apikey=${API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      const firstTx = data.result?.[0];
      if (!firstTx) return null;

      const firstTxDate = new Date(firstTx.timeStamp * 1000);
      const walletAgeMonths = Math.floor(
        (Date.now() - firstTxDate) / (1000 * 60 * 60 * 24 * 30)
      );

      return {
        address: holder.address,
        percentage: holder.percentage,
        firstTxDate: firstTxDate.toISOString().split('T')[0],
        walletAgeMonths,
        isNewWallet: walletAgeMonths < 3,
      };
    })
  );

  const results = walletAges
    .filter(r => r.status === 'fulfilled' && r.value)
    .map(r => r.value);

  const newWalletCount = results.filter(w => w.isNewWallet).length;
  const newWalletRatio = results.length > 0
    ? parseFloat((newWalletCount / results.length * 100).toFixed(0))
    : null;

  return {
    walletDetails: results,
    newWalletCount,
    newWalletRatio,
    isAirdropPattern: newWalletRatio > 60,
    isOrganicHolders: newWalletRatio !== null && newWalletRatio < 30,
  };
}

async function analyzeDistributionPattern(contractAddress, chainId = 56) {
  const url = `${BASE_URL}?chainid=${chainId}&module=account&action=tokentx&contractaddress=${contractAddress}&page=1&offset=100&sort=asc&apikey=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.result?.[0]) return null;

  const txs = data.result;
  const deployDate = new Date(txs[0].timeStamp * 1000);

  const first24hTxs = txs.filter(tx =>
    new Date(tx.timeStamp * 1000) - deployDate < 86400000
  );

  const initialReceivers = new Set(first24hTxs.map(tx => tx.to)).size;

  return {
    deployDate: deployDate.toISOString().split('T')[0],
    first24hTxCount: first24hTxs.length,
    initialReceivers,
    isAirdropLaunch: initialReceivers > 100,
  };
}

module.exports = {
  getTokenHolders,
  getTokenCreationDate,
  getTokenTotalHolderCount,
  analyzeHolderWalletAge,
  analyzeDistributionPattern,
};
