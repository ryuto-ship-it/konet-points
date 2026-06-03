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

module.exports = { getTokenHolders, getTokenCreationDate, getTokenTotalHolderCount };
